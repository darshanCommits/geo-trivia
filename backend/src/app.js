import express from "express";
import cors from "cors";
import { setupRoutes } from "@backend/routes";
import { config } from "@backend/config";
const app = express();
const port = config.port;
app.use(cors({
    origin: "http://localhost:5173",
}));
setupRoutes(app);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
//# sourceMappingURL=app.js.map