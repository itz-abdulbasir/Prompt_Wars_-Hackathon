import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ClipboardCheck,
  HeartPulse,
  Pill,
  ShieldCheck,
} from "lucide-react";
import { Card, ProgressBar, StatusBadge } from "../components/ui";
import {
  getData,
  getStorageNotice,
  markMedication,
  submitCheckIn,
} from "../services/storage";
import {
  appointmentStatus,
  calculateCareGap,
  patientActivity,
} from "../services/careGapService";
import { dateKey } from "../utils/dates";
import type { CheckIn, MedicationLog } from "../types";

const PATIENT_ID = "patient-1";
export default function PatientDashboard() {
  const [data, setData] = useState(getData);
  const [now, setNow] = useState(() => new Date());
  const today = dateKey(now);
  const existing = data.checkIns.find(
    (c) => c.patientId === PATIENT_ID && c.date === today,
  );
  const [feeling, setFeeling] = useState<CheckIn["feeling"] | "">(
    existing?.feeling ?? "",
  );
  const [pain, setPain] = useState(existing?.painLevel ?? 2);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  // Refresh the calendar and derived status after a background tab is reopened.
  useEffect(() => {
    const refresh = () => setNow(new Date());
    window.addEventListener("focus", refresh);
    const timer = window.setInterval(refresh, 60000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.clearInterval(timer);
    };
  }, []);
  const patient = data.patients.find((p) => p.id === PATIENT_ID);
  if (!patient)
    return (
      <div className="page">
        <h1>Demo patient not found</h1>
        <p>The patient record is unavailable.</p>
        <Link to="/">Return to overview</Link>
      </div>
    );
  const medications = data.medications
    .filter((m) => m.patientId === PATIENT_ID)
    .sort((a, b) => a.time.localeCompare(b.time));
  const activity = patientActivity(data, PATIENT_ID, now);
  const gap = calculateCareGap(data, PATIENT_ID, now);
  const todayLog = (id: string) =>
    data.medicationLogs.find(
      (l) =>
        l.medicationId === id && l.patientId === PATIENT_ID && l.date === today,
    );
  const taken = medications.filter(
    (m) => todayLog(m.id)?.status === "taken",
  ).length;
  const completed = taken + (existing ? 1 : 0),
    total = medications.length + 1;
  const greeting =
    now.getHours() < 12
      ? "Good morning"
      : now.getHours() < 18
        ? "Good afternoon"
        : "Good evening";
  function saveAction(action: () => void, success: string) {
    try {
      action();
      setData(getData());
      setNow(new Date());
      setError("");
      setMessage(
        getStorageNotice()
          ? `${success} ${getStorageNotice()}`
          : `${success} Saved in this browser.`,
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Your update could not be saved. Please try again.",
      );
      setMessage("");
    }
  }
  function recordMedication(id: string, status: MedicationLog["status"]) {
    saveAction(
      () => markMedication(PATIENT_ID, id, status),
      `Medication marked ${status} for today.`,
    );
  }
  function sendCheckIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!feeling) {
      setError(
        "Choose Better, Same, or Worse before submitting your check-in.",
      );
      setMessage("");
      document.querySelector<HTMLInputElement>('input[name="feeling"]')?.focus();
      return;
    }
    saveAction(
      () => submitCheckIn(PATIENT_ID, { feeling, painLevel: pain, notes }),
      existing
        ? "Today’s check-in updated."
        : "Your daily check-in is recorded.",
    );
  }
  return (
    <div className="patient-page">
      <header className="patient-heading">
        <div>
          <span className="eyebrow">PATIENT PORTAL · SYNTHETIC DEMO</span>
          <h1>
            {greeting}, Arjun<span className="greeting-dot">.</span>
          </h1>
          <p>Small steps. A clearer care journey.</p>
        </div>
        <span className="patient-date">
          <CalendarDays size={16} />
          {now.toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "short",
          })}
        </span>
      </header>
      <div className="patient-banner">
        <span className="patient-banner-icon">
          <HeartPulse size={26} />
        </span>
        <div>
          <b>Your care, connected.</b>
          <p>
            Record your day here. See the same updates in the provider’s view.
          </p>
        </div>
        <Link to={`/provider/patient/${PATIENT_ID}`}>
          View provider record <ArrowRight size={16} />
        </Link>
      </div>
      <div className="patient-feedback" aria-live="polite" role="status">
        {message && (
          <p className="success-message">
            <Check size={17} />
            {message}
          </p>
        )}
      </div>
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <div className="patient-columns">
        <div className="patient-main-column">
          <Card className="today-card">
            <div className="section-title">
              <div>
                <span className="eyebrow">ONE STEP AT A TIME</span>
                <h2>Today’s care</h2>
              </div>
              <span className="completion-count">
                {completed}
                <small> / {total}</small>
              </span>
            </div>
            <ProgressBar
              value={Math.round((completed / total) * 100)}
              label={`${completed} of ${total} daily care tasks completed`}
            />
            <p className="metric-note">
              A task is completed when a medication is marked Taken or today’s
              check-in is submitted. Missed is recorded, but not counted as
              completed. Appointments are shown separately.
            </p>
            <div className="task-chips">
              <span>
                <Pill size={15} />
                {taken} of {medications.length} medications taken
              </span>
              <span>
                <ClipboardCheck size={15} />
                {existing ? "Check-in complete" : "Check-in pending"}
              </span>
            </div>
          </Card>
          <section aria-labelledby="medications-title">
            <div className="patient-section-heading">
              <h2 id="medications-title">
                <Pill size={21} />
                Medication schedule
              </h2>
              <span>Today · local time</span>
            </div>
            {medications.length ? (
              medications.map((m) => {
                const log = todayLog(m.id);
                return (
                  <Card className="patient-medication" key={m.id}>
                    <div className="row">
                      <span className="schedule-time">{m.time}</span>
                      <span
                        className={`badge ${log?.status === "taken" ? "on-track" : log?.status === "missed" ? "monitor" : "pending-badge"}`}
                      >
                        {log?.status === "taken"
                          ? "Taken"
                          : log?.status === "missed"
                            ? "Missed"
                            : "Not recorded"}
                      </span>
                    </div>
                    <h3>{m.name}</h3>
                    <p>{m.dosage}</p>
                    <p className="medication-instructions">{m.instructions}</p>
                    <div
                      className="medication-actions"
                      role="group"
                      aria-label={`Record ${m.name}`}
                    >
                      <button
                        className="button taken-button"
                        aria-pressed={log?.status === "taken"}
                        onClick={() => recordMedication(m.id, "taken")}
                      >
                        <Check size={17} />
                        Taken
                      </button>
                      <button
                        className="button missed-button"
                        aria-pressed={log?.status === "missed"}
                        onClick={() => recordMedication(m.id, "missed")}
                      >
                        Missed
                      </button>
                    </div>
                    <small>
                      You can correct today’s entry by choosing the other
                      status.
                    </small>
                  </Card>
                );
              })
            ) : (
              <Card>
                <p>No medication schedule recorded.</p>
              </Card>
            )}
          </section>
          <Card className="checkin-card">
            <span className="eyebrow">A MOMENT FOR YOURSELF</span>
            <h2>How are you feeling today?</h2>
            <p>A short recovery update for your shared demo record.</p>
            <form onSubmit={sendCheckIn} noValidate>
              <fieldset>
                <legend>
                  Compared with yesterday, I feel <span>(required)</span>
                </legend>
                <div className="feeling-options">
                  {(["better", "same", "worse"] as const).map((f) => (
                    <label key={f} className={feeling === f ? "selected" : ""}>
                      <input
                        type="radio"
                        name="feeling"
                        value={f}
                        checked={feeling === f}
                        onChange={() => setFeeling(f)}
                      />
                      <span>{f[0].toUpperCase() + f.slice(1)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="pain-heading">
                <label htmlFor="pain">Pain level</label>
                <output htmlFor="pain">{pain} / 10</output>
              </div>
              <input
                id="pain"
                type="range"
                min="1"
                max="10"
                step="1"
                value={pain}
                onChange={(e) => setPain(Number(e.target.value))}
              />
              <div className="range-labels">
                <span>1 · Low</span>
                <span>10 · High</span>
              </div>
              <label className="notes-label" htmlFor="checkin-notes">
                Anything to add? <span>Optional · synthetic details only</span>
              </label>
              <textarea
                id="checkin-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Add a short demo update…"
              />
              <small className="character-count">{notes.length}/1000</small>
              <button className="button primary submit-checkin" type="submit">
                {existing ? "Update today’s check-in" : "Submit daily check-in"}
                <ArrowRight size={17} />
              </button>
              <p className="metric-note">
                One check-in per day. Updating replaces today’s entry. This
                prototype does not send messages or alert a care team.
              </p>
            </form>
          </Card>
        </div>
        <aside className="patient-side-column">
          <Card>
            <h2 className="icon-heading">
              <CalendarDays size={21} />
              Your follow-up
            </h2>
            {activity.appointments.length ? (
              activity.appointments.map((a) => {
                const status = appointmentStatus(a, now);
                return (
                  <div className="appointment-block" key={a.id}>
                    <span
                      className={`badge ${status === "overdue" ? "attention" : status === "completed" ? "on-track" : "monitor"}`}
                    >
                      {status[0].toUpperCase() + status.slice(1)}
                    </span>
                    <h3 className="appointment-date">
                      {new Date(a.scheduledAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </h3>
                    <p>
                      {new Date(a.scheduledAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · Browser local time
                      <br />
                      {a.providerName}
                    </p>
                    {status === "overdue" && (
                      <p className="appointment-note">
                        This fictional follow-up is overdue. It remains visible
                        in the provider record.
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <p>No appointments recorded.</p>
            )}
          </Card>
          <Card>
            <h2>Recorded activity</h2>
            {activity.adherence === null ? (
              <p>No medication entries in the last 7 days.</p>
            ) : (
              <ProgressBar
                value={activity.adherence}
                label="Recorded adherence · 7 days"
              />
            )}
            <p className="metric-note">
              {activity.taken} taken of {activity.logs.length} recorded entries.
              Unrecorded doses are excluded.
            </p>
            <StatusBadge status={gap.level} />
            <p className="metric-note">
              Provider follow-up priority: {gap.score}/7. This is not a medical
              risk score.
            </p>
            <Link
              className="review-link"
              to={`/provider/patient/${PATIENT_ID}`}
            >
              See the reasons <ArrowRight size={15} />
            </Link>
          </Card>
          <Card>
            <h2 className="icon-heading">
              <ClipboardCheck size={21} />
              Recent check-ins
            </h2>
            {activity.checkIns.length ? (
              <ol className="timeline">
                {activity.checkIns.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <time>{c.date === today ? "Today" : c.date}</time>
                    <b>
                      Feeling {c.feeling} · Pain {c.painLevel}/10
                    </b>
                    <p>{c.notes || "No note added."}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p>Your first check-in will appear here.</p>
            )}
          </Card>
          <div className="patient-safety">
            <ShieldCheck size={19} />
            <p>
              Fictional patient, fictional schedule. CareLoop records follow-up
              activity; it does not diagnose conditions or provide treatment
              advice.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
