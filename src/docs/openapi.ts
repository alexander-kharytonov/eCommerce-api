const objectIdSchema = {
  type: "string",
  pattern: "^[a-fA-F0-9]{24}$",
  example: "64b7f0d6a8a7c95f4c1f1234",
};

const timestamps = {
  createdAt: { type: "string", format: "date-time" },
  updatedAt: { type: "string", format: "date-time" },
};

const idParameter = {
  name: "id",
  in: "path",
  required: true,
  schema: objectIdSchema,
};

const errorResponses = {
  "400": {
    description: "Invalid request",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  "404": {
    description: "Resource not found",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
  "422": {
    description: "A referenced resource does not exist",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } },
  },
};

function jsonBody(schemaName: string, required = true) {
  return {
    required,
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaName}` },
      },
    },
  };
}

function resourceResponse(schemaName: string, description = "Success") {
  return {
    description,
    content: {
      "application/json": {
        schema: { $ref: `#/components/schemas/${schemaName}` },
      },
    },
  };
}

function listResponse(schemaName: string) {
  return {
    description: "Success",
    content: {
      "application/json": {
        schema: {
          type: "array",
          items: { $ref: `#/components/schemas/${schemaName}` },
        },
      },
    },
  };
}

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "eCommerce API",
    version: "1.0.0",
    description:
      "CRUD API for users, categories, products, and orders. Order totals are calculated from current product prices on the server.",
  },
  servers: [{ url: "/", description: "Current server" }],
  tags: [
    { name: "Users" },
    { name: "Categories" },
    { name: "Products" },
    { name: "Orders" },
  ],
  paths: {
    "/users": {
      get: {
        tags: ["Users"],
        summary: "List users",
        responses: { "200": listResponse("User"), ...errorResponses },
      },
      post: {
        tags: ["Users"],
        summary: "Create a user",
        requestBody: jsonBody("CreateUser"),
        responses: {
          "201": resourceResponse("User", "Created"),
          "409": resourceResponse("Error", "Email already exists"),
          ...errorResponses,
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get a user",
        parameters: [idParameter],
        responses: { "200": resourceResponse("User"), ...errorResponses },
      },
      put: {
        tags: ["Users"],
        summary: "Update a user",
        parameters: [idParameter],
        requestBody: jsonBody("UpdateUser"),
        responses: {
          "200": resourceResponse("User"),
          "409": resourceResponse("Error", "Email already exists"),
          ...errorResponses,
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete a user",
        parameters: [idParameter],
        responses: { "204": { description: "Deleted" }, ...errorResponses },
      },
    },
    "/categories": {
      get: {
        tags: ["Categories"],
        summary: "List categories",
        responses: { "200": listResponse("Category"), ...errorResponses },
      },
      post: {
        tags: ["Categories"],
        summary: "Create a category",
        requestBody: jsonBody("CreateCategory"),
        responses: { "201": resourceResponse("Category", "Created"), ...errorResponses },
      },
    },
    "/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get a category",
        parameters: [idParameter],
        responses: { "200": resourceResponse("Category"), ...errorResponses },
      },
      put: {
        tags: ["Categories"],
        summary: "Update a category",
        parameters: [idParameter],
        requestBody: jsonBody("UpdateCategory"),
        responses: { "200": resourceResponse("Category"), ...errorResponses },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete a category",
        parameters: [idParameter],
        responses: { "204": { description: "Deleted" }, ...errorResponses },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "List products",
        parameters: [
          {
            name: "categoryId",
            in: "query",
            required: false,
            schema: objectIdSchema,
          },
        ],
        responses: { "200": listResponse("Product"), ...errorResponses },
      },
      post: {
        tags: ["Products"],
        summary: "Create a product",
        requestBody: jsonBody("CreateProduct"),
        responses: { "201": resourceResponse("Product", "Created"), ...errorResponses },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get a product",
        parameters: [idParameter],
        responses: { "200": resourceResponse("Product"), ...errorResponses },
      },
      put: {
        tags: ["Products"],
        summary: "Update a product",
        parameters: [idParameter],
        requestBody: jsonBody("UpdateProduct"),
        responses: { "200": resourceResponse("Product"), ...errorResponses },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete a product",
        parameters: [idParameter],
        responses: { "204": { description: "Deleted" }, ...errorResponses },
      },
    },
    "/orders": {
      get: {
        tags: ["Orders"],
        summary: "List orders",
        responses: { "200": listResponse("Order"), ...errorResponses },
      },
      post: {
        tags: ["Orders"],
        summary: "Create an order and calculate its total",
        requestBody: jsonBody("CreateOrder"),
        responses: { "201": resourceResponse("Order", "Created"), ...errorResponses },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get an order",
        parameters: [idParameter],
        responses: { "200": resourceResponse("Order"), ...errorResponses },
      },
      put: {
        tags: ["Orders"],
        summary: "Update an order and recalculate its total",
        parameters: [idParameter],
        requestBody: jsonBody("UpdateOrder"),
        responses: { "200": resourceResponse("Order"), ...errorResponses },
      },
      delete: {
        tags: ["Orders"],
        summary: "Delete an order",
        parameters: [idParameter],
        responses: { "204": { description: "Deleted" }, ...errorResponses },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: {
            type: "object",
            required: ["code", "message"],
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string" },
              details: {},
            },
          },
        },
      },
      User: {
        type: "object",
        required: ["id", "name", "email"],
        properties: {
          id: objectIdSchema,
          name: { type: "string" },
          email: { type: "string", format: "email" },
          ...timestamps,
        },
      },
      CreateUser: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", writeOnly: true },
        },
      },
      UpdateUser: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          password: { type: "string", writeOnly: true },
        },
      },
      Category: {
        type: "object",
        required: ["id", "name"],
        properties: { id: objectIdSchema, name: { type: "string" }, ...timestamps },
      },
      CreateCategory: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" } },
      },
      UpdateCategory: {
        type: "object",
        minProperties: 1,
        properties: { name: { type: "string" } },
      },
      Product: {
        type: "object",
        required: ["id", "name", "description", "price", "categoryId"],
        properties: {
          id: objectIdSchema,
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number", minimum: 0 },
          categoryId: objectIdSchema,
          ...timestamps,
        },
      },
      CreateProduct: {
        type: "object",
        required: ["name", "description", "price", "categoryId"],
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number", minimum: 0 },
          categoryId: objectIdSchema,
        },
      },
      UpdateProduct: {
        type: "object",
        minProperties: 1,
        properties: {
          name: { type: "string" },
          description: { type: "string" },
          price: { type: "number", minimum: 0 },
          categoryId: objectIdSchema,
        },
      },
      OrderProduct: {
        type: "object",
        required: ["productId", "quantity"],
        properties: {
          productId: objectIdSchema,
          quantity: { type: "integer", minimum: 1 },
        },
      },
      Order: {
        type: "object",
        required: ["id", "userId", "products", "total"],
        properties: {
          id: objectIdSchema,
          userId: objectIdSchema,
          products: { type: "array", items: { $ref: "#/components/schemas/OrderProduct" } },
          total: { type: "number", minimum: 0, readOnly: true },
          ...timestamps,
        },
      },
      CreateOrder: {
        type: "object",
        required: ["userId", "products"],
        properties: {
          userId: objectIdSchema,
          products: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/OrderProduct" },
          },
        },
      },
      UpdateOrder: {
        type: "object",
        minProperties: 1,
        properties: {
          userId: objectIdSchema,
          products: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/OrderProduct" },
          },
        },
      },
    },
  },
};
