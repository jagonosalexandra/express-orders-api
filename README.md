# Express Fundamentals Practice

A small Express server modeling a simple orders API using a local orders dataset. It serves order data from `data.json` with support for retrieving all orders, filtering by status, and accessing individual orders by ID.

This repository specifically explores the following concepts:

- **Express.js** — A Node.js web application framework that provides a thin layer of fundamental web application features for building web and mobile applications
- **Routing** — Matching HTTP methods (GET) and URL patterns to handler functions. Includes static routes (`/orders`) and dynamic routes with parameters (`/orders/:id`)
- **Middleware** — Functions that execute during the request/response cycle, including custom logging middleware, 404 handlers, and error-handling middleware
- **Request & Response Objects** — `req` (request) contains incoming data like `req.params`, `req.query`, and `req.body`; `res` (response) sends data back with methods like `res.json()`, `res.status()`, and `res.send()`
- **Query Parameters** — Filtering data using URL query strings (e.g., `/orders?status=delivered`)
- **Route Parameters** — Accessing dynamic URL segments (e.g., `/orders/:id` to get a specific order)
- **Error Handling** — Custom 4-parameter error-handling middleware that catches errors and returns appropriate HTTP status codes (500 for server errors, 404 for not found)
- **fs/promises API** — Provides asynchronous file system operations that return promises, used for reading the local JSON dataset

## Tech / Tools

- Node.js
- Express.js

## Setup

```
git clone git@github.com:jagonosalexandra/express-fundamentals-practice.git
cd express-fundamentals-practice
npm install
```

## Usage

```
node server.js
```

Server runs on `http://localhost:3000`. Available endpoints:

- `GET /orders` — all orders
- `GET /orders?status=delivered` — orders filtered by status
- `GET /orders/:id` — a single order by ID
