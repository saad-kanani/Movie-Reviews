# 🎬 Movie Review Platform

A full-stack movie review application built with a **microservices architecture**. The platform allows users to browse movies, read reviews, and submit their own ratings and comments. It features a modern React frontend communicating with a Node.js backend composed of independently deployable gRPC microservices unified behind a REST API gateway.

---

## 📐 Architecture Overview

```
┌──────────────────┐        HTTP (REST)        ┌──────────────────┐
│                  │ ───────────────────────▶   │   API Gateway    │
│   React Client   │                           │  (Express :3000) │
│   (Vite :5173)   │ ◀───────────────────────  │                  │
└──────────────────┘                           └────────┬─────────┘
        │                                        gRPC   │
        │ Auth                         ┌────────────────┼────────────────┐
        ▼                              ▼                ▼                ▼
┌──────────────┐            ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Supabase   │            │ User Service │ │Movie Service │ │Review Service│
│  (Auth + DB) │            │   (:5001)    │ │   (:5002)    │ │   (:5003)    │
└──────────────┘            └──────────────┘ └──────────────┘ └──────────────┘
```

- **Client** — React SPA that handles the UI, routing, and authentication via Supabase.
- **API Gateway** — Express server that exposes RESTful endpoints and proxies requests to the appropriate gRPC microservice.
- **Microservices** — Three independent gRPC services handling users, movies, and reviews respectively.
- **MySQL** — Persistent storage for users, movies, and reviews used by backend microservices.
- **Supabase** — Provides PostgreSQL database hosting with Row-Level Security (RLS) and user authentication.

---

## 🛠️ Tech Stack

### Frontend (`/client`)

| Technology          | Purpose                          |
| ------------------- | -------------------------------- |
| **React 18**        | UI library                       |
| **TypeScript**      | Type safety                      |
| **Vite**            | Build tool & dev server          |
| **Tailwind CSS**    | Utility-first styling            |
| **React Router v7** | Client-side routing              |
| **Axios**           | HTTP client for API calls        |
| **Supabase JS**     | Authentication & database client |
| **Lucide React**    | Icon library                     |

### Backend (`/server`)

| Technology           | Purpose                              |
| -------------------- | ------------------------------------ |
| **Node.js**          | Runtime environment                  |
| **Express 5**        | API Gateway HTTP framework           |
| **gRPC**             | Inter-service communication protocol |
| **Protocol Buffers** | Service contract definitions         |
| **Nodemon**          | Development hot-reloading            |

### Database & Auth

| Technology                | Purpose                               |
| ------------------------- | ------------------------------------- |
| **MySQL 8**               | Backend microservice data persistence |
| **Supabase (PostgreSQL)** | Cloud-hosted relational database      |
| **Row-Level Security**    | Fine-grained access control policies  |
| **Supabase Auth**         | User authentication                   |

---

## 📁 Project Structure

```
Movie-Review/
├── client/                          # React frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx           # App shell with Outlet
│   │   │   ├── Loading.tsx          # Loading spinner component
│   │   │   ├── MovieCard.tsx        # Movie thumbnail card
│   │   │   ├── Navbar.tsx           # Navigation bar
│   │   │   ├── ReviewCard.tsx       # Individual review display
│   │   │   └── StarRating.tsx       # Interactive star rating input
│   │   ├── pages/
│   │   │   ├── Movies.tsx           # Movie listing page
│   │   │   ├── MovieDetails.tsx     # Single movie with reviews
│   │   │   └── Register.tsx         # User registration page
│   │   ├── router/
│   │   │   └── index.tsx            # Route definitions
│   │   ├── services/
│   │   │   ├── api.ts               # Axios instance configuration
│   │   │   └── supabase.ts          # Supabase client setup
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces
│   │   ├── App.tsx                  # Root component
│   │   └── main.tsx                 # Entry point
│   ├── supabase/
│   │   └── migrations/              # SQL migration files
│   ├── .env                         # Environment variables
│   └── package.json
│
└── server/                          # Backend microservices
    ├── proto/                       # Shared Protobuf definitions
    │   ├── movie.proto
    │   ├── review.proto
    │   └── user.proto
    ├── gateway/                     # API Gateway (Express + gRPC clients)
    │   └── src/
    │       ├── grpc/                # gRPC client stubs
    │       ├── routes/              # REST route handlers
    │       └── index.js             # Gateway entry point
    ├── movie-service/               # Movie gRPC microservice
    │   └── src/
    │       ├── grpc/
    │       │   └── movie.server.js
    │       └── index.js
    ├── review-service/              # Review gRPC microservice
    │   └── src/
    │       ├── grpc/
    │       │   └── review.server.js
    │       └── index.js
    └── user-service/                # User gRPC microservice
        └── src/
            ├── grpc/
            │   └── user.server.js
            └── index.js
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or later)
- **npm** (comes with Node.js)
- A **Supabase** project (for database & authentication)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Movie-Review.git
cd Movie-Review
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com).
2. Run the SQL migration found in `client/supabase/migrations/` against your Supabase database to create the `users`, `movies`, and `reviews` tables with RLS policies.
3. Copy your project's **URL** and **anon key** from the Supabase dashboard.

### 3. Configure Environment Variables

Create or update the `client/.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Install Dependencies

```bash
# Client
cd client
npm install

# Gateway
cd ../server/gateway
npm install

# Microservices
cd ../movie-service
npm install

cd ../review-service
npm install

cd ../user-service
npm install
```

### 5. Start the Services

Open **five separate terminals** and run each service:

```bash
# Terminal 1 — User Service (gRPC :5001)
cd server/user-service
npm run dev

# Terminal 2 — Movie Service (gRPC :5002)
cd server/movie-service
npm run dev

# Terminal 3 — Review Service (gRPC :5003)
cd server/review-service
npm run dev

# Terminal 4 — API Gateway (HTTP :3000)
cd server/gateway
npm run gateway

# Terminal 5 — React Client (HTTP :5173)
cd client
npm run dev
```

Once all services are running, open **http://localhost:5173** in your browser.

---

## 🐳 Run With Docker

You can run the full stack (client + gateway + all gRPC services) with Docker Compose.

### 1. Prepare Environment Variables

At the project root, create a `.env` file from `.env.example` and fill in your Supabase values:

```bash
cp .env.example .env
# Windows (Command Prompt)
copy .env.example .env
```

Required variables:

```env
MYSQL_ROOT_PASSWORD=1234
MYSQL_DATABASE=movie_review_db
MYSQL_USER=movie_app
MYSQL_PASSWORD=movie_app_password
MYSQL_PORT=3306

VITE_API_BASE_URL=http://localhost:3000/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 2. Build and Start Containers

```bash
docker compose up --build
```

### 3. Access the App

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:3000`

### 4. Stop Containers

```bash
docker compose down
```

---

## 🔌 API Reference

The API Gateway exposes the following REST endpoints on `http://localhost:3000/api`:

### Movies

| Method | Endpoint          | Description        |
| ------ | ----------------- | ------------------ |
| `GET`  | `/api/movies`     | List all movies    |
| `GET`  | `/api/movies/:id` | Get a movie by ID  |
| `POST` | `/api/movies`     | Create a new movie |

**Create Movie — Request Body:**

```json
{
  "title": "Inception",
  "description": "A mind-bending thriller by Christopher Nolan.",
  "release_year": 2010
}
```

### Reviews

| Method | Endpoint                 | Description                 |
| ------ | ------------------------ | --------------------------- |
| `GET`  | `/api/reviews/movie/:id` | Get all reviews for a movie |
| `POST` | `/api/reviews`           | Submit a new review         |

**Add Review — Request Body:**

```json
{
  "user_id": 1,
  "movie_id": 1,
  "rating": 5,
  "comment": "Absolutely brilliant!"
}
```

### Users

| Method | Endpoint         | Description       |
| ------ | ---------------- | ----------------- |
| `GET`  | `/api/users/:id` | Get a user by ID  |
| `POST` | `/api/users`     | Create a new user |

**Create User — Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

---

## 🗄️ Database Schema

The application uses three tables in Supabase (PostgreSQL):

```sql
users
├── id          (uuid, PK)
├── email       (text, unique)
├── name        (text)
└── created_at  (timestamptz)

movies
├── id           (bigserial, PK)
├── title        (text)
├── description  (text)
├── release_year (integer)
└── created_at   (timestamptz)

reviews
├── id         (bigserial, PK)
├── movie_id   (bigint, FK → movies)
├── user_id    (uuid, FK → users)
├── rating     (integer, 1–5)
├── comment    (text)
└── created_at (timestamptz)
```

**Row-Level Security Policies:**

- Anyone (anonymous & authenticated) can **read** users, movies, and reviews.
- Only **authenticated** users can **insert** reviews (must match their own `user_id`).
- Users can **update** and **delete** only their own reviews.

---

## 🧩 gRPC Service Definitions

Services communicate internally using Protocol Buffers. The `.proto` files are located in `server/proto/`.

| Service           | Port   | RPCs                                                 |
| ----------------- | ------ | ---------------------------------------------------- |
| **UserService**   | `5001` | `CreateUser`, `GetUser`, `ListUsers`                 |
| **MovieService**  | `5002` | `CreateMovie`, `GetMovie`, `ListMovies`              |
| **ReviewService** | `5003` | `AddReview`, `GetReviewsByMovie`, `GetReviewsByUser` |

---

## 📄 License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC).
