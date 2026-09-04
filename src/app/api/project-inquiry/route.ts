import { NextResponse } from "next/server";
import { Resend } from "resend";

import { getPrismaUserOrNull } from "@/core/auth/clerk-user";
import { getProjectInquiryEmail, getResendApiKey, getResendFromEmail } from "@/core/config";
import { prisma } from "@/core/database/prisma";
import { MemoryRateLimiter } from "@/lib/api/rate-limit";
import { createLogger } from "@/lib/logger/logger";

const log = createLogger("api.project-inquiry");

const projectInquiryRateLimiter = new MemoryRateLimiter({
  limit: 8,
  windowMs: 60_000,
});

function clientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  return req.headers.get("x-real-ip") ?? "unknown";
}

const allowedProjectTypes = [
  "Website",
  "Web App",
  "Mobile App",
  "AI Solution",
  "Automation",
];

export async function POST(req: Request) {
  try {
    const rateLimit = await projectInquiryRateLimiter.check(
      `project-inquiry:${clientIp(req)}`,
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Too many inquiries. Please try again shortly." },
        { status: 429 },
      );
    }

    const body = await req.json();

    const name =
      typeof body?.name === "string"
        ? body.name.trim()
        : "";

    const email =
      typeof body?.email === "string"
        ? body.email.trim().toLowerCase()
        : "";

    const company =
      typeof body?.company === "string"
        ? body.company.trim()
        : "";

    const projectType =
      typeof body?.projectType === "string"
        ? body.projectType.trim()
        : "";

    const idea =
      typeof body?.idea === "string"
        ? body.idea.trim()
        : "";

    if (!name || !email || !projectType || !idea) {
      return NextResponse.json(
        {
          error:
            "Name, email, project type and project description are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!allowedProjectTypes.includes(projectType)) {
      return NextResponse.json(
        {
          error: "Invalid project type.",
        },
        {
          status: 400,
        }
      );
    }

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return NextResponse.json(
        {
          error: "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    if (name.length > 100) {
      return NextResponse.json(
        {
          error: "Name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (email.length > 200) {
      return NextResponse.json(
        {
          error: "Email address is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (company.length > 150) {
      return NextResponse.json(
        {
          error: "Company name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (idea.length < 10 || idea.length > 5000) {
      return NextResponse.json(
        {
          error:
            "Project description must be between 10 and 5000 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const signedInUser = await getPrismaUserOrNull();

    const inquiry = await prisma.projectInquiry.create({
      data: {
        userId: signedInUser?.id,
        name,
        email,
        company: company || null,
        idea,
        projectType,
        description: idea,
        status: "new",
      },
    });

    const inquiryId = inquiry.id;

    const resendApiKey = getResendApiKey();
    const inquiryEmail = getProjectInquiryEmail();

    if (resendApiKey && inquiryEmail) {
    const resend = new Resend(
      resendApiKey
    );


    const { data: emailData, error: emailError } =
      await resend.emails.send({
        from: getResendFromEmail(),

        to: [
          inquiryEmail,
        ],

        replyTo: email,

        subject:
          `New Aila Project — ${projectType} — ${name}`,

        html: `
          <div style="
            background:#050505;
            padding:40px;
            font-family:Arial,Helvetica,sans-serif;
            color:#ffffff;
          ">

            <div style="
              max-width:680px;
              margin:0 auto;
              background:#0d0d0d;
              border:1px solid #222;
              border-radius:24px;
              overflow:hidden;
            ">

              <div style="
                padding:32px;
                border-bottom:1px solid #222;
              ">

                <p style="
                  margin:0 0 10px;
                  color:#67e8f9;
                  font-size:12px;
                  letter-spacing:3px;
                  text-transform:uppercase;
                ">
                  Aila Ecosystem
                </p>

                <h1 style="
                  margin:0;
                  font-size:30px;
                ">
                  New Project Inquiry
                </h1>

              </div>

              <div style="padding:32px;">

                <p style="
                  margin:0 0 8px;
                  color:#777;
                  font-size:12px;
                  text-transform:uppercase;
                  letter-spacing:2px;
                ">
                  Project Type
                </p>

                <p style="
                  margin:0 0 28px;
                  font-size:20px;
                ">
                  ${escapeHtml(projectType)}
                </p>

                <p style="
                  margin:0 0 8px;
                  color:#777;
                  font-size:12px;
                  text-transform:uppercase;
                  letter-spacing:2px;
                ">
                  Client
                </p>

                <p style="
                  margin:0 0 6px;
                  font-size:18px;
                ">
                  ${escapeHtml(name)}
                </p>

                <p style="
                  margin:0 0 6px;
                  color:#aaa;
                ">
                  ${escapeHtml(email)}
                </p>

                <p style="
                  margin:0 0 28px;
                  color:#aaa;
                ">
                  ${
                    company
                      ? escapeHtml(company)
                      : "No company provided"
                  }
                </p>

                <p style="
                  margin:0 0 8px;
                  color:#777;
                  font-size:12px;
                  text-transform:uppercase;
                  letter-spacing:2px;
                ">
                  Project Idea
                </p>

                <div style="
                  white-space:pre-wrap;
                  line-height:1.8;
                  color:#ddd;
                  background:#080808;
                  border:1px solid #222;
                  border-radius:16px;
                  padding:20px;
                ">
                  ${escapeHtml(idea)}
                </div>

                <p style="
                  margin:28px 0 0;
                  color:#555;
                  font-size:12px;
                ">
                  Inquiry ID: ${inquiryId}
                </p>

              </div>

            </div>

          </div>
        `,
      });

    if (emailError) {
      log.error("Project inquiry email failed.", emailError);
    } else {
      log.info("Project inquiry email sent.", {
        inquiryId,
        emailId: emailData?.id,
      });
    }
    }

    return NextResponse.json(
      {
        success: true,

        message:
          "Your project has entered the Aila Ecosystem.",

        inquiryId,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    log.error("Project inquiry failed.", error);

    return NextResponse.json(
      {
        error: "Aila could not receive your project right now.",
      },
      {
        status: 500,
      }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}