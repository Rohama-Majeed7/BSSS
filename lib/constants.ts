export const SCHOOL_INFO = {
  name: "Bright Stars Science School & Academy",
  nameUpper: "BRIGHT STARS SCIENCE SCHOOL & ACADEMY",
  urduName: "برائٹ سٹارز سائنس سکول اینڈ اکیڈمی",
  emis: "323320474",
  principal: "Rahmatullah Dogar",
  address: "Basti Jaisal Wain, Jhang Road, Muzaffargarh",
  urduAddress: "بستی جیسل وائن، جھنگ روڈ، مظفرگڑھ",
};

export const SCHOOL_CLASSES = [
  "Nursery",
  "Prep",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
] as const;

export type SchoolClass = (typeof SCHOOL_CLASSES)[number];

export const VALID_TABS = [
  "dashboard",
  "students",
  "attendance",
  "fees",
  "results",
  "idcards",
  "slc",
  "staff",
  "excelhub",
] as const;

export type ValidTab = (typeof VALID_TABS)[number];

export const DEFAULT_FEE_REMINDER_TEMPLATE =
  "Assalam-o-Alaikum Respected {father}, monthly fee reminder from {school} (EMIS: {emis}), Muzaffargarh for {month}:\n" +
  "• Student: {student} (Adm #{admNo}, {class})\n" +
  "• Total Monthly Fee: Rs. {totalFee}\n" +
  "• Paid Amount: Rs. {paid}\n" +
  "• Balance Due: Rs. {balance}\n" +
  "Kindly clear the fee at your earliest convenience. JazakAllah!";

