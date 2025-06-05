import { z } from "zod";

export const PlayerSchema = z.object({
	name: z.string(),
	id: z.string(),
	zone: z.string(),
});
