# MyDataGolf Portal

React + TypeScript single-page app for logging golf shots and sending them to the MyDataGolf API. Tailwind CSS provides styling, and a simple form captures both intended and actual ball flight details with inline validation and toast feedback.

## Getting Started
Prereqs: Node.js (LTS recommended) and npm.

```bash
cd MyDataGolfPortal
npm install
npm start
```

The dev server runs at http://localhost:3000 with hot reload.

## Configuration
- API endpoint lives in `src/config.ts` as `API_URL` (currently pointing at the prod gateway). Update this value for local/staging as needed.
- Tailwind scans `./src/**/*.{js,jsx,ts,tsx}` via `tailwind.config.js`.

## Scripts
- `npm start` — run the dev server.
- `npm test` — Jest + React Testing Library in watch mode.
- `npm run build` — production build to `build/`.
- `npm run eject` — CRA eject (one-way; typically avoid).

## Project Structure
- `src/App.tsx` — main form UI, submission flow, and toasts.
- `src/types.ts` — enumerations for shot attributes.
- `src/config.ts` — API base URL.
- `src/index.tsx` — app entry; global styles at `src/index.css` (Tailwind directives).

## Shot Payload Shape
Example POST body sent to `POST {API_URL}/shots`:

```json
{
  "timestamp": 1734556800000,
  "club": "7 Iron",
  "intendedShot": {
    "startLine": "left",
    "curve": "leftToRight",
    "height": "medium"
  },
  "actualShot": {
    "startLine": "straight",
    "curve": "none",
    "height": "medium",
    "strikeLocation": "center",
    "endLocation": "target"
  }
}
```
