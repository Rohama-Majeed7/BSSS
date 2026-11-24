import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const where = date ? { date } : {};
    const records = await prisma.studentAttendance.findMany({ where });
    return NextResponse.json({ ok: true, records });
  } catch (err: any) {
    logApiError("GET /api/attendance", err);
    const { message, status } = handlePrismaError(err, "fetch attendance");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { date, records } = body;

    if (!date || typeof date !== "string") {
      return NextResponse.json({ ok: false, error: "A valid attendance date is required." }, { status: 400 });
    }
    if (!records || typeof records !== "object") {
      return NextResponse.json({ ok: false, error: "Attendance records are required." }, { status: 400 });
    }

    const entries = Object.entries(records as Record<string, string>);
    if (entries.length === 0) {
      return NextResponse.json({ ok: false, error: "No attendance records to save." }, { status: 400 });
    }

    const ops = entries.map(([studentIdStr, status]) => {
      const studentId = Number(studentIdStr);
      return prisma.studentAttendance.upsert({
        where: { studentId_date: { studentId, date } },
        update: { status: String(status) },
        create: { studentId, date, status: String(status) },
      });
    });

    await prisma.$transaction(ops);
    return NextResponse.json({ ok: true, count: ops.length });
  } catch (err: any) {
    logApiError("POST /api/attendance", err);
    const { message, status } = handlePrismaError(err, "save attendance");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
