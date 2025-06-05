import { z } from "zod";

export const QualifierSchema = z.object({
	id: z.string(),
	version: z.number(),
	cupId: z.string(),
});
export type Qualifier = z.infer<typeof QualifierSchema>;

export const AdminQualifierSchema = QualifierSchema.extend({
	_count: z.object({
		results: z.number(),
	}),
});

export type AdminQualifier = z.infer<typeof AdminQualifierSchema>;
