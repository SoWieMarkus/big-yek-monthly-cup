import type { LeaderboardEntry } from "@prisma/client";
import { Log } from ".";
import { database } from "../database";

type Columns = [number, number, string, string, string];

type DataArray = Columns[];

const POSITION = 0;
const POINTS = 1;
const NAME = 2;
const LOGIN = 3;
const ZONE = 4;

const POINT_LIMIT = 6969;

export const calculateLeaderboard = async (
	qualifierId: number,
	content: DataArray,
) => {
	for (const row of content) {
		await database.player.upsert({
			where: {
				id: row[LOGIN],
			},
			create: {
				name: row[NAME],
				id: row[LOGIN],
				zone: row[ZONE],
			},
			update: {
				name: row[NAME],
				zone: row[ZONE],
			},
		});
	}

	await database.qualifierResult.deleteMany({
		where: {
			qualifierId,
		},
	});
	await database.qualifierResult.createMany({
		data: content.map((row) => {
			return {
				playerId: row[LOGIN],
				points: row[POINTS],
				position: row[POSITION],
				qualifierId,
			};
		}),
	});

	await updateLeaderboard(qualifierId);
};

export const updateLeaderboard = async (qualifierId: number) => {
	const qualifier = await database.qualifier.findUnique({
		where: {
			id: qualifierId,
		},
		include: {
			cup: {
				include: {
					leaderboard: true,
				},
			},
		},
	});
	if (qualifier === null)
		throw new Error(`No Qualifier with id ${qualifierId}.`);
	if (qualifier.cup.leaderboard === null)
		throw new Error("Cup has no leaderboard! YEK?");

	const allResultsOfCup = await database.qualifierResult.findMany({
		where: {
			qualifier: {
				cupId: qualifier.cup.id,
			},
		},
	});

	await database.leaderboardEntry.deleteMany({
		where: {
			leaderboardId: qualifier.cup.leaderboard.id,
		},
	});

	const map: Record<string, LeaderboardEntry> = {};

	for (const result of allResultsOfCup) {
		const id = result.playerId;
		const entry = map[id] ?? {
			qualified: false,
			points: 0,
			playerId: id,
			leaderboardId: qualifier.cup.leaderboard.id,
		};

		let points = result.points;
		let qualified = false;
		if (result.position >= 1 && result.position <= 3) {
			qualified = true;
			points = 50000;
		} else if (result.position === 4) {
			points = 15000;
		} else if (result.position === 5) {
			points = 10000;
		} else if (result.points >= POINT_LIMIT) {
			points = 7500;
		}

		entry.points += points;

		if (qualified) {
			entry.qualified = qualified;
		}

		map[id] = entry;
	}

	await database.leaderboardEntry.createMany({
		data: Object.values(map),
	});

	Log.complete(`Updated leaderboard of cup ${qualifier.cup.id}`);
};
