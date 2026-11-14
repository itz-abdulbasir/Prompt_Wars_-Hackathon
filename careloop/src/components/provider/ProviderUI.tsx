import type { ReactNode } from "react";
import { Link, NavLink } from "react-router-dom";
import {
  ArrowUpRight,
  Radar,
  ShieldCheck,
  LayoutDashboard,
  Users,
} from "lucide-react";
import { Card, ProgressBar, StatusBadge } from "../ui";
import type { ProviderPatient } from "../../services/careGapService";
export function ProviderFrame({ children }: { children: ReactNode }) {
  return (
    <div className="provider-shell">
      <aside className="provider-sidebar">
        <span className="eyebrow">WORKSPACE</span>
        <NavLink end to="/provider">
          <LayoutDashboard size={17} />
          Overview
        </NavLink>
        <NavLink to="/provider/patients">
          <Users size={17} />
          Patients
        </NavLink>
        <div className="sidebar-note">
          <ShieldCheck size={20} />
          <b>A transparent approach</b>
          <p>Recorded follow-up gaps, always explained.</p>
          <small>Synthetic data only</small>
        </div>
      </aside>
      <div className="provider-main">
        <div className="provider-top">
          <span>
            Provider Portal <span className="muted">/ Demo workspace</span>
          </span>
          <div className="profile">
            <span className="avatar">AR</span>
            <div>
              <b>Dr. Ananya Rao</b>
              <small>Fictional provider</small>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
export function RadarDisclaimer() {
  return (
    <p className="radar-disclaimer">
      <ShieldCheck size={16} />
      CareGap Radar prioritizes recorded follow-up gaps. It is not a clinical
      risk score or diagnostic tool.
    </p>
  );
}
export function RadarRules() {
  return (
    <details className="radar-rules">
      <summary>How priorities are calculated</summary>
      <ul>
        <li>Any overdue, incomplete follow-up: +3.</li>
        <li>
          Two or more entries explicitly marked missed in the last 7 calendar
          days: +2.
        </li>
        <li>
          No check-in for at least 2 calendar days: +2. If none exists, count
          from the care plan start.
        </li>
      </ul>
      <p>
        0–1: On Track · 2–3: Monitor · 4–7: Needs Attention. One missed entry
        alone adds no points. Unrecorded doses are not treated as missed; On
        Track only means no rule was triggered.
      </p>
    </details>
  );
}
export function CareGapCard({ row }: { row: ProviderPatient }) {
  return (
    <Card className={`gap-card gap-${row.gap.level}`}>
      <div className="row">
        <span className="avatar">
          {row.patient.name
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </span>
        <StatusBadge status={row.gap.level} />
      </div>
      <h3>{row.patient.name}</h3>
      <span className="gap-score">
        {row.gap.score} / 7 follow-up priority points
      </span>
      <ul>
        {row.gap.reasons.map((r) => (
          <li key={r}>{r}</li>
        ))}
      </ul>
      <Link className="review-link" to={`/provider/patient/${row.patient.id}`}>
        Review Patient <ArrowUpRight size={16} />
      </Link>
    </Card>
  );
}
export function PatientTable({ rows }: { rows: ProviderPatient[] }) {
  return (
    <div className="table-scroll" tabIndex={0} role="region" aria-label="Patient table; scroll horizontally on small screens">
      <table className="patient-table">
        <caption className="sr-only">
          Fictional patient follow-up overview
        </caption>
        <thead>
          <tr>
            <th>Patient / care plan</th>
            <th>Recorded adherence</th>
            <th>Last check-in</th>
            <th>Follow-up status</th>
            <th>
              <span className="sr-only">Review</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.patient.id}>
              <td>
                <Link
                  className="patient-name"
                  to={`/provider/patient/${r.patient.id}`}
                >
                  {r.patient.name}
                </Link>
                <small>{r.patient.carePlan}</small>
              </td>
              <td>
                {r.activity.adherence === null ? (
                  <span>No entries</span>
                ) : (
                  <ProgressBar
                    value={r.activity.adherence}
                    label="Last 7 days"
                  />
                )}
              </td>
              <td>{r.activity.lastCheckIn?.date ?? "No check-in yet"}</td>
              <td>
                <StatusBadge status={r.gap.level} />
              </td>
              <td>
                <Link
                  className="table-action"
                  to={`/provider/patient/${r.patient.id}`}
                  aria-label={`Review ${r.patient.name}`}
                >
                  <ArrowUpRight size={18} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function RadarHeading() {
  return (
    <div className="radar-title">
      <span className="radar-icon">
        <Radar size={23} />
      </span>
      <div>
        <h2>CareGap Radar</h2>
        <p>The follow-ups that deserve a closer look.</p>
      </div>
      <span className="stage-chip">EXPLAINABLE · RULE-BASED</span>
    </div>
  );
}
