import {prisma} from '../../../lib/prisma';
import {getServerSession} from "next-auth";
import {authOptions} from "../../../lib/auth";
import {NextResponse} from "next/server";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({error: "Unauthorized"}, {status: 401});
    const user = await prisma.user.findUnique({where: {email: session.user.email}});
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
    const conversations = await prisma.conversation.findMany({
        where: {userId: user.id},
        orderBy: {updatedAt: "desc"},
        select: {id: true, title: true, createdAt: true, updatedAt: true},
    });
    return NextResponse.json({conversations});
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({error: "Unauthorized"}, {status: 401});
    const user = await prisma.user.findUnique({where: {email: session.user.email}});
    if (!user) return NextResponse.json({error: "Unauthorized"}, {status: 401});
    const {title} = await req.json();
    const convo = await prisma.conversation.create({data:{userId: user.id, title: title ?? "New Chat"}});
    return NextResponse.json({id: convo.id});
}