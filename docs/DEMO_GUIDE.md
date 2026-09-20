# 3-Minute Hackathon Demo Script — Recyvia

This deterministic step-by-step guide is designed to showcase the complete Recyvia ecosystem to hackathon judges in 3 minutes using two side-by-side browser windows.

---

## Window Setup

- **Window A (Left)**: Customer / Individual Persona (`http://localhost:5173/` or Amplify URL)
- **Window B (Right)**: Collector / Recycler Persona (`http://localhost:5173/` with persona switcher set to **Informal Collector**)

---

## Step-by-Step Presentation Script

### 1. The Waste Generator Request (0:00 - 0:45)
- **Action in Window A**:
  - Show the landing page and click the **Language Selector** (English, Hindi, Tamil, Telugu) to demonstrate regional language support.
  - Enter the app and click **Request Pickup** in the top navigation.
  - Select scrap items (e.g. **Printed Circuit Boards / E-Waste** and **Office Paper**).
  - Adjust estimated weights (10 kg PCBs, 20 kg Paper).
  - Click **Confirm Pickup Request**.
- **Judge Callout**: *"Notice the generated 6-Digit Security OTP (`849201`) and live status tracker on the customer's dashboard. In the background, an event was published to AWS AppSync over WebSockets."*

### 2. Real-Time Collector Radar & Job Acceptance (0:45 - 1:15)
- **Action in Window B**:
  - In Window B (Informal Collector), show the **Available Jobs Radar**.
  - Notice the pickup request appeared in real time without reloading the page.
  - Click **Accept Job**.
- **Judge Callout**: *"Notice how Window A transitions to 'Collector Accepted' in real time. The customer sees their assigned collector's name and contact details."*

### 3. Doorstep Arrival & Security OTP Verification (1:15 - 1:45)
- **Action in Window B**:
  - Click **Start Trip (On the Way)** -> **Arrived at Location**.
  - Click **Verify Security OTP**.
  - Type the 6-digit OTP displayed in Window A (or the demo fallback code `123456`).
  - Click **Verify OTP**.
- **Judge Callout**: *"This ensures physical doorstep custody authentication before any waste is weighed or transferred."*

### 4. Digital Scale Weighing & Settlement Calculation (1:45 - 2:15)
- **Action in Window B**:
  - Enter the verified scale weights (e.g., 12.5 kg PCBs, 22.0 kg Paper).
  - Click **Save Verified Weights**.
  - Select settlement preference (UPI or Cash) and click **Confirm Payment & Complete**.
- **Judge Callout**: *"Both customer and collector records synchronize immediately. The calculated settlement is recorded on the transaction ledger."*

### 5. Completed Pickup & Transaction Summary (2:15 - 2:40)
- **Action in Window A**:
  - Window A now indicates the pickup is completed.
  - Open **History / Transactions** to inspect the recorded settlement details, category breakdown, verified weights, and timestamp.

### 6. Recycler Facility Intake & Processing (2:40 - 3:00)
- **Action in Window B**:
  - Switch the persona dropdown in the sidebar to **Recycler Partner**.
  - Show the **Incoming Material** stream: The waste collected in Step 4 is now visible in the facility intake queue.
  - Click **Receive Material** -> **Start Processing** -> **Complete Recovery**.
  - Observe the material transition from `AVAILABLE` to `RECEIVED`, `PROCESSING`, and finally `RECOVERED`.
- **Closing Statement**: *"Recyvia coordinates the loop from the resident's doorstep to facility-level material recovery, bringing efficiency and operational visibility to recyclable waste collection."*
