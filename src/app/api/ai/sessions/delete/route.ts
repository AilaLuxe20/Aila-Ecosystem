import { NextResponse } from "next/server";
import { AilaAuthenticationError, requirePrismaUser } from "@/core/auth/clerk-user";
import { deleteUserConversation } from "@/core/ai/conversation/service";

export async function POST(req:Request){
    try {
        const user = await requirePrismaUser();
        const {id, conversationId, sessionId}=await req.json();
        const targetId = conversationId ?? sessionId ?? id;

        if (!targetId) {
            return NextResponse.json(
                { error: "conversationId is required." },
                { status: 400 }
            );
        }

        const deleted = await deleteUserConversation(user.id, targetId);

        return NextResponse.json({
            success:true,
            deleted
        });
    } catch (error) {
        if (error instanceof AilaAuthenticationError) {
            return NextResponse.json({ error: error.message }, { status: 401 });
        }

        console.error("Aila Session Delete Error:", error);
        return NextResponse.json(
            { error: "Unable to delete the conversation." },
            { status: 500 }
        );
    }

}
