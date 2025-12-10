    # 🧠 Bias Checker — Full Stack Project

    This repository contains both the **Frontend (React + Fusion Starter)** and **Backend (FastAPI)** components of the Bias Checker project.  
    The goal of this project is to analyze media text for bias, sentiment, and tone, providing users with a clear and visual understanding of potential bias patterns.

    ---

    ## ⚠️ Active Branch Notice

    > **Main Development Branch:** `wip_frontend`  
    > This is the **working branch** where the frontend and backend integration currently functions correctly.  
    > The `main` branch is used primarily for documentation and stable releases.

    To move into the branch, do this command:
        git checkout origin/wip_frontend
    ---

    ## 🚀 Frontend — Fusion Starter Setup (Flare/Fusion)

    This project uses the **Fusion Starter full-stack React + Express template** as the base for the Bias Checker frontend.

    ### 🧩 Setup Steps

    #### 1️⃣ Install PNPM
    You may possibly download Node.js onto your machine and put that into your system path, then you should be able to run all
    the commands you find below.

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
    If another service is using 8080, change ports:
    pnpm dev -- --port 5174 --host

    Then open the output link (usually):

    Local: http://localhost:8080/
    Network: http://192.168.x.xxx:8080/

    or if you changed it:
    http://localhost:5174/

    ⚙️ Backend — FastAPI Server Setup

    The backend handles text analysis, model interaction, and API routing.

    📦 Installation
    From the backend/ directory:

    pip install -r requirements.txt
    This installs all required dependencies.

    ▶️ Run the Python Server

    While in the backend directory:

    uvicorn main:app --reload

    Or, from the project root:

    uvicorn backend.main:app --reload
    (This to is run the backend while you're in the root directory.)

    The backend typically runs on port 8000.

    You’ll see this printed in the terminal when you start the server.

    🔗 Connecting Frontend to Backend
    Make sure your frontend fetch requests point to the backend’s active port (default: 8000). 

    Example:
    fetch("http://127.0.0.1:8000/api/analyze")

    Your frontend will make API calls to this endpoint with appropriate parameters (method, headers, body, etc.).

    ⚠️ Important Note — __pycache__
    When you run the backend, Python will automatically generate a __pycache__/ folder.
    Do NOT commit or push this directory.

    Example:

    main.cpython-312.pyc

    This varies by your Python version (e.g., 3.12). Always delete or ignore these before pushing.

    ![Example of Full Analysis](./assets/demo_gif.gif)

    🧾 Summary

        - **Frontend:** Built with React (Fusion Starter).  
        Start using `pnpm dev` — defaults to port **8080** (or a custom port if specified).

        - **Backend:** Built with FastAPI (Python).  
        Start using `uvicorn main:app --reload` — defaults to port **8000**.

        - **Active Branch:** `wip_frontend_dashboard` — this branch contains the latest working full-stack integration.
