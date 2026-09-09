# eCommerce API

An Express + TypeScript + Mongoose REST API for users, categories, products, and
orders. Requests are validated with Zod, errors use one response shape, and the
complete API is documented with Swagger UI.

## Requirements

- Node.js 20+
- npm
- MongoDB 7+ locally, in Docker, or a MongoDB Atlas connection string

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

The API starts on `http://localhost:4000` by default. Swagger UI is available at
`http://localhost:4000/api-docs`, and the raw OpenAPI document is at
`http://localhost:4000/api-docs.json`.

To start a local MongoDB with Docker before running the API:

```bash
docker compose up -d mongodb
```

For MongoDB Atlas, replace `MONGODB_URI` in `.env` with the Atlas connection
string. The HTTP server starts only after Mongoose establishes the database
connection.

## Environment variables

| Variable | Default/example | Purpose |
| --- | --- | --- |
| `PORT` | `4000` | HTTP port |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/ecommerce` | MongoDB connection string (required) |
| `NODE_ENV` | `development` | `development` or `production` |

## Commands

```bash
npm run dev        # start with watch mode
npm run build      # compile production JavaScript into dist/
npm start          # run the compiled application
npm run typecheck  # TypeScript checks without output
```

## API endpoints

| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/health` | Service health check |
| `GET`, `POST` | `/users` | List or create users |
| `GET`, `PUT`, `DELETE` | `/users/:id` | Read, update, or delete a user |
| `GET`, `POST` | `/categories` | List or create categories |
| `GET`, `PUT`, `DELETE` | `/categories/:id` | Read, update, or delete a category |
| `GET`, `POST` | `/products` | List or create products |
| `GET` | `/products?categoryId=:id` | Filter products by category |
| `GET`, `PUT`, `DELETE` | `/products/:id` | Read, update, or delete a product |
| `GET`, `POST` | `/orders` | List or create orders |
| `GET`, `PUT`, `DELETE` | `/orders/:id` | Read, update, or delete an order |

`POST` returns `201 Created`, successful deletion returns `204 No Content`, and
the other successful operations return `200 OK`.

### Example creation flow

Create the referenced resources in this order: user, category, product, order.

```bash
curl -X POST http://localhost:4000/users \
  -H 'Content-Type: application/json' \
  -d '{"name":"Ada","email":"ada@example.com","password":"secret"}'

curl -X POST http://localhost:4000/categories \
  -H 'Content-Type: application/json' \
  -d '{"name":"Keyboards"}'
```

Use the returned category `id` when creating a product, and the returned user
and product IDs when creating an order:

```json
{
  "userId": "64b7f0d6a8a7c95f4c1f1236",
  "products": [
    {
      "productId": "64b7f0d6a8a7c95f4c1f1235",
      "quantity": 2
    }
  ]
}
```

The client cannot set an order total. On every order create or update, the API
loads the current product prices and calculates `price * quantity` on the
server. A product cannot be created or moved to a missing category, and an
order cannot reference a missing user or product.

## Responses and errors

MongoDB `_id` is returned as `id`, and `__v` is omitted. Passwords are hashed
before storage, excluded from normal database selections, and removed from all
serialized API responses.

Errors have a stable shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "path": "body.email",
        "message": "A valid email is required",
        "code": "invalid_string"
      }
    ]
  }
}
```

Relationship failures return `422`, duplicate email conflicts return `409`,
unknown resources return `404`, and invalid inputs return `400`.

## Project structure

```text
src/
├── config/       environment validation
├── controllers/  HTTP handlers and business integrity checks
├── db/           Mongoose connection lifecycle
├── docs/         OpenAPI document
├── errors/       typed application error
├── middleware/   Zod validation and centralized error handling
├── models/       Mongoose models
├── routes/       resource routers
├── schemas/      request body, parameter, and query schemas
├── services/     order pricing logic
├── types/        shared TypeScript types
├── app.ts        Express application
└── index.ts      database-first server startup and graceful shutdown
```
