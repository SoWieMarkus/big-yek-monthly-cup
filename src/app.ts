import cors from "cors";
import "dotenv/config";
import express, { json, type NextFunction, type Request, type Response } from "express";
import createHttpError, { isHttpError } from "http-errors";
import { Log } from "./util";
import { AdminRouter, AuthenticationRouter, CupsRouter } from "./routes";

const app = express();

app.use(cors());
app.use(json());

app.use("/auth", AuthenticationRouter);
app.use("/admin", AdminRouter);
app.use("/cups", CupsRouter);

// Handling of unknown endpoints
app.use((request, response, next) => {
    next(createHttpError(404, "Endpoint not found."));
})

// Error handling
app.use((error: unknown, request: Request, response: Response, next: NextFunction) => {
    const errorMessage = isHttpError(error) ? error.message : "An unknown error occured.";
    const errorStatus = isHttpError(error) ? error.status : 500;
    Log.error(`Status ${errorStatus}: ${errorMessage}`);
    response.status(errorStatus).json({ error: errorMessage });
});

export default app;