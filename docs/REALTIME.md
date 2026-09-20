# Real-Time Event Architecture — Recyvia

Recyvia leverages **AWS AppSync Events** for serverless, bi-directional WebSocket pub/sub communication, enabling immediate synchronization between waste generators, informal collectors, and recycling facilities without polling.

---

## 1. WebSocket Channel Topology

- **Channel Pattern**: `/pickups/*` (or individual topics `/pickups/{pickupId}`)
- **Real-Time Protocol**: WebSockets (`wss://<id>.appsync-realtime-api.ap-south-1.amazonaws.com/event/realtime`)
- **HTTP Publish Endpoint**: `https://<id>.appsync-api.ap-south-1.amazonaws.com/event`
- **Subprotocol Authentication**:
  Connection headers encode API Key authentication using the standard AppSync event subprotocol format:
  ```
  subprotocols: ['aws-appsync-event-ws', 'header-<base64-encoded-auth-payload>']
  ```

---

## 2. Complete Domain Event Catalog

| Event Type | Triggering Action | Published Payload | Subscribed Roles |
|---|---|---|---|
| `PICKUP_CREATED` | Customer submits request | `{ pickupId, customerId, wasteItems, estimatedAmount, status: "REQUESTED" }` | Collectors (Radar) |
| `PICKUP_ACCEPTED` | Collector accepts job | `{ pickupId, collectorId, collectorName, status: "ACCEPTED" }` | Customer, Collector |
| `COLLECTOR_ON_THE_WAY` | Collector begins travel | `{ pickupId, status: "ON_THE_WAY" }` | Customer |
| `COLLECTOR_ARRIVED` | Collector arrives at location | `{ pickupId, status: "ARRIVED" }` | Customer |
| `OTP_VERIFIED` | 6-Digit OTP verified | `{ pickupId, status: "COLLECTING", otpVerified: true }` | Customer, Collector |
| `WEIGHT_VERIFIED` | Calibrated weights submitted | `{ pickupId, weighedItems, finalAmount, status: "WEIGHT_VERIFICATION" }` | Customer, Collector |
| `PAYMENT_CONFIRMED` | Settlement calculated & confirmed | `{ pickupId, payoutMethod, paymentStatus: "completed" }` | Customer, Collector |
| `COLLECTION_COMPLETED` | Collection finalized | `{ pickupId, status: "COMPLETED" }` | Customer, Collector |
| `RECOVERY_AVAILABLE` | Pickup finalized, material at facility gate | `{ recoveryId, pickupId, materials, totalWeightKg, status: "AVAILABLE" }` | Recycler Partner |
| `RECYCLER_RECEIVED` | Material gate intake accepted | `{ recoveryId, recyclerId, status: "RECEIVED" }` | Recycler, Customer |
| `PROCESSING_STARTED` | Sorting & conveyor conversion begun | `{ recoveryId, status: "PROCESSING" }` | Recycler, Customer |
| `RECOVERY_COMPLETED` | Material processing finalized | `{ recoveryId, status: "RECOVERED" }` | Recycler, Customer |

---

## 3. Offline Resilience & Reconnection Strategy

If a user experiences a temporary network disconnection (common on mobile connections):
1. **Visual Indicator**: The UI displays a non-intrusive status badge indicating the connection state (`Connecting`, `Connected`, `Offline Reconnecting`).
2. **Exponential Backoff**: Automatic WebSocket reconnection attempts with randomized jitter to prevent server thundering herds.
3. **State Reconciliation**: Upon reconnection, the client automatically executes `GET /pickups` and `GET /recovery` to fetch authoritative state from DynamoDB, guaranteeing that no state changes were lost during the offline window.
