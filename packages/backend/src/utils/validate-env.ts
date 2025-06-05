import "dotenv/config";
import { cleanEnv, port, str } from "envalid";

export default cleanEnv(process.env, {
	PORT: port(),
	ADMIN_USERNAME: str(),
	ADMIN_PASSWORD: str(),
	JWT_SECRET: str(),
	DATABASE_URL: str(),
});
