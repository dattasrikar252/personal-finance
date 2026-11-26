# personal finances — React PWA

## What this is
An installable Progressive Web App built with React + Vite. It is designed for Android Chrome and works offline after the first successful load and service-worker caching.

## Included initial records
Receivables: Pranav ₹7,888 (₹7,195 Hero VIDA balance + ₹693 Splitwise), Vamshi ₹7,500, Yashwant ₹2,192, Ragamayi ₹1,000. Total ₹18,580.
Bills pending: Kotak ₹5,517, Navneet ₹15,000, Anusri ₹10,000. Total ₹30,517.
Paid bills: Cheq ₹550 and IDFC ₹300.
Net amount to arrange: ₹11,937.

## Run locally
- Install Node.js 20+
- Run `npm install`
- Run `npm run dev`

## Deploy for Android installation
A PWA must be served over HTTPS (or localhost) for installation and service workers. Deploy the project to a static HTTPS host such as Netlify, Vercel, or GitHub Pages:
- Push this folder to a GitHub repository.
- Import the repository into Netlify/Vercel, or enable GitHub Pages with a suitable Vite build workflow.
- Build command: `npm run build`
- Output directory: `dist`
- Open the HTTPS deployment URL in Chrome on Android.
- Choose Chrome menu > Install app (or Add to Home screen).

## Data and security
The app saves records in browser localStorage on this device. Use Settings > Download backup regularly and Restore backup when needed. Clearing Chrome site data can erase records.
The biometric setup uses WebAuthn platform authentication and requires HTTPS, compatible Android/browser support and a device screen lock/biometric. Browser-only biometric gating is a convenience feature, not a fully audited security boundary; records are not encrypted at rest in this starter version. Do not store highly sensitive financial secrets in it.
