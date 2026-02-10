# Rwanda National Integrated Disease Surveillance and Response Platform (RIDSR)


---

## 1. The Core Functional Architecture (What to Build)

To avoid "noise," the platform should be divided into three specific modules that solve the paper-based lag in Rwanda:

### A. The "Signal" Input (Community & Clinic Level)

* **Case Reporting Engine:** Digital version of the IDSR weekly reporting form (12 pages down to a few taps).
* **Case-Based Surveillance (CBS):** Individual tracking of "Epidemic-Prone" diseases. When a patient shows symptoms of Marburg or Cholera, the record is flagged for "Immediate Investigation."
* **Offline Data Sync:** Since rural connectivity in Rwanda fluctuates, the app must store data locally (IndexedDB/SQLite) and auto-sync when back online.

### B. The "Validation" Hub (District & Lab Level)

* **Lab-Link:** A specific interface for lab technicians. When a sample from a district reaches the National Reference Lab (NRL), the tech updates the status (Negative/Positive), which instantly updates the nurse's dashboard.
* **Alert Verification:** A workflow for District Health Officers to "Verify" or "Dismiss" a community signal, preventing false alarms from wasting resources.

### C. The "Action" Dashboard (National/RBC Level)

* **Automated Epi-Curves:** No more manual Excel. The system generates  in real-time.
* **Heatmapping:** Uses GIS data to show clusters of illness down to the **Sector** level.

---

## 2. Recommended Technical Stack

For Rwanda, where data sovereignty and long-term maintenance are key, an **Open-Source Standard** stack is best.

### Frontend: Next.js + Tailwind CSS

* **Why:** Next.js provides **Server-Side Rendering (SSR)** for fast dashboard loading and **Progressive Web App (PWA)** capabilities. A PWA allows health workers to "install" the web app on their phones for offline use without going through the Play Store.
* **State Management:** **Zustand** or **React Query** for managing complex, real-time data fetching from health centers.

### Backend: Node.js (Express) or Go

* **Why:** High concurrency. In the event of an outbreak, thousands of CHWs might submit reports simultaneously. Node.js handles these asynchronous events efficiently.
* **Database:** **PostgreSQL** with **PostGIS** for geographic mapping. PostGIS is essential for Rwanda’s hilly terrain to calculate "catchment areas" for health centers.

### Interoperability Layer: HL7 FHIR

* **The Industry Standard:** Do not build a custom data format. Use **FHIR (Fast Healthcare Interoperability Resources)**. This ensures that in 2 years, your system can "talk" to the existing **OpenMRS** or **DHIS2** systems used by the Ministry of Health without rewriting your code.

---

## 3. Engineering Requirements (The "How")

| Requirement | Technical Strategy |
| --- | --- |
| **Data Privacy** | Implement **RBAC (Role-Based Access Control)**. A CHW should only see their village; the Minister sees the whole country. Use **JWT** for secure sessions. |
| **Connectivity** | **Service Workers** for background syncing. If the internet fails during a report, the "Submit" action is queued in a background sync task. |
| **Analytics** | Use **Apache Superset** or a custom **D3.js** implementation for the charts. This allows epidemiologists to "slice and dice" data by age, gender, and location. |
| **Reliability** | **Dockerize** the entire stack. This allows RISA (Rwanda Information Society Authority) to host the platform on their local servers easily. |

---

## 4. The "No-Noise" Feature Set for MVP

1. **Identity Management:** Integration with Rwanda's National ID system (API-based) to ensure patient data is accurate.
2. **Threshold Engine:** A background cron job that checks: `If cases > X in Sector Y within 72 hours, Send SMS Alert to District Head.`
3. **Digital Bulletin:** An automated PDF generator that creates the "Weekly Surveillance Bulletin" every Friday at 5:00 PM, saving epidemiologists 2 days of manual work.

