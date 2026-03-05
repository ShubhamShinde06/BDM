# 🩸 BloodLink Backend

> Node.js REST API + Socket.io | ES Modules | MongoDB | JWT Auth

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secrets

# 3. Seed database with test data
npm run seed

# 4. Start development server
npm run dev

# 5. Production
npm start
```

---

## 🏗️ Project Structure

```
src/
├── server.js              # Entry point — Express + Socket.io
├── config/
│   ├── db.js              # MongoDB connection
│   └── jwt.js             # Token generation & verification
├── models/
│   ├── User.js            # Donors, Receivers, Main Admin
│   ├── Hospital.js        # Hospital admins + embedded inventory
│   ├── BloodRequest.js    # Full request lifecycle
│   ├── DonationHistory.js # Completed donations log
│   └── Notification.js    # System notifications
├── controllers/
│   ├── auth.controller.js
│   ├── admin.controller.js
│   ├── hospital.controller.js
│   ├── request.controller.js
│   └── user.controller.js
├── routes/
│   ├── auth.routes.js
│   ├── admin.routes.js
│   ├── hospital.routes.js
│   ├── request.routes.js
│   └── user.routes.js
├── middleware/
│   ├── auth.js            # JWT protect + authorize + socketAuth
│   └── error.js           # asyncHandler, errorHandler, ApiError
├── sockets/
│   ├── emitter.js         # Centralized emit helper (userId → socketId map)
│   └── handlers.js        # All socket event handlers
├── validators/
│   └── index.js           # express-validator rules
└── utils/
    └── seed.js            # Database seeder
```

---

## 🔐 Authentication

All protected routes require:
```
Authorization: Bearer <accessToken>
```

### Token Flow
1. **Login** → returns `accessToken` (7d) + sets `refreshToken` cookie (30d)
2. **Access** protected routes with `Authorization: Bearer <accessToken>`
3. When expired → **POST /api/auth/refresh** (cookie auto-sent) → new `accessToken`
4. **Logout** → clears DB refresh token + cookie

---

## 📡 API Reference

### Auth Routes `/api/auth`

| Method | Route | Access | Body |
|--------|-------|--------|------|
| POST | `/register/user` | Public | `{ name, email, password, role, bloodGroup, phone, location }` |
| POST | `/register/hospital` | Public | `{ name, email, password, licenseNumber, contact, location }` |
| POST | `/login` | Public | `{ email, password, loginAs: "user"\|"hospital" }` |
| POST | `/refresh` | Public | Cookie or `{ refreshToken }` |
| POST | `/logout` | Private | — |
| GET  | `/me` | Private | — |

---

### Admin Routes `/api/admin` *(main_admin only)*

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/dashboard` | Stats, monthly trends, blood availability |
| GET | `/hospitals?status=pending` | List all hospitals with filters |
| PATCH | `/hospitals/:id/status` | Approve/reject hospital |
| GET | `/users?role=donor&bloodGroup=O+` | List all users |
| PATCH | `/users/:id/block` | Toggle block user |
| DELETE | `/users/:id` | Delete user |
| GET | `/requests` | View all blood requests |

---

### Hospital Routes `/api/hospitals`

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/search?bloodGroup=O+&city=Karachi` | **Public** | Find hospitals with available blood |
| GET | `/profile` | hospital_admin | Get hospital profile |
| PUT | `/profile` | hospital_admin | Update profile |
| GET | `/inventory` | hospital_admin | Get blood inventory |
| PATCH | `/inventory` | hospital_admin | Update single blood group `{ bloodGroup, units }` |
| PATCH | `/inventory/bulk` | hospital_admin | Bulk update `{ inventory: [{bloodGroup, units}] }` |
| GET | `/donors` | hospital_admin | List donors with filters |
| GET | `/stats` | hospital_admin | Hospital dashboard stats |

---

### Blood Request Routes `/api/requests`

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | `/` | receiver | Create blood request |
| GET | `/my` | receiver | My requests |
| PATCH | `/:id/cancel` | receiver | Cancel pending request |
| GET | `/hospital` | hospital_admin | Incoming requests |
| PATCH | `/:id/respond` | hospital_admin | Accept/reject `{ status, rejectionReason? }` |
| PATCH | `/:id/complete` | hospital_admin | Mark donation complete `{ donorId? }` |

---

### User Routes `/api/users`

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | `/profile` | Any user | Get profile |
| PUT | `/profile` | Any user | Update profile |
| GET | `/stats` | Any user | User statistics |
| PATCH | `/availability` | donor | Toggle donation availability |
| GET | `/donations` | donor | Donation history |
| GET | `/nearby-requests` | donor | Pending requests matching blood group |
| GET | `/notifications` | Any user | Get notifications |
| PATCH | `/notifications/:id/read` | Any user | Mark notification read |
| PATCH | `/notifications/read-all` | Any user | Mark all read |

---

## 🔌 Socket.io Events

### Connection
```javascript
const socket = io("http://localhost:5000", {
  auth: { token: "<accessToken>" }
});
```

### Client → Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `join_hospital_room` | `hospitalId` | Hospital joins their room |
| `subscribe_blood_group` | `{ bloodGroup }` | Subscribe to blood group alerts |
| `mark_notification_read` | `{ notificationId }` | Mark notification read |
| `ping_server` | — | Heartbeat |
| `get_online_status` | `{ targetUserId }` | Check if user is online |

### Server → Client Events

| Event | Payload | Sent To |
|-------|---------|---------|
| `new_blood_request` | `{ request, notification }` | Hospital |
| `request_status_update` | `{ requestId, status, notification }` | Requester |
| `donor_needed` | notification | Matching donors |
| `inventory_changed` | `{ hospitalId, bloodGroup, newUnits }` | All (inventory_updates room) |
| `inventory_bulk_updated` | `{ hospitalId, inventory }` | All |
| `notification` | notification object | Target user |
| `donation_recorded` | notification | Donor |
| `low_stock_alert` | notification | Admin room |
| `force_logout` | `{ reason }` | Blocked user |
| `unread_count` | `{ count }` | Self (on connect) |
| `user_online` | `{ userId, role, name }` | Admin room |
| `user_offline` | `{ userId, role, name }` | Admin room |
| `online_status` | `{ userId, isOnline }` | Requester |
| `pong_server` | `{ timestamp }` | Self |

---

## 🗄️ Database Design

### Collections
- **users** — donors, receivers, main_admin (roles in one collection)
- **hospitals** — hospital admins with embedded `bloodInventory[]`
- **bloodrequests** — full lifecycle with status tracking
- **donationhistories** — completed donations with certificate IDs
- **notifications** — polymorphic (User or Hospital recipient)

### Key Design Decisions
- Blood inventory **embedded in Hospital** (not separate collection) — avoids joins, atomic updates
- `refreshToken` stored in DB for **rotation + revocation**
- Socket user mapping in **memory** (emitter.js Map) for O(1) lookups
- Notifications are **persistent** (stored in MongoDB) + **real-time** (Socket.io)

---

## 🔑 Test Credentials (after `npm run seed`)

| Role | Email | Password |
|------|-------|----------|
| Main Admin | admin@bloodlink.pk | Admin@123 |
| Hospital (approved) | citygen@bloodlink.pk | Hospital@123 |
| Hospital (approved) | shifa@bloodlink.pk | Hospital@123 |
| Hospital (pending) | akuh@bloodlink.pk | Hospital@123 |
| Donor | ali@bloodlink.pk | User@123 |
| Receiver | sara@bloodlink.pk | User@123 |

---

## 🛡️ Security Features
- JWT access tokens (7d) + refresh tokens (30d) with rotation
- Refresh token stored in DB (revocable)
- httpOnly secure cookies for refresh token
- bcrypt password hashing (12 rounds)
- express-validator on all inputs
- Role-based access control on every route
- Socket.io JWT middleware on handshake
- Blocked users force-disconnected via socket
- Hospital must be approved before login
