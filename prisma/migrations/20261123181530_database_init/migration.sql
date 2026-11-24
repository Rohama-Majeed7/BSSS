-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Administrator',
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Student" (
    "id" SERIAL NOT NULL,
    "admNo" TEXT NOT NULL,
    "receiptNo" TEXT,
    "name" TEXT NOT NULL,
    "father" TEXT NOT NULL,
    "fatherCnic" TEXT,
    "class" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "dob" TEXT NOT NULL,
    "bform" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "fee" DOUBLE PRECISION NOT NULL,
    "adj" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payDate" TEXT,
    "payMethod" TEXT DEFAULT 'Cash',
    "payRemarks" TEXT,
    "address" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "admClass" TEXT NOT NULL,
    "admDate" TEXT NOT NULL,
    "leaveClass" TEXT,
    "leaveDate" TEXT,
    "conduct" TEXT DEFAULT 'Excellent',
    "leaveReason" TEXT,
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudentAttendance" (
    "id" SERIAL NOT NULL,
    "date" TEXT NOT NULL,
    "studentId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeePayment" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "receiptNo" TEXT NOT NULL,
    "billingMonth" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "adj" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "payDate" TEXT NOT NULL,
    "payMethod" TEXT NOT NULL DEFAULT 'Cash',
    "payRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FeePayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExamResult" (
    "id" SERIAL NOT NULL,
    "studentId" INTEGER NOT NULL,
    "term" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "rank" TEXT,
    "remarks" TEXT,
    "subjects" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExamResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Teacher" (
    "id" SERIAL NOT NULL,
    "empId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "cnic" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "basic" DOUBLE PRECISION NOT NULL,
    "allowance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "deduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "att" TEXT NOT NULL DEFAULT 'Present',
    "payStatus" TEXT NOT NULL DEFAULT 'Unpaid',
    "photo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Teacher_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolSetting" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT NOT NULL DEFAULT 'Bright Stars Science School & Academy',
    "nameUpper" TEXT NOT NULL DEFAULT 'BRIGHT STARS SCIENCE SCHOOL & ACADEMY',
    "urduName" TEXT NOT NULL DEFAULT 'برائٹ سٹارز سائنس سکول اینڈ اکیڈمی',
    "emis" TEXT NOT NULL DEFAULT '323320474',
    "principal" TEXT NOT NULL DEFAULT 'Rahmatullah Dogar',
    "address" TEXT NOT NULL DEFAULT 'Basti Jaisal Wain, Jhang Road, Muzaffargarh',
    "urduAddress" TEXT NOT NULL DEFAULT 'بستی جیسل وائن، جھنگ روڈ، مظفرگڑھ',
    "logo" TEXT,
    "sign" TEXT,
    "feeReminderTemplate" TEXT,
    "reminderSentLog" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Student_admNo_key" ON "Student"("admNo");

-- CreateIndex
CREATE INDEX "Student_class_idx" ON "Student"("class");

-- CreateIndex
CREATE INDEX "Student_status_idx" ON "Student"("status");

-- CreateIndex
CREATE INDEX "StudentAttendance_date_idx" ON "StudentAttendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "StudentAttendance_studentId_date_key" ON "StudentAttendance"("studentId", "date");

-- CreateIndex
CREATE INDEX "FeePayment_studentId_idx" ON "FeePayment"("studentId");

-- CreateIndex
CREATE INDEX "FeePayment_billingMonth_idx" ON "FeePayment"("billingMonth");

-- CreateIndex
CREATE INDEX "ExamResult_studentId_idx" ON "ExamResult"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Teacher_empId_key" ON "Teacher"("empId");

-- AddForeignKey
ALTER TABLE "StudentAttendance" ADD CONSTRAINT "StudentAttendance_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FeePayment" ADD CONSTRAINT "FeePayment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExamResult" ADD CONSTRAINT "ExamResult_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
