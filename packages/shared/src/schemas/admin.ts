import { z } from "zod";

export const create = z.object({
	year: z.number().int().min(2000).max(2100),
	month: z.number().int().min(0).max(11),
});

export const visibility = z.object({
	visible: z.boolean(),
});

export const rename = z.object({
	name: z.string().min(1).max(100),
});

export const resultEntry = z.tuple([z.coerce.number(), z.coerce.number(), z.string(), z.string(), z.string()]);

export const updateQualifier = z.object({
	data: z.array(resultEntry).min(1),
	server: z.number().min(1),
});

export const createQualifier = z.object({
	version: z.number().int().min(1).max(100),
});

export const updateQualifierVersion = createQualifier;
