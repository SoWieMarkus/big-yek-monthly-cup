import express from "express";
import { AdminController } from "../controllers";
import { requiresAuthentication } from "../middlewares/authentication"

const router = express.Router();

router.post("/cup/create", requiresAuthentication, AdminController.createCup);
router.post("/cup/qualifier/update/:qualifierId", requiresAuthentication, AdminController.updateQualifier);
router.delete("/cup/qualifier/clear/:qualifierId", requiresAuthentication, AdminController.clearQualifier);

router.get("/cups", requiresAuthentication, AdminController.getAllCups);
router.delete("/cup/delete/:id", requiresAuthentication, AdminController.deleteCup);
router.post("/cup/public/:id", requiresAuthentication, AdminController.setCupVisibility);
router.post("/cup/current/:id", requiresAuthentication, AdminController.setCupToCurrent);
router.get("/cup/:id", requiresAuthentication, AdminController.getCupDetails);
router.post("/cup/rename/:id", requiresAuthentication, AdminController.renameCup);

export default router;