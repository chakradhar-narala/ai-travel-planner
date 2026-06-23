# Trao AI Travel Planner

Trao AI Travel Planner is a modern, responsive, and secure full-stack web application that allows users to co-author and refine personalized travel plans using generative AI. It is designed to create a structured itinerary, estimate local expenses, suggest suitable lodgings, and features a specialized weather-aware packing assistant.

---

## 1. Project Overview & Features

- **Multi-User Isolation**: Each user gets their own protected vault context. Users cannot view or modify other users' trips.
- **AI-Powered Itinerary Generation**: Generates 2-4 structured activities per day categorized by time-of-day (Morning, Afternoon, Evening) based on user interests, location, and budget constraints.
- **Adaptive Expense Breakdown**: Estimates local budgets for transportation, lodging, food, and activities. Modifying itinerary items dynamically updates the ledger.
- **Targeted AI Day Regeneration**: Allows regenerating individual days by sending feedback instructions directly to the LLM.
- **AI Weather-Aware Packing Assistant (Creative Feature)**: Cross-references the destination's climate during the month of travel and itinerary themes to curate a dynamic, checkable packing list.
- **Hotel Suggestions**: Suggests local lodgings with ratings, price estimates, and budget tags.

---

## 2. Technology Stack & Justification

- **Frontend**: **Next.js 14 (App Router)** with **TypeScript**. Chosen for high performance, server-side rendering support, and flexible App Router layouts.
- **Styling**: **Tailwind CSS** + **Lucide Icons**. Facilitates quick, responsive styling and high-fidelity dark glassmorphic designs.
- **Backend**: **Node.js** + **Express.js** with **TypeScript**. Lightweight, modular REST API structure with compile-time checks.
- **Database**: **MongoDB** + **Mongoose ODM**. Offers a flexible document store ideal for nesting variable-length itinerary days, activity arrays, and checklists.
- **Authentication**: Stateless session security using **JSON Web Tokens (JWT)** and **bcryptjs** (12 salt rounds) for password hashing.

---

## 3. System Architecture & Authentication Flow

```
┌────────────────────────────────────────────────────────┐
│                   Next.js Client (UI)                  │
│   (Auth State, Trip Form, Dynamic Itinerary Board)    │
└───────────┬────────────────────────────────▲───────────┘
            │                                │
     REST Request                     JSON Response
 (JWT in Auth Header)           (Strict User-Isolated Data)
            │                                │
┌───────────▼────────────────────────────────┼───────────┐
│               Express.js REST API Server               │
│   ┌────────────────────────────────────────────────┐   │
│   │               Auth Middleware                  │   │
│   │   (Decodes JWT, Enforces req.user.id Checks)   │   │
│   └───────────────────────┬────────────────────────┘   │
│                           │                            │
│           ┌───────────────┴───────────────┐            │
│           ▼                               ▼            │
│   ┌───────────────┐               ┌───────────────┐    │
│   │  Trip Routes  │               │  User Routes  │    │
│   └───────┬───────┘               └───────┬───────┘    │
└───────────┼───────────────────────────────┼────────────┘
            │                               │
            ├───────────────┐               │
            ▼               ▼               ▼
 ┌───────────────────┐ ┌─────────┐ ┌─────────────────┐
 │ Google Gemini API │ │ MongoDB │ │  MongoDB Users  │
 │ (LLM Generation)  │ │  Trips  │ │  (Hashed Pass)  │
 └───────────────────┘ └─────────┘ └─────────────────┘
```

### Authentication Details
1. **Password Security**: Passwords are hashed with `bcryptjs` before DB write.
2. **Access Control**: Public endpoints are limited to user register and login. Private endpoints check for a valid `Authorization: Bearer <token>` header.
3. **Database Isolation**: All queries (GET, PUT, DELETE, POST) on the `Trip` collection filter by `userId: req.user.id` to prevent cross-account exposure.

---

## 4. AI Agent Design & API Resilience

- **Model Selection**: The application relies on Google **Gemini 2.5 Flash** due to its low latency, high context limits, and native support for structured JSON MimeTypes.
- **Prompt Engineering**: System instructions force the model to output a strict, parseable JSON schema conforming to database models.
- **Exponential Backoff**: To protect the application from transient 429 rate limit errors or API timeouts, a custom fetch retry wrapper retries requests up to 5 times with progressive delays (`1s`, `2s`, `4s`, `8s`, `16s`).

---

## 5. Creative Feature: Smart Weather-Aware Packing Assistant

- **Problem solved**: Travelers often pack generic items, forgetting activity-specific tools (e.g. hiking boots for active trails) or climate wear (e.g. heavy insulation, umbrellas) appropriate for local microclimates.
- **Solution**: When generating the itinerary, Gemini analyzes the destination climate and trip activities to return custom categorized items:
  - **Documents**: Visas, reservation vouchers, currency requirements.
  - **Clothing**: Layers tailored to the destination's climate profile.
  - **Gear**: Adapters, activity equipment (swimwear, walking poles).
  - **Other**: Lotions, medicine, destination specifics.
- Checkboxes toggle items dynamically and sync back to the database.

---

## 6. Setup & Installation Instructions

### Local Environment Setup

Ensure you have **Node.js (v18+)** and **MongoDB** (local or Atlas) running.

#### 1. Configure the Backend
1. Open the `backend` folder:
   ```bash
   cd backend
   ```
2. Create your `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Update the variables inside `.env`:
   - `MONGO_URI`: Your MongoDB connection string.
   - `JWT_SECRET`: A secure secret string.
   - `GEMINI_API_KEY`: Your Google AI Studio API key.
4. Install backend dependencies:
   ```bash
   npm install
   ```
5. Launch the backend server in developer mode:
   ```bash
   npm run dev
   ```
   *(Server starts listening on `http://localhost:5000`)*

#### 2. Configure the Frontend
1. Open the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *(Frontend opens at `http://localhost:3000`)*

---

## 7. Deployment Instructions

### Backend (Render or Railway)
1. Push code to GitHub (ensure `.env` is omitted from Git tracking).
2. Create a new Web Service pointing to the backend folder.
3. Configure Environment Variables in the provider's dashboard:
   - `PORT=5000`
   - `MONGO_URI=mongodb+srv://...`
   - `JWT_SECRET=your_super_secret`
   - `GEMINI_API_KEY=your_gemini_key`
   - `FRONTEND_URL=https://your-frontend-deployment.vercel.app`

### Frontend (Vercel)
1. Connect your repository to Vercel.
2. Select the `frontend` directory as the root folder.
3. Define the environment variable:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com`
4. Click **Deploy**.

---

## 8. Limitations & Trade-offs

- **Static Weather Predictions**: Checklists are based on monthly weather averages rather than real-time 7-day live weather forecasts.
- **Stateless Tokens**: JWT sessions cannot be revoked instantly without database blacklisting, which was traded off for token statelessness and simplicity.
