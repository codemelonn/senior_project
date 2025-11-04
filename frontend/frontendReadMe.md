# 🚀 Bias Checker Frontend (Flare/Fusion Setup)

This project uses the Fusion Starter full-stack React + Express template as the base for the Bias Checker frontend.

---

## 🧠 Setup Steps

### 1️⃣ Install PNPM
```bash
npm i -g pnpm

2️⃣ Install Dependencies

pnpm install

If you get a warning like this:

Ignored build scripts: @swc/core, esbuild.
Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.

Run:

pnpm approve-builds @swc/core esbuild
If it shows “No items selected,” that’s fine — you can still continue.

💻 Run the Project
Option A – Default Port (8080)


pnpm dev

Option B – Custom Port (e.g. 5174)
This was required on my system because port 8080 redirected to AlmaLinux.

pnpm dev -- --port 5174 --host

Then open the output link (usually):

Local:   http://localhost:8080/
Network: http://192.168.x.xxx:8080/

or if you changed it:

http://localhost:5174/

⚙️ Dependency Setup (React + UI Libraries)
If you’re setting up this project from scratch or your dependencies are missing, install these manually:


# App frameworks + routing + data
pnpm add react react-dom react-router-dom @tanstack/react-query

# UI & charts
pnpm add lucide-react recharts

# shadcn/ui peer deps used by our components
pnpm add sonner @radix-ui/react-tooltip

# (Tailwind is already configured in this repo; only run these if you're starting from scratch)
# pnpm add -D tailwindcss postcss autoprefixer
# npx tailwindcss init -p

Dev Tools (only if missing)

pnpm add -D typescript vite @types/react @types/react-dom

🧭 App Routes

/         → Welcome Page — Introduction and feature overview
/analyze  → Index Page — Paste text, choose biases, and run analysis
/main     → Dashboard — Displays charts and summaries (Sentiment, Political, Overview tabs)