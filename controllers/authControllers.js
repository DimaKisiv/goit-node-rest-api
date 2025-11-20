import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db/sequelize.js";
import HttpError from "../helpers/HttpError.js";

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw HttpError(409, "Email in use");
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hash });

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw HttpError(401, "Email or password is wrong");
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw HttpError(401, "Email or password is wrong");
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw HttpError(500, "JWT secret not configured");
    }
    const payload = { id: user.id };
    const token = jwt.sign(payload, secret, { expiresIn: "1h" });
    user.token = token;
    await user.save();
    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getCurrent = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw HttpError(401, "Not authorized");
    }
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (err) {
    next(err);
  }
};

export const updateSubscription = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw HttpError(401, "Not authorized");
    }
    const { subscription } = req.body;
    user.subscription = subscription;
    await user.save();
    res.status(200).json({
      email: user.email,
      subscription: user.subscription,
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw HttpError(401, "Not authorized");
    }
    user.token = null;
    await user.save();
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
