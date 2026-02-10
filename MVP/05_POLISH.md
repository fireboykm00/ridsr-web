
# POLISH USER STORY

---

### 1. End-to-End User Stories & Case Flows

You need to define how data moves through the "Health Pyramid" of Rwanda.

#### A. The Community Signal (CHW Level)

* **User Story:** *As a Community Health Worker (Abajyanama b’Ubuzima), I want to report a cluster of "unusual symptoms" via a USSD code or a light PWA so that I don't have to walk 2 hours to the Health Center to deliver a paper report.*
* **The Flow:** 1.  CHW observes 3 cases of high fever in a village.

2. CHW opens the RIDSR PWA (Offline).
2. Data is saved to **IndexedDB**.
3. When the CHW reaches 4G/5G coverage, the record auto-syncs to the National Database.

#### B. The Clinical Triage (Health Center Level)

* **User Story:** *As a Nurse, I want the system to pull patient data from the National ID (NIDA) registry so that I don't waste time typing names and addresses manually.*
* **The Flow:**

1. Nurse enters the patient's **National ID**.
2. RIDSR calls the NIDA API to fetch demographics.
3. Nurse selects "Suspected Cholera."
4. The system generates a **QR Code** for the lab sample.

#### C. The Verification Loop (District Level)

* **User Story:** *As a District Health Officer, I want to see a heatmap of my district so I can deploy a Rapid Response Team (RRT) to the exact sector where an outbreak is emerging.*

---

### 2. Comprehensive Feature List (By Module)

| Module | Core Features | Technical Requirement |
| --- | --- | --- |
| **Intake** | **NID Integration** | Integration with NIDA for de-duplication. |
| **Reporting** | **Dynamic Stepper Forms** | Form logic that asks follow-up questions based on symptoms. |
| **Laboratory** | **QR Specimen Tracking** | Unique ID generation to link physical vials to digital cases. |
| **Intelligence** | **Automated Epi-Curves** | Real-time calculation of incidence rates per 10,000 people. |
| **Response** | **Resource Dashboard** | Tracking ambulance locations and oxygen supply levels. |
| **Alerting** | **Threshold Engine** | Backend logic: `If Cases > 5 in 7 days in Sector X, Trigger SMS`. |

---

### 3. Critical Requirements (The "Missing" Details)

#### A. Data Sovereignty & Security

* **Local Hosting:** All data must reside within the **Rwanda Data Center** to comply with the 2023 Data Protection Law.
* **Audit Logs:** Every change to a patient record must be logged (Who accessed it? When? Why?) to ensure HIPAA-equivalent privacy.

#### B. Interoperability (The "Glue")

* **FHIR Standard:** Use **HL7 FHIR** for the API. This ensures RIDSR can talk to **OpenMRS** (Patient records) and **DHIS2** (National stats) without custom "spaghetti" code.
* **Lab Integration:** Connect directly to LIMS used by Roche or Abbott machines in Rwanda to remove manual data entry by lab techs.

#### C. The "Zero-Noise" UI/UX

* **Multi-language:** All interfaces must be available in **Kinyarwanda, English, and French**.
* **Performance:** The app must load in **<2 seconds** even on a 3G/Edge network.

---

### 4. Best Practices for Rwanda Implementation

1. **Incentive Alignment:** Link the platform to **Mobile Money**. If a CHW reports a confirmed case, they should receive a small performance-based incentive (e.g., $2) automatically.
2. **Zero-Rated Data:** Partner with local telecoms (MTN/Airtel) so that health workers do not use their personal airtime/data to submit reports.
3. **Offline-First Architecture:** Assume the internet will fail. Use **Service Workers** to cache forms so the system never "freezes" during a consultation.
4. **Phased Rollout:** Do not launch nationally on Day 1. Start with 5 pilot districts to iterate on the UI based on real feedback from nurses in rural settings.

### 5. Success Metrics to Track

* **Detection Lag:** Reduce from **9 days** to **<24 hours**.
* **Data Quality:** Improve accuracy from **77%** to **>95%**.
* **Financial ROI:** Target **$6M in annual savings** by eliminating paper forms and manual reconciliation.
