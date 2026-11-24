import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const feePayments = await prisma.feePayment.findMany({
      orderBy: { id: "desc" },
      take: 200,
      include: {
        student: {
          select: { name: true, admNo: true, class: true, father: true },
        },
      },
    });
    return NextResponse.json({ ok: true, payments: feePayments });
  } catch (err: any) {
    logApiError("GET /api/fees", err);
    const { message, status } = handlePrismaError(err, "fetch fee payments");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, receiptNo, billingMonth, amount, adj, payDate, payMethod, payRemarks } = body;

    if (!studentId || amount === undefined || amount === null) {
      return NextResponse.json(
        { ok: false, error: "Student ID and payment amount are required." },
        { status: 400 }
      );
    }

    const sId = Number(studentId);
    if (isNaN(sId) || sId <= 0) {
      return NextResponse.json({ ok: false, error: "Invalid student ID." }, { status: 400 });
    }

    const paidAmount = Number(amount);
    if (isNaN(paidAmount) || paidAmount < 0) {
      return NextResponse.json({ ok: false, error: "Payment amount must be a valid non-negative number." }, { status: 400 });
    }

    const adjAmount = Number(adj || 0);
    const actualReceiptNo = receiptNo || `REC-${String(Date.now()).slice(-4)}`;
    const actualPayDate = payDate || new Date().toISOString().slice(0, 10);
    const actualPayMethod = payMethod || "Cash";
    const actualBillingMonth =
      billingMonth || new Date().toLocaleString("en-US", { month: "long", year: "numeric" });

    const [paymentRecord, updatedStudent] = await prisma.$transaction([
      prisma.feePayment.create({
        data: {
          studentId: sId,
          receiptNo: actualReceiptNo,
          billingMonth: actualBillingMonth,
          amount: paidAmount,
          adj: adjAmount,
          payDate: actualPayDate,
          payMethod: actualPayMethod,
          payRemarks: payRemarks || null,
        },
      }),
      prisma.student.update({
        where: { id: sId },
        data: {
          paid: paidAmount,
          adj: adjAmount,
          receiptNo: actualReceiptNo,
          payDate: actualPayDate,
          payMethod: actualPayMethod,
          payRemarks: payRemarks || "",
        },
      }),
    ]);

    return NextResponse.json({ ok: true, payment: paymentRecord, student: updatedStudent });
  } catch (err: any) {
    logApiError("POST /api/fees", err);
    const { message, status } = handlePrismaError(err, "record fee payment");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
