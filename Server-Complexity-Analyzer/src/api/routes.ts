import { Router } from "express";
import ExampleRoutes from "./example/example.routes";

const router = Router();
router.use("/example", ExampleRoutes);

export default router;
