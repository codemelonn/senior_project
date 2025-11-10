# Running the Backend (FastAPI – Port 8000)

## 1. Navigate to your backend folder
```bash
cd .\senior_project\backend
```

## 2. Build the Docker image
```bash
docker build -t codemelon/senior_project:backend-v3 .
```

This uses your `backend/Dockerfile` to:
- Copy the FastAPI app into the container
- Install requirements
- Start `uvicorn main:app --host 0.0.0.0 --port 8000`

## 3. Run the container
```bash
docker run -p 8000:8000 codemelon/senior_project:backend-v3
```

When it starts successfully, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## 4. Access the backend API docs
```
http://localhost:8000/docs
```

---

## Common Docker Commands
| Action | Command |
| --- | --- |
| List running containers | `docker ps` |
| Stop a container | `docker stop <container_id>` |
| Remove a container | `docker rm <container_id>` |
| Remove an image | `docker rmi <image_id>` |
| View logs | `docker logs <container_id>` |
