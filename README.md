# CampusBid

**CampusBid** is a full-stack MERN student marketplace where users can sell used items and participate in simple timed auctions. Every user can act as both a buyer and a seller by switching modes — no separate accounts needed.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen)

---

## Features

- **Unified User System** — One account for buying and selling; switch between Buyer Mode and Seller Mode anytime
- **Marketplace Browse** — Search by title, filter by category, sort by newest
- **Timed Auctions** — 1, 3, or 7-day auction durations with live countdown
- **Bidding System** — Place bids with validation (must exceed current highest, no self-bidding)
- **Seller Dashboard** — Manage listings, view bids, close auctions, accept winning bids
- **Buyer Dashboard** — Track my bids, participated auctions, and won items
- **Auto Auction Expiry** — Expired auctions close automatically on fetch (no cron jobs)

---

## Tech Stack

| Layer          | Technology                          |
|----------------|-------------------------------------|
| Frontend       | React, Tailwind CSS, React Router, Axios |
| Backend        | Node.js, Express.js                 |
| Database       | MongoDB with Mongoose               |
| Authentication | JWT + bcrypt                        |

---

## Project Structure

```
CampusBid/
├── backend/
│   ├── controllers/     # Route handlers (auth, items, bids)
│   ├── models/        # Mongoose schemas (User, Item, Bid)
│   ├── routes/        # API route definitions
│   ├── middleware/    # JWT auth middleware
│   ├── utils/         # Token generation, auction expiry checks
│   └── server.js      # Express app entry point
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI components
│       ├── context/     # Auth context (global state)
│       ├── pages/       # Page-level components
│       ├── services/    # Axios API calls
│       └── App.jsx      # Routes and layout
└── README.md
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) running locally, or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection string

---

## Getting Started

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd CampusBid
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (or copy from `.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/campusbid
JWT_SECRET=your_super_secret_jwt_key_change_in_production
```

Start the backend:

```bash
npm run dev
```

The API runs at **http://localhost:5000**

### 3. Frontend setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app runs at **http://localhost:3000**

---

## API Reference

### Authentication

| Method | Endpoint              | Description        | Auth |
|--------|-----------------------|--------------------|------|
| POST   | `/api/auth/register`  | Register new user  | No   |
| POST   | `/api/auth/login`     | Login user         | No   |
| GET    | `/api/auth/profile`   | Get user profile   | Yes  |
| PUT    | `/api/auth/mode`      | Switch buyer/seller mode | Yes |

### Items

| Method | Endpoint                    | Description              | Auth |
|--------|-----------------------------|--------------------------|------|
| GET    | `/api/items`                | List active items        | No   |
| GET    | `/api/items/:id`            | Get item with bids       | No   |
| POST   | `/api/items`                | Create listing           | Yes  |
| PUT    | `/api/items/:id`            | Update listing           | Yes  |
| DELETE | `/api/items/:id`            | Delete listing           | Yes  |
| GET    | `/api/items/my-listings`    | Seller's listings        | Yes  |
| PUT    | `/api/items/:id/close`      | Close auction manually   | Yes  |
| PUT    | `/api/items/:id/acceptBid`  | Accept a bid (mark sold) | Yes  |
| GET    | `/api/items/categories`     | Get category list        | No   |

**Query params for `GET /api/items`:**
- `search` — filter by title
- `category` — filter by category (or `all`)
- `sort` — `newest` (default)

### Bids

| Method | Endpoint                  | Description              | Auth |
|--------|---------------------------|--------------------------|------|
| POST   | `/api/bids`               | Place a bid              | Yes  |
| GET    | `/api/bids/:itemId`       | Get bids for an item     | No   |
| GET    | `/api/bids/my-bids`       | Current user's bids      | Yes  |
| GET    | `/api/bids/participated`  | Auctions user bid on     | Yes  |
| GET    | `/api/bids/won`           | Auctions user won        | Yes  |

---

## Data Models

### User
```
name, email, password, currentMode ("buyer" | "seller"), createdAt
```

### Item
```
title, description, category, image, startingPrice, auctionDuration (1|3|7),
createdBy, createdAt, auctionEndTime, status (active|closed|sold), winningBidderId
```

### Bid
```
itemId, bidderId, amount, timestamp
```

### Categories
Electronics, Books, Furniture, Sports, Stationery, Miscellaneous

---

## How It Works

### Buyer / Seller Modes

- New users start in **Buyer Mode** by default
- Click the mode toggle in the navbar or profile page to switch to **Seller Mode**
- Seller Mode unlocks: Create Listing, Seller Dashboard
- Buyer Mode shows: My Bids (Buyer Dashboard)

### Bidding Rules

1. Bid amount must be **greater than** the current highest bid (or starting price if no bids)
2. Users **cannot bid on their own listings**
3. **Closed** or **sold** auctions reject new bids

### Auction Expiry

When `auctionEndTime` passes, the item status is automatically set to `closed` whenever:
- Item details are fetched (`GET /api/items/:id`)
- A bid is attempted (`POST /api/bids`)
- Marketplace listings are loaded (`GET /api/items`)

No background schedulers or cron jobs are used.

### Seller Workflow

1. Switch to Seller Mode
2. Create a listing with title, description, category, image URL, starting price, and duration
3. View received bids in Seller Dashboard
4. **Accept** a bid → item marked as `sold`, `winningBidderId` stored
5. Or **Close** auction manually without accepting

---

## Screenshots & Demo Flow

1. **Register** → Browse marketplace as a buyer
2. **Switch to Seller Mode** → Create a listing with an image URL
3. **Log in as another user** → Place bids on the listing
4. **Switch back to seller** → Accept the highest bid
5. **Check Buyer Dashboard** → See won auctions

---

## Environment Variables

### Backend (`backend/.env`)

| Variable      | Description                    | Default                              |
|---------------|--------------------------------|--------------------------------------|
| `PORT`        | Server port                    | `5000`                               |
| `MONGODB_URI` | MongoDB connection string      | `mongodb://localhost:27017/campusbid` |
| `JWT_SECRET`  | Secret key for JWT signing     | (required)                           |

### Frontend (optional)

| Variable        | Description     | Default |
|-----------------|-----------------|---------|
| `VITE_API_URL`  | API base URL    | `/api` (proxied to localhost:5000 in dev) |

---

## Scripts

### Backend
```bash
npm start      # Production
npm run dev    # Development with nodemon
```

### Frontend
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

---

## License

This project is open source and available for educational and portfolio use.
