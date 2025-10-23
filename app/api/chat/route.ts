import {NextResponse} from "next/server";
import {getServerSession} from "next-auth";
import {authOptions} from "../../../lib/auth";
import {prisma} from '../../../lib/prisma';
import {getModel} from '../../../lib/gemini';
import {sseHeaders, sseChunk} from '../../../lib/sse';

export const runtime = "nodejs"; 

export async function POST(req:Request){
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { conversationId, message } = await req.json();
    if (!conversationId || !message) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

    const convo = await prisma.conversation.findFirst({ where: { id: conversationId, userId: user.id } });
    if (!convo) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });

    const userMsg = await prisma.message.create({
        data: {conversationId, role: "user", content: message},
    });

    const stream = new ReadableStream({
        async start(controller) {
            const encoder = new TextEncoder();
            try {
                const model = getModel();
                const history = await prisma.message.findMany({
                    where: {conversationId: conversationId},
                    orderBy: {createdAt: "asc"},
                    take: 40,
                });
                const histortyToGemini = history.map((m: { role: string; content: string }) => ({
                    role: m.role === "user" ? "user" : "model",
                    parts: [{text: m.content}],
                }));

                const result = await model.generateContentStream({
                    contents: histortyToGemini,
                });
                
                let full = "";
                for await (const chunk of result.stream) {
                    const piece = chunk.text();
                    full += piece;
                    controller.enqueue(encoder.encode(sseChunk("delta", {text: piece})));
                }

                await prisma.message.create({
                    data: {conversationId, role: "assistant", content: full},
                });

                controller.enqueue(encoder.encode(sseChunk("done", {})));
                controller.close();
            } catch (err: any) {
                controller.enqueue(encoder.encode(sseChunk("error", {message: err?.message || "stream error"})));
                controller.close();
            }
        }
    });
    return new Response(stream, {headers: sseHeaders() });
}