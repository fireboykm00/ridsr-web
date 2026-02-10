
# UI/UX PHILOSOPHY

--- 

### 1. Design Philosophy: The "Clean Triage"

* **Accessibility First:** Large touch targets for mobile (CHW use).
* **Color Semantics:** Use Rwanda MoH standard colors.
* **Red:** Immediate Alert (Ebola, Marburg, Cholera).
* **Yellow:** Weekly report due / Follow-up required.
* **Green:** Validated/Clean sector.

* **Language:** Toggle between **English and Kinyarwanda** at the component level.

---

### 2. Page Architecture & Features

#### A. The Facility "Entry" Dashboard (Nurse/Data Clerk)

The goal here is to replace the 12-page paper form with a "Smart Stepper."

* **Patient Intake Module:** Search by National ID (NID). If found, auto-populate Names, DOB, and Residence (Province/District/Sector/Cell/Village).
* **Case Reporting Stepper:**

1. **Symptoms:** Multi-select chips (Fever, Cough, Rash, etc.).
2. **Logic Trigger:** If "Fever" + "Bleeding" are selected, the UI immediately turns Red and displays: **"IMMEDIATE ACTION: Isolate Patient & Notify District!"**
3. **Lab Request:** One-click generation of a Specimen ID and a QR code to stick on the sample vial.

#### B. The District "Verification" Hub (DHO)

This is a high-density data table where the District Health Officer acts as a "Gatekeeper."

* **The "Inbox" View:** A list of all suspected cases submitted by Health Centers in the last 24 hours.
* **Verification Toggle:** DHO can click "Verify" (adds to official stats) or "Investigate" (sends a message back to the nurse for more info).
* **Resource Tracker:** Mini-widgets showing ambulance availability and PPE stock at each Health Center.

#### C. The National "Situation Room" (RBC Epidemiologists)

* **Interactive Map (PostGIS integration):** A choropleth map of Rwanda. Zooming in changes the view from Province → District → Sector.
* **The Epi-Curve:** Automatic charting of cases over time. The system draws a "Threshold Line" based on the last 5 years of data. If the current bar crosses that line, the system triggers a system-wide "Outbreak Alert."

---

### 3. Role-Based Access Control (RBAC) UX

The UI should morph based on the user's permissions:

| Page | CHW (Mobile) | Nurse (Tablet/PC) | DHO (PC) | National (PC) |
| --- | --- | --- | --- | --- |
| **Simple Signal** | Can submit | Can submit | View only | View only |
| **Full Case Report** | Hidden | Full Edit | Verify Only | View/Audit |
| **Lab Results** | Notification only | View results | View results | Manage NRL labs |
| **Admin Panel** | Hidden | Hidden | Hidden | Full Access |

---

### 4. Technical UI/UX Requirements

* **PWA (Progressive Web App):** Since internet can be unstable, use **Next.js PWA** to allow the app to be "installed" on Android tablets. It must work offline and show a "Syncing..." status bar when the nurse reaches 4G coverage.
* **QR Scanner:** Use the device camera to scan Lab Specimen vials to ensure the digital record matches the physical bottle.
* **State Persistence:** If a nurse is halfway through a 20-field report and gets an emergency, the form must auto-save to **LocalStorage** so they don't lose data.

---

### 5. API Endpoints for the UI

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/v1/patients/search?nid=...` | Pulls data from the National ID registry. |
| `POST` | `/api/v1/cases/submit` | Submits the case report (JSON format). |
| `GET` | `/api/v1/geo/map-data` | Fetches TopoJSON/GeoJSON for the Rwanda map. |
| `POST` | `/api/v1/notifications/broadcast` | (Admin Only) Sends SMS/Push to all health workers. |

---

