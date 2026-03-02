import { Router } from "express";
import { authenticate } from "~/middleware/authenticate";
import { filesController } from "./files.controller";

export const filesRoutes: Router = Router();

filesRoutes.use(authenticate);
filesRoutes.post("/presign", filesController.presign);
filesRoutes.post("/confirm", filesController.confirm);
filesRoutes.get("/", filesController.list);
filesRoutes.get("/:id/url", filesController.getUrl);
filesRoutes.delete("/:id", filesController.remove);
