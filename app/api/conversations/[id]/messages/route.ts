import {prisma} from '../../../../../lib/prisma';
import {getServerSession} from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import {NextResponse} from "next/server";

export const runtime = "nodejs";

export async function GET(_: Request, {params}: {params: {id: string}}) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({error: "Unauthorized"}, {status: 401});
    const user = await prisma.user.findUnique({where:{email: session.user.email}});
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
    const convo = await prisma.conversation.findFirst({ where: {id: params.id, userId: user.id}});
    if (!convo) return NextResponse.json({error: "Conversation not found"}, {status: 404});
    const messages = await prisma.message.findMany({where: {conversationId: convo.id}, orderBy: {createdAt: "asc"}});
    return NextResponse.json({messages});
}
