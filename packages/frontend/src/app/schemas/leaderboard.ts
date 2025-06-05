import { z } from "zod";
import { PlayerSchema } from "./player";

export const LeaderboardEntrySchema = z.object({
	player: PlayerSchema,
	points: z.number(),
	qualified: z.boolean(),
	position: z.number(),
});

export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
