import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../utils";

const PayloadSchema = z.object({
	username: z.string(),
	exp: z.number(),
});

export const requiresAuthentication: RequestHandler = (request, _, next) => {
	const token = request.headers.authorization;
	if (token === undefined || token === "") {
		const httpError = createHttpError(401, "Unauthorized. Please provide a valid token.");
		return next(httpError);
	}

	jwt.verify(token, env.JWT_SECRET, async (error, decoded) => {
		if (error !== null || decoded === undefined) {
			const httpError = createHttpError(401, "Unauthorized. Please provide a valid token.");
			return next(httpError);
		}

		const { success, data } = PayloadSchema.safeParse(decoded);

		if (!success) {
			const httpError = createHttpError(401, "Unauthorized. Invalid token payload.");
			return next(httpError);
		}

		const { username, exp } = data;
		const now = Date.now() / 1000;
		if (exp < now) {
			const httpError = createHttpError(401, "Unauthorized. Token has expired.");
			return next(httpError);
		}

		if (username !== env.ADMIN_USERNAME) {
			const httpError = createHttpError(403, "Forbidden. You do not have permission to access this resource.");
			return next(httpError);
		}

		request.authenticated = true;
		next();
	});
};
