import express from "express";
import { AdminController } from "../controllers";
import { requiresAuthentication } from "../middlewares/authentication";

const router = express.Router();

router.post("/cup/create", requiresAuthentication, AdminController.createCup);
router.post(
	"/cup/:cupId/qualifier/:qualifierId/update",
	requiresAuthentication,
	AdminController.updateQualifier,
);
router.delete(
	"/cup/:cupId/qualifier/:qualifierId/clear",
	requiresAuthentication,
	AdminController.clearQualifier,
);
router.delete(
	"/cup/:cupId/qualifier/:qualifierId/delete",
	requiresAuthentication,
	AdminController.deleteQualifier,
)
router.post(
	"/cup/:cupId/qualifier/create",
	requiresAuthentication,
	AdminController.createQualifier,
)

router.get("/cups", requiresAuthentication, AdminController.getAllCups);
router.delete(
	"/cup/:cupId/delete",
	requiresAuthentication,
	AdminController.deleteCup,
);
router.post(
	"/cup/:cupId/public",
	requiresAuthentication,
	AdminController.setCupVisibility,
);
router.post(
	"/cup/:cupId/current",
	requiresAuthentication,
	AdminController.setCupToCurrent,
);
router.get(
	"/cup/:cupId",
	requiresAuthentication,
	AdminController.getCupDetails,
);
router.post(
	"/cup/:cupId/rename",
	requiresAuthentication,
	AdminController.renameCup,
);


export default router;
