import { Router } from "express";
import { authenticate } from "~/middleware/authenticate";
import { packagesController } from "./packages.controller";

export const packagesRoutes: Router = Router();

packagesRoutes.get("/", authenticate, packagesController.listPackages);
