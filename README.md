# 🧠 Bias Checker — Full Stack Project

Bias Checker is a full-stack application designed to analyze media text for sentiment, bias, and tone. The system provides both raw analysis results and AI-assisted summaries to help users better understand potential bias patterns in written content.

This repository contains:

* A **React-based frontend** for user interaction and visualization
* A **FastAPI backend** that performs NLP analysis using multiple models
* **Auto-generated backend documentation** built with Sphinx

---

## 🖥️ Frontend — React (Fusion Starter)

The frontend is built using the **Fusion Starter** React template and provides an interactive dashboard for submitting text, selecting analysis types, and viewing results through charts and summaries.

### Setup

#### 1. Install Node.js and PNPM

Ensure Node.js is installed and available in your system PATH, then install PNPM:

```bash
npm install -g pnpm
```

#### 2. Install Dependencies

From the frontend directory:

```bash
pnpm install
```

If you receive a warning about ignored build scripts such as:

```
Ignored build scripts: @swc/core, esbuild
```

Approve them with:

```bash
pnpm approve-builds @swc/core esbuild
```

If no items are listed, you may safely continue.

#### 3. Run the Frontend

```bash
pnpm dev
```

By default, the frontend runs on port **8080**.

To specify a custom port (e.g., if 8080 is in use):

```bash
pnpm dev -- --port 5174 --host
```

Access the application at:

* [http://localhost:8080](http://localhost:8080)
* or [http://localhost:5174](http://localhost:5174) (if changed)

---

## ⚙️ Backend — FastAPI Server

The backend handles text processing, model inference, summarization, and API routing. It exposes REST endpoints that the frontend consumes.

### Installation

From the `backend/` directory:

```bash
pip install -r requirements.txt
```

This installs all required backend dependencies.

### Running the Server

From the backend directory:

```bash
uvicorn main:app --reload
```

Or from the project root:

```bash
uvicorn backend.main:app --reload
```

The backend runs on **[http://127.0.0.1:8000](http://127.0.0.1:8000)** by default.

---

## 🔗 Frontend–Backend Communication

The frontend communicates with the backend through REST API calls.

Example API endpoint:

```javascript
fetch("http://127.0.0.1:8000/api/analyze")
```

Ensure the frontend is configured to point to the correct backend port if you change the default.

---

## 📘 Backend API Documentation

The backend is fully documented using **Sphinx autodoc**, which generates HTML documentation directly from Python docstrings in the source code.

### Viewing the Documentation Locally

After generating the documentation with Sphinx, open the following file in a web browser:

```
docs/_build/html/index.html
```

The documentation includes:

* Backend modules and functions
* API endpoint descriptions
* NLP model execution logic
* Parameter and return-value details

This documentation is intended to support future maintenance, extension, or handoff of the project.

---

## ⚠️ Notes on Generated Files

When running the backend, Python automatically generates a `__pycache__/` directory containing compiled bytecode files.

Example:

```
main.cpython-312.pyc
```

These files should **not** be committed to version control. Ensure they are ignored or removed before pushing changes.

---

## 🧾 Summary

* **Frontend:** React (Fusion Starter)
  Start with `pnpm dev` (default port: **8080**)

* **Backend:** FastAPI (Python)
  Start with `uvicorn backend.main:app --reload` (default port: **8000**)

* **Documentation:**
  Auto-generated using Sphinx and located in `docs/_build/html/`

---

![Example of Full Analysis](./assets/demo_gif.gif)
