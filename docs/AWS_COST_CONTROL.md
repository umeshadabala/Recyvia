# AWS Cost Control & Hackathon Safety Guide — Recyvia

Recyvia is architected using 100% serverless, on-demand AWS primitives. There are zero provisioned EC2 instances, zero idle RDS databases, and zero container clusters. During testing and demonstration, total infrastructure costs remain strictly **₹0.00**.

---

## Service Breakdown & AWS Free Tier Quotas

| Service | Architecture Role | AWS Free Tier Quota (Monthly) | Expected Hackathon Cost |
|---|---|---|---|
| **AWS Amplify Hosting** | Frontend Web App & CDN | 1,000 build minutes & 15 GB served bandwidth | **₹0.00** |
| **Amazon API Gateway** | HTTP API Ingress | 1,000,000 requests / month | **₹0.00** |
| **AWS Lambda** | Compute Handlers | 1,000,000 invocations & 3,200,000 seconds of compute | **₹0.00** |
| **Amazon DynamoDB** | Single-Table Database | 25 GB storage & 25 WCU / 25 RCU (On-Demand) | **₹0.00** |
| **AWS AppSync Events** | Real-Time WebSockets | 250,000 published events / month | **₹0.00** |

---

## Best Practices to Prevent Unintended Charges

1. **Keep DynamoDB on On-Demand Mode**:
   Always use `PAY_PER_REQUEST` capacity. Do not switch to provisioned capacity with high allocated read/write units.
2. **Short Lambda Timeouts**:
   The Lambda function timeout is set to 15 seconds with 256 MB RAM, preventing rogue runaway loops.
3. **Set Up an AWS Billing Alarm**:
   In the AWS Management Console, open **Billing and Cost Management** -> **Budgets** -> create a zero-spend or $1.00 USD threshold alert.

---

## Post-Hackathon Teardown Instructions

If you wish to completely clean up your AWS account after your project demonstration, run these CLI commands (or delete the resources via the AWS Console):

```bash
# 1. Delete DynamoDB Table
aws dynamodb delete-table --table-name Recyvia --region ap-south-1

# 2. Delete Lambda Function
aws lambda delete-function --function-name RecyviaApi --region ap-south-1

# 3. Delete API Gateway HTTP API
aws apigatewayv2 delete-api --api-id <your-api-id> --region ap-south-1

# 4. Delete AppSync Events API
aws appsync delete-graphql-api --api-id <your-appsync-id> --region ap-south-1

# 5. Delete Amplify App
aws amplify delete-app --app-id <your-amplify-app-id> --region ap-south-1
```
*(All local code, tests, and mock fallbacks remain intact in your repository).*
