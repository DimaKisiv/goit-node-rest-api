import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import {
  generateAndSaveAvatar,
  saveUploadedAvatar,
} from "../helpers/avatarHelper.js";
import { User } from "../models/index.js";
import HttpError from "../helpers/HttpError.js";
import { sendVerificationEmailLink } from "../helpers/mailHelper.js";

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      throw HttpError(409, "Email in use");
    }

    const hash = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();
    const user = await User.create({
      email,
      password: hash,
      verificationToken,
      verify: false,
    });
    const { avatarURL } = await generateAndSaveAvatar(email, user.id);
    user.avatarURL = avatarURL;
    await user.save();

    try {
      await sendVerificationEmailLink(email, verificationToken);
    } catch (e) {
      console.error("Failed to send verification email:", e?.message || e);
    }

    res.status(201).json({
      user: {
        email: user.email,
        subscription: user.subscription,
        avatarURL: user.avatarURL,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await User.findOne({ where: { verificationToken } });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    user.verify = true;
    user.verificationToken = null;
    await user.save();
    res.status(200).json({ message: "Verification successful" });
  } catch (err) {
    next(err);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      throw HttpError(401, "Not authorized");
    }
    const file = req.file;
    if (!file) {
      throw HttpError(400, "No file uploaded");
    }

    const { avatarURL: publicUrl } = await saveUploadedAvatar(file, user.id);
    user.avatarURL = publicUrl;
    await user.save();

    res.status(200).json({ avatarURL: publicUrl });
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
    if (!user.verify) {
      throw HttpError(401, "Email not verified");
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

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ message: "missing required field email" });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw HttpError(404, "User not found");
    }
    if (user.verify) {
      return res
        .status(400)
        .json({ message: "Verification has already been passed" });
    }
    let token = user.verificationToken;
    if (!token) {
      token = nanoid();
      user.verificationToken = token;
      await user.save();
    }
    await sendVerificationEmailLink(email, token);
    res.status(200).json({ message: "Verification email sent" });
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
