import { Router } from "express";
import { getExample } from "./example.controller";

const router = Router();
router.route("/").get(getExample);

export default router;
