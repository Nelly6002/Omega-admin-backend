import express from "express";
import { createBusiness, getBusinesses } from "../controllers/businessController.js";

const router = express.Router();

// Public endpoints: creating a business and listing approved businesses are public
router.post("/", createBusiness);
router.get("/", getBusinesses);

export default router;
