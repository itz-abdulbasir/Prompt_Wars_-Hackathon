import type { Appointment, CareGapResult, DemoData } from "../types";
import { dateKey, relativeDate } from "../utils/dates";
// Calendar-day arithmetic stays stable across daylight-saving changes.
export function daysBetween(start: string, end: string): number {
  const toDay = (value: string) => {
    const [y, m, d] = value.split("-").map(Number);
    return Date.UTC(y, m - 1, d) / 86400000;
  };
  return toDay(end) - toDay(start);
}
export function appointmentStatus(
  appointment: Appointment,
  now = new Date(),
): Appointment["status"] {
  if (appointment.status === "completed") return "completed";
  return new Date(appointment.scheduledAt).getTime() < now.getTime()
    ? "overdue"
    : "upcoming";
}
export function patientActivity(
  data: DemoData,
  patientId: string,
  now = new Date(),
) {
  const today = dateKey(now),
    start = relativeDate(-6, now);
  const logs = data.medicationLogs.filter(
    (l) => l.patientId === patientId && l.date >= start && l.date <= today,
  );
  const checkIns = data.checkIns
    .filter((c) => c.patientId === patientId && c.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date));
  const appointments = data.appointments
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));
  const taken = logs.filter((l) => l.status === "taken").length;
  return {
    logs,
    checkIns,
    appointments,
    taken,
    missed: logs.length - taken,
    adherence: logs.length ? Math.round((taken / logs.length) * 100) : null,
    lastCheckIn: checkIns[0],
  };
}
export function calculateCareGap(
  data: DemoData,
  patientId: string,
  now = new Date(),
): CareGapResult {
  const patient = data.patients.find((p) => p.id === patientId);
  if (!patient) throw new Error("Patient was not found.");
  const activity = patientActivity(data, patientId, now);
  let score = 0;
  const reasons: string[] = [];
  if (
    activity.appointments.some((a) => appointmentStatus(a, now) === "overdue")
  ) {
    score += 3;
    reasons.push("Follow-up appointment is overdue (+3)");
  }
  if (activity.missed >= 2) {
    score += 2;
    reasons.push(
      `${activity.missed} medication entries marked missed in the last 7 days (+2)`,
    );
  }
  const days = daysBetween(
    activity.lastCheckIn?.date ?? patient.carePlanStart,
    dateKey(now),
  );
  if (days >= 2) {
    score += 2;
    reasons.push(
      activity.lastCheckIn
        ? `No recovery check-in for ${days} days (+2)`
        : `No recovery check-in since care plan started ${days} days ago (+2)`,
    );
  }
  return {
    score,
    level: score >= 4 ? "attention" : score >= 2 ? "monitor" : "on-track",
    reasons,
  };
}
export function providerPatients(data: DemoData, now = new Date()) {
  return data.patients
    .map((patient) => ({
      patient,
      activity: patientActivity(data, patient.id, now),
      gap: calculateCareGap(data, patient.id, now),
    }))
    .sort(
      (a, b) =>
        b.gap.score - a.gap.score ||
        a.patient.name.localeCompare(b.patient.name),
    );
}
export type ProviderPatient = ReturnType<typeof providerPatients>[number];
