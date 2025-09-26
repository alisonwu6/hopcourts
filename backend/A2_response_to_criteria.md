Assignment 2 - Cloud Services Exercises - Response to Criteria
================================================

Instructions
------------------------------------------------
- Keep this file named A2_response_to_criteria.md, do not change the name
- Upload this file along with your code in the root directory of your project
- Upload this file in the current Markdown format (.md extension)
- Do not delete or rearrange sections.  If you did not attempt a criterion, leave it blank
- Text inside [ ] like [eg. S3 ] are examples and should be removed


Overview
------------------------------------------------

- **Name:** Alison Wu
- **Student number:** n12119831
- **Application name:** SportsMatch
- **Two line description:** Sports is one of the best ways to make friends and build self-confidence. SportsMatch is an application that allows users to find sports partners and games to play together locally. 
- **EC2 instance name or ID:** i-04d3aa52bc49f339f  (n12119831_assignment) 

------------------------------------------------

### Core - First data persistence service

- **AWS service name:**  S3
- **What data is being stored?:** User avatars
- **Why is this service suited to this data?:** S3 provides durable, scalable object storage ideal for large binary files.
- **Why are the other services used not suitable for this data?:** RDS and DynamoDB are designed for structured/tabular data and are inefficient and costly for large media storage.  
- **Bucket/instance/table name:** ssm-sportsmatch-media  
- **Video timestamp:** 00:00
- **Relevant files:**
    - /src/routes/s3.js

### Core - Second data persistence service

- **AWS service name:**  DynamoDB  
- **What data is being stored?:**  User avatars
- **Why is this service suited to this data?:** DynamoDB is serverless, low‑latency, and can handle unpredictable workloads without manual scaling. It’s ideal for fast lookups (e.g. finding all bookings for a given user) and frequently updated state, which fits how SportsMatch will grow.  
- **Why are the other services used not suitable for this data?:** S3 is only for binary/object storage and does not support queries. RDS requires more setup and ongoing management, and for this project’s needs that overhead isn’t justified.  
- **Bucket/instance/table name:** ssm_dynamo_users_matches  
- **Video timestamp:** 01:00
- **Relevant files:**  
    - /src/services/dynamo.js

### Third data service

- **AWS service name:**
- **What data is being stored?:**
- **Why is this service suited to this data?:**
- **Why is are the other services used not suitable for this data?:**
- **Bucket/instance/table name:**
- **Video timestamp:**
- **Relevant files:**

### S3 Pre-signed URLs

- **S3 Bucket names:** ssm-sportsmatch-media 
- **Video timestamp:** 00:16
- **Relevant files:**
    - /src/routes/s3.js

### In-memory cache

- **ElastiCache instance name:** ssm-redis-cache
- **What data is being cached?:** Frequently accessed queries such as the list of upcoming games.
- **Why is this data likely to be accessed frequently?:** Many users will repeatedly request the same match list within short time frames. Caching reduces DynamoDB load and speeds up responses.
- **Video timestamp:**
- **Relevant files:**
  - /src/cache.js
  - /src/controllers/gameController.js
  - /src/routes/games.js

### Core - Statelessness

- **What data is stored within your application that is not stored in cloud data services?:** Temporary files such as resized images.  
- **Why is this data not considered persistent state?:**  These temporary files can always be regenerated from the original images in S3. Persistent data such as avatars or metadata is stored in S3 and DynamoDB.
- **How does your application ensure data consistency if the app suddenly stops?:** All writes go directly to S3 or DynamoDB. If the EC2 container stops or restarts, no data is lost because state is externalized. WebSocket sessions reconnect automatically and rebuild state from DynamoDB.
- **Relevant files:**
    - /src/app.js
    - /src/routes/s3.js
    - /src/services/dynamo.js

### Graceful handling of persistent connections

- **Type of persistent connection and use:**
- **Method for handling lost connections:** 
- **Relevant files:**

### Core - Authentication with Cognito

- **User pool name:** n12119831-a2
- **How are authentication tokens handled by the client?:** JWT tokens are stored in local storage and attached as Authorization headers in requests.  
- **Video timestamp:** 01:47
- **Relevant files:**
    - `/src/utils/cognito.js`
    - `/src/routes/authRoutes.js`
    - `/src/controllers/authController.js`

### Cognito multi-factor authentication

- **What factors are used for authentication:**
- **Video timestamp:**
- **Relevant files:**

### Cognito federated identities

- **Identity providers used:**
- **Video timestamp:**
- **Relevant files:**
    -

### Cognito groups

- **How are groups used to set permissions?:** I use Cognito groups for role-based access. Admin users can access /api/admin; non-admin tokens receive 403 Forbidden. Authorization is enforced by checking the cognito:groups claim in the verified JWT.
- **Video timestamp:** 03:35
- **Relevant files:**
    - /src/auth.js
	- /src/routes/adminRoutes.js
	- /src/utils/cognito.js
	- /src/controllers/authController.js

### Core - DNS with Route53

- **Subdomain**: sportsmatch.cab432.com
- **Video timestamp:**

### Parameter store

- **Parameter names:** /n12119831/ssm_parameter
- **Video timestamp:** 04:09
- **Relevant files:** 
  - `/src/config.js`
  - `/src/routes/s3.js`

### Secrets manager

- **Secrets names:** n12119831/cognito-client-secret
- **Video timestamp:** 05:17
- **Relevant files:** 
  - `/src/utils/secrets.js`
  - `/src/controllers/authController.js`
  - `/src/routes/authRoutes.js`

### Infrastructure as code

- **Technology used:** 
- **Services deployed:** 
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior approval only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -

### Other (with prior permission only)

- **Description:**
- **Video timestamp:**
- **Relevant files:**
    -
