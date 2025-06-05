import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import { database } from "../database";

export const getAllCups: RequestHandler = async (_, response) => {
	const cups = await database.cup.findMany({
		where: { public: true },
		orderBy: [{ year: "desc" }, { month: "desc" }],
	});
	response.json(cups).status(200);
};

export const getCurrentCup: RequestHandler = async (_, response) => {
	const cups = await database.cup.findMany({
		where: {
			public: true,
			current: true,
		},
		select: {
			id: true,
			qualifier: true,
			year: true,
			month: true,
			name: true,
			leaderboard: {
				include: {
					entries: {
						orderBy: [
							{
								qualified: "desc",
							},
							{
								points: "desc",
							},
						],
						select: {
							player: true,
							points: true,
							qualified: true,
							position: true,
						},
					},
				},
			},
		},
	});
	if (cups.length === 0) {
		throw createHttpError(404, "There is no current cup.");
	}

	response.json(cups[0]).status(200);
};

export const getQualifierResults: RequestHandler = async (request, response, next) => {
	const { qualifierId } = request.params;
	if (!qualifierId) {
		throw createHttpError(400, "Qualifier ID is required.");
	}

	const qualifierResults = await database.qualifierResult.findMany({
		where: {
			qualifier: {
				id: qualifierId,
				cup: {
					public: true,
				},
			},
		},
		orderBy: [{ position: "asc" }],
	});
	response.json(qualifierResults).status(200);
};

export const getCupLeaderboard: RequestHandler = async (request, response) => {
	const { cupId } = request.params;
	if (!cupId) {
		throw createHttpError(400, "Cup ID is required.");
	}

	const results = await database.leaderboardEntry.findMany({
		where: {
			leaderboard: {
				cup: {
					id: cupId,
					public: true,
				},
			},
		},
		orderBy: [
			{
				qualified: "desc",
			},
			{
				points: "desc",
			},
		],
		select: {
			player: true,
			points: true,
			qualified: true,
		},
	});
	response.json(results).status(200);
};
