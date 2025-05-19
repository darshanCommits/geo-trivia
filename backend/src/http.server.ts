import express from "express";
import cors from "cors";
import { createServer } from "node:http";
import { setupRoutes } from "./routes";
import { config } from "./config";

export const app: express.Express = express();

export const server = createServer(app);

// Middleware
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

// Routes
setupRoutes(app);

// Start server
server.listen(config.port, () => {
	console.log(`Server running on port ${config.port}`);
});
