export type CareStatus = "on-track" | "monitor" | "attention";
export interface Patient {
  id: string;
  name: string;
  age: number;
  carePlan: string;
  carePlanStart: string;
  carePlanEnd: string;
  adherence: number;
  status: CareStatus;
}
export interface Medication {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  time: string;
  instructions?: string;
}
export interface MedicationLog {
  id: string;
  medicationId: string;
  patientId: string;
  date: string;
  status: "taken" | "missed";
}
export interface Appointment {
  id: string;
  patientId: string;
  providerName: string;
  scheduledAt: string;
  status: "upcoming" | "completed" | "overdue";
}
export interface CheckIn {
  id: string;
  patientId: string;
  date: string;
  feeling: "better" | "same" | "worse";
  painLevel: number;
  notes?: string;
}
export interface CareGapResult {
  score: number;
  level: CareStatus;
  reasons: string[];
}
export interface DemoData {
  version: 1;
  patients: Patient[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  appointments: Appointment[];
  checkIns: CheckIn[];
}
