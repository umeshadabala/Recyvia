# Amazon DynamoDB Schema Specification — Recyvia

Recyvia implements an optimized **Single-Table Design** pattern on Amazon DynamoDB. All domain entities share a single table named `Recyvia` partitioned with compound key design principles to guarantee sub-10ms reads and zero join overhead.

---

## 1. Key Schema & Configuration

- **Table Name**: `Recyvia`
- **Partition Key (`pk`)**: String (Format: `<ENTITY_TYPE>#<IDENTIFIER>`)
- **Sort Key (`sk`)**: String (Format: `META` or `PROFILE`)
- **Capacity Mode**: **On-Demand** (`PAY_PER_REQUEST`)
- **Region**: `ap-south-1` (Mumbai)

---

## 2. Entity Mapping & Access Patterns

| Entity Type | Partition Key (`pk`) | Sort Key (`sk`) | Attributes & Payloads |
|---|---|---|---|
| **User Profile** | `USER#<userId>` | `PROFILE` | `id`, `phone`, `name`, `email`, `role`, `address`, `pincode`, `createdAt` |
| **Collector Profile** | `COLLECTOR#<collectorId>` | `PROFILE` | `id`, `name`, `phone`, `vehicleType`, `vehicleNumber`, `isAvailable`, `rating` |
| **Pickup Request** | `PICKUP#<pickupId>` | `META` | `id`, `customerId`, `collectorId`, `status`, `otp`, `wasteItems`, `estimatedAmount`, `weighedItems`, `finalAmount`, `createdAt` |
| **Transaction** | `TRANSACTION#<transactionId>` | `META` | `id`, `pickupId`, `customerId`, `collectorId`, `totalAmount`, `paymentStatus`, `payoutMethod`, `timestamp` |
| **Recovery Record** | `RECOVERY#<recoveryId>` | `META` | `id`, `pickupId`, `collectorId`, `recyclerId`, `status`, `materials`, `totalWeightKg`, `batchId`, `facilityName`, `updatedAt` |

---

## 3. Core Query Patterns & Implementations

### 1. Fetch Item by Entity ID
Direct Point-In-Time Read:
```ts
const command = new GetCommand({
  TableName: 'Recyvia',
  Key: {
    pk: `PICKUP#${pickupId}`,
    sk: 'META',
  },
});
```

### 2. Query All Active Pickups
```ts
const command = new ScanCommand({
  TableName: 'Recyvia',
  FilterExpression: 'begins_with(pk, :prefix) AND sk = :sk',
  ExpressionAttributeValues: {
    ':prefix': 'PICKUP#',
    ':sk': 'META',
  },
});
```

### 3. Query All Downstream Recovery Batches
```ts
const command = new ScanCommand({
  TableName: 'Recyvia',
  FilterExpression: 'begins_with(pk, :prefix) AND sk = :sk',
  ExpressionAttributeValues: {
    ':prefix': 'RECOVERY#',
    ':sk': 'META',
  },
});
```

### 4. Query All Completed Transaction Records
```ts
const command = new ScanCommand({
  TableName: 'Recyvia',
  FilterExpression: 'begins_with(pk, :prefix) AND sk = :sk',
  ExpressionAttributeValues: {
    ':prefix': 'TRANSACTION#',
    ':sk': 'META',
  },
});
```
