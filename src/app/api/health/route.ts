import { NextResponse } from "next/server";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    await db.execute(sql`SELECT 1`);
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      restaurant: "Koreyaki",
      db: "connected",
    });
  } catch (e) {
    return NextResponse.json(
      { status: "error", error: String(e) },
      { status: 500 }
    );
  }
}
