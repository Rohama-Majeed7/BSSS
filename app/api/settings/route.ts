import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const setting = await prisma.schoolSetting.findFirst();
    return NextResponse.json({ ok: true, setting });
  } catch (err: any) {
    logApiError("GET /api/settings", err);
    const { message, status } = handlePrismaError(err, "fetch settings");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { logo, sign, feeReminderTemplate, reminderSentLog } = body;

    const setting = await prisma.schoolSetting.upsert({
      where: { id: 1 },
      update: {
        ...(logo !== undefined && { logo }),
        ...(sign !== undefined && { sign }),
        ...(feeReminderTemplate !== undefined && { feeReminderTemplate }),
        ...(reminderSentLog !== undefined && { reminderSentLog }),
      },
      create: {
        id: 1,
        logo: logo ?? null,
        sign: sign ?? null,
        feeReminderTemplate: feeReminderTemplate ?? null,
        reminderSentLog: reminderSentLog ?? null,
      },
    });

    return NextResponse.json({ ok: true, setting });
  } catch (err: any) {
    logApiError("POST /api/settings", err);
    const { message, status } = handlePrismaError(err, "save settings");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
