# User Engagement API

Node.js microservice for user engagement, backed by MongoDB Atlas, containerized with Docker, and deployed to Kubernetes with a LoadBalancer Service.

## Prerequisites

- Docker and Docker Compose
- MongoDB Atlas cluster and connection string
- `kubectl` (optional, for Kubernetes)

## MongoDB Atlas

1. Create a cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Add a database user and note the username/password.
3. Under **Network Access**, allow your IP (or `0.0.0.0/0` for development only).
4. Copy the connection string (`mongodb+srv://...`) and set it as `MONGODB_URI`.

```bash
cp .env.example .env
# Edit .env and set MONGODB_URI
```

Health check: `GET http://localhost:8080/health`

## Interests API

Each profile may include an optional **`user`** field (set by another service when linking accounts — not collected in this form).

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/interests` | List all profiles (`?user=` to filter) |
| `GET` | `/interests/user/:user` | Latest profile for a user |
| `PUT` | `/interests/user/:user` | Upsert profile for a user (external apps) |
| `POST` | `/interests` | Create profile |
| `GET` | `/interests/:id` | Read by MongoDB id |
| `PUT` | `/interests/:id` | Replace by MongoDB id |
| `PATCH` | `/interests/:id` | Partial update |
| `DELETE` | `/interests/:id` | Delete |

Example create body:

```json
{
  "user": "auth0|abc123",
  "householdMembers": 3,
  "timeOutdoors": "1-2 hours daily",
  "occupation": "Healthcare worker",
  "animalContact": true,
  "animalTypes": ["Chickens", "Goats", "Dogs"],
  "housingAndAC": "AC",
  "hobbies": ["hiking", "gardening"]
}
```

`housingAndAC` must be one of: `AC`, `Swamp Cooler`, `None`.

## Run everything with Docker Compose (recommended)

Starts the **API** and **frontend** — no local `npm install` required.

```bash
cp .env.example .env   # set MONGODB_URI
docker compose up --build
```

| Service | URL |
|---------|-----|
| **Frontend (health form)** | http://localhost:3000 |
| **API** | http://localhost:8080 |
| **API health** | http://localhost:8080/health |

The frontend calls the API at `http://localhost:8080` from your browser (CORS enabled). After submit, verify data:

```bash
curl http://localhost:8080/interests
```

In MongoDB Atlas, look at database **`user-engagement`** (from your connection string) → collection **`interests`**.

Stop:

```bash
docker compose down
```

## Frontend only (Docker)

```bash
docker compose up --build api      # API on :8080
docker compose up --build frontend # UI on :3000 (needs api running)
```

## API only (Docker)

```bash
docker build -t user-engagement-api:latest .
docker run --rm -p 8080:8080 --env-file .env user-engagement-api:latest
```

Healthcare-themed multi-step form: one quick question per screen (~10 seconds). Submit on the last step to `POST /interests`.

For Kubernetes, the image name in `k8s/deployment.yaml` must match what you build. With minikube, load the image into the cluster:

```bash
minikube image load user-engagement-api:latest
```

With Docker Desktop Kubernetes, a local `docker build` is usually enough when `imagePullPolicy: IfNotPresent`.

## Kubernetes (kubectl)

### 1. Create the secret

Either copy and edit the example:

```bash
cp k8s/secret.yaml.example k8s/secret.yaml
# Edit k8s/secret.yaml with your real MONGODB_URI
```

Or create it from the CLI (recommended; nothing sensitive on disk):

```bash
kubectl create namespace user-engagement --dry-run=client -o yaml | kubectl apply -f -
kubectl create secret generic user-engagement-secrets \
  --namespace=user-engagement \
  --from-literal=MONGODB_URI='mongodb+srv://USER:PASS@CLUSTER.mongodb.net/user-engagement?retryWrites=true&w=majority'
```

### 2. Deploy

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
```

Or apply everything except the secret in one step:

```bash
kubectl apply -k k8s/
```

### 3. Load balancer external IP

```bash
kubectl get svc -n user-engagement user-engagement-api -w
```

When `EXTERNAL-IP` is assigned, call:

```bash
curl http://<EXTERNAL-IP>/interests
```

**minikube:** LoadBalancer Services stay `<pending>` until you run `minikube tunnel` in another terminal (requires sudo on some setups).

**Docker Desktop:** `EXTERNAL-IP` is often `localhost`.

### Useful commands

```bash
kubectl get pods -n user-engagement
kubectl logs -n user-engagement -l app=user-engagement-api -f
kubectl describe svc -n user-engagement user-engagement-api
kubectl delete namespace user-engagement
```

## Architecture

```mermaid
flowchart LR
  Client --> LB[LoadBalancer Service :80]
  LB --> Pod1[API Pod]
  LB --> Pod2[API Pod]
  Pod1 --> Atlas[(MongoDB Atlas)]
  Pod2 --> Atlas
```

The Deployment runs two replicas; the Service type `LoadBalancer` distributes traffic across pods on port 80, forwarding to container port 8080.
