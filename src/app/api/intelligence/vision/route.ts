import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const form = await req.formData();

    const image = form.get("image");

    if (!(image instanceof File)) {
      return NextResponse.json(
        {
          error: "No image uploaded.",
        },
        {
          status: 400,
        }
      );
    }

    return NextResponse.json({
      success: true,
      filename: image.name,
      size: image.size,
      type: image.type,
      message: "Image received successfully. Vision AI integration is next.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Vision request failed.",
      },
      {
        status: 500,
      }
    );
  }
}
