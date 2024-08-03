import type { RequestHandler } from "express";
import createHttpError from "http-errors";
import { database } from "../database";
import { validateInteger } from "../util/validate-integer";

export const getAllCups: RequestHandler = async (request, response, next) => {
	try {
		const cups = await database.cup.findMany({
			where: { public: true },
			orderBy: [{ year: "desc" }, { month: "desc" }],
		});
		response.json(cups).status(200);
	} catch (error) {
		console.error(error);
		next(createHttpError(500, "Failed to get cups."));
	}
};

export const getCurrentCup: RequestHandler = async (
	request,
	response,
	next,
) => {
	try {
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
	} catch (error) {
		next(createHttpError(500, "Failed to get current cup."));
		console.error(error);
	}
};

export const getQualifierResults: RequestHandler = async (
	request,
	response,
	next,
) => {
	const { qualifierId } = request.params;

	try {
		const id = validateInteger(qualifierId);
		const qualifierResults = await database.qualifierResult.findMany({
			where: {
				qualifier: {
					id,
					cup: {
						public: true,
					},
				},
			},
			orderBy: [{ position: "asc" }],
		});
		response.json(qualifierResults).status(200);
	} catch (error) {
		next(
			createHttpError(
				500,
				`Failed to load results of qualifier "${qualifierId}"`,
			),
		);
	}
};

export const getCupLeaderboard: RequestHandler = async (
	request,
	response,
	next,
) => {
	const { cupId } = request.params;

	try {
		const id = validateInteger(cupId);
		const results = await database.leaderboardEntry.findMany({
			where: {
				leaderboard: {
					cup: {
						id,
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
	} catch (error) {
		console.error(error);
		next(createHttpError(500, `Failed to load leaderboard of cup "${cupId}".`));
	}
};
