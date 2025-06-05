import { Schema } from "@bymc/shared";
import bcrypt from "bcryptjs";
import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken";
import { env } from "../utils";

export const login: RequestHandler = async (request, response) => {
	const { success, data, error } = Schema.authentication.login.safeParse(request.body);
	if (!success) {
		throw createHttpError(400, error.errors[0].message);
	}

	const { username, password } = data;

	const adminPassword = await bcrypt.hash(env.ADMIN_PASSWORD, 10);
	const passwordMatch = await bcrypt.compare(password, adminPassword);

	if (!passwordMatch || username !== env.ADMIN_USERNAME) {
		throw createHttpError(401, "Unauthorized. Invalid username or password.");
	}

	const token = jwt.sign({ username }, env.JWT_SECRET, { expiresIn: "24h" });
	response.status(200).json({ token });
};
