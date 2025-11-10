# Running the Frontend (React + Vite + PNPM – Port 5174)

## 1. Navigate to your frontend folder
```bash
cd .\senior_project\frontend
```

## 2. Build the Docker image
```bash
docker build -t codemelon/senior_project:frontend-v3 .
```

This uses your `frontend/Dockerfile` to:
- Install PNPM
- Install all project dependencies
- Run `pnpm run build:client`
- Serve static files with `serve -s dist/spa -l 5174`

## 3. Run the container
```bash
docker run -p 5174:5174 codemelon/senior_project:frontend-v3
```

When it starts successfully, you should see:
```
INFO  Accepting connections at: http://localhost:5174
```

## 4. Open the frontend
```
http://localhost:5174
```

---

## Connecting Frontend to Backend
If your frontend needs to call the backend API, make sure it points to:
```
http://localhost:8000
```

This allows the frontend (5174) to communicate with the backend (8000) when both containers are running locally.

---

## Common Docker Commands
| Action | Command |
| --- | --- |
| List running containers | `docker ps` |
| Stop a container | `docker stop <container_id>` |
| Remove a container | `docker rm <container_id>` |
| Remove an image | `docker rmi <image_id>` |
| View logs | `docker logs <container_id>` |
