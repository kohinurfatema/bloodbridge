# BloodBridge API

Blood Donation & Emergency Platform — RESTful backend API built with Node.js, TypeScript, Express, PostgreSQL, and Prisma.

## Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express.js v5
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** JWT (access + refresh tokens) + Google OAuth (GCP)
- **Payments:** Stripe Checkout
- **Validation:** Zod
- **Security:** Helmet, CORS, express-rate-limit

## Getting Started

```bash
# Install dependencies
npm install

# Copy env file and fill in values
cp .env.example .env

# Push schema to database and generate client
npm run db:push

# Seed test users
npm run db:seed

# Start dev server
npm run dev
```

## Environment Variables

See `.env.example` for all required variables.

## API Base URL

```
/api/v1
```

## Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /auth/register | Public | Register new user |
| POST | /auth/login | Public | Login with email & password |
| POST | /auth/refresh-token | Public | Get new access token |
| POST | /auth/google | Public | Login with Google ID token |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /users/me | Authenticated | Get own profile |
| PATCH | /users/me | Authenticated | Update own profile |
| GET | /users/:id | ADMIN | Get any user by ID |

### Donors
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /donors | Authenticated | Search donors (blood type, location, pagination) |
| POST | /donors/register | DONOR | Register donor profile |
| GET | /donors/me | DONOR | Get own donor profile |
| PATCH | /donors/me | DONOR | Update own donor profile |

### Blood Requests
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /requests | REQUESTER | Create blood request |
| GET | /requests | Authenticated | List all requests (filterable) |
| GET | /requests/my | REQUESTER | Get own requests |
| GET | /requests/:id | Authenticated | Get request by ID |
| PATCH | /requests/:id/status | REQUESTER, ADMIN | Update request status |
| DELETE | /requests/:id | REQUESTER, ADMIN | Soft delete request |

### Matches
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /matches | ADMIN | Create donor-request match |
| GET | /matches/my | DONOR | Get own matches |
| GET | /matches/request/:requestId | REQUESTER, ADMIN | Get matches for a request |
| PATCH | /matches/:id/respond | DONOR | Accept, decline, or complete a match |

### Emergency Alerts
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /alerts | ADMIN | Create emergency alert |
| GET | /alerts | Authenticated | List alerts |
| PATCH | /alerts/:id/resolve | ADMIN | Resolve an alert |

### Payments
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | /payments/initiate | REQUESTER | Initiate Stripe payment |
| GET | /payments/verify | Authenticated | Verify payment by session ID |
| GET | /payments/my | REQUESTER | Get own payments |

### Admin
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /admin/stats | ADMIN | Dashboard statistics |
| GET | /admin/users | ADMIN | List all users |
| PATCH | /admin/users/:id/status | ADMIN | Toggle user active/inactive |
| DELETE | /admin/users/:id | ADMIN | Soft delete user |

### Audit Logs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | /audit | ADMIN | List audit logs |
| GET | /audit/:id | ADMIN | Get single audit log |

## Response Format

```json
{ "success": true, "message": "...", "data": {} }
{ "success": false, "message": "...", "errors": [] }
```

## Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| ADMIN | admin@bloodbridge.com | Admin@1234 |
| DONOR | donor@bloodbridge.com | Donor@1234 |
| REQUESTER | requester@bloodbridge.com | Requester@1234 |
