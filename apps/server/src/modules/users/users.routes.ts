import { Router } from "express";
import { authenticate } from "~/middleware/authenticate";
import { usersController } from "./users.controller";

export const usersRoutes: Router = Router();

usersRoutes.get("/me", authenticate, usersController.getMe);
