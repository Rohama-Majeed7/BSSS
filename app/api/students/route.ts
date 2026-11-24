import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";
import {
  getStudentPhotoUrl,
  deleteStudentPhoto,
  isValidPhotoKey,
  isExternalOrDataUrl,
  validatePhotoKeyForSave,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const students = await prisma.student.findMany({
      orderBy: { id: "desc" },
    });

    const studentsWithPhotos = await Promise.all(
      students.map(async (student) => ({
        ...student,
        photoUrl: await getStudentPhotoUrl(student.photo),
      }))
    );

    return NextResponse.json({
      ok: true,
      students: studentsWithPhotos,
    });
  } catch (err: any) {
    logApiError("GET /api/students", err);
    const { message, status } = handlePrismaError(err, "fetch students");
    return NextResponse.json(
      { ok: false, error: message },
      { status }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

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
      photoKey,
    } = body;

    if (!admNo || !name || !father || !studentClass) {
      return NextResponse.json(
        { ok: false, error: "Admission No, Student Name, Father Name and Class are all required." },
        { status: 400 }
      );
    }

    const studentId = id && Number(id) > 0 ? Number(id) : null;
    const existingStudent = studentId
      ? await prisma.student.findUnique({
          where: { id: studentId },
          select: { id: true, photo: true },
        })
      : null;

    if (studentId && !existingStudent) {
      return NextResponse.json(
        { ok: false, error: "Student record not found." },
        { status: 404 }
      );
    }

    const rawPhotoInput = photoKey !== undefined ? photoKey : photo;
    const photoValidation = validatePhotoKeyForSave({
      rawPhotoInput,
      existingPhoto: existingStudent?.photo,
      expectedPrefix: "students/",
      entityLabel: "student",
    });

    if (!photoValidation.ok) {
      return NextResponse.json(
        { ok: false, error: photoValidation.error },
        { status: 400 }
      );
    }

    const normalizedPhoto = photoValidation.photo;

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
      photo: normalizedPhoto,
    };

    const previousPhoto = existingStudent?.photo?.trim() || null;

    let student;
    if (studentId) {
      student = await prisma.student.update({
        where: { id: studentId },
        data: payload,
      });

      // If the student's stored photo was replaced or cleared via save, delete the superseded object.
      if (
        previousPhoto &&
        previousPhoto !== normalizedPhoto &&
        isValidPhotoKey(previousPhoto, "students/")
      ) {
        try {
          await deleteStudentPhoto(previousPhoto);
        } catch (cleanupErr) {
          console.warn(
            "Warning: Student updated, but superseded photo could not be deleted from storage:",
            previousPhoto,
            cleanupErr
          );
        }
      }
    } else {
      student = await prisma.student.create({ data: payload });
    }

    return NextResponse.json({
      ok: true,
      student: {
        ...student,
        photoUrl: await getStudentPhotoUrl(student.photo),
      },
    });
  } catch (err: any) {
    logApiError("POST /api/students", err);
    const { message, status } = handlePrismaError(err, "save student");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    let studentId = queryId ? Number(queryId) : null;

    if (!studentId) {
      const body = await req.json().catch(() => ({}));
      studentId = body.id ? Number(body.id) : null;
    }

    if (!studentId || isNaN(studentId) || !Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ ok: false, error: "Missing or invalid student ID." }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, photo: true },
    });

    if (!student) {
      return NextResponse.json({ ok: false, error: "Student not found." }, { status: 404 });
    }

    if (student.photo && (isExternalOrDataUrl(student.photo) || isValidPhotoKey(student.photo, "students/"))) {
      await deleteStudentPhoto(student.photo);
    }

    await prisma.student.delete({ where: { id: studentId } });
    return NextResponse.json({ ok: true, deletedId: studentId });
  } catch (err: any) {
    logApiError("DELETE /api/students", err);
    const { message, status } = handlePrismaError(err, "delete student");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
