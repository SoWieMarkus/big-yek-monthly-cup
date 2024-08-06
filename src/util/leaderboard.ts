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

export const updateResults = async (
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
};

export const updateLeaderboard = async (cupId: number) => {
	const cup = await database.cup.findUnique({
		where: {
			id: cupId,
		},
		include: {
			leaderboard: true,
		}
	});
	if (cup === null)
		throw new Error(`No Cup with id ${cupId}.`);
	if (cup.leaderboard === null)
		throw new Error("Cup has no leaderboard! YEK?");

	const allResultsOfCup = await database.qualifierResult.findMany({
		where: {
			qualifier: {
				cupId: cup.id,
			},
		},
	});

	await database.leaderboardEntry.deleteMany({
		where: {
			leaderboardId: cup.leaderboard.id,
		},
	});

	const map: Record<string, LeaderboardEntry> = {};

	for (const result of allResultsOfCup) {
		const id = result.playerId;
		const entry = map[id] ?? {
			qualified: false,
			points: 0,
			playerId: id,
			leaderboardId: cup.leaderboard.id,
			position: 0
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

	const leaderboard = Object.values(map);
	leaderboard.sort((a, b) => b.points - a.points);

	let currentRank = 1;
	let previousAmount: number | undefined = undefined;
	let rankCount = 0;

	for (const entry of leaderboard) {
		if (entry.qualified) {
			rankCount++;
		} else if (previousAmount !== entry.points) {
			currentRank += rankCount;
			rankCount = 1;
		} else {
			rankCount++;
		}

		entry.position = currentRank;
		previousAmount = entry.points;
	}

	await database.leaderboardEntry.createMany({
		data: Object.values(map),
	});

	Log.complete(`Updated leaderboard of cup ${cup.id}`);
};
