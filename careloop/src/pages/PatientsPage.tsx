import { useState } from "react";
import { Search } from "lucide-react";
import { getData } from "../services/storage";
import { providerPatients } from "../services/careGapService";
import {
  PatientTable,
  ProviderFrame,
  RadarDisclaimer,
} from "../components/provider/ProviderUI";
import type { CareStatus } from "../types";
const filters: { value: "all" | CareStatus; label: string }[] = [
  { value: "all", label: "All" },
  { value: "on-track", label: "On Track" },
  { value: "monitor", label: "Monitor" },
  { value: "attention", label: "Needs Attention" },
];
export default function PatientsPage() {
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState<"all" | CareStatus>("all");
  const rows = providerPatients(getData());
  const matches = rows.filter(
    (r) =>
      (filter === "all" || r.gap.level === filter) &&
      `${r.patient.name} ${r.patient.carePlan}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <ProviderFrame>
      <header className="dashboard-heading">
        <div>
          <span className="eyebrow">YOUR DEMO COHORT</span>
          <h1>Patients</h1>
          <p>Find a patient. Understand their follow-up journey.</p>
        </div>
        <span className="stage-chip">{rows.length} fictional patients</span>
      </header>
      <section className="table-card">
        <div className="list-controls">
          <label className="search-box">
            <Search size={18} />
            <span className="sr-only">Search patients or care plans</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search patients or care plans…"
            />
          </label>
          <div
            className="filter-group"
            role="group"
            aria-label="Filter by follow-up status"
          >
            {filters.map((f) => (
              <button
                key={f.value}
                aria-pressed={filter === f.value}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className="result-count" role="status">
          {matches.length} of {rows.length} patients · highest priority first
        </p>
        {matches.length ? (
          <PatientTable rows={matches} />
        ) : (
          <div className="empty-state">
            <Search size={28} />
            <h2>No patients found</h2>
            <p>Try another name, care plan, or follow-up status.</p>
            <button
              className="button secondary"
              onClick={() => {
                setQuery("");
                setFilter("all");
              }}
            >
              Clear filters
            </button>
          </div>
        )}
      </section>
      <RadarDisclaimer />
    </ProviderFrame>
  );
}
