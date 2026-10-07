# Dhanya Kothar Receipt Management System — Backend
धान्य कोठार पावती व्यवस्थापन प्रणाली | श्री स्वामी समर्थ अन्नछत्र मंडळ, अक्कलकोट

Node.js + Express + MongoDB (Mongoose) + JWT + bcrypt. Implements the SRS v1.0 modules.

## Setup
```bash
npm install
cp .env.example .env      # set MONGO_URI and a strong JWT_SECRET
npm run seed              # creates admin user, default materials, default settings
npm run dev               # or: npm start
```
Default admin (change immediately): `admin` / `Admin@12345` (from `.env`).

## Roles
| Role | Access |
|---|---|
| admin | everything |
| operator | create/view/search/print/reprint receipts, dashboard |
| viewer | view/search receipts, reports (read-only) |

## API (all under `/api`, JWT via `Authorization: Bearer <token>`)
**Auth** — `POST /auth/login`, `GET /auth/me`, `POST /auth/logout`, `PUT /auth/change-password`
**Dashboard** — `GET /dashboard`
**Receipts**
- `POST /receipts` (admin, operator) — number auto-generated, e.g. `DK-2026-00001`
- `GET /receipts?receiptNumber=&donorName=&mobile=&date=YYYY-MM-DD&from=&to=&page=&limit=`
- `GET /receipts/:id`, `GET /receipts/number/:number`
- `POST /receipts/:id/reprint` (admin, operator) — number unchanged, logs audit + reprintCount
- `PUT /receipts/:id` (admin) — controlled correction; `reason` required; old version kept in `editHistory`
**Materials** — `GET /materials`, `GET /materials/units`, `POST/PUT/DELETE /materials[/:id]` (admin; DELETE = disable)
**Reports** (admin, viewer) — `GET /reports/daily?date=`, `/reports/weekly?date=`, `/reports/monthly?year=&month=`, `/reports/material-wise?from=&to=`
  - Weekly reports use Monday through Sunday in the IST calendar.
  - Monthly reports use the first through last day of the selected year and month.
**Users** (admin) — `GET/POST /users`, `PUT /users/:id`, `PUT /users/:id/reset-password`
**Settings** — `GET /settings`, `PUT /settings` (admin), `GET /audit-logs` (admin)

### Create receipt body
```json
{
  "date": "2026-10-06",
  "donor": { "name": "रामचंद्र पाटील", "mobile": "9876543210", "address": "अक्कलकोट" },
  "items": [
    { "material": "तांदूळ", "quantity": 100, "unit": "Kg" },
    { "material": "गहू", "quantity": 50, "unit": "Kg" }
  ],
  "remarks": ""
}
```
Units: Kg, Quintal, Ton, Gram, Litre, Bag, Packet, Tin, Piece (Marathi labels returned as `unitLabel`).
Receipt responses include `settings` (org name, trust no., header) so the frontend can render the print layout directly.

## Notes
- Receipt numbers come from an atomic per-year counter (unique index + retry), so duplicates cannot occur. Numbers are never reused.
- Dates are calendar days (IST); stored as UTC midnight of that day.
- `totalQuantity` is the plain sum (SRS FR-08); `totalsByUnit` gives the accurate total when units are mixed.
- Receipts cannot be deleted through the API (SRS §20: prevent unauthorized modification).
- Production: set `NODE_ENV=production`, strong `JWT_SECRET`, HTTPS, `CLIENT_URL` to your frontend origin, and schedule MongoDB backups (daily/weekly/monthly).
