import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getData } from "../services/storage";
import {
  appointmentStatus,
  providerPatients,
} from "../services/careGapService";
import { dateKey } from "../utils/dates";
import { Card, StatCard } from "../components/ui";
import {
  CareGapCard,
  PatientTable,
  ProviderFrame,
  RadarDisclaimer,
  RadarHeading,
  RadarRules,
} from "../components/provider/ProviderUI";
export default function ProviderDashboard() {
  const [now] = useState(() => new Date());
  const data = getData(),
    rows = providerPatients(data, now);
  const today = dateKey(now);
  const active = data.patients.filter(
    (p) => p.carePlanStart <= today && p.carePlanEnd >= today,
  ).length;
  const measured = rows.filter((r) => r.activity.adherence !== null);
  const average = measured.length
    ? `${Math.round(measured.reduce((sum, r) => sum + r.activity.adherence!, 0) / measured.length)}%`
    : "No entries";
  const due = data.appointments.filter(
    (a) =>
      appointmentStatus(a, now) !== "completed" &&
      a.scheduledAt.slice(0, 10) <= today,
  ).length;
  const attention = rows.filter((r) => r.gap.level === "attention").length;
  const queue = rows.filter((r) => r.gap.score >= 2).slice(0, 3);
  return (
    <ProviderFrame>
      <header className="dashboard-heading">
        <div>
          <span className="eyebrow">CONTINUITY, AT A GLANCE</span>
          <h1>Your care overview</h1>
          <p>A shared view of the moments between visits.</p>
        </div>
        <span className="date-chip">
          <CalendarDays size={15} />
          {now.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      </header>
      <div className="provider-stats">
        <StatCard label="Active patients" value={active} />
        <StatCard label="Need attention" value={attention} />
        <StatCard label="Average adherence" value={average} />
        <StatCard label="Follow-ups due" value={due} />
      </div>
      <p className="metric-note">
        Active: within care-plan dates · Adherence: mean of patient
        recorded-entry rates over 7 days · Due: overdue or scheduled today,
        excluding completed.
      </p>
      <section className="radar-panel">
        <RadarHeading />
        {queue.length ? (
          <div className="gap-grid">
            {queue.map((r) => (
              <CareGapCard key={r.patient.id} row={r} />
            ))}
          </div>
        ) : (
          <Card>
            <h3>No follow-up gaps flagged</h3>
            <p>No recorded activity currently triggers the demo rules.</p>
          </Card>
        )}
        <RadarDisclaimer />
        <RadarRules />
      </section>
      <section className="table-card">
        <div className="section-title">
          <div>
            <h2>Patient overview</h2>
            <p>Sorted by follow-up priority, highest first.</p>
          </div>
          <Link className="review-link" to="/provider/patients">
            View all patients <ArrowRight size={16} />
          </Link>
        </div>
        <PatientTable rows={rows.slice(0, 5)} />
      </section>
    </ProviderFrame>
  );
}
