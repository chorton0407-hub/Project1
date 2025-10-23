import {prisma} from '../../../lib/prisma';
import {NextResponse} from "next/server";
import * as bcrypt from "bcryptjs";
import {z} from "zod";

const RegisterSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().optional(),
});

export async function POST(req: Request) {
    const body = await req.json();
    const parsed = RegisterSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({error:"Invalid"}, {status: 400});
    const { email, password, name } = parsed.data;
    const exists = await prisma.user.findUnique({where:{email} });
    if (exists) return NextResponse.json({error:"Email in use"}, {status: 409});
const passwordHash = await bcrypt.hash(password, 12);
const user = await prisma.user.create({ data: {email, name, passwordHash} });
return NextResponse.json({id: user.id, email: user.email});
}