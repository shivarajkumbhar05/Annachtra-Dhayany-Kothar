# धान्य कोठार पावती — Frontend
React 18 + Vite + React Router. Works with `dhanya-kothar-backend`.

## Run
```bash
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:5000/api
npm run dev              # http://localhost:5173  (backend CLIENT_URL must match)
npm run build            # production files in dist/
```
Login: `admin` / `Admin@12345` (from backend seed) — change it in Settings.

## Screens by role
- **Admin:** all screens, users, materials, settings, audit log
- **Operator:** dashboard, new receipt, receipts, print/reprint
- **Viewer:** dashboard, receipts (read-only), reports

Printing follows the paper size set in Settings (A4, A5, 58mm, 80mm). The first print after creating a receipt is the original; later prints call `/reprint` and are logged.
