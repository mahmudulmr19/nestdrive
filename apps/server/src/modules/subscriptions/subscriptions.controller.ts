import type { Request, Response } from "express";
import { subscriptionsService } from "./subscriptions.service";
import { SubscribeSchema } from "@nestdrive/schemas/subscription";

const getMe = async (req: Request, res: Response) => {
  const subscription = await subscriptionsService.getActiveSubscription(
    req.user.userId,
  );
  return res.status(200).json(subscription);
};

const subscribe = async (req: Request, res: Response) => {
  const body = SubscribeSchema.parse(req.body);
  const subscription = await subscriptionsService.subscribe(
    req.user.userId,
    body,
  );
  return res.status(201).json(subscription);
};

const getHistory = async (req: Request, res: Response) => {
  const history = await subscriptionsService.getHistory(req.user.userId);
  return res.status(200).json(history);
};

export const subscriptionsController = {
  getMe,
  subscribe,
  getHistory,
};
