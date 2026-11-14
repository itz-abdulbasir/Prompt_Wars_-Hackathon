import type { ReactNode } from "react";
import type { CareStatus } from "../../types";
const labels = {
  "on-track": "On Track",
  monitor: "Monitor",
  attention: "Needs Attention",
};
export function StatusBadge({ status }: { status: CareStatus }) {
  return <span className={`badge ${status}`}>{labels[status]}</span>;
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
export function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Card>
      <span className="muted">{label}</span>
      <strong className="stat">{value}</strong>
    </Card>
  );
}
export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const v = Math.min(100, Math.max(0, value));
  return (
    <div>
      <div className="row">
        <span>{label}</span>
        <b>{v}%</b>
      </div>
      <div
        className="progress"
        role="progressbar"
        aria-label={label}
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <span style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
export function PageHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <header className="page-heading">
      <span className="eyebrow">{eyebrow}</span>
      <h1>{title}</h1>
      {children}
    </header>
  );
}
