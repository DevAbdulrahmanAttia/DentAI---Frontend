# AI_CONTEXT.md — PART 0: THE CORE MANIFEST & ARCHITECTURAL GUARDRAILS

> Core Focus: Product Philosophy, Business Workflows, and Strict Architectural Layers.
> Target: This block acts as the grounding layer for all structural and logical decisions.

---

## 1. PRODUCT PHILOSOPHY & VISION (PRODUCTION SYSTEM CONSTRAINTS)

- **High-Density Productivity Tool:** DentAI is an enterprise internal dental clinic operating system (ERP/POS/HIS)[cite: 3]. It is built for internal employees who spend 6 to 10 hours daily inside the application[cite: 3].
- **Efficiency Over Aesthetics:** The frontend must heavily prioritize **Speed, Consistency, Productivity, Reliability, and Maintainability** over fancy animations, creative transitions, experimental UI, or visual complexity[cite: 3]. Never optimize for screenshots; always optimize for actual workflow efficiency[cite: 3].
- **Workflow-Driven Paradigm:** DentAI is completely workflow-driven, NOT page-driven[cite: 3]. Every script or component must represent a real clinic operation[cite: 3]. Never think: "I need to build another page." Instead, think: "I need to support another business workflow."[cite: 3]
- **No Speculative Modules:** Never invent business modules or assume unwritten requirements[cite: 3]. If a feature is not part of the documentation, do not generate it[cite: 3].

---

## 2. STRICT ARCHITECTURAL LAYERS & DEPENDENCY RULES

The project strictly follows a **Feature-Based Architecture** using Angular Standalone APIs[cite: 3]. Architecture consistency is more important than code generation speed[cite: 3]. If a solution violates these boundaries, it is wrong[cite: 3].

Dependencies always flow strictly downward: **Features ➔ Shared ➔ Core**[cite: 3].

- **Core Layer (`src/app/core/`):** Responsible for application infrastructure (HTTP clients, interceptors, auth guards, tokens, constants, global utilities)[cite: 3]. It must remain entirely business-agnostic[cite: 3]. It must NEVER import anything from features or contain business logic (No Patient, Appointment, or Inventory context allowed here)[cite: 3].
- **Shared Layer (`src/app/shared/`):** Reusable UI presentation building blocks (Generic buttons, inputs, generic modals, badges, loaders, custom pipes, structural directives)[cite: 3]. It must NEVER know anything about business entities (e.g., `PatientCard` or `InventoryTable` are strictly forbidden here; they belong to their respective features)[cite: 3].
- **Features Layer (`src/app/features/`):** Every business capability lives here independently (Auth, Patients, Appointments, Inventory, Analytics, Notifications)[cite: 3]. Each feature completely owns its pages, components, local services, dedicated routes, and interfaces[cite: 3]. Keep features loosely coupled; communication happens through clean service APIs, never tight coupling[cite: 3].
- **Layout Layer:** Organizes application shell structure (Header, Sidebar, Navigation container, Router Outlet)[cite: 3]. Must never contain core business logic[cite: 3].

---

## 3. CORE BUSINESS WORKFLOWS & UX PHILOSOPHY

### 3.1 Receptionist Workflow (The Priority User)

The receptionist is the busiest actor in the system[cite: 3]. The UI must optimize this path for speed and minimal clicks:
`Login ➔ Dashboard ➔ Search Patient ➔ If Found? ➔ Book Appointment ➔ Assign Doctor ➔ Save ➔ Done`[cite: 3]
_(If patient does not exist: Create Patient ➔ Book Appointment ➔ Done)_[cite: 3].

### 3.2 Doctor Workflow

Driven by immediate timeline updates without arbitrary navigation:
`Doctor Login ➔ Dashboard ➔ Today's Appointments ➔ Open Patient ➔ Review History ➔ Diagnosis ➔ Treatment Plan ➔ Save Visit ➔ Next Patient`[cite: 3].

### 3.3 UX Guardrails & Performance Principles

- **Good UX Context:** Minimal clicks, predictable navigation paths, large clickable hotkeys, rapid server-side search/filtering, persistent table state, and heavy keyboard navigation support[cite: 3].
- **Poor UX Context:** Long visual animations, complex nested menus, hidden actions, or redundant verification dialogs[cite: 3].
- **Performance Enforcements:** Always prefer Lazy Loading, OnPush Change Detection, Angular Signals, Server-side Pagination, TrackBy loops, and Debounced input streams[cite: 3].

---

## 4. CODE DESIGN & ACCESS RULES

- **Standalone Mandate:** Always generate standalone components, directives, and pipes[cite: 3]. Never generate `NgModules` or introduce traditional app-wide modules[cite: 3].
- **State Management:** **Do NOT introduce NgRx.** Prefer localized, reactive Angular **Signals** to drive template states[cite: 3].
- **Dependency Injection:** Strictly prefer the functional `inject()` API over traditional class constructor parameters unless explicit context demands otherwise[cite: 3].
- **Zero Registration Scopes:** DentAI is an internal tool[cite: 3]. Registration or public signup pages must **NEVER** be generated[cite: 3]. Accounts are provisioned internally by administrative roles[cite: 3].
- **Terminology Uniformity:** Always use consistent business names: `Patient`, `Appointment`, `Receptionist`, `Doctor`, `Owner`, `Inventory`, `Notification`, `Analytics`, `Treatment`, `Medical Record`[cite: 3]. Never use generic terms like `Customer`, `Client`, `Employee`, `Booking`, or `Product`[cite: 3].

---

## AI GROUNDING MATRIX

Before generating a single line of code, evaluate the target location:

1. _Is this infrastructure configuration?_ ➔ **Core**[cite: 3]
2. _Is this a presentation UI component with no business data attachment?_ ➔ **Shared**[cite: 3]
3. _Does this execute a distinct clinic business capability or workflow?_ ➔ **Feature**[cite: 3]

# AI_CONTEXT.md — PART 1: SYSTEM ARCHITECTURE & RECEPTION MODULES

> Version: 4.0 (Production-Ready Vibe Coding Blueprint)
> Project: DentAI (Phase 2 — Full Clinic Operating System)
> Framework: Angular 21 (Strict Standalone Components & Signals Architecture)
> UI & Styling: Tailwind CSS + Angular Material (Custom Medical Theme Configured)
> Primary Backend: NestJS (Modular Monolith Monitored via TypeORM/Prisma)
> Microservices Layer: Python (FastAPI for Machine Learning & Predictive Analytics)
> Database: PostgreSQL
> Last Updated: July 2026

---

## 1. GLOBAL AI GOVERNANCE & PROMPTING RULES

- **Absolute Authority:** This document is the ultimate architectural blueprint for all AI agents (Cursor, Antigravity, Claude Code) working on this repository[cite: 3]. It supersedes generic internet conventions or baseline code configurations[cite: 3].
- **Current Repository State:** **Epic 1 (Frontend Project Setup - DENT-3) is 100% complete**[cite: 4]. The core workspace configuration, directory boundaries, Tailwind theme customization, environment variables, and the root routing shell are fully implemented[cite: 4]. Do NOT attempt to rewrite, initialize, or suggest changes to setup frameworks; build custom components straight into feature boundaries[cite: 4].
- **Application Paradigm:** DentAI is an **Enterprise Internal Operating System** (ERP/POS/Hospital Information System) for healthcare workflows[cite: 3]. It is NOT a public website or a marketing platform[cite: 3]. It is used 6–10 hours a day by trained staff[cite: 3]. Prioritize **Speed, High-Density Data Tables, Keyboard-Friendly Forms, and Zero-Latency Updates** over transitions or complex animations[cite: 3].
- **Language & Layout Requirements:** All components must structurally support dynamic English and Arabic localization without breaking layout constraints or alignments[cite: 4].

---

## 2. CORE ANGULAR 21 GENERATION STANDARDS

When creating any frontend code, the AI must strictly strictly implement the following patterns:

1. **Standalone Components:** Every component, pipe, and directive must declare `standalone: true` natively[cite: 3]. No `NgModule` wrappers allowed[cite: 3].
2. **Modern Dependency Injection:** Enforce the explicit utilization of the `inject()` token wrapper over traditional class constructor overrides[cite: 3]. (e.g., `private http = inject(HttpClient);`)[cite: 3].
3. **Reactive Signals State Management:** Maintain components completely driven by Angular **Signals** (`signal()`, `computed()`, `effect()`) for local state tracking[cite: 3]. **Do NOT implement complex global NgRx boilerplate**[cite: 3].
4. **Declarative Stream Handling:** Handle data delivery streams directly in presentation layer views using the RxJS `async` pipe wrapper to clear memory leaks on compilation[cite: 3].
5. **Strict Typings Only:** Use of type notation `any` is strictly forbidden[cite: 3]. Every endpoint structure, contract object model, or internal parameter requires explicit interface mappings[cite: 3].

---

## 3. COMPREHENSIVE SCREEN DIRECTORY & FUNCTIONAL SPECIFICATIONS

### 3.1 MODULE 1: AUTHENTICATION & SYSTEM FRAMEWORK (SHARED INFRASTRUCTURE)

#### 1. Login Screen [All Roles]

- **Functional Scope:** Authenticates internal clinic staff using Email/Password credentials[cite: 4]. Handles secure JWT token reception and local storage initialization[cite: 4].
- **UI Specs:** Centered card interface using a high-density clinical layout.
  - Inputs: Email (with strict validation), Password (with hide/show visibility toggle component).
  - Actions: Login Button (`disabled` until form is completely valid), "Forgot Password" redirection link[cite: 4].
  - Signals State: `isLoading = signal(false)`, `errorMessage = signal<string | null>(null)`.

#### 2. Forgot / Reset Password Flow [All Roles]

- **Functional Scope:** Secure administrative recovery protocol for internal accounts[cite: 4].
- **UI Specs:** Step-by-step wizard.
  - Step 1: Input registered clinic email to receive a recovery request.
  - Step 2: Input secure reset code token alongside the new password matching validation bounds.
  - Signals State: `currentStep = signal(1)`, `isSubmitting = signal(false)`.

#### 3. Main Application Shell Layout [All Roles]

- **Functional Scope:** The persistent navigation frame hosting all internal operational modules[cite: 4].
- **UI Specs:**
  - Left Sidebar: Collapsible navigational rail showing links mapped dynamically based on the verified JWT `user.role` (Owner, Doctor, Receptionist)[cite: 4].
  - Top Bar: Displays Active Clinic Name, real-time Network Status indicator, dynamic Profile Menu dropdown (Profile link + Logout action), and the Global Notifications Bell component[cite: 4].
  - Content Area: Dynamic `<router-outlet>` wrapper injecting feature submodules using lazy loading[cite: 4].

#### 4. Central Notifications & Alerts Feed Screen [Owner / Reception]

- **Functional Scope:** Real-time data feed displaying operational and intelligence notifications[cite: 4].
- **UI Specs:** High-density alert queue card with filtering controls.
  - Filters: All Alerts, Low Stock Alerts, Expired Inventory, High-Risk Appointment Flags[cite: 4].
  - List Items: Color-coded border elements based on severity (Red for Expiry/No-Show Alert, Amber for Low-Stock, Blue for Waitlist Updates)[cite: 4].
  - Actions: "Mark all as read" button, "Acknowledge" click triggers per list item.

#### 5. User Profile & Settings Component [All Roles]

- **Functional Scope:** Allows logged-in staff to modify active details and individual system parameters[cite: 4].
- **UI Specs:** Grid configuration form containing profile tracking details.
  - Fields: Full Name, Phone Number, Profile Photo Asset, Password Update fields, Language Switcher (EN/AR Toggle)[cite: 4].

---

### 3.2 MODULE 2: RECEPTION & CLINICAL OPERATIONS WORKSPACES

#### 6. Receptionist Operational Dashboard [Receptionist]

- **Functional Scope:** High-velocity control center rendering daily clinical statistics and instant actions[cite: 4].
- **UI Specs:**
  - Grid Row 1 (KPI Metrics Grid): Display Cards showing: Today's Appointments Count, Checked-in Patients, Recovered Slots via Waitlist, and Active Low Stock Warnings[cite: 4].
  - Main Section: Two-column split layout. Left Column displays the absolute real-time queue checklist. Right Column renders a "Quick Actions" dock containing large clickable hotkeys: [Quick Patient Ingestion], [Instant Appointment Allocation][cite: 4].

#### 7. Central Appointment Calendar Interface [Receptionist / Doctor]

- **Functional Scope:** Master time allocation matrix mapping reservation blocks, schedule availability, and status overrides[cite: 4].
- **UI Specs:** Full-screen calendar interface integrating Angular Material view modes.
  - View Modes: Day View, Week View, Month View switcher[cite: 4].
  - Functionality: Appointment cards rendered as absolute positioned absolute layout block overlays. Drag-and-drop mechanics enabled to automatically trigger rescheduled date/time parameters updates via API endpoints[cite: 4].
  - Visual Indicators: Color-coded states (`status` variables: Booked = Teal, Done = Grey, Cancelled = Red, No-Show = Purple)[cite: 4]. Small warning badge attached displaying the calculated ML threat index level (`High` = blinking red outline)[cite: 4].

#### 8. Book Appointment Component [Receptionist]

- **Functional Scope:** Advanced reservation validator handling scheduling constraints, resource allocation, and instant ML threat evaluation scoring[cite: 4].
- **UI Specs:** Two-column interactive form.
  - Form Fields: Patient Selector autocomplete dropdown, Doctor Selector dropdown, Clinical Procedure Type selection picker, Date Picker component, Time Slot selection grid dynamically filtering out slot clashes[cite: 4].
  - Sidebar Preview Panel: Renders real-time information: Estimated Duration, base clinical fee, and an immediate asynchronous preview of the patient's calculated `no_show_risk_score` fetched immediately upon selecting the patient[cite: 4].

#### 9. Appointment Parameters Detailed Panel [Receptionist / Doctor]

- **Functional Scope:** Exhaustive operational oversight modal showing data relevant to an isolated appointment instance[cite: 4].
- **UI Specs:** Deep overlay sheet layout split into functional sections.
  - Header: Patient Name, Core Status badge dropdown (allows manual overrides between Booked, Done, Cancelled, No-Show)[cite: 4].
  - Section A (AI Threat Telemetry): Displays the calculated Patient Risk Index alongside an automated WhatsApp logs timeline (Reminders scheduled, sent timestamps, patient confirmation status responses)[cite: 4].
  - Section B (Logistics Summary): Lists scheduled Clinician, targeted operational dental room, base procedure price[cite: 4].

#### 10. Smart Waitlist Manager UI [Receptionist]

- **Functional Scope:** Operational management tool tracking queue lines, automated fill logs, and pending allocation overrides[cite: 4].
- **UI Specs:** Tabbed tracking view.
  - Tab 1 (Active Queue): High-density data table listing patients waiting for dynamic openings. Rows show: Patient Name, Preferred Date, Attributed Urgency Index, and Created Timestamp[cite: 4].
  - Tab 2 (Active Offers Tracking): Real-time monitor showing slots freed by sudden cancellations. Shows: Freed Slot Details, Target Offered Patient, Response Countdown Timer Component (Visual ticking indicator rendering remaining minutes before timeout expiration)[cite: 4].

#### 11. Patients Master Directory View [Receptionist / Doctor]

- **Functional Scope:** Master patient relational database browser with rapid data fetching utilities[cite: 4].
- **UI Specs:** High-density pagination grid.
  - Controls: Global search bar processing text targets (Name, Phone Number, National Identity code), advanced demographic group filters.
  - Data Grid Columns: Full Name, Patient Contact Phone, Registration Date, General Medical Flags, Cached ML Attendance Threat Index, Actions Button Menu (View Full Sheet, Book New Reservation)[cite: 4].

#### 12. Patient Comprehensive Profile Sheet [Receptionist / Doctor]

- **Functional Scope:** Single source of truth for a patient's historical, financial, and clinical interactions[cite: 4].
- **UI Specs:** Multi-tab sidebar card container sheet layout.
  - Tab 1 (Operational Overview): Summary analytics tracking Total Visits, Cancelled Allocations count, and the explicit No-Show Risk Percentage Gauge Chart[cite: 4].
  - Tab 2 (Medical Records Ledger): Form components documenting persistent physiological metrics: Allergies checklist, Chronic diseases fields, and long-term text medical notes[cite: 4].
  - Tab 3 (Treatment Timeline): Chronological card tracking list detailing every completed case, executing doctor, dental notes, and linked procedural prices[cite: 4].

#### 13. Patient Ingestion Component [Receptionist]

- **Functional Scope:** Form interface executing initial validation mapping for new patient records[cite: 4].
- **UI Specs:** Step-divided data layout.
  - Required Fields: Legal Name, Primary Mobile Number (with regex validation), Date of Birth, Gender selection, Initial Medical Notes block[cite: 4].
  - Actions: Cancel navigation hotkey, Submit Registration Request button (triggers API post mapping)[cite: 4].

  # AI_CONTEXT.md — PART 2: CLINICAL WORKSPACES & INVENTORY LOGISTICS

## 3.3 MODULE 3: CLINICAL (DOCTOR) WORKSPACES

#### 14. Doctor Dashboard Component [Doctor]

- **Functional Scope:** Main operational terminal for medical staff, focusing entirely on patient rotation and daily scheduling[cite: 4].
- **UI Specs:**
  - Header: Displays current date, logged-in clinician's name, and a dynamic count indicator showing remaining scheduled patients for the shift[cite: 4].
  - Main Section: Left-side column contains the "Live Patient Queue Tracker" (lists patients whose status is checked-in or waiting)[cite: 4]. Right-side column renders a quick-view pane showing the medical files of the selected patient[cite: 4].
  - Grid Rows: Appointment cards showing Patient Name, Scheduled Time, Expected Procedure Type, and a direct action trigger button labeled "Start Visit"[cite: 4].
  - Signals State: `selectedAppointmentId = signal<string | null>(null)`, `activeQueue = signal<Appointment[]>([])`.

#### 15. Procedure & Active Visit Screen [Doctor]

- **Functional Scope:** High-density clinical console used by the dentist during the active treatment session[cite: 4]. Captures completed clinical records and logs physical material usage[cite: 4].
- **UI Specs:** Split-pane interface designed to minimize scrolling.
  - Left Pane (Treatment Logging Form): Contains the dynamic checklist for the procedure performed, structural fields for clinical notes, prescription generation fields, and a billing price review block[cite: 4].
  - Right Pane (Material Consumption Ledger): A dynamic inline data grid where staff enter physical item depletion metrics[cite: 4]. Includes an autocomplete item selector matching active `INVENTORY_ITEM` values and a text field for `quantity_used`[cite: 4].
  - Actions: "Save Visit Ledger" button (validates fields, decrements stock levels, computes case costs, and marks the appointment as `Done`)[cite: 4].

#### 16. Historical Treatment Timeline Component [Doctor]

- **Functional Scope:** Chronological historical review sheet displaying a patient's entire dental tracking timeline[cite: 4].
- **UI Specs:** Vertical layout rendering past dental actions.
  - Timeline Cards: Rendered sequentially by date[cite: 4]. Each card displays: Execution Date, Attributed Dentist Name, Completed Procedure Type, Dental Notes block, Prescribed Medications list, and the itemized material log for that visit[cite: 4].

---

### 3.4 MODULE 4: MATERIAL LEDGER & INVENTORY TRACKING

#### 17. Master Inventory Tracking View [Owner / Reception / Staff]

- **Functional Scope:** Master management data table documenting all clinical consumables, current stock counts, and expiration paths[cite: 4].
- **UI Specs:** High-density pagination grid matching internal ERP design rules[cite: 3].
  - Controls: Top row features a text search box (filters by item name), and a category filter dropdown[cite: 4].
  - Columns: Item Name, SKU/Code, Current Quantity in Stock, Unit Cost parameter, Configured Low Stock Threshold bound, Next Expiry Date, and an Status Badge[cite: 4].
  - Status Badge Logic: Red border for `Expired`, Amber for `Low Stock`, Green for `Healthy`[cite: 4].

#### 18. Inventory Item Mutation Sheet [Owner]

- **Functional Scope:** Modal dialog or dedicated entry form used to insert new materials or modify active warehouse parameters[cite: 4].
- **UI Specs:** Focused modal interface with strict validation parameters.
  - Fields: Item Name string, Measurement Unit selector (e.g., box, piece, ml, gram), Initial Stock Quantity, Unit Cost, Safety Low Stock Threshold number, and Expiration Date picker[cite: 4].
  - Signals State: `formSubmitting = signal(false)`, `isEditMode = signal(false)`.

#### 19. Material Usage Ingestion Interface [Doctor / Staff]

- **Functional Scope:** Dedicated structural utility supporting manual consumption adjustments outside of standard appointment visit flows[cite: 4].
- **UI Specs:** Simple, high-velocity record sheet.
  - Inputs: Material Autocomplete Dropdown, Quantity input, Reason for Adjustment selector (e.g., Waste, Accidental Damage, Manual Reconciliation)[cite: 4].
  - Validation: Form prevents submissions where the adjustment value exceeds current `quantity_in_stock` limits.

#### 20. Stock Alert Monitor Panel [Owner / Reception]

- **Functional Scope:** High-visibility dashboard console parsing data from warehouse assets to highlight items requiring emergency restock or immediate safe discard[cite: 4].
- **UI Specs:** Tabbed monitoring interface divided by critical urgency levels.
  - Tab A (Critical Expiry Alerts): Lists all warehouse stock entries whose expiration timestamp is within the configured threshold window, highlighting the remaining safe storage days[cite: 4].
  - Tab B (Low Stock Reorder Queue): Renders a list of items violating minimum safety stock metrics, complete with an "Instant Reorder Document Generation" hotkey action button[cite: 4].

---

## 4. MATERIALIZED DATA BINDING AND DTO INTERFACES

When building endpoints or consuming mock variables for Modules 3 and 4, the AI must strictly bind component models to these explicit interfaces:

```typescript
export interface InventoryItem {
  id: string;
  name: string;
  quantity_in_stock: number;
  unit_cost: number;
  low_stock_threshold: number;
  expiry_date: string;
  unit: string;
}

export interface MaterialUsage {
  id: string;
  appointment_id: string;
  inventory_item_id: string;
  quantity_used: number;
  unit_cost_at_time: number;
  logged_at: string;
  item_details?: Partial<InventoryItem>;
}

export interface VisitTelemetryPayload {
  appointment_id: string;
  clinical_notes: string;
  procedure_type_id: string;
  materials_consumed: Array<{
    inventory_item_id: string;
    quantity_used: number;
  }>;
}

# AI_CONTEXT.md — PART 3: OWNER ADMINISTRATIVE CONSOLE & AI FORECASTING

## 3.5 MODULE 5: OWNER — ANALYTICS, FINANCE & AI INSIGHTS

#### 21. Owner Executive Dashboard Component [Owner]
* **Functional Scope:** High-level strategic command center providing real-time operational visibility and leakage alerts.
* **UI Specs:**
  * Section 1 (Executive KPI Cards): Displays dynamically calculated corporate statistics: Gross Revenue Tracker, Active Net Profit Margin, No-Show Attendance Rate Percentage, and Room Occupancy Efficiency.
  * Section 2 (System Leakage Feed): A prominent list highlighting financial inefficiencies (e.g., "Alert: 12 High-Risk No-Shows Predicted for this week - Estimated $1,400 revenue at risk")[cite: 4].
  * Signals State: `timeframeFilter = signal<'week' | 'month' | 'quarter'>('month')`, `executiveMetrics = signal<ExecutiveKPI | null>(null)`.

#### 22. Revenue & Profit Analytics Dashboard [Owner]
* **Functional Scope:** In-depth visual terminal tracking clinic revenue, financial health, and individual procedural efficiency[cite: 4].
* **UI Specs:**
  * Upper Section: Time-series line chart (Chart.js / ngx-charts) plotting Monthly Gross Revenue vs. Actual Operation Costs[cite: 4].
  * Lower Section: Bar chart rendering "Profitability Ranking per Procedure Type" to immediately show which workflows generate the highest margins[cite: 4].
  * Controls: Interactive toggle switch to swap views between Gross Income, Overhead Expenses, and Net Profit Margin data[cite: 4].

#### 23. Cost-per-Case Detailed Audit Report [Owner]
* **Functional Scope:** Deep-dive accounting audit interface assessing actual procedural cost margins against overhead assumptions[cite: 4].
* **UI Specs:** High-density financial data grid.
  * Columns: Procedure Name, Target Base Price, Attributed Doctor Labor Cost, Material Depletion Cost (calculated directly from `MATERIAL_USAGE`), Fixed Overhead Allocation, Net Profit, and Profit Margin Percentage[cite: 4].
  * Feature: "Export Report" button and an interactive expandable row detail view showing an itemized list of all materials consumed for that specific procedure category[cite: 4].

#### 24. AI-Driven 3-Month Financial Forecast Interface [Owner]
* **Functional Scope:** Advanced forecasting workspace rendering 3-month rolling revenue projections generated by the Python predictive service[cite: 4].
* **UI Specs:**
  * Main View: Dual-line chart showing Historical Performance metrics seamlessly transitioning into a dotted-line 3-Month Predictive Projection (Prophet/ARIMA array)[cite: 4].
  * Confidence Boundary: Chart must shade the upper and lower confidence intervals to accurately reflect model uncertainty.
  * Sidebar: Summary cards displaying Predicted Gross Revenue, Expected Appointment Volume, and a "Model Reliability Index".

#### 25. No-Show Predictive Insights Terminal [Owner]
* **Functional Scope:** Diagnostic analytical space isolating risk distribution factors and measuring revenue saved via automated waitlist fills[cite: 4].
* **UI Specs:**
  * Left Panel: Donut chart displaying the total distribution of the patient database by risk status (`Low`, `Medium`, `High`)[cite: 4].
  * Right Panel: KPI metrics tracking "Recovered Slots via Smart Waitlist" and "Estimated Revenue Restored" through the automated WhatsApp auto-fill mechanism[cite: 4].

#### 26. Staff Directory & Identity Management Control [Owner]
* **Functional Scope:** Core governance terminal managing system access scopes and staff data[cite: 4].
* **UI Specs:** Operational management grid.
  * Columns: Staff Name, Professional Email, Inputted Mobile Number, Attributed System Role Scope (`Owner`, `Doctor`, `Receptionist`), and Account Status Toggle (Active/Suspended)[cite: 4].
  * Action: "Add Staff Member" floating button opening a secure validation form to provision new clinic credentials internally (No public signups).

---

## 5. MACHINE LEARNING LOGIC & PREDICTIVE ARCHITECTURE REFERENCE

All AI features built into the frontend modules must communicate with the backend assuming these precise decision rules and model structures:

### 5.1 No-Show Risk Score Logic
* **Endpoint Interaction:** When an appointment booking is requested, the system triggers an asynchronous HTTP request to parse the patient’s historical metrics[cite: 4].
* **Model Baseline:** The core logic calculates risk scoring dynamically based on historical parameters located in the `ATTENDANCE_HISTORY` table[cite: 4].
* **Risk Classifications:**
  * **`High Risk`:** Triggered when individual cancellation rates cross past predefined bounds[cite: 4]. Instructs the frontend reminder architecture to initiate an automated, high-frequency WhatsApp reminder cascade (48h, 24h, and 3h before the appointment)[cite: 4].
  * **`Low/Medium Risk`:** Adheres to the standard single-message validation reminder protocol 24 hours prior[cite: 4].

### 5.2 Automated Waitlist Auto-Fill Workflow
* **Trigger:** An appointment status mutation moving to `Cancelled` instantly prompts the system to cross-reference active `WAITLIST` row entries[cite: 4].
* **State Cascades:**
```
