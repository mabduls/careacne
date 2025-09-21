# AcureScan - Acne Detection & Treatment Application

![AcureScan Logo](./src/public/favicon.png)

## 📋 Overview

**AcureScan** is a full-stack web application that leverages **machine learning** to detect, classify, and recommend treatments for acne. It provides users with:
- Acne detection via image upload
- Acne type classification (papules, pustules, nodules, cysts)
- Personalized treatment and skincare recommendations
- Secure user authentication and history tracking

This project consists of:
- **Frontend (PWA)**: Web interface with responsive design
- **Backend (Node.js + Hapi)**: Core server handling APIs, Firebase integration, and ML support
- **Cloudflare Workers**: Lightweight API edge functions for scalability

---

## ✨ Features

- **AI-Powered Acne Detection**: Detects acne from uploaded facial images
- **Type Classification**: Identifies acne categories and severity
- **Treatment Recommendations**: Provides personalized treatment options
- **Skincare Guidance**: Educates users on proper treatment routines
- **User Accounts**: Firebase-powered authentication & history storage
- **Offline Support**: Service Worker + IndexedDB for caching and persistence
- **Progressive Web App (PWA)**: Installable and mobile-friendly

---

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- TailwindCSS
- Custom Web Components
- Webpack (dev, prod builds)
- Workbox for service workers

### Backend
- Node.js
- @hapi/hapi
- Firebase Admin SDK
- dotenv for environment variables

### Machine Learning
- TensorFlow.js (`@tensorflow/tfjs`)

### Edge API (Cloudflare Workers)
- Wrangler
- itty-router
- Firebase Admin (for secure data access)

---

## 📂 Project Structure

```
├── dist/                        # Production build output
├── node_modules/                # Dependencies
├── src/
│   ├── public/                  # Public assets
│   │   ├── images/              # Images
│   │   └── favicon.png          # App favicon
│   ├── scripts/
│   │   ├── data/                # Data handlers (API, DB)
│   │   ├── pages/               # Page components (auth, landing, etc.)
│   │   ├── routes/              # Routing (hash-based)
│   │   ├── utils/               # Utility functions
│   │   ├── index.js             # Entry point
│   │   └── sw.js                # Service Worker
│   ├── server/
│   │   └── index.js             # Backend server entry (Hapi)
│   ├── styles/                  # Global styles
│   │   └── styles.css
│   └── index.html               # Main HTML entry
├── acure-scan-workers/          # Cloudflare Workers project
│   ├── worker.js                # Worker entry point
│   └── package.json             # Worker dependencies
├── .gitignore
├── package.json                 # Root dependencies & scripts
├── wrangler.toml                # Cloudflare Workers config
├── webpack.common.js
├── webpack.dev.js
├── webpack.prod.js
└── tailwind.config.js
```

---

## ⚡ Installation & Development

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/acurescan.git
cd acurescan
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Development Server
```bash
npm run dev
```
Runs webpack dev server at `http://localhost:8080` (with hot reload).

### 4. Production Build
```bash
npm run build
```
Builds into `/dist`.

### 5. Serve Production Build
```bash
npm run serve
```
Serves via `http-server`.

### 6. Backend Server
```bash
npm run start
```
Runs Node.js backend (`src/server/index.js`).

---

## 🚀 Deployment

### Frontend + Backend
- Build production assets:
  ```bash
  npm run build
  ```
- Deploy `/dist` folder to your hosting provider (e.g., Vercel, Netlify, or custom server).

### Cloudflare Workers
Ensure you are logged in:
```bash
npx wrangler whoami
```

Deploy worker:
```bash
cd acure-scan-workers
npx wrangler deploy
```

This will deploy your worker and provide a `workers.dev` URL.

---

## 🔒 Environment Variables

Create a `.env` file in the root directory for backend configuration:
```env
PORT=3000
FIREBASE_API_KEY=your_firebase_api_key
FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id
```

For Cloudflare Workers, environment variables are defined in `wrangler.toml`:
```toml
[vars]
NODE_ENV = "production"
```

---

## 🧠 How It Works

1. **User uploads a photo** → processed locally with TensorFlow.js.
2. **Acne detected & classified** → ML model identifies acne type.
3. **Treatment recommendations** → Provided based on acne severity & classification.
4. **Data storage** → IndexedDB (local) + Firebase (user history).
5. **Cloudflare Worker** → Handles edge API routing & secure Firebase admin access.

---

## 🤝 Contribution Guide

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/xyz`)
3. Commit changes (`git commit -m "Add xyz feature"`)
4. Push branch (`git push origin feature/xyz`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](./LICENSE) file for details.

---

## 📞 Contact

For questions or contributions:
- **Email**: abdabdulziza@gmail.com
- **GitHub**: [mabduls](https://github.com/mabduls)

---

© 2025 AcureScan. All rights reserved.

