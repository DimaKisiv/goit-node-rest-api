import jwt from "jsonwebtoken";
import HttpError from "./HttpError.js";
import { User } from "../db/sequelize.js";

const authMiddleware = async (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [scheme, token] = authHeader.split(" ");
    if (scheme !== "Bearer" || !token) {
      throw HttpError(401, "Not authorized");
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw HttpError(500, "Server misconfiguration");
    }
    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw HttpError(401, "Not authorized");
    }
    const user = await User.findByPk(payload.id);
    if (!user || user.token !== token) {
      throw HttpError(401, "Not authorized");
    }
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
