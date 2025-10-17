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
