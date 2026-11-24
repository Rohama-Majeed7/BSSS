import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const teachers = await prisma.teacher.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json({ ok: true, teachers });
  } catch (err: any) {
    logApiError("GET /api/staff", err);
    const { message, status } = handlePrismaError(err, "fetch staff");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id, empId, name, role, cnic, phone, basic, allowance, deduction, att, payStatus, photo } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ ok: false, error: "Staff member name is required." }, { status: 400 });
    }
    if (!role || !String(role).trim()) {
      return NextResponse.json({ ok: false, error: "Designation / role is required." }, { status: 400 });
    }

    const payload = {
      empId: empId || `BS-STF-${String(Date.now()).slice(-4)}`,
      name: String(name).trim(),
      role: String(role).trim(),
      cnic: cnic || "",
      phone: phone || "",
      basic: Number(basic || 0),
      allowance: Number(allowance || 0),
      deduction: Number(deduction || 0),
      att: att || "Present",
      payStatus: payStatus || "Unpaid",
      photo: photo || null,
    };

    let teacher;
    if (id && Number(id) > 0) {
      teacher = await prisma.teacher.update({ where: { id: Number(id) }, data: payload });
    } else {
      teacher = await prisma.teacher.create({ data: payload });
    }

    return NextResponse.json({ ok: true, teacher });
  } catch (err: any) {
    logApiError("POST /api/staff", err);
    const { message, status } = handlePrismaError(err, "save staff member");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    let teacherId = queryId ? Number(queryId) : null;

    if (!teacherId) {
      const body = await req.json().catch(() => ({}));
      teacherId = body.id ? Number(body.id) : null;
    }

    if (!teacherId || isNaN(teacherId)) {
      return NextResponse.json({ ok: false, error: "Missing or invalid staff ID." }, { status: 400 });
    }

    await prisma.teacher.delete({ where: { id: teacherId } });
    return NextResponse.json({ ok: true, deletedId: teacherId });
  } catch (err: any) {
    logApiError("DELETE /api/staff", err);
    const { message, status } = handlePrismaError(err, "delete staff member");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
