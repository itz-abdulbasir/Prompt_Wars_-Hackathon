import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, ClipboardCheck, Pill } from "lucide-react";
import { getData } from "../services/storage";
import {
  appointmentStatus,
  daysBetween,
  providerPatients,
} from "../services/careGapService";
import { dateKey } from "../utils/dates";
import { Card, ProgressBar, StatusBadge } from "../components/ui";
import {
  ProviderFrame,
  RadarDisclaimer,
  RadarHeading,
  RadarRules,
} from "../components/provider/ProviderUI";
export default function PatientDetailPage() {
  const { id } = useParams();
  const [now] = useState(() => new Date());
  const data = getData();
  const row = providerPatients(data, now).find((r) => r.patient.id === id);
  if (!row)
    return (
      <ProviderFrame>
        <div className="empty-state">
          <h1>Patient not found</h1>
          <p>This demo patient does not exist.</p>
          <Link className="button primary" to="/provider/patients">
            Back to patient list
          </Link>
        </div>
      </ProviderFrame>
    );
  const { patient, activity, gap } = row;
  const total = Math.max(
    1,
    daysBetween(patient.carePlanStart, patient.carePlanEnd) + 1,
  );
  const elapsed = Math.min(
    total,
    Math.max(0, daysBetween(patient.carePlanStart, dateKey(now)) + 1),
  );
  const medications = data.medications.filter((m) => m.patientId === id);
  return (
    <ProviderFrame>
      <Link className="back-link" to="/provider/patients">
        <ArrowLeft size={16} />
        All patients
      </Link>
      <header className="dashboard-heading">
        <div>
          <span className="eyebrow">
            FICTIONAL PATIENT · {patient.id.toUpperCase()}
          </span>
          <h1>{patient.name}</h1>
          <p>
            {patient.age} years · {patient.carePlan}
          </p>
        </div>
        <StatusBadge status={gap.level} />
      </header>
      <div className="detail-grid">
        <section className="radar-panel">
          <RadarHeading />
          <div className="score-line">
            <strong>
              {gap.score}
              <small>/ 7</small>
            </strong>
            <div>
              <b>Follow-up priority points</b>
              <p>Calculated from recorded activity.</p>
            </div>
          </div>
          {gap.reasons.length ? (
            <ul className="reason-list">
              {gap.reasons.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          ) : (
            <p>
              No recorded follow-up gap triggers the demo rules. This does not
              establish medical wellbeing or complete medication adherence.
            </p>
          )}
          <RadarDisclaimer />
          <RadarRules />
        </section>
        <Card>
          <span className="eyebrow">CARE PROGRESS</span>
          <h2>One day at a time</h2>
          <p>
            {patient.carePlanStart} — {patient.carePlanEnd}
          </p>
          <ProgressBar
            label={`Care plan · day ${elapsed} of ${total}`}
            value={Math.round((elapsed / total) * 100)}
          />
          <p className="metric-note">
            Calendar progress, not a measure of recovery.
          </p>
          {activity.adherence === null ? (
            <p>No medication entries in the last 7 days.</p>
          ) : (
            <ProgressBar
              label="Recorded adherence · 7 days"
              value={activity.adherence}
            />
          )}
          <p className="metric-note">
            {activity.taken} taken of {activity.logs.length} recorded entries.
            Unrecorded doses are excluded.
          </p>
        </Card>
      </div>
      <div className="detail-grid">
        <Card>
          <h2 className="icon-heading">
            <Pill size={21} />
            Medication activity
          </h2>
          {medications.length ? (
            medications.map((m) => (
              <div className="medication-block" key={m.id}>
                <h3>{m.name}</h3>
                <p>
                  {m.dosage} · Scheduled at {m.time}
                </p>
                <small>{m.instructions}</small>
                <div className="log-list">
                  {activity.logs
                    .filter((l) => l.medicationId === m.id)
                    .sort((a, b) => b.date.localeCompare(a.date))
                    .map((l) => (
                      <div key={l.id}>
                        <time>{l.date}</time>
                        <span
                          className={`badge ${l.status === "taken" ? "on-track" : "monitor"}`}
                        >
                          {l.status === "taken" ? "Taken" : "Missed"}
                        </span>
                      </div>
                    ))}
                </div>
                {!activity.logs.some((l) => l.medicationId === m.id) && (
                  <p>No entries in the last 7 days.</p>
                )}
              </div>
            ))
          ) : (
            <p>No medication schedules recorded.</p>
          )}
        </Card>
        <div className="detail-stack">
          <Card>
            <h2 className="icon-heading">
              <CalendarDays size={21} />
              Follow-up appointments
            </h2>
            {activity.appointments.length ? (
              activity.appointments.map((a) => {
                const status = appointmentStatus(a, now);
                return (
                  <div className="appointment-block" key={a.id}>
                    <div className="row">
                      <b>
                        {new Date(a.scheduledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </b>
                      <span
                        className={`badge ${status === "overdue" ? "attention" : status === "completed" ? "on-track" : "monitor"}`}
                      >
                        {status[0].toUpperCase() + status.slice(1)}
                      </span>
                    </div>
                    <p>
                      {new Date(a.scheduledAt).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · Browser local time
                      <br />
                      {a.providerName}
                    </p>
                  </div>
                );
              })
            ) : (
              <p>No appointments recorded.</p>
            )}
          </Card>
          <Card>
            <h2 className="icon-heading">
              <ClipboardCheck size={21} />
              Recovery check-ins
            </h2>
            {activity.checkIns.length ? (
              <ol className="timeline">
                {activity.checkIns.map((c) => (
                  <li key={c.id}>
                    <time>{c.date}</time>
                    <b>
                      Feeling {c.feeling} · Pain {c.painLevel}/10
                    </b>
                    <p>{c.notes || "No note added."}</p>
                  </li>
                ))}
              </ol>
            ) : (
              <p>No check-ins recorded yet.</p>
            )}
          </Card>
        </div>
      </div>
    </ProviderFrame>
  );
}
