import { createSeedData } from "../data/seed";
import type { DemoData, CheckIn, MedicationLog } from "../types";
import { dateKey } from "../utils/dates";
const KEY = "careloop-data";
let memory: DemoData | undefined;
let notice = "";
export const getStorageNotice = () => notice;
// Check required fields, not only JSON syntax, before accepting saved data.
function valid(value: unknown): value is DemoData {
  if (!value || typeof value !== "object") return false;
  const d = value as DemoData;
  return (
    d.version === 1 &&
    Array.isArray(d.patients) &&
    d.patients.length > 0 &&
    d.patients.every(
      (p) =>
        typeof p.id === "string" &&
        typeof p.name === "string" &&
        typeof p.age === "number" &&
        typeof p.carePlan === "string" &&
        typeof p.carePlanStart === "string" &&
        typeof p.carePlanEnd === "string" &&
        Number.isFinite(p.adherence) &&
        ["on-track", "monitor", "attention"].includes(p.status),
    ) &&
    Array.isArray(d.medications) &&
    d.medications.every(
      (m) =>
        typeof m.id === "string" &&
        d.patients.some((p) => p.id === m.patientId) &&
        typeof m.name === "string" &&
        typeof m.dosage === "string" &&
        typeof m.time === "string",
    ) &&
    Array.isArray(d.medicationLogs) &&
    d.medicationLogs.every(
      (l) =>
        typeof l.id === "string" &&
        typeof l.date === "string" &&
        ["taken", "missed"].includes(l.status) &&
        d.medications.some(
          (m) => m.id === l.medicationId && m.patientId === l.patientId,
        ),
    ) &&
    Array.isArray(d.appointments) &&
    d.appointments.every(
      (a) =>
        typeof a.id === "string" &&
        typeof a.providerName === "string" &&
        Number.isFinite(Date.parse(a.scheduledAt)) &&
        ["upcoming", "completed", "overdue"].includes(a.status) &&
        d.patients.some((p) => p.id === a.patientId),
    ) &&
    Array.isArray(d.checkIns) &&
    d.checkIns.every(
      (c) =>
        typeof c.id === "string" &&
        typeof c.date === "string" &&
        ["better", "same", "worse"].includes(c.feeling) &&
        c.painLevel >= 1 &&
        c.painLevel <= 10 &&
        d.patients.some((p) => p.id === c.patientId),
    )
  );
}
function save(data: DemoData): void {
  memory = structuredClone(data);
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    notice =
      "Browser storage is unavailable. Changes last only for this session.";
  }
}
export function getData(): DemoData {
  if (memory) return structuredClone(memory);
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (valid(parsed)) {
        memory = parsed;
        return structuredClone(parsed);
      }
      notice = "Invalid saved demo data was reset.";
    }
  } catch {
    notice =
      "Saved data could not be read. A fresh demo is loaded; persistence may be unavailable.";
  }
  const data = createSeedData();
  save(data);
  return structuredClone(data);
}
export const getPatients = () => getData().patients;
export const getPatient = (id: string) =>
  getPatients().find((p) => p.id === id);
export function resetDemo(): void {
  notice = "";
  save(createSeedData());
}
export function markMedication(
  patientId: string,
  medicationId: string,
  status: MedicationLog["status"],
): void {
  const data = getData();
  if (
    !["taken", "missed"].includes(status) ||
    !data.medications.some(
      (m) => m.id === medicationId && m.patientId === patientId,
    )
  )
    throw new Error("Medication was not found.");
  const date = dateKey();
  data.medicationLogs = data.medicationLogs.filter(
    (l) =>
      !(
        l.patientId === patientId &&
        l.medicationId === medicationId &&
        l.date === date
      ),
  );
  data.medicationLogs.push({
    id: `${medicationId}-${date}`,
    patientId,
    medicationId,
    date,
    status,
  });
  const logs = data.medicationLogs.filter((l) => l.patientId === patientId);
  const patient = data.patients.find((p) => p.id === patientId)!;
  patient.adherence = Math.round(
    (100 * logs.filter((l) => l.status === "taken").length) / logs.length,
  );
  save(data);
}
export function submitCheckIn(
  patientId: string,
  input: Pick<CheckIn, "feeling" | "painLevel" | "notes">,
): void {
  const data = getData();
  if (!data.patients.some((p) => p.id === patientId))
    throw new Error("Patient was not found.");
  if (
    !["better", "same", "worse"].includes(input.feeling) ||
    !Number.isInteger(input.painLevel) ||
    input.painLevel < 1 ||
    input.painLevel > 10
  )
    throw new Error("Choose a feeling and pain level from 1 to 10.");
  const date = dateKey();
  data.checkIns = data.checkIns.filter(
    (c) => !(c.patientId === patientId && c.date === date),
  );
  data.checkIns.push({
    ...input,
    notes: input.notes?.trim().slice(0, 1000),
    id: `${patientId}-${date}`,
    patientId,
    date,
  });
  save(data);
}
