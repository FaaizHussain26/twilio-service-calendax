import express from "express";
import { DashboardController } from "../controllers/dashboard.controller";

const router = express.Router();

router.get("/prescreener/stats", DashboardController.dashboardStats);
export default router;
