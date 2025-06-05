import { z } from "zod";
import { LeaderboardEntrySchema } from "./leaderboard";
import { AdminQualifierSchema, QualifierSchema } from "./qualifier";

export const AdminCupSchema = z.object({
	id: z.string(),
	year: z.number(),
	month: z.number(),
	public: z.boolean(),
	current: z.boolean(),
	name: z.string(),
});
export type AdminCup = z.infer<typeof AdminCupSchema>;

export const CupSchema = z.object({
	id: z.string(),
	year: z.number(),
	month: z.number(),
	name: z.string(),
	qualifier: z.array(QualifierSchema),
	leaderboard: z.object({
		id: z.string(),
		cupId: z.string(),
		entries: z.array(LeaderboardEntrySchema),
	}),
});
export type Cup = z.infer<typeof CupSchema>;

export const AdminCupDetailsSchema = AdminCupSchema.extend({
	qualifier: z.array(AdminQualifierSchema),
});
export type AdminCupDetails = z.infer<typeof AdminCupDetailsSchema>;
