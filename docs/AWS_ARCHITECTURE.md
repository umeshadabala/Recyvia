# Cloud Architecture & Data Flow Specification — Recyvia

```
                                    ┌───────────────────────┐
                                    │    CLIENT BROWSER     │
                                    │  (React 19 / TS SPA)  │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │  AWS AMPLIFY HOSTING  │
                                    │   (Global Edge CDN)   │
                                    └───────────┬───────────┘
                                                │
               ┌────────────────────────────────┴────────────────────────────────┐
               │ HTTPS REST Calls                                                │ WebSockets Real-Time
               ▼                                                                 ▼
    ┌──────────────────────┐                                          ┌──────────────────────┐
    │  AMAZON API GATEWAY  │                                          │  AWS APPSYNC EVENTS  │
    │   (HTTP API CORS)    │                                          │ (Channel: /pickups/*)│
    └──────────┬───────────┘                                          └──────────▲───────────┘
               │                                                                 │
               ▼ Lambda Proxy                                                    │
    ┌─────────────────────────────────────────────────────────────┐              │ Publish
    │                      AWS LAMBDA ROUTER                      │              │ Event
    │ ┌──────────────┬──────────────────┬───────────────────────┐ │              │
    │ │ Auth Handler │ Pickup Lifecycle │ Material Recovery Flow│ │──────────────┘
    │ └──────────────┴──────────────────┴───────────────────────┘ │
    └──────────────────────────────┬──────────────────────────────┘
                                   │
                                   ▼ Read / Write
                     ┌───────────────────────────┐
                     │      AMAZON DYNAMODB      │
                     │ (Single-Table: "Recyvia") │
                     └───────────────────────────┘
```

---

## 1. System Components & Separation of Concerns

### A. Frontend Layer (AWS Amplify Hosting)
- **Framework**: React 19 Single Page Application built with Vite and TypeScript.
- **Edge Distribution**: Served via AWS Amplify's globally distributed CloudFront CDN with automated SSL/TLS encryption and Gzip/Brotli compression.
- **Client Routing**: Configured with SPA rewrite rules routing all virtual paths (`/my-pickups`, `/request-pickup`, `/transactions`) to `/index.html`.

### B. Ingress Layer (Amazon API Gateway HTTP API)
- **Protocol**: HTTP/2 and HTTP/1.1 over TLS 1.3.
- **CORS Policy**: Configured to permit cross-origin requests (`GET`, `POST`, `PATCH`, `OPTIONS`) from any origin (`*`) with standard headers (`Content-Type`, `Authorization`, `X-Requested-With`).
- **Integration**: Zero-overhead direct Lambda Proxy integration forwarding path, query parameters, headers, and request bodies to `RecyviaApi`.

### C. Compute Layer (AWS Lambda)
- **Runtime**: Node.js 20.x on x86_64 architecture.
- **Packaging**: Single self-contained zip package (`backend/recyvia-backend.zip`) containing compiled TypeScript handlers and AWS SDK v3 clients.
- **Stateless Router**: Dispatches incoming HTTP events to discrete handler domains:
  - `AuthHandler`: 6-digit OTP verification and session resolution.
  - `PickupHandler`: Lifecycle state machine execution (`REQUESTED` -> `COMPLETED`).
  - `RecoveryHandler`: Recycler facility intake and conversion tracking.

### D. Data Persistence Layer (Amazon DynamoDB)
- **Single-Table Design**: All application entities reside within a single table (`Recyvia`).
- **Primary Keys**: High-cardinality compound partition key `pk` and semantic sort key `sk`.
- **Capacity**: On-Demand (`PAY_PER_REQUEST`) scaling automatically with workload spikes.

### E. Real-Time Messaging Layer (AWS AppSync Events)
- **Protocol**: WebSockets over TLS with subprotocol authentication.
- **Decoupled Architecture**: Lambda handlers publish state change events to AppSync via HTTP, and AppSync distributes real-time push frames to all active connected browser clients.

---

## 2. Security Architecture

1. **Least-Privilege IAM**: The Lambda execution role is restricted to CRUD operations specifically on the `Recyvia` DynamoDB table ARN (`arn:aws:dynamodb:ap-south-1:*:table/Recyvia`).
2. **Encryption in Transit**: All API Gateway, AppSync, and Amplify interactions are strictly enforced over TLS 1.3.
3. **Encryption at Rest**: DynamoDB table data is encrypted at rest using AWS KMS managed keys.
4. **Doorstep OTP Authentication**: Prevents unauthorized custody transfers by requiring customer-to-collector physical verification before scale weighing.
