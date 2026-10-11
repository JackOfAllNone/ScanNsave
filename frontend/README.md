# ScanNsave

ScanNsave is an Expo Go barcode scanner backed by the Express API and MongoDB.

## Run the app

From this directory, install dependencies and start Expo over your local network:

```powershell
npm install
npm start -- --lan
```

Scan the terminal QR code with Expo Go. Keep the phone and computer on the same Wi-Fi.

## Run the API

In a second terminal, start the backend:

```powershell
cd ..\backend
npm install
npm run dev
```

The API reads settings from `backend/.env`; see [`backend/.env.example`](../backend/.env.example) for the required variables. The native app uses the Expo development host to reach the API on port 4000. Set `EXPO_PUBLIC_API_URL` if the API is hosted at a different address.

Barcode price lookups use the free, crowdsourced Open Prices API and require no API key. Only reports in Philippine locations with PHP prices are displayed; availability may be limited. See [Open Prices API docs](https://prices.openfoodfacts.org/api/docs).

Scan history, including the scanned product details and price, is stored locally on the device with AsyncStorage, separately for each signed-in account. It is not synced to the backend or shared across devices. Existing local history is kept and assigned to the first account that signs in after this update.

## Accounts and email

The app uses email and password accounts stored in MongoDB. Passwords are stored as scrypt hashes, and sign-in sessions are stored as hashed, expiring tokens. New accounts must verify their email before signing in. Verification and password-reset emails are sent through Brevo's transactional email API.

Configure `BREVO_API_KEY` and a sender address verified in Brevo. `PUBLIC_API_URL` must be the publicly reachable HTTPS API base, including `/api` (for example, `https://api.example.com/api`); email links open secure verification and password-reset pages served by the API. Do not put the Brevo API key in the frontend or commit it to source control.

Passwords must be 8-128 characters. Verification and reset links expire after 24 hours. Sign-in tokens are stored in the device secure store; signing out revokes the current server session.