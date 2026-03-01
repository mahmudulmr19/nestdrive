import { Router } from "express";
import { authenticate } from "~/middleware/authenticate";
import { authorize } from "~/middleware/authorize";
import { packagesController } from "./packages.controller";

export const adminRoutes: Router = Router();

adminRoutes.use(authenticate, authorize("ADMIN"));

adminRoutes.get("/packages", packagesController.listPackages);
adminRoutes.get("/packages/:id", packagesController.getPackage);
adminRoutes.post("/packages", packagesController.createPackage);
adminRoutes.put("/packages/:id", packagesController.updatePackage);
adminRoutes.delete("/packages/:id", packagesController.deletePackage);
