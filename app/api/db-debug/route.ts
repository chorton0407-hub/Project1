export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // DB, user, current schema, and a few user tables if they exist
    const info: any[] = await prisma.$queryRawUnsafe(`
      select
        current_database() as db,
        current_user as usr,
        current_schema() as schema,
        version() as ver
    `);

    const tables: any[] = await prisma.$queryRawUnsafe(`
      select table_schema, table_name
      from information_schema.tables
      where table_schema = current_schema()
      order by table_schema, table_name
      limit 200
    `);

    return NextResponse.json({
      ok: true,
      envHasUrl: !!process.env.DATABASE_URL,
      info: info[0],
      tables,
    });
  } catch (e: any) {
    console.error("/api/db-debug error:", e);
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}