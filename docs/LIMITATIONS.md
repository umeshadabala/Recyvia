# Scope, Design Decisions & Production Roadmap — Recyvia

To achieve extreme reliability, fast response times, and resilience during demonstrations, specific architectural choices were made for the MVP release. This document details current capabilities and the technical roadmap for production scaling.

---

## 1. Authentication & Session Identity

### Current MVP Implementation
- **6-Digit OTP Service**: Features an OTP controller compatible with email and SMS endpoints, combined with an automated demo fallback (`123456`) ensuring evaluators and users are never blocked by carrier SMS latency or third-party quota limits.
- **Fast Persona Switcher**: In addition to modal login, users can switch between **Customer**, **Informal Collector**, and **Recycler Partner** roles directly from the sidebar navigation to evaluate all sides of the platform.

### Production Roadmap
- Integrate **Amazon Cognito User Pools** with Amazon SNS SMS delivery for production OTP issuance.
- Add hardware biometric (WebAuthn / Fingerprint) authentication for informal collectors on mobile devices.

---

## 2. Settlement Calculation & Transaction Ledger

### Current MVP Implementation
- **Settlement State Ledger**: The application captures real-time digital scale weights, calculates exact settlement amounts based on category scrap rates, and records the transaction on the DynamoDB ledger (`TRANSACTION#<id>`) with user-selected settlement preferences (UPI or Cash).

### Production Roadmap
- Connect to standard banking and payout APIs to initiate direct bank-to-bank transfers upon pickup completion.

---

## 3. Geolocation & Collector Route Planning

### Current MVP Implementation
- **Browser Geolocation & Distance Calculation**: Computes radial distance between active pickup requests and available collectors using standard coordinate geometry (Haversine formula).

### Production Roadmap
- Integrate turn-by-turn routing services for road-network distance calculation and traffic delay estimation.

---

## 4. Material Recovery Tracking

### Current MVP Implementation
- **Facility Intake & Recovery State Machine**: Tracks waste through the recycling facility lifecycle (`AVAILABLE` -> `RECEIVED` -> `PROCESSING` -> `RECOVERED`) with batch tracking.

### Production Roadmap
- Integration with external facility management and enterprise resource planning systems for automated material reconciliation.
