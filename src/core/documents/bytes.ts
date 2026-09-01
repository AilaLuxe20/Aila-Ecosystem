/**
 * Shared file-byte checks used by Legal upload and Intelligence attachments.
 * Client MIME types are ignored.
 */

export function looksLikePdf(bytes: Uint8Array): boolean {
  const limit = Math.min(bytes.length, 1024);

  for (let index = 0; index <= limit - 4; index += 1) {
    if (
      bytes[index] === 0x25 &&
      bytes[index + 1] === 0x50 &&
      bytes[index + 2] === 0x44 &&
      bytes[index + 3] === 0x46
    ) {
      return true;
    }
  }

  return false;
}

export function containsNul(bytes: Uint8Array, sampleBytes = 8192): boolean {
  const end = Math.min(bytes.length, sampleBytes);

  for (let index = 0; index < end; index += 1) {
    if (bytes[index] === 0) {
      return true;
    }
  }

  return false;
}

export function looksLikeBinary(bytes: Uint8Array): boolean {
  if (containsNul(bytes)) {
    return true;
  }

  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return true;
  }

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return true;
  }

  if (bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
    return true;
  }

  if (bytes.length >= 2 && bytes[0] === 0x4d && bytes[1] === 0x5a) {
    return true;
  }

  return false;
}
