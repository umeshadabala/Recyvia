# API Endpoint Reference — Recyvia

Base API Gateway HTTP Endpoint: `https://<api-id>.execute-api.ap-south-1.amazonaws.com`

All endpoints return JSON responses with standard status envelopes:
- **Success**: `{ "success": true, "data": ... }`
- **Error**: `{ "success": false, "error": "Descriptive message" }`

---

## 1. System Health

### `GET /health`
Verifies API Gateway and Lambda execution status.
- **Method**: `GET`
- **Path**: `/health`
- **Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "service": "Recyvia API",
    "status": "HEALTHY",
    "version": "1.0.0",
    "timestamp": "2026-09-20T12:00:00.000Z"
  }
}
```

---

## 2. Authentication & Session

### `POST /auth/send-otp`
Dispatches a 6-digit verification code to the provided phone number or email address.
- **Method**: `POST`
- **Path**: `/auth/send-otp`
- **Request Body**:
```json
{
  "phone": "+91 98765 43210"
}
```
- **Response**: `200 OK`
```json
{
  "success": true,
  "message": "OTP sent successfully"
}
```

### `POST /auth/verify-otp`
Validates the submitted 6-digit OTP code (also accepts demo fallback `123456`).
- **Method**: `POST`
- **Path**: `/auth/verify-otp`
- **Request Body**:
```json
{
  "phone": "+91 98765 43210",
  "otp": "123456",
  "name": "Ananya Sharma",
  "role": "INDIVIDUAL"
}
```
- **Response**: `200 OK` (Returns auth session profile and token)

### `GET /auth/me`
Retrieves the session profile for the authenticated request.
- **Method**: `GET`
- **Path**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`

---

## 3. Waste Pickup Requests

### `GET /pickups`
Fetches active pickup requests.
- **Method**: `GET`
- **Path**: `/pickups`
- **Response**: `200 OK` (Array of PickupRequest objects)

### `POST /pickups`
Submits a new recyclable waste pickup request.
- **Method**: `POST`
- **Path**: `/pickups`
- **Request Body**:
```json
{
  "customerId": "gen-01",
  "customerName": "Ananya Sharma",
  "customerType": "individual",
  "phone": "+91 98450 12345",
  "pickupLocation": {
    "street": "Flat 402, Green Glen Layout",
    "area": "Bellandur",
    "city": "Bengaluru",
    "state": "Karnataka",
    "pincode": "560103",
    "lat": 12.9279,
    "lng": 77.6801
  },
  "wasteItems": [
    {
      "categoryId": "rate-ewaste-laptops",
      "categoryName": "Old Laptops & Computers",
      "categoryKey": "e_waste",
      "estimatedWeightKg": 10,
      "ratePerKg": 180
    }
  ],
  "scheduledAt": "2026-09-20",
  "scheduledTimeSlot": "10:00 AM - 12:00 PM",
  "paymentMethod": "upi"
}
```

### `GET /pickups/:id`
Retrieves full details and itemized history for a specific pickup.
- **Method**: `GET`
- **Path**: `/pickups/:id`

### `POST /pickups/:id/accept`
Assigns a requested pickup job to an informal collector.
- **Method**: `POST`
- **Path**: `/pickups/:id/accept`
- **Request Body**:
```json
{
  "collectorId": "coll-01",
  "collectorName": "Rajesh Kumar",
  "collectorPhone": "+91 98765 43210"
}
```

### `POST /pickups/:id/status`
Updates operational stage (`ON_THE_WAY`, `ARRIVED`, `CANCELLED`).
- **Method**: `POST`
- **Path**: `/pickups/:id/status`
- **Request Body**: `{ "status": "ON_THE_WAY" }`

### `POST /pickups/:id/verify-otp`
Authenticates doorstep physical custody before weighing waste items.
- **Method**: `POST`
- **Path**: `/pickups/:id/verify-otp`
- **Request Body**: `{ "otp": "849201" }`

### `POST /pickups/:id/weight`
Records calibrated digital scale weights for each waste category.
- **Method**: `POST`
- **Path**: `/pickups/:id/weight`
- **Request Body**:
```json
{
  "weighedItems": [
    { "categoryId": "rate-ewaste-laptops", "actualWeightKg": 12.5 }
  ]
}
```

### `POST /pickups/:id/complete`
Calculates final settlement amount based on verified weights, records the transaction, completes the pickup, and creates a downstream recovery record.
- **Method**: `POST`
- **Path**: `/pickups/:id/complete`
- **Request Body**:
```json
{
  "paymentMethodOverride": "upi"
}
```

---

## 4. Material Recovery & Recycling Facility Loop

### `GET /recovery`
Lists all material recovery records across lifecycle stages (`AVAILABLE`, `RECEIVED`, `PROCESSING`, `RECOVERED`).
- **Method**: `GET`
- **Path**: `/recovery`

### `POST /recovery/:id/receive`
Logs material intake when delivered to a recycling facility.
- **Method**: `POST`
- **Path**: `/recovery/:id/receive`
- **Request Body**:
```json
{
  "recyclerId": "rec-facility-01",
  "recyclerName": "EcoRecycle Processing Facility"
}
```

### `POST /recovery/:id/process`
Moves received materials into sorting and processing lines.
- **Method**: `POST`
- **Path**: `/recovery/:id/process`

### `POST /recovery/:id/recover`
Marks materials as processed into secondary raw materials (`RECOVERED`).
- **Method**: `POST`
- **Path**: `/recovery/:id/recover`

---

## 5. Transaction Ledger

### `GET /transactions`
Retrieves the recorded ledger of completed pickups and calculated settlement amounts.
- **Method**: `GET`
- **Path**: `/transactions`
