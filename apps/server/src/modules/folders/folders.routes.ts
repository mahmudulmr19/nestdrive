import { Router } from "express";
import { authenticate } from "~/middleware/authenticate";
import { foldersController } from "./folders.controller";

export const foldersRoutes: Router = Router();

foldersRoutes.use(authenticate);
foldersRoutes.get("/", foldersController.list);
foldersRoutes.post("/", foldersController.create);
foldersRoutes.put("/:id", foldersController.rename);
foldersRoutes.delete("/:id", foldersController.remove);
