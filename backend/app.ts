import express from "express";
import { setupRoutes } from "./src/routes";
import { config } from "#/config";

const app = express();
const port = config.port;
setupRoutes(app);

app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
