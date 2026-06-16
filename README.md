# Enterprise CS Onboarding Tool

A production-inspired, multi-step customer onboarding workflow application built in React. Designed to support Customer Success, SaaS Implementation, and Solutions teams managing complex enterprise account setups — including compliance documentation, data integration configuration, geospatial field mapping, and regulatory attestation.

---

## Why I Built This

Enterprise SaaS onboarding for regulated industries is rarely a simple sign-up flow. It involves coordinating legal entities, compliance programs, data integrations, certified material tracking, and multi-stakeholder sign-off across CS, Commercial, Product, and Engineering teams.

I built this tool to solve a real coordination problem: replacing fragmented spreadsheets, email chains, and tribal knowledge with a single structured interface that guides CS teams through every required input — step by step — before a customer goes live on the platform.

---

## Overview

The tool is a 9-step guided workflow that walks CS managers through the full account setup lifecycle for an enterprise customer in a mass balance SaaS environment. It enforces structure without sacrificing flexibility, and is designed to be used by non-technical CS staff handling technically complex onboarding requirements.

---

## Key Features

**Multi-step navigation** — 9 structured workflow phases with persistent progress tracking, free step jumping, and section-complete indicators.

**Products & Programs Questionnaire** — Dynamic chip-selectors for feedstocks, low-carbon programs (LCFS, CFR, ISCC, 45Z, and others), and co-products. Supports custom product entry and conditional per-program participation history with year selectors.

**Business Rules capture** — Customer legal name, website, commercial handoff status tracking, configuration confirmations, and meeting scheduling.

**Compliance Attestation management** — Pre-populated standard attestation verbiage for California LCFS and Canada CFR programs sourced from public regulatory frameworks. Each block supports Accept as-is, Modify, or Revert workflows, with a copyable clean template view that strips client information.

**Interactive field boundary map** — Leaflet/OpenStreetMap integration for dropping coordinate pins on agricultural fields. Auto-populates an editable Field List with lat/lng to 5 decimal places — built to support LCFS multi-coordinate field boundary compliance requirements.

**GeoJSON and shapefile upload** — Accepts `.geojson`, `.shp`, `.kml`, and `.gpx` field boundary files alongside the map interface.

**Grower list ingestion** — File upload zone with inline minimum field requirements (Name, Customer ID, Email, Phone, Farm Physical Address, Mailing Address) displayed as a reference callout.

**Integration method configuration** — Three-option card selector (API preferred, CSV fallback, Custom scope) with conditional fields that appear per method. Custom integration expands to scope definition and rate agreement reference.

**Beginning Inventory intake** — Snapshot date, inventory basis, product-in-scope chip selector, and a dynamic balance table with certified/uncertified quantity columns and auto-populated unit of measure by product type.

**3rd-party blanket declaration capture** — Conditional supplier table (Name + ID columns, dynamic rows) triggered when customer uses year-end declaration workflows.

**Customer Responsibility Acknowledgement** — Final step with three-state radio (Confirmed / Not Yet Discussed / Pending Legal Review), conditional confirmation detail fields, and follow-up notes.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI Framework | React 18 (hooks-based) |
| Map | Leaflet 1.9.4 via cdnjs + OpenStreetMap tiles |
| Icons | Lucide React |
| Typography | Google Fonts — Crimson Pro + DM Sans |
| Styling | Inline styles with a centralized theme token object |
| State | React `useState` (local, no external store) |
| Build | Vite 5 |

No backend. No database. No API keys required. Runs entirely in the browser.

---

## Use Case

This tool reflects the onboarding complexity of **mass balance SaaS platforms** in the **clean fuels and agricultural supply chain** space — where customers must be configured across multiple regulatory programs (California LCFS, Canada CFR, ISCC, 45Z), certified material types, integration methods, and compliance documentation requirements before they can transact on the platform.

It is designed for:

- **Customer Success Managers** running structured implementation handoffs
- **Solutions Engineers** documenting integration method and data mapping decisions
- **Implementation Specialists** collecting reference data, signatories, and compliance documentation
- **Account Managers** tracking program participation history and acknowledgement status

---

## Repository Structure

```
enterprise-ai-apps/
├── src/
│   ├── CSOnboardingTool.jsx   # Full application — single-file component
│   └── main.jsx               # React entry point
├── index.html
├── vite.config.js
├── package.json
├── .gitignore
└── README.md
```

> The application ships as a single self-contained component for portability. A planned refactor will split it into separate `components/`, `constants/`, `theme/`, and `utils/` modules.

---

## How to Run Locally

**Requirements:** Node.js 18+ and npm or yarn.

```bash
# 1. Clone the repository
git clone https://github.com/fpineiro23/enterprise-ai-apps.git
cd enterprise-ai-apps

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

**The map requires an internet connection** to load OpenStreetMap tile layers. All other functionality works offline.

---

## Screenshots

> _Screenshots coming soon — the tool includes a full 9-step sidebar navigation, interactive Leaflet map, attestation management interface, and dynamic inventory intake form._

---

## Privacy & Sanitization

This project is **inspired by real enterprise SaaS implementation challenges** but contains no proprietary company data, customer information, internal systems, API keys, or confidential workflows.

- All attestation verbiage is sourced from **publicly available regulatory frameworks**: the California Low Carbon Fuel Standard (LCFS) and Canada's Clean Fuel Regulations (SOR/2022-140).
- Program names (LCFS, CFR, ISCC, 45Z, PURO, etc.) are **public regulatory and certification schemes**.
- No real customer names, accounts, credentials, or internal documents appear anywhere in this codebase.

---

## Known Limitations & Future Improvements

**Current limitations:**
- Single-file architecture — refactor into component/constants structure is planned
- No persistence — form state resets on page refresh (no localStorage or backend)
- File uploads are UI-only — no actual file handling or server integration

**Planned improvements:**
- [ ] Split into modular component structure
- [ ] Add TypeScript types / PropTypes throughout
- [ ] Implement localStorage persistence with session restore
- [ ] Add form validation with per-field error states
- [ ] Export collected data as a structured JSON or PDF summary
- [ ] Add a review/summary view before final submission
- [ ] Dark mode support using the existing theme token system

---

## Author

Built by Francisco Piñeiro — Customer Success & AI Workflow tooling.

Connect on [LinkedIn](https://www.linkedin.com/in/francisco-piñeiro-mba-469b53213) · [GitHub](https://github.com/fpineiro23)
