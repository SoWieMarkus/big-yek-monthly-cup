import app from "./app";
import { Log, env } from "./util";

Log.info("Booting ...");
app.listen(env.PORT, () => Log.complete(`Running on port "${env.PORT}"`));
