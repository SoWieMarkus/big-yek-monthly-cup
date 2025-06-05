import cors from "cors";
import "dotenv/config";
import path from "node:path";
import express, { json, type NextFunction, type Request, type Response } from "express";
import createHttpError, { isHttpError } from "http-errors";
import { AdminRouter, AuthenticationRouter, CupsRouter } from "./routes";
import { logger } from "./utils";

const app = express();

app.use(express.static(path.join(__dirname, "../../frontend/dist/frontend/browser")));

app.use(cors());
app.use(json());

const apiRouter = express.Router();
apiRouter.use("/authentication", AuthenticationRouter);
apiRouter.use("/admin", AdminRouter);
apiRouter.use("/cups", CupsRouter);

app.use("/api", apiRouter);
app.get("*name", (_, response) => {
	response.sendFile(path.join(__dirname, "../../frontend/dist/frontend/browser/index.html"));
});

// Handling of unknown endpoints
app.use((_, __, next) => {
	next(createHttpError(404, "Endpoint not found."));
});

// Error handling
app.use((error: unknown, _: Request, response: Response, next: NextFunction) => {
	const errorMessage = isHttpError(error) ? error.message : "An unknown error occured.";
	const errorStatus = isHttpError(error) ? error.status : 500;

	if (errorStatus >= 500) {
		logger.error(`Status ${errorStatus}: ${errorMessage}`);
		console.error(error);
	}
	response.status(errorStatus).json({ error: errorMessage });
});

export default app;
