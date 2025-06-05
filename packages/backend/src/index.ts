import app from "./app";
import { env, logger } from "./utils";

logger.info("Booting ...");
app.listen(env.PORT, () => logger.info(`Running on port "${env.PORT}"`));
