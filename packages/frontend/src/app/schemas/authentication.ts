import { z } from "zod";
export const AuthenticationSchema = z.object({
	token: z.string(),
});
