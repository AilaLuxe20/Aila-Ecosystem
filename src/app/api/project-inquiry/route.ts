import { NextResponse } from "next/server";
import { Resend } from "resend";

const allowedProjectTypes = [
  "Website",
  "Web App",
  "Mobile App",
  "AI Solution",
  "Automation",
];

export async function POST(req: Request) {
  try {
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

    if (
      !process.env.RESEND_API_KEY ||
      !process.env.PROJECT_INQUIRY_EMAIL
    ) {
      console.error(
        "Missing RESEND_API_KEY or PROJECT_INQUIRY_EMAIL"
      );

      return NextResponse.json(
        {
          error:
            "Project inquiry email is not configured yet.",
        },
        {
          status: 500,
        }
      );
    }

    const resend = new Resend(
      process.env.RESEND_API_KEY
    );

    const inquiryId = crypto.randomUUID();

    const { data: emailData, error: emailError } =
      await resend.emails.send({
        from:
          "Aila Ecosystem <onboarding@resend.dev>",

        to: [
          process.env.PROJECT_INQUIRY_EMAIL,
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
      console.error(
        "Aila Inquiry Email Error:",
        emailError
      );

      return NextResponse.json(
        {
          error:
            emailError.message ||
            "Aila could not send the notification email.",
        },
        {
          status: 500,
        }
      );
    }

    console.log(
      "Aila Inquiry Email Sent:",
      emailData
    );

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
    console.error(
      "Project Inquiry API Error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Aila could not receive your project right now.",
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