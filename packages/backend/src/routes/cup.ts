import express from "express";
import { CupsController } from "../controllers";

const router = express.Router();

router.get("/", CupsController.getAllCups);
router.get("/current", CupsController.getCurrentCup);
router.get("/qualifier/:qualifierId", CupsController.getQualifierResults);
router.get("/leaderboard/:cupId", CupsController.getCupLeaderboard);

export default router;
