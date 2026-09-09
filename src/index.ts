import "dotenv/config";
import type { Server } from "node:http";
import { app } from "./app";
import { readEnvironment } from "./config/env";
import { connectToDatabase, disconnectFromDatabase } from "./db";

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function start(): Promise<void> {
  const environment = readEnvironment();
  await connectToDatabase(environment.MONGODB_URI);

  const server = app.listen(environment.PORT, () => {
    console.log(`eCommerce API listening on http://localhost:${environment.PORT}`);
    console.log(`Swagger UI: http://localhost:${environment.PORT}/api-docs`);
  });

  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`${signal} received, shutting down`);

    try {
      await closeServer(server);
      await disconnectFromDatabase();
      process.exitCode = 0;
    } catch (error) {
      console.error("Graceful shutdown failed", error);
      process.exitCode = 1;
    }
  };

  process.once("SIGINT", () => void shutdown("SIGINT"));
  process.once("SIGTERM", () => void shutdown("SIGTERM"));
}

void start().catch((error) => {
  console.error("Failed to start eCommerce API", error);
  process.exitCode = 1;
});
