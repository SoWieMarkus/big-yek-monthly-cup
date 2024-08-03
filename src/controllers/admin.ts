import type { RequestHandler } from "express";
import { database } from "../database";
import createHttpError from "http-errors";
import Joi from "joi";
import { calculateLeaderboard, updateLeaderboard } from "../services/leaderboard";

const createCupBodySchema = Joi.object({
    year: Joi.number().integer().min(2024).required(),
    month: Joi.number().integer().min(0).max(11).required()
});


const displayMonth = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]

export const getDisplayNameOfMonth = (month: number) => {
    return displayMonth[month - 1]
}

export const getCupDisplayName = (year: number, month: number) => {
    return `BYMC ${year}-${getDisplayNameOfMonth(month)}`;
}

export const createCup: RequestHandler = async (request, response, next) => {

    try {
        const parsedBody = createCupBodySchema.validate(request.body);

        if (parsedBody.error) {
            return next(createHttpError(400, parsedBody.error));
        }

        const cups = await database.cup.findMany();

        const { year, month } = parsedBody.value;
        const cup = await database.cup.create({
            data: {
                year,
                month,
                public: false,
                current: cups.length === 0,
                name: getCupDisplayName(year, month)
            }
        });

        await database.qualifier.createMany({
            data: [
                {
                    version: 1,
                    cupId: cup.id,
                },
                {
                    version: 2,
                    cupId: cup.id,
                },
                {
                    version: 3,
                    cupId: cup.id,
                }
            ]
        })

        await database.final.create({
            data: {
                cupId: cup.id
            }
        })

        await database.leaderboard.create({
            data: {
                cupId: cup.id
            }
        })

        response.json(cup).status(200);
    } catch (error) {
        console.error(error);
        next(createHttpError(500, "Error while creating cup."));
    }
}

const cupVisibilityBodySchema = Joi.object({
    visible: Joi.boolean().required()
});

export const setCupVisibility: RequestHandler = async (request, response, next) => {
    try {
        const parsedBody = cupVisibilityBodySchema.validate(request.body);

        if (parsedBody.error) {
            return next(createHttpError(400, parsedBody.error));
        }
        const { id } = request.params;
        const { visible } = parsedBody.value;
        const cup = await database.cup.update({
            where: {
                id: Number.parseInt(id),
            },
            data: {
                public: visible
            }
        })
        response.json(cup).status(200);
    } catch (error) {
        console.error(error);
        next(createHttpError(500, "Error while updating cup visibility."));
    }
}

const cupNameBodySchema = Joi.object({
    name: Joi.string().required().min(1).max(100)
});

export const renameCup: RequestHandler = async (request, response, next) => {
    try {
        const parsedBody = cupNameBodySchema.validate(request.body);

        if (parsedBody.error) {
            return next(createHttpError(400, parsedBody.error));
        }
        const { id } = request.params;
        const { name } = parsedBody.value;
        const cup = await database.cup.update({
            where: {
                id: Number.parseInt(id),
            },
            data: {
                name: name
            }
        })
        response.json(cup).status(200);
    } catch (error) {
        console.error(error);
        next(createHttpError(500, "Error while updating cup name."));
    }
}

export const deleteCup: RequestHandler = (request, response, next) => {
    const { id } = request.params;
    database.cup.delete({
        where: {
            id: Number.parseInt(id),
        },
    }).then(cup => response.json(cup).status(200)).catch(error => {
        console.error(error);
        next(createHttpError(500, "Error while deleting cup."))
    });
}

export const setCupToCurrent: RequestHandler = async (request, response, next) => {
    const { id } = request.params;

    try {
        await database.cup.updateMany({
            data: {
                current: false
            }
        })
        const cup = await database.cup.update({
            where: {
                id: Number.parseInt(id),
            },
            data: {
                current: true
            }
        });
        response.json(cup).status(200)
    } catch {
        next(createHttpError(500, "Error while deleting cup."))
    }


}

export const getCupDetails: RequestHandler = (request, response, next) => {
    const { id } = request.params;
    database.cup.findUnique({
        where: {
            id: Number.parseInt(id)
        },
        include: {
            qualifier: {
                include: {
                    _count: {
                        select: { results: true },
                    },
                },
            },
            final: {
                include: {
                    _count: {
                        select: { results: true },
                    },
                },
            },
            leaderboard: {
                include: {
                    _count: {
                        select: { entries: true },
                    },
                },
            },
        }
    })
        .then(cup => response.json(cup).status(200))
        .catch(error => {
            console.error(error);
            next(createHttpError(500, `Can't query cup with if ${id}`));

        })
}

const recordSchema = Joi.array().items(
    Joi.number().required(),
    Joi.number().required(),
    Joi.string().required(),
    Joi.string().required(),
    Joi.string().required()
);

const dataSchema = Joi.array().items(recordSchema).min(1)

export const updateQualifier: RequestHandler = (request, response, next) => {
    const { qualifierId } = request.params;
    const parsedBody = dataSchema.validate(request.body);
    if (parsedBody.error) {
        return next(createHttpError(400, parsedBody.error));
    }
    calculateLeaderboard(Number.parseInt(qualifierId), parsedBody.value).then(_ => {
        response.status(200).json({});
    }).catch(() => {
        next(createHttpError(400, "Failed to parse data to leaderboard."))
    });

}

export const clearQualifier: RequestHandler = (request, response, next) => {
    const { qualifierId } = request.params;

    database.qualifierResult.deleteMany({
        where: {
            qualifierId: Number.parseInt(qualifierId)
        }
    }).then(async _ => {
        await updateLeaderboard(Number.parseInt(qualifierId))
        response.status(200).json({});
    }).catch(() => {
        next(createHttpError(400, "Failed to parse data to leaderboard."))
    });

}

export const getAllCups: RequestHandler = (request, response, next) => {
    database.cup.findMany({
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