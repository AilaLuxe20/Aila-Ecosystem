import { NextResponse } from "next/server";


export const runtime = "nodejs";


export async function POST(request: Request) {

  try {

    const body = await request.json();


    const { text } = body;


    if (!text) {

      return NextResponse.json(
        {
          error: "No document text provided",
        },
        {
          status: 400,
        }
      );

    }



    const analysis = {

      summary:
        "This document describes an AI-powered legal assistant platform designed for law firms. The system focuses on email automation, document processing, AI drafting, confidentiality protection, and tenant-based architecture.",


      riskScore:
        "Medium",


      risks: [

        "Client confidentiality requirements must be strictly maintained.",

        "External AI processing requires data protection controls.",

        "Multi-tenant architecture requires strict data isolation.",

        "Legal compliance requirements must be validated before deployment."

      ],



      keyClauses: [

        "Data Protection & Confidentiality",

        "Multi-Tenancy Architecture",

        "AI Processing Rules",

        "Hosting Requirements",

        "User Approval Workflow"

      ],



      recommendations: [

        "Implement access control before production use.",

        "Encrypt sensitive legal information.",

        "Maintain human approval before AI-generated communication is sent."

      ]

    };



    return NextResponse.json({

      analysis

    });



  } catch {


    return NextResponse.json(

      {
        error: "Analysis failed",
      },

      {
        status: 500,
      }

    );


  }

}