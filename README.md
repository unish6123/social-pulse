# Social Pulse 📊

Real-time social media monitoring platform that tracks mentions, analyzes sentiment, and provides actionable insights across Twitter and Reddit.

---

## 🎯 Project Overview

**Social Pulse** is a microservices-based application designed to:
- Monitor specific keywords across Twitter and Reddit in real-time
- Analyze sentiment (positive/negative/neutral) of social media posts
- Provide analytics dashboards with trends and insights
- Alert users when unusual spikes in mentions occur

### Use Cases
- **Brand Monitoring:** Track customer sentiment about products
- **Crisis Detection:** Get alerts when negative mentions spike
- **Trend Analysis:** Identify emerging topics in your industry
- **Campaign Tracking:** Monitor public opinion during political campaigns

---

## 🏗️ Architecture

This project uses a **microservices architecture** with the following components:

```
┌─────────────────────────────────────────────────────────┐
│                    Social Pulse System                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Twitter    │  │   Reddit     │  │  Dashboard   │ │
│  │   Ingestor   │  │   Ingestor   │  │   (React)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────▲───────┘ │
│         │                  │                  │         │
│         └──────────┬───────┘                  │         │
│                    │                          │         │
│              ┌─────▼─────┐              ┌────┴─────┐   │
│              │   Kafka   │              │   API    │   │
│              └─────┬─────┘              │ (Node.js)│   │
│                    │                    └────┬─────┘   │
│              ┌─────▼─────┐                   │         │
│              │ Processor │                   │         │
│              │ (Python)  │                   │         │
│              └─────┬─────┘                   │         │
│                    │                         │         │
│         ┌──────────┴──────────┬──────────────┘         │
│         │                     │                        │
│    ┌────▼─────┐         ┌────▼─────┐                 │
│    │PostgreSQL│         │  Redis   │                 │
│    └──────────┘         └──────────┘                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Backend Services
- **API Service:** Node.js, Express, TypeScript
- **Data Processing:** Python (sentiment analysis)
- **Message Queue:** Apache Kafka
- **Databases:** PostgreSQL, Redis

### Frontend
- **Dashboard:** React, TypeScript, Vite

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Orchestration:** Kubernetes
- **CI/CD:** GitHub Actions
- **Monitoring:** Prometheus, Grafana
- **Logging:** ELK Stack (Elasticsearch, Logstash, Kibana)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Docker Desktop** (for Mac/Windows) or Docker Engine (for Linux)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/social-pulse.git
   cd social-pulse
   ```

2. **Start Docker containers** (PostgreSQL & Redis)
   ```bash
   cd infrastructure/docker
   docker-compose up -d
   ```

3. **Verify containers are running**
   ```bash
   docker ps
   ```
   You should see `social-pulse-postgres` and `social-pulse-redis` with `(healthy)` status.

4. **Set up the API service**
   ```bash
   cd ../../services/api
   npm install
   ```

5. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration (defaults should work for local development)
   ```

6. **Run database migrations**
   ```bash
   npm run migrate:up
   ```

7. **Start the API server**
   ```bash
   npm run dev
   ```

8. **Verify the API is running**
   ```bash
   curl http://localhost:3000/health
   ```
   You should see:
   ```json
   {
     "status": "ok",
     "service": "api",
     "database": "connected",
     "redis": "connected",
     "timestamp": "2026-02-02T..."
   }
   ```

---

## 📂 Project Structure

```
social-pulse/
│
├── services/                          # Microservices
│   ├── api/                          # REST API (Node.js/TypeScript)
│   │   ├── src/
│   │   │   ├── config/              # Database, Redis, Logger configs
│   │   │   ├── routes/              # API endpoints
│   │   │   ├── controllers/         # Request handlers
│   │   │   ├── services/            # Business logic
│   │   │   ├── models/              # Data models
│   │   │   ├── middleware/          # Express middleware
│   │   │   └── utils/               # Helper functions
│   │   ├── migrations/              # Database migrations
│   │   └── tests/                   # Test files
│   │
│   ├── dashboard/                    # React frontend (coming soon)
│   ├── processor/                    # Sentiment analysis (Python, coming soon)
│   ├── ingestor-twitter/            # Twitter data collector (coming soon)
│   └── ingestor-reddit/             # Reddit data collector (coming soon)
│
├── infrastructure/
│   ├── docker/                       # Docker Compose configs
│   │   └── docker-compose.yml       # PostgreSQL & Redis setup
│   ├── kubernetes/                   # K8s manifests (coming soon)
│   └── monitoring/                   # Prometheus/Grafana (coming soon)
│
├── .github/
│   └── workflows/                    # CI/CD pipelines (coming soon)
│
├── docs/                             # Documentation
├── scripts/                          # Utility scripts
├── .gitignore                        # Git ignore rules
└── README.md                         # This file
```

---

## 🗄️ Database Schema

### Tables

**keywords**
- Stores keywords to monitor (e.g., "Tesla", "Bitcoin")
- Fields: `id`, `keyword`, `is_active`, `created_at`

**posts**
- Stores social media posts from Twitter and Reddit
- Fields: `id`, `platform`, `external_id`, `author`, `content`, `keyword_id`, `posted_at`, `created_at`

**sentiment_analysis**
- Stores sentiment analysis results for each post
- Fields: `id`, `post_id`, `sentiment`, `score`, `analyzed_at`

---
