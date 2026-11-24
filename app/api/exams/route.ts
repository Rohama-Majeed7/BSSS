import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const results = await prisma.examResult.findMany({
      orderBy: { id: "desc" },
      include: { student: { select: { name: true, admNo: true, class: true, father: true } } },
    });
    return NextResponse.json({ ok: true, results });
  } catch (err: any) {
    logApiError("GET /api/exams", err);
    const { message, status } = handlePrismaError(err, "fetch exam results");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, studentId, term, date, rank, remarks, subjects } = body;

    if (!studentId) {
      return NextResponse.json({ ok: false, error: "Please select a student." }, { status: 400 });
    }
    if (!term) {
      return NextResponse.json({ ok: false, error: "Exam term is required." }, { status: 400 });
    }
    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return NextResponse.json({ ok: false, error: "At least one subject with marks is required." }, { status: 400 });
    }

    const payload = {
      studentId: Number(studentId),
      term: String(term),
      date: date || new Date().toISOString().slice(0, 10),
      rank: rank || "",
      remarks: remarks || "",
      subjects,
    };

    let result;
    if (id && Number(id) > 0) {
      result = await prisma.examResult.update({ where: { id: Number(id) }, data: payload });
    } else {
      result = await prisma.examResult.create({ data: payload });
    }

    return NextResponse.json({ ok: true, result });
  } catch (err: any) {
    logApiError("POST /api/exams", err);
    const { message, status } = handlePrismaError(err, "save exam result");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    let resultId = queryId ? Number(queryId) : null;

    if (!resultId) {
      const body = await req.json().catch(() => ({}));
      resultId = body.id ? Number(body.id) : null;
    }

    if (!resultId || isNaN(resultId)) {
      return NextResponse.json({ ok: false, error: "Missing or invalid result ID." }, { status: 400 });
    }

    await prisma.examResult.delete({ where: { id: resultId } });
    return NextResponse.json({ ok: true, deletedId: resultId });
  } catch (err: any) {
    logApiError("DELETE /api/exams", err);
    const { message, status } = handlePrismaError(err, "delete exam result");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
