🚀 Bias Checker Frontend (Flare/Fusion Setup)

This project uses the Fusion Starter full-stack React + Express template as the base for the Bias Checker frontend.

🧠 Setup Steps
1️⃣ Install PNPM
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

Option B – Custom Port (e.g. 5174) //mine, I had to change the port because it was sending me the the AlphaLinux page 

If another service is using 8080, change ports:

pnpm dev -- --port 5174 --host


Then open the output link (usually):

Local:   http://localhost:8080/
Network: http://192.168.x.xxx:8080/


or if you changed it:

http://localhost:5174/


Things changed 10/20: 
🧩 Troubleshooting Notes (Fixes Discovered)

While setting up the Bias Checker Frontend (Fusion Starter), a few issues came up during development that required manual fixes:

1️⃣ createServer Not Defined
Error: ReferenceError: createServer is not defined
Cause: The createServer() function was being called in vite.config.ts, but the import was commented out.
Fix: Uncomment or add the line at the top of vite.config.ts:
import { createServer } from "./server";

2️⃣ Vite “outside of allow list” Error
Error:
The request id "index.html" is outside of Vite serving allow list.
Cause: Vite’s file-system permissions (fs.allow) only included ./client and ./shared, but our index.html lives in the root frontend/ folder.
Fix: Add the root path to the allow list in vite.config.ts:
fs: {
  allow: ["./", "./client", "./shared"],
},

3️⃣ Cached Vite Config Still Throwing Errors
Error: Vite continued using the old broken config even after fixes.
Fix: Clear the temporary Vite cache before running again:
rm -rf node_modules/.vite-temp

4️⃣ Port Mismatch
Note: The default config runs on port 8080, but if that’s already in use or you prefer another port, specify it when starting the dev server:
pnpm dev -- --port 5174 --host

✅ After these fixes, the project ran successfully using:

pnpm install
pnpm approve-builds @swc/core esbuild
pnpm dev -- --port 5174 --host