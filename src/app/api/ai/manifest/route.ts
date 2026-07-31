import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    success:true,
    name:"Aila AI",
    version:"1.0.0",
    api:"v1"
  });
}
