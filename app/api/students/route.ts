import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const students = await prisma.student.findMany({ orderBy: { id: "desc" } });
    return NextResponse.json({ ok: true, students });
  } catch (err: any) {
    logApiError("GET /api/students", err);
    const { message, status } = handlePrismaError(err, "fetch students");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      admNo,
      receiptNo,
      name,
      father,
      fatherCnic,
      class: studentClass,
      gender,
      dob,
      bform,
      phone,
      fee,
      adj,
      paid,
      payDate,
      payMethod,
      payRemarks,
      address,
      status,
      admClass,
      admDate,
      leaveClass,
      leaveDate,
      conduct,
      leaveReason,
      photo,
    } = body;

    if (!admNo || !name || !father || !studentClass) {
      return NextResponse.json(
        { ok: false, error: "Admission No, Student Name, Father Name and Class are all required." },
        { status: 400 }
      );
    }

    const payload = {
      admNo: String(admNo).trim(),
      receiptNo: receiptNo || `REC-${String(Date.now()).slice(-4)}`,
      name: String(name).trim(),
      father: String(father).trim(),
      fatherCnic: fatherCnic || "",
      class: String(studentClass),
      gender: gender || "Male",
      dob: dob || "",
      bform: bform || "",
      phone: phone || "",
      fee: Number(fee || 0),
      adj: Number(adj || 0),
      paid: Number(paid || 0),
      payDate: payDate || "",
      payMethod: payMethod || "Cash",
      payRemarks: payRemarks || "",
      address: address || "",
      status: status || "Active",
      admClass: admClass || studentClass,
      admDate: admDate || new Date().toISOString().slice(0, 10),
      leaveClass: leaveClass || null,
      leaveDate: leaveDate || null,
      conduct: conduct || "Excellent",
      leaveReason: leaveReason || null,
      photo: photo || null,
    };

    let student;
    if (id && Number(id) > 0) {
      student = await prisma.student.update({
        where: { id: Number(id) },
        data: payload,
      });
    } else {
      student = await prisma.student.create({ data: payload });
    }

    return NextResponse.json({ ok: true, student });
  } catch (err: any) {
    logApiError("POST /api/students", err);
    const { message, status } = handlePrismaError(err, "save student");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    let studentId = queryId ? Number(queryId) : null;

    if (!studentId) {
      const body = await req.json().catch(() => ({}));
      studentId = body.id ? Number(body.id) : null;
    }

    if (!studentId || isNaN(studentId)) {
      return NextResponse.json({ ok: false, error: "Missing or invalid student ID." }, { status: 400 });
    }

    await prisma.student.delete({ where: { id: studentId } });
    return NextResponse.json({ ok: true, deletedId: studentId });
  } catch (err: any) {
    logApiError("DELETE /api/students", err);
    const { message, status } = handlePrismaError(err, "delete student");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
