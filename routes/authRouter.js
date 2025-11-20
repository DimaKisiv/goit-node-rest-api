import express from "express";
import validateBody from "../helpers/validateBody.js";
import {
  registerSchema,
  loginSchema,
  updateSubscriptionSchema,
} from "../schemas/authSchemas.js";
import {
  register,
  login,
  logout,
  getCurrent,
  updateSubscription,
} from "../controllers/authControllers.js";
import authMiddleware from "../helpers/authMiddleware.js";

const authRouter = express.Router();

authRouter.post("/register", validateBody(registerSchema), register);
authRouter.post("/login", validateBody(loginSchema), login);
authRouter.post("/logout", authMiddleware, logout);
authRouter.get("/current", authMiddleware, getCurrent);
authRouter.patch(
  "/subscription",
  authMiddleware,
  validateBody(updateSubscriptionSchema),
  updateSubscription
);

export default authRouter;
