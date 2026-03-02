import { Router } from "express";
import { authenticate } from "~/middleware/authenticate";
import { subscriptionsController } from "./subscriptions.controller";

export const subscriptionsRoutes: Router = Router();

subscriptionsRoutes.use(authenticate);
subscriptionsRoutes.get("/me", subscriptionsController.getMe);
subscriptionsRoutes.post("/", subscriptionsController.subscribe);
subscriptionsRoutes.get("/history", subscriptionsController.getHistory);
