# CareLoop

**Continuity of care, beyond the consultation.**

CareLoop helps patients record daily care activities and lets providers review missed follow-ups through an explainable **CareGap Radar**. Built for the Prompt Wars Hackathon.

> Interactive prototype · Eight fictional patients · Browser-local storage · No real patient information

## Problem and solution

Between consultations, medication activity, recovery updates and follow-up appointments can become disconnected. CareLoop brings these records into connected patient and provider views and explains which recorded gaps need attention.

## Features

- **Patient:** Taken/Missed actions, daily progress, Better/Same/Worse check-ins, pain-level slider, optional notes, appointment status and recent activity.
- **Provider:** overview metrics, priority-ranked CareGap cards, patient search, status filters and detailed activity timelines.
- **Demo:** persistence after refresh, reset with confirmation, responsive layouts, keyboard focus, empty/not-found states and storage-failure feedback.

## Run locally

Install **Node.js 24 LTS** (tested with Node 24) and npm. No API keys, environment variables, database or login are needed.

Extract the ZIP and open a terminal **inside `careloop`**, where `package.json` lives:

```bash
npm ci
npm run dev
```

Open the URL printed by Vite. Stop the server with Ctrl+C.

```bash
npm run check    # lint + service tests + TypeScript + production build
npm run preview  # serve the production build after check/build
```

If using a GitHub clone, open the cloned folder and run the same commands. `package-lock.json` is included for reproducible installation. `private: true` prevents accidental npm publication; it does not affect GitHub visibility.

## Two-minute demo

1. Click **Reset demo data** in the footer and confirm to start fresh.
2. Choose **Continue as Provider**. Arjun Mehta starts with **7/7** follow-up priority points. Open his record and review the reasons.
3. Choose **Patient** in the top navigation. Toggle today's medication to **Missed**, then **Taken**. Progress and recorded adherence change immediately.
4. Submit an empty check-in to see validation. Select **Better**, set a pain level, add a fictional note and submit. Daily progress reaches **2/2**.
5. Refresh: the saved activity remains. Click **View provider record**: the note appears and Arjun's score drops to **5/7**. Historical misses and the overdue appointment remain, so he still Needs Attention.
6. Open the provider patient list. Search for a name, try status filters, and use an unmatched search to see the empty state. **Clear filters** restores the list.

Demo dates are relative to the first initialization or reset. Use the same browser tab for both roles. Reset replaces all local demo activity; cancel leaves it intact.

## How CareGap Radar works

Deterministic rules, not an AI model or clinical prediction:

| Recorded gap | Points |
| --- | ---: |
| At least one incomplete appointment before the current time | +3 |
| At least two explicitly missed medication entries in today and the preceding six local calendar days | +2 |
| No check-in for at least two calendar days (from plan start if none exists) | +2 |

**0–1: On Track · 2–3: Monitor · 4–7: Needs Attention.** Each rule contributes once. Completed appointments and future activity do not trigger current gaps. One missed entry alone adds no points; unrecorded doses are not assumed missed. On Track does not establish medical wellbeing.

Recorded adherence is Taken / all recorded medication entries over seven calendar days. No entries displays “No entries.” The dashboard average is the unweighted mean of available patient rates. Active plans include today; follow-ups due are overdue or scheduled today. Care-plan progress measures elapsed calendar time, not recovery. Daily task completion counts Taken entries plus a submitted check-in; Missed entries and appointments do not count as completed tasks.

## Stack and structure

React, TypeScript, Vite, React Router, Lucide icons and plain CSS. No chart library, backend, AI API or external font service is required.

| Location | Purpose |
| --- | --- |
| `src/pages/` | Landing, patient and provider screens |
| `src/components/` | Shared layout, accessible controls and provider components |
| `src/services/storage.ts` | Validated browser persistence and demo writes |
| `src/services/careGapService.ts` | Pure activity calculations and explainable rules |
| `src/data/seed.ts` | Synthetic records with relative dates |
| `src/types/`, `src/utils/` | Models and local-calendar helpers |
| `tests/foundation.mjs` | Storage and scoring regression checks |

UI → service functions → synthetic data and `localStorage`. Patient writes refresh their view immediately; provider values recompute on navigation/render. There is no network synchronization, authentication or authorization. Separate tabs are not synchronized live. Blocked storage falls back to session memory; corrupt stored data resets to a fresh demo.

## Verification

The final package passes clean dependency installation, lint, storage/scoring regression tests and the production TypeScript/Vite build. Tests cover persistence, duplicate-write prevention, malformed data, blocked storage, reset, CareGap thresholds and changed activity.

Stage 4 browser verification was blocked because the available browsers could not reach the workspace preview. Before submitting, run the demo above locally and check widths of 320px, 375px, 768px and desktop in browser developer tools. Check navigation, horizontal table scrolling, keyboard focus, reset cancel/confirm and the browser console. The responsive and accessibility edits are implemented, but this final visual pass is not claimed as tested.

## Push to GitHub (beginner walkthrough)

You can push directly; Antigravity is optional. GitHub stores the source; pushing alone does **not** publish a live app.

1. Install Git. Extract this complete project. If updating an existing local repository, replace its earlier source files with these files, preserving its `.git` folder. Do not place one `careloop` folder inside another.
2. Run `npm ci` and `npm run check` from the project root.
3. On GitHub create a **public** repository named `careloop`, leaving “Add README”, `.gitignore` and license unselected because the local source is ready.
4. For a **new** local repository, run:

```bash
git init -b main
git add .
git status
```

Check the staged files: `node_modules`, `dist`, `.env`, ZIPs and editor files must not appear. The included `.gitignore` excludes them. If Git asks for your identity, configure your own name and email (GitHub's verified private noreply email is also suitable):

```bash
git config user.name "YOUR_NAME"
git config user.email "YOUR_GITHUB_EMAIL"
```

Then commit and connect the exact URL shown by GitHub (replace `YOUR_USERNAME`):

```bash
git commit -m "Build CareLoop patient follow-up prototype"
git remote add origin https://github.com/YOUR_USERNAME/careloop.git
git push -u origin main
```

Complete Git's browser/credential-manager sign-in when prompted. Never put credentials in source files or remote URLs.

**Existing repository:** skip `git init` and `git remote add` if already configured. Check `git branch --show-current` and `git remote -v`, keep the existing `main` branch, then `git add .`, review `git status`, commit and `git push`. If the remote has commits you do not have, fetch and reconcile them first; do not force-push over remote work.

Final verification:

```bash
git status
git branch
git ls-remote --heads origin
git ls-files
git count-objects -vH
```

Confirm a clean working tree, only **main** locally and remotely, and repository size comfortably below **10 MB**. `git count-objects` reports local Git objects; also inspect the tracked file list and GitHub repository size, especially if reusing old history. Ignoring a previously committed large file does not remove it from history.

Open the public repository while signed out: check the README renders, source files are present, and only the main branch exists. Submit that repository URL. Suggested description: **Smart patient follow-up prototype with explainable CareGap monitoring.** Suggested topics: `healthcare`, `hackathon`, `react`, `typescript`, `vite`.

## Hosting and limitations

For optional static hosting, build with `npm run build` and serve `dist`. The app uses browser-history routing: configure the host to rewrite application routes to `index.html`. Default GitHub Pages does not provide this fallback; this package is prepared for a GitHub source submission, not automatic Pages deployment.

This prototype does not diagnose, prescribe, predict clinical risk or send reminders/alerts. Medication records are fictional patient-reported activity. It is not intended for real clinical use; do not enter real patient data. Browser storage is not secure medical storage.

Future production work includes secure authentication, role enforcement, a database/API, audit logging, notification delivery and clinical/privacy review. No open-source license is granted by this package; choose an appropriate license with your team if you want to permit reuse.
