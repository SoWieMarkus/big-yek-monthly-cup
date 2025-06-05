import { Schema } from "@bymc/shared";
import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import { database } from "../database";
import { Cup, Leaderboard } from "../utils";

export const createCup: RequestHandler = async (request, response) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to create a cup.");
	}

	const { success, data, error } = Schema.admin.create.safeParse(request.body);
	if (!success) {
		throw createHttpError(400, error.errors[0].message);
	}

	const { year, month } = data;

	const existingCup = await database.cup.findFirst({
		where: {
			year,
			month,
		},
	});

	if (existingCup) {
		throw createHttpError(400, `Cup for ${year}-${month + 1} already exists.`);
	}

	const cups = await database.cup.findMany();
	const current = cups.length === 0;
	const name = Cup.getDisplayName(year, month);

	const cup = await database.cup.create({
		data: {
			year,
			month,
			current,
			name,
			public: false,
			qualifier: {
				createMany: {
					data: [{ version: 1 }, { version: 2 }, { version: 3 }],
				},
			},
			final: {
				create: {},
			},
			leaderboard: {
				create: {},
			},
		},
	});
	response.status(201).json(cup);
};

export const setCupVisibility: RequestHandler = async (request, response) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to create a cup.");
	}

	const { cupId } = request.params;
	if (!cupId) {
		throw createHttpError(400, "Cup ID is required.");
	}

	const { success, data, error } = Schema.admin.visibility.safeParse(request.body);
	if (!success) {
		throw createHttpError(400, error.errors[0].message);
	}

	const existingCup = await database.cup.findUnique({
		where: { id: cupId },
	});
	if (!existingCup) {
		throw createHttpError(404, `Cup with ID ${cupId} not found.`);
	}

	const { visible } = data;
	const cup = await database.cup.update({
		where: { id: cupId },
		data: { public: visible },
	});
	response.status(200).json(cup);
};

export const renameCup: RequestHandler = async (request, response, next) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to create a cup.");
	}

	const { cupId } = request.params;
	if (!cupId) {
		throw createHttpError(400, "Cup ID is required.");
	}

	const { success, data, error } = Schema.admin.rename.safeParse(request.body);
	if (!success) {
		throw createHttpError(400, error.errors[0].message);
	}

	const existingCup = await database.cup.findUnique({
		where: { id: cupId },
	});
	if (!existingCup) {
		throw createHttpError(404, `Cup with ID ${cupId} not found.`);
	}

	const { name } = data;
	const cup = await database.cup.update({
		where: { id: cupId },
		data: { name },
	});
	response.status(200).json(cup);
};

export const deleteCup: RequestHandler = async (request, response, next) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to delete a cup.");
	}

	const { cupId } = request.params;
	if (!cupId) {
		throw createHttpError(400, "Cup ID is required.");
	}

	await database.cup.delete({
		where: { id: cupId },
	});
	response.status(204).send();
};

export const setCupToCurrent: RequestHandler = async (request, response) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to set a cup as current.");
	}

	const { cupId } = request.params;
	if (!cupId) {
		throw createHttpError(400, "Cup ID is required.");
	}

	const existingCup = await database.cup.findUnique({
		where: { id: cupId },
	});
	if (!existingCup) {
		throw createHttpError(404, `Cup with ID ${cupId} not found.`);
	}

	await database.cup.updateMany({
		where: { current: true },
		data: { current: false },
	});

	const cup = await database.cup.update({
		where: { id: cupId },
		data: { current: true },
	});
	response.status(200).json(cup);
};

export const getCupDetails: RequestHandler = async (request, response) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to get cup details.");
	}

	const { cupId } = request.params;
	if (!cupId) {
		throw createHttpError(400, "Cup ID is required.");
	}

	const cup = await database.cup.findUnique({
		where: { id: cupId },
		include: {
			qualifier: {
				include: { _count: { select: { results: true } } },
			},
			final: {
				include: { _count: { select: { results: true } } },
			},
			leaderboard: {
				include: { _count: { select: { entries: true } } },
			},
		},
	});
	response.json(cup).status(200);
};

export const updateQualifier: RequestHandler = async (request, response) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to update qualifier data.");
	}

	const { qualifierId, cupId } = request.params;
	if (!qualifierId || !cupId) {
		throw createHttpError(400, "Qualifier ID and Cup ID are required.");
	}

	const { success, data, error } = Schema.admin.updateQualifier.safeParse(request.body);
	if (!success) {
		throw createHttpError(400, error.errors[0].message);
	}

	await Leaderboard.updateResults(qualifierId, data.server, data.data);
	await Leaderboard.updateLeaderboard(cupId);

	response.status(200).json({ success: true });
};

export const clearQualifier: RequestHandler = async (request, response) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to clear qualifier data.");
	}

	const { qualifierId, cupId } = request.params;
	if (!qualifierId || !cupId) {
		throw createHttpError(400, "Qualifier ID and Cup ID are required.");
	}

	await database.qualifierResult.deleteMany({
		where: {
			qualifierId,
		},
	});
	await Leaderboard.updateLeaderboard(cupId);
	response.status(200).json({ success: true });
};

export const getAllCups: RequestHandler = async (request, response) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to get all cups.");
	}

	// get all cups (including private cups)
	const cups = await database.cup.findMany({
		orderBy: [{ year: "desc" }, { month: "desc" }],
	});
	response.json(cups).status(200);
};

export const createQualifier: RequestHandler = async (request, response, next) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to create a qualifier.");
	}

	const { cupId } = request.params;
	if (!cupId) {
		throw createHttpError(400, "Cup ID is required.");
	}

	const { success, data, error } = Schema.admin.createQualifier.safeParse(request.body);
	if (!success) {
		throw createHttpError(400, error.errors[0].message);
	}

	const existingQualifier = await database.qualifier.findUnique({
		where: { version_cupId: { cupId, version: data.version } },
	});
	if (existingQualifier) {
		throw createHttpError(400, `Qualifier with version ${data.version} already exists for cup ${cupId}.`);
	}

	const { version } = data;
	const qualifier = await database.qualifier.create({
		data: {
			cupId,
			version,
		},
	});
	response.json(qualifier).status(201);
};

export const deleteQualifier: RequestHandler = async (request, response) => {
	if (!request.authenticated) {
		throw createHttpError(401, "You are not authenticated to delete a qualifier.");
	}

	const { qualifierId, cupId } = request.params;
	if (!qualifierId || !cupId) {
		throw createHttpError(400, "Qualifier ID and Cup ID are required.");
	}

	await database.qualifier.delete({
		where: { id: qualifierId },
	});

	await Leaderboard.updateLeaderboard(cupId);
	response.json({ success: true }).status(200);
};
