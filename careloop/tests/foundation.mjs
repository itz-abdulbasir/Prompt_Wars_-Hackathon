import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  writeFileSync,
  rmSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { createRequire } from "node:module";
const dir = mkdtempSync(join(tmpdir(), "careloop-test-"));
const require = createRequire(import.meta.url);
try {
  writeFileSync(join(dir, "package.json"), '{"type":"commonjs"}');
  for (const name of [
    "services/storage",
    "services/careGapService",
    "types/index",
    "data/seed",
    "utils/dates",
  ]) {
    const target = join(dir, "src", name + ".ts");
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, readFileSync("src/" + name + ".ts", "utf8"));
  }
  writeFileSync(
    join(dir, "tsconfig.json"),
    JSON.stringify({
      compilerOptions: {
        target: "ES2022",
        module: "Node16",
        moduleResolution: "Node16",
        outDir: "out",
        rootDir: "src",
        strict: true,
        skipLibCheck: true,
      },
      include: ["src/**/*.ts"],
    }),
  );
  execFileSync(
    process.execPath,
    ["node_modules/typescript/bin/tsc", "-p", join(dir, "tsconfig.json")],
    { stdio: "inherit" },
  );
  const { calculateCareGap, patientActivity, appointmentStatus } = require(
    join(dir, "out/services/careGapService.js"),
  );
  const { createSeedData } = require(join(dir, "out/data/seed.js"));
  const fixedNow = new Date(2026, 10, 14, 12);
  const seed = createSeedData(fixedNow);
  assert.equal(calculateCareGap(seed, "patient-1", fixedNow).score, 7);
  assert.equal(calculateCareGap(seed, "patient-2", fixedNow).level, "on-track");
  assert.equal(calculateCareGap(seed, "patient-3", fixedNow).score, 0);
  assert.equal(calculateCareGap(seed, "patient-4", fixedNow).score, 4);
  assert.equal(calculateCareGap(seed, "patient-5", fixedNow).score, 2);
  assert.equal(patientActivity(seed, "patient-1", fixedNow).adherence, 57);
  const changed = structuredClone(seed);
  changed.checkIns.find((c) => c.patientId === "patient-1").date = "2026-11-14";
  assert.equal(calculateCareGap(changed, "patient-1", fixedNow).score, 5);
  changed.medicationLogs
    .filter((l) => l.patientId === "patient-1")
    .forEach((l) => (l.status = "taken"));
  assert.equal(calculateCareGap(changed, "patient-1", fixedNow).score, 3);
  changed.appointments.find((a) => a.patientId === "patient-1").status =
    "completed";
  assert.equal(calculateCareGap(changed, "patient-1", fixedNow).score, 0);
  assert.equal(
    appointmentStatus(
      { ...seed.appointments[0], status: "upcoming" },
      fixedNow,
    ),
    "overdue",
  );
  assert.equal(
    appointmentStatus(
      { ...seed.appointments[0], status: "completed" },
      fixedNow,
    ),
    "completed",
  );
  const noRecords = structuredClone(seed);
  noRecords.medicationLogs = [];
  noRecords.checkIns = [];
  assert.equal(
    patientActivity(noRecords, "patient-3", fixedNow).adherence,
    null,
  );
  assert.equal(calculateCareGap(noRecords, "patient-3", fixedNow).score, 2);
  const old = structuredClone(seed);
  old.medicationLogs
    .filter((l) => l.patientId === "patient-1")
    .forEach((l) => (l.date = "2026-10-01"));
  assert.equal(calculateCareGap(old, "patient-1", fixedNow).score, 5);
  assert.throws(() => calculateCareGap(seed, "missing", fixedNow));
  console.log(
    "PASS: CareGap thresholds, explanations, seven-day window, live activity changes, appointment dates, missing records and unknown patient.",
  );
  const values = new Map();
  globalThis.localStorage = {
    getItem: (k) => values.get(k) ?? null,
    setItem: (k, v) => values.set(k, v),
  };
  const file = join(dir, "out/services/storage.js");
  const reload = () => {
    delete require.cache[file];
    return require(file);
  };
  let repo = reload();
  assert.equal(repo.getPatients().length, 8);
  assert.equal(calculateCareGap(repo.getData(), "patient-1").score, 7);
  const copy = repo.getPatients();
  copy[0].name = "Changed";
  assert.equal(repo.getPatients()[0].name, "Arjun Mehta");
  repo.markMedication("patient-1", "med-patient-1", "missed");
  repo.markMedication("patient-1", "med-patient-1", "taken");
  assert.equal(
    repo.getData().medicationLogs.filter((l) => l.patientId === "patient-1")
      .length,
    7,
  );
  repo.submitCheckIn("patient-1", {
    feeling: "better",
    painLevel: 3,
    notes: "test",
  });
  repo.submitCheckIn("patient-1", {
    feeling: "same",
    painLevel: 2,
    notes: "replaced",
  });
  repo = reload();
  assert.equal(calculateCareGap(repo.getData(), "patient-1").score, 5);
  assert.equal(
    repo.getData().checkIns.filter((c) => c.patientId === "patient-1").length,
    2,
  );
  assert.equal(patientActivity(repo.getData(), "patient-1").adherence, 57);
  assert.equal(
    repo.getData().checkIns.find((c) => c.notes === "replaced").feeling,
    "same",
  );
  assert.equal(
    repo
      .getData()
      .medicationLogs.filter((l) => l.patientId === "patient-1")
      .at(-1).status,
    "taken",
  );
  assert.throws(() =>
    repo.submitCheckIn("patient-1", { feeling: "better", painLevel: 11 }),
  );
  assert.throws(() =>
    repo.markMedication("patient-2", "med-patient-1", "taken"),
  );
  assert.equal(repo.getPatient("unknown"), undefined);
  values.set("careloop-data", "broken JSON");
  repo = reload();
  assert.equal(repo.getPatients().length, 8);
  values.set("careloop-data", JSON.stringify({ version: 1, patients: [{}] }));
  repo = reload();
  assert.equal(repo.getPatients().length, 8);
  globalThis.localStorage = {
    getItem() {
      throw Error("blocked");
    },
    setItem() {
      throw Error("blocked");
    },
  };
  repo = reload();
  repo.getData();
  repo.submitCheckIn("patient-1", { feeling: "better", painLevel: 1 });
  assert.match(repo.getStorageNotice(), /unavailable/);
  assert.ok(repo.getData().checkIns.some((c) => c.feeling === "better"));
  repo.resetDemo();
  assert.equal(repo.getPatients().length, 8);
  console.log(
    "PASS: seed, defensive copies, idempotent updates, persistence after reload, validation, missing patient, corrupt data, blocked storage, reset.",
  );
} finally {
  rmSync(dir, { recursive: true, force: true });
}
