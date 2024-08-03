import type { RequestHandler } from "express";
import { database } from "../database"
import createHttpError from "http-errors";

export const getAllCups: RequestHandler = (request, response, next) => {
    database.cup.findMany({
        where: {
            public: true
        },
        orderBy: [
            {
                year: "desc"
            },
            {
                month: "desc"
            },
        ]
    })
        .then(cups => response.json(cups).status(200))
        .catch(error => next(createHttpError(500, error.message)))
}

export const getCurrentCup: RequestHandler = async (request, response, next) => {
    try {
        const cups = await database.cup.findMany({
            where: {
                public: true,
                current: true
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
                                    points: "desc"
                                }
                            ],
                            select: {
                                player: true,
                                points: true,
                                qualified: true,

                            }
                        }
                    }
                }
            }
        });

        if (cups.length === 0) {
            throw createHttpError(404, "There is no current cup.")
        }

        response.json(cups[0]).status(200)
    } catch (error) {
        next(createHttpError(500, "Failed to get current cup."))
        console.error(error);
    }
}


export const getQualifierResults: RequestHandler = (request, response, next) => {
    const { id } = request.params;
    database.qualifierResult.findMany({
        where: {
            qualifier: {
                id: Number.parseInt(id),
                cup: {
                    public: true
                }
            }
        },
        orderBy: [
            {
                position: "asc"
            }
        ]
    }).then(results => response.json(results).status(200))
        .catch(error => next(createHttpError(500, error.message)))
}


export const getCupLeaderboard: RequestHandler = (request, response, next) => {
    const { id } = request.params;
    database.leaderboardEntry.findMany({
        where: {
            leaderboard: {
                cup: {
                    id: Number.parseInt(id),
                    public: true
                }
            }
        },
        orderBy: [
            {
                qualified: "desc",
            },
            {
                points: "desc"
            }
        ],
        select: {
            player: true,
            points: true,
            qualified: true,

        }
    }).then(results => response.json(results).status(200))
        .catch(error => next(createHttpError(500, error.message)))
}