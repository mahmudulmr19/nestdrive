import { Router } from "express";
import { authController } from "./auth.controller";

export const authRoutes: Router = Router();

authRoutes.post("/register", authController.registerUser);
authRoutes.post("/login", authController.loginUser);
