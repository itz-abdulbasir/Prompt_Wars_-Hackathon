import type { DemoData, Patient } from "../types";
import { relativeDate } from "../utils/dates";
export function createSeedData(now = new Date()): DemoData {
  const names = [
    "Arjun Mehta",
    "Priya Sharma",
    "Rahul Das",
    "Aisha Khan",
    "Neha Roy",
    "Kabir Ali",
    "Maya Sen",
    "Dev Patel",
  ];
  const patients: Patient[] = names.map((name, i) => ({
    id: `patient-${i + 1}`,
    name,
    age: 24 + i * 4,
    carePlan: [
      "Post-consultation follow-up",
      "Routine care review",
      "Recovery follow-up",
    ][i % 3],
    carePlanStart: relativeDate(-7, now),
    carePlanEnd: relativeDate(7, now),
    adherence: i === 0 ? 57 : i === 1 ? 86 : i === 3 ? 71 : 100,
    status: i === 0 || i === 3 ? "attention" : i === 4 ? "monitor" : "on-track",
  }));
  return {
    version: 1,
    patients,
    medications: patients.map((p) => ({
      id: `med-${p.id}`,
      patientId: p.id,
      name: "Demo medication",
      dosage: "Fictional schedule",
      time: "09:00",
      instructions: "Synthetic example only; not a prescription.",
    })),
    medicationLogs: patients.flatMap((p, i) =>
      Array.from({ length: 7 }, (_, day) => ({
        id: `log-${p.id}-${day}`,
        patientId: p.id,
        medicationId: `med-${p.id}`,
        date: relativeDate(day - 6, now),
        status:
          (i === 0 && day < 3) || (i === 1 && day === 0) || (i === 3 && day < 2)
            ? ("missed" as const)
            : ("taken" as const),
      })),
    ),
    appointments: patients.map((p, i) => ({
      id: `appt-${p.id}`,
      patientId: p.id,
      providerName: "Dr. Ananya Rao (fictional)",
      scheduledAt: `${relativeDate(i === 0 ? -1 : i + 1, now)}T10:00:00`,
      status: i === 0 ? "overdue" : "upcoming",
    })),
    checkIns: patients.map((p, i) => ({
      id: `check-${p.id}`,
      patientId: p.id,
      date: relativeDate(i === 0 ? -3 : i === 3 ? -2 : i === 4 ? -2 : 0, now),
      feeling: "same",
      painLevel: 2,
      notes: "Synthetic demo check-in.",
    })),
  };
}
