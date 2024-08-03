import express from "express";
import { CupsController } from "../controllers";

const router = express.Router();

router.get("/", CupsController.getAllCups);
router.get("/current", CupsController.getCurrentCup);
router.get("/qualifier/:id", CupsController.getQualifierResults);
router.get("/leaderboard/:id", CupsController.getCupLeaderboard);

export default router;