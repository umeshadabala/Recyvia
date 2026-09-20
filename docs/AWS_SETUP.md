# AWS Setup & Deployment Guide — Recyvia

This comprehensive guide walks you through deploying all cloud components of **Recyvia** on AWS, including **Amplify Hosting**, **Amazon DynamoDB**, **AWS Lambda**, **Amazon API Gateway**, and **AWS AppSync Events**.

---

## SECTION 1 — Region Selection & Free Tier Safety

1. Sign in to your **[AWS Management Console](https://aws.amazon.com/console/)**.
2. In the top-right navigation bar, choose your deployment region:
   - **Recommended Region**: `ap-south-1` (Asia Pacific - Mumbai).
3. **CRITICAL**: Use the **exact same region** (`ap-south-1`) for all services (DynamoDB, Lambda, API Gateway, AppSync, and Amplify). Services in different regions cannot communicate with internal IAM roles and will incur cross-region latency.
4. All services used fall well within the AWS Free Tier limits for hackathon testing:
   - **DynamoDB**: 25 GB storage & 25 RCU/WCU (configured On-Demand).
   - **Lambda**: 1,000,000 free requests & 3.2M seconds of compute/month.
   - **API Gateway (HTTP API)**: 1,000,000 free requests/month.
   - **AppSync Events**: 250,000 free events/month.
   - **Amplify Hosting**: 1,000 build minutes and 15 GB served/month.

---

## SECTION 2 — Amazon DynamoDB Setup (Single-Table Design)

1. Open **Amazon DynamoDB** in the AWS Console.
2. Click **Create table**.
3. **Table details**:
   - **Table name**: `Recyvia`
   - **Partition key (`pk`)**: `pk` (Type: **String**)
   - **Sort key (`sk`)**: `sk` (Type: **String**)
4. **Table settings**:
   - Select **Customize settings**.
   - Under **Capacity mode**, choose **On-demand** (pay strictly per request with zero idle fees).
5. Click **Create table**.

### Single-Table Schema Layout
| Entity | Partition Key (`pk`) | Sort Key (`sk`) | Key Attributes |
|---|---|---|---|
| User Profile | `USER#<id>` | `PROFILE` | `name`, `phone`, `role`, `address`, `pincode` |
| Collector Profile | `COLLECTOR#<id>` | `PROFILE` | `name`, `phone`, `vehicle`, `isAvailable` |
| Pickup Request | `PICKUP#<id>` | `META` | `status`, `otp`, `wasteItems`, `estimatedAmount`, `location` |
| Transaction Record | `TRANSACTION#<id>` | `META` | `pickupId`, `totalAmount`, `paymentStatus`, `payoutMethod` |
| Material Recovery Record | `RECOVERY#<id>` | `META` | `pickupId`, `collectorId`, `status`, `batchId`, `facilityName` |

---

## SECTION 3 — AWS Lambda Backend Deployment

1. Package the backend deployment bundle:
   ```bash
   npm run package:backend
   ```
   *(This compiles TypeScript and generates `backend/recyvia-backend.zip`)*.

2. Open **AWS Lambda** in the AWS Console.
3. Click **Create function**:
   - **Function name**: `RecyviaApi`
   - **Runtime**: **Node.js 20.x**
   - **Architecture**: **x86_64**
4. Under **Code Source**, click **Upload from** -> **.zip file**.
5. Select `backend/recyvia-backend.zip` from your codebase directory.
6. Under **Runtime settings**:
   - Ensure Handler is: `index.handler`
7. **IAM Permissions**:
   - Go to **Configuration** -> **Permissions** -> Click the execution role link.
   - In the IAM console, attach an inline policy granting DynamoDB access:
     ```json
     {
       "Version": "2012-10-17",
       "Statement": [
         {
           "Effect": "Allow",
           "Action": [
             "dynamodb:GetItem",
             "dynamodb:PutItem",
             "dynamodb:UpdateItem",
             "dynamodb:DeleteItem",
             "dynamodb:Query",
             "dynamodb:Scan"
           ],
           "Resource": "arn:aws:dynamodb:ap-south-1:*:table/Recyvia"
         }
       ]
     }
     ```
8. **Environment Variables**:
   - Under **Configuration** -> **Environment variables**, click **Edit** and add:
     - `DYNAMODB_TABLE`: `Recyvia`
     - `AWS_REGION`: `ap-south-1`

---

## SECTION 4 — Amazon API Gateway (HTTP API) Setup

1. Open **Amazon API Gateway** in the AWS Console.
2. Click **Create API** -> Choose **HTTP API** (click **Build**).
3. Click **Add integration**:
   - Integration type: **Lambda**
   - Lambda function: `RecyviaApi`
4. **API Name**: `RecyviaHttpApi`.
5. **Routes**:
   - Add route: Method `ANY`, Resource path `/{proxy+}`.
   - (Or configure default catch-all `$default` pointing to `RecyviaApi`).
6. **CORS Configuration**:
   - In the left navigation, click **CORS** -> **Configure**:
     - **Access-Control-Allow-Origin**: `*`
     - **Access-Control-Allow-Headers**: `Content-Type, Authorization, X-Requested-With`
     - **Access-Control-Allow-Methods**: `GET, POST, PATCH, PUT, DELETE, OPTIONS`
   - Click **Save**.
7. Note down the **Invoke URL** (e.g., `https://i2o1thfy6j.execute-api.ap-south-1.amazonaws.com`).
   - Test in your browser: `https://<api-id>.execute-api.ap-south-1.amazonaws.com/health` should return status `HEALTHY`.

---

## SECTION 5 — AWS AppSync Events (Real-Time WebSockets)

1. Open **AWS AppSync** in the AWS Console.
2. Click **Create API** -> Choose **Event API** (Pub/Sub).
3. **API Name**: `RecyviaEventsApi`.
4. **Authentication**:
   - Select **API Key** authentication.
5. **Channel Namespaces**:
   - Add namespace: `/pickups/*` (allows pub/sub across all pickup channels).
6. Under **API Details** / **Settings**, copy your:
   - **Event API HTTP endpoint**: `https://<id>.appsync-api.ap-south-1.amazonaws.com/event`
   - **Event API Real-time endpoint**: `wss://<id>.appsync-realtime-api.ap-south-1.amazonaws.com/event/realtime`
   - **API Key**: `da2-xxxxxxxxxxxxxxxxxxxxxxxxxx`

---

## SECTION 6 — AWS Amplify Hosting (Frontend)

### Method A: Drag-and-Drop Zip Upload (Fastest — 2 Minutes)
1. In the AWS Console, search for and open **AWS Amplify**.
2. Click **Create new app** (or **Host web app**).
3. Select **Deploy without Git provider** (Manual deployment).
4. Enter:
   - **App name**: `Recyvia`
   - **Environment name**: `prod`
5. Drag and drop the ready bundle `recyvia-frontend.zip` (located in the root of your project) into the upload box.
6. Click **Save and deploy**.

### Method B: Git-Based CI/CD (GitHub Connection)
1. In **AWS Amplify**, click **Host web app** -> Select **GitHub**.
2. Choose your repository and `main` branch.
3. Amplify will automatically detect the pre-configured `amplify.yml` build specification.
4. Under **Advanced settings** -> **Environment variables**, supply:
   - `VITE_DATA_PROVIDER`: `aws`
   - `VITE_API_BASE_URL`: `https://<api-id>.execute-api.ap-south-1.amazonaws.com`
   - `VITE_APPSYNC_ENDPOINT`: `https://<appsync-id>.appsync-api.ap-south-1.amazonaws.com/event`
   - `VITE_APPSYNC_REALTIME_ENDPOINT`: `wss://<appsync-id>.appsync-realtime-api.ap-south-1.amazonaws.com/event/realtime`
   - `VITE_APPSYNC_API_KEY`: `da2-xxxxxxxxxxxxxxxxxxxxxxxxxx`
5. Click **Save and deploy**.

### Critical Step for Single Page App (SPA) Routing
To prevent 404 errors when refreshing direct routes (such as `/my-pickups`, `/request-pickup`, `/transactions`):
1. In your Amplify App console, go to **Hosting** -> **Rewrites and redirects**.
2. Click **Edit** and add:
   - **Source address**: `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json)$)([^.]+$)/>`
   - **Target address**: `/index.html`
   - **Type**: `200 (Rewrite)`
3. Click **Save**.

---

## SECTION 7 — Verification & Troubleshooting Matrix

| Issue / Symptom | Root Cause | Resolution |
|---|---|---|
| **CORS blocked error** | Missing API Gateway headers | Ensure API Gateway CORS configuration includes `*` origin and headers |
| **500 Internal Server Error** | Missing DynamoDB IAM permission | Verify the Lambda execution role has `dynamodb:*` permission on the `Recyvia` table |
| **WebSocket connection fails** | Subprotocol or endpoint mismatch | Ensure the WebSocket URL includes `/event/realtime` and includes the base64 auth header |
| **404 on page refresh in Amplify** | Missing SPA rewrite rule | Add the regex rewrite rule pointing to `/index.html` in Amplify Hosting console |
