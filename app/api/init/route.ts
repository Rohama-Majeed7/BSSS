import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [students, teachers, examResults, attendanceRecords, feePayments, setting] =
      await Promise.all([
        prisma.student.findMany({ orderBy: { id: "desc" } }),
        prisma.teacher.findMany({ orderBy: { id: "asc" } }),
        prisma.examResult.findMany({
          orderBy: { id: "desc" },
          include: { student: { select: { name: true, admNo: true, class: true, father: true } } },
        }),
        prisma.studentAttendance.findMany(),
        prisma.feePayment.findMany({ orderBy: { id: "desc" }, take: 100 }),
        prisma.schoolSetting.findFirst(),
      ]);

    const attendanceMap: Record<string, Record<string, string>> = {};
    for (const att of attendanceRecords) {
      if (!attendanceMap[att.date]) attendanceMap[att.date] = {};
      attendanceMap[att.date][String(att.studentId)] = att.status;
    }

    return NextResponse.json({
      ok: true,
      hasDbData: students.length > 0 || teachers.length > 0,
      data: { students, teachers, examResults, attendanceMap, feePayments, setting },
    });
  } catch (err: any) {
    logApiError("GET /api/init", err);
    const { message, status } = handlePrismaError(err, "load application data");
    return NextResponse.json({ ok: false, error: message, hasDbData: false }, { status });
  }
}
