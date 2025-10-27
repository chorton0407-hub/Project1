export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [info] = await prisma.$queryRawUnsafe(`
    select current_database() as db, current_schema() as schema
  `) as any[];
  const tables = await prisma.$queryRawUnsafe(`
    select table_name from information_schema.tables
    where table_schema = current_schema()
    order by table_name
  `);
  return NextResponse.json({ info, tables });
}