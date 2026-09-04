import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

import { ValidationError } from "@/lib/errors/app-error";

const FETCH_TIMEOUT_MS = 8_000;
const MAX_BYTES = 400_000;
const MAX_REDIRECTS = 2;

function isPrivateIpv4(ip: string): boolean {
  const parts = ip.split(".").map((part) => Number(part));
  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [a, b] = parts;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  return false;
}

function isPrivateIp(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    return isPrivateIpv4(ip);
  }

  if (version === 6) {
    const normalized = ip.toLowerCase();
    if (normalized === "::" || normalized === "::1") return true;
    if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
    if (normalized.startsWith("fe80")) return true;
    if (normalized.startsWith("::ffff:")) {
      return isPrivateIpv4(normalized.slice("::ffff:".length));
    }
  }

  return false;
}

function hostnameLooksPrivate(hostname: string): boolean {
  const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
    return true;
  }
  if (host === "metadata.google.internal") {
    return true;
  }
  if (isIP(host) && isPrivateIp(host)) {
    return true;
  }
  return false;
}

export function assertPublicHttpUrl(value: string): URL {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new ValidationError({ url: "Enter a valid URL." }, { message: "Enter a valid URL." });
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new ValidationError(
      { url: "Only http and https URLs can be analysed." },
      { message: "Only http and https URLs can be analysed." },
    );
  }

  if (parsed.username || parsed.password) {
    throw new ValidationError(
      { url: "URLs with credentials cannot be fetched." },
      { message: "URLs with credentials cannot be fetched." },
    );
  }

  if (hostnameLooksPrivate(parsed.hostname)) {
    throw new ValidationError(
      { url: "That address cannot be fetched." },
      { message: "That address cannot be fetched." },
    );
  }

  return parsed;
}

async function assertPublicHost(url: URL): Promise<void> {
  if (hostnameLooksPrivate(url.hostname)) {
    throw new ValidationError(
      { url: "That address cannot be fetched." },
      { message: "That address cannot be fetched." },
    );
  }

  const host = url.hostname.replace(/^\[|\]$/g, "");
  if (isIP(host)) {
    if (isPrivateIp(host)) {
      throw new ValidationError(
        { url: "That address cannot be fetched." },
        { message: "That address cannot be fetched." },
      );
    }
    return;
  }

  const addresses = await lookup(host, { all: true });
  if (addresses.length === 0 || addresses.some((entry) => isPrivateIp(entry.address))) {
    throw new ValidationError(
      { url: "That address cannot be fetched." },
      { message: "That address cannot be fetched." },
    );
  }
}

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match?.[1]) return null;
  const title = stripTags(match[1]).slice(0, 200);
  return title || null;
}

export type LandingPageFetchResult = {
  fetchStatus: "success" | "failed" | "blocked";
  httpStatus: number | null;
  title: string | null;
  excerpt: string | null;
  errorMessage: string | null;
};

async function readLimitedBody(response: Response): Promise<string> {
  const reader = response.body?.getReader();
  if (!reader) {
    const text = await response.text();
    return text.slice(0, MAX_BYTES);
  }

  const chunks: Uint8Array[] = [];
  let received = 0;

  while (received < MAX_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    if (!value) continue;
    chunks.push(value);
    received += value.byteLength;
  }

  await reader.cancel().catch(() => undefined);

  const merged = new Uint8Array(Math.min(received, MAX_BYTES));
  let offset = 0;
  for (const chunk of chunks) {
    const size = Math.min(chunk.byteLength, merged.length - offset);
    merged.set(chunk.subarray(0, size), offset);
    offset += size;
    if (offset >= merged.length) break;
  }

  return new TextDecoder("utf-8", { fatal: false }).decode(merged);
}

async function fetchOnce(url: URL, signal: AbortSignal): Promise<Response> {
  await assertPublicHost(url);
  return fetch(url, {
    method: "GET",
    redirect: "manual",
    signal,
    headers: {
      accept: "text/html,application/xhtml+xml;q=0.9,*/*;q=0.1",
      "user-agent": "AilaAds/1.0",
    },
  });
}

export async function fetchPublicLandingPage(rawUrl: string): Promise<LandingPageFetchResult> {
  let current: URL;
  try {
    current = assertPublicHttpUrl(rawUrl);
  } catch (error) {
    return {
      fetchStatus: "blocked",
      httpStatus: null,
      title: null,
      excerpt: null,
      errorMessage: error instanceof Error ? error.message : "That address cannot be fetched.",
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let response: Response | null = null;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
      response = await fetchOnce(current, controller.signal);

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get("location");
        if (!location) {
          return {
            fetchStatus: "failed",
            httpStatus: response.status,
            title: null,
            excerpt: null,
            errorMessage: "The landing page redirected without a location.",
          };
        }
        current = assertPublicHttpUrl(new URL(location, current).toString());
        continue;
      }

      break;
    }

    if (!response) {
      return {
        fetchStatus: "failed",
        httpStatus: null,
        title: null,
        excerpt: null,
        errorMessage: "The landing page could not be fetched.",
      };
    }

    if (response.status < 200 || response.status >= 300) {
      return {
        fetchStatus: "failed",
        httpStatus: response.status,
        title: null,
        excerpt: null,
        errorMessage: `The landing page returned HTTP ${response.status}.`,
      };
    }

    const html = await readLimitedBody(response);
    const excerpt = stripTags(html).slice(0, 2000) || null;

    return {
      fetchStatus: "success",
      httpStatus: response.status,
      title: extractTitle(html),
      excerpt,
      errorMessage: null,
    };
  } catch (error) {
    if (error instanceof ValidationError) {
      return {
        fetchStatus: "blocked",
        httpStatus: null,
        title: null,
        excerpt: null,
        errorMessage: error.message,
      };
    }

    return {
      fetchStatus: "failed",
      httpStatus: null,
      title: null,
      excerpt: null,
      errorMessage: error instanceof Error ? error.message : "The landing page could not be fetched.",
    };
  } finally {
    clearTimeout(timeout);
  }
}
