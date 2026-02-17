# FiadoApp — Project Context for Claude Code

## What this is
A mobile-first debt tracking app for small Brazilian businesses — inspired by Tikkie (Netherlands). Owners record "fiado" (credit sales), send payment requests via WhatsApp, and customers pay via Pix.

## Tech stack
- React 19 + Vite 7
- Tailwind CSS v4 (CSS variables for theming)
- React Router v7
- react-hot-toast
- qrcode.react
- LocalStorage for data persistence (MVP)

## Current state — what's already built
- **Dashboard**: stats (total open, received, debtors) + top debtor list with Cobrar button
- **Customers**: list with search, add via bottom sheet, FAB button
- **CustomerDetail**: customer hero, debt history, mark paid, delete debt/customer, FAB to add debt, WhatsApp charge button
- **Settings**: store name, city, Pix key
- **CobrancaModal**: WhatsApp message preview with payment link
- **Payment landing page** (`/pagar`): customer-facing page with Pix Copia e Cola code, QR code (qrcode.react), Tikkie-inspired dark navy design
- **Pix EMV payload generator** (`src/lib/pix.js`): generates valid BRCode/EMV Pix Copia e Cola strings with CRC16

### Design
- Dark navy theme (#1E1C54 bg, #2A2870 cards, #151347 nav)
- Teal accent (#00C4A7) — matches official Pix color
- Bottom tab navigation (Painel / Clientes / Config)
- Teal FAB buttons
- Bottom sheet forms (BottomSheet component)
- Fully inline styles (no Tailwind in page components — only index.css for global CSS variables)

## ✅ Next task: Set up Capacitor for iOS + Android

The app is ready to be wrapped as a native app using Capacitor. All steps below should be done on a Mac with Xcode installed.

### Prerequisites to confirm on the Mac
- [ ] Xcode installed (App Store, free) and opened at least once to accept license
- [ ] Xcode Command Line Tools: `xcode-select --install`
- [ ] CocoaPods: `sudo gem install cocoapods`
- [ ] Android Studio installed (optional, for Android builds)
- [ ] Node.js installed

### Step 1 — Install Capacitor
```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/ios @capacitor/android
```

### Step 2 — Initialize Capacitor
```bash
npx cap init "FiadoApp" "com.fiado.app" --web-dir dist
```
This creates `capacitor.config.ts`. Verify it points to `webDir: 'dist'`.

### Step 3 — Update vite.config.js
Add `base: './'` so asset paths are relative (required for Capacitor):
```js
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
})
```

### Step 4 — Build and add platforms
```bash
npm run build
npx cap add ios
npx cap add android
npx cap sync
```

### Step 5 — iOS safe area fixes needed in the app
iPhones have a notch/dynamic island at the top and a home indicator bar at the bottom. The bottom tab bar needs extra padding so it doesn't overlap the home indicator.

In `src/components/Layout.jsx`, update the bottom tab bar padding:
```jsx
// Add to the nav style:
paddingBottom: 'env(safe-area-inset-bottom)',
```

And add this to `index.html` `<head>`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

And add to `index.css`:
```css
body {
  padding-top: env(safe-area-inset-top);
}
```

### Step 6 — Open in Xcode
```bash
npx cap open ios
```
In Xcode:
- Set the Team (requires Apple Developer account)
- Set Bundle Identifier to `com.fiado.app` (or your preferred ID)
- Run on simulator or device

### Step 7 — App icon + splash screen
Install the assets plugin:
```bash
npm install @capacitor/assets --save-dev
```
Create `assets/` folder with:
- `icon.png` — 1024×1024px, no rounded corners (iOS rounds them)
- `splash.png` — 2732×2732px centered logo on dark navy (#1E1C54) background

Then generate all sizes:
```bash
npx capacitor-assets generate
```

### Step 8 — Android (optional, can do later)
```bash
npx cap open android
```
Requires Android Studio. Follow the same safe area approach for Android status bar.

### Step 9 — After any code change
Always run:
```bash
npm run build && npx cap sync
```
Then rebuild in Xcode/Android Studio.

## Future roadmap (after native is working)
- Push notifications when debt is paid (Capacitor Push Notifications plugin)
- Pix payment confirmation webhook (needs backend)
- Multi-business / login
- Analytics & reports
- Transaction receipts
