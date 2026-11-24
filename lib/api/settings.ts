import { api } from "./client";
import { SchoolSettingRecord } from "./dashboard";

export interface SettingsPayload {
  logo?: string | null;
  sign?: string | null;
  feeReminderTemplate?: string | null;
  reminderSentLog?: Record<string, Record<string, string>> | null;
}

export interface SettingsResponse {
  ok: boolean;
  setting: SchoolSettingRecord;
}

/**
 * Fetch school branding and reminder settings from the database.
 */
export async function getSchoolSettings(): Promise<SchoolSettingRecord | null> {
  const res = await api.get<SettingsResponse>("/api/settings");
  return res.setting || null;
}

/**
 * Save / update school branding and configuration settings in the database.
 */
export async function updateSchoolSettings(
  data: SettingsPayload
): Promise<SchoolSettingRecord> {
  const res = await api.post<SettingsResponse>("/api/settings", data);
  return res.setting;
}

/**
 * Update school logo in the database.
 */
export async function updateLogo(logo: string): Promise<SchoolSettingRecord> {
  return await updateSchoolSettings({ logo });
}

/**
 * Update principal signature in the database.
 */
export async function updateSignature(sign: string): Promise<SchoolSettingRecord> {
  return await updateSchoolSettings({ sign });
}

/**
 * Update monthly WhatsApp fee reminder template in the database.
 */
export async function updateFeeReminderTemplate(
  feeReminderTemplate: string
): Promise<SchoolSettingRecord> {
  return await updateSchoolSettings({ feeReminderTemplate });
}

/**
 * Update WhatsApp monthly fee reminder sent log in the database.
 */
export async function updateReminderSentLog(
  reminderSentLog: Record<string, Record<string, string>>
): Promise<SchoolSettingRecord> {
  return await updateSchoolSettings({ reminderSentLog });
}
