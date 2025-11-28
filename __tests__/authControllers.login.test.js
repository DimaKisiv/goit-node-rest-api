import { jest, describe, test, expect, beforeEach } from "@jest/globals";

process.env.JWT_SECRET = "test_secret";

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const next = jest.fn();

jest.unstable_mockModule("../models/index.js", () => ({
  User: {
    findOne: jest.fn(),
  },
}));

jest.unstable_mockModule("bcryptjs", () => ({
  default: {
    compare: jest.fn(),
  },
}));

jest.unstable_mockModule("jsonwebtoken", () => ({
  default: {
    sign: jest.fn(),
  },
}));

const { User } = await import("../models/index.js");
const bcrypt = (await import("bcryptjs")).default;
const jwt = (await import("jsonwebtoken")).default;
const { login } = await import("../controllers/authControllers.js");

describe("login controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("responds 200, returns token and user object", async () => {
    const email = "dima@email.com";
    const password = "12345678";
    const userRecord = {
      id: 1,
      email,
      password: "hashed",
      subscription: "starter",
      save: jest.fn().mockResolvedValue(undefined),
    };

    User.findOne.mockResolvedValue(userRecord);
    bcrypt.compare.mockResolvedValue(true);
    jwt.sign.mockReturnValue("mock_token");

    const req = { body: { email, password } };
    const res = createRes();

    await login(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();

    const payload = res.json.mock.calls[0][0];
    expect(typeof payload.token).toBe("string");

    expect(payload.user).toBeDefined();
    expect(typeof payload.user.email).toBe("string");
    expect(typeof payload.user.subscription).toBe("string");
  });

  test("responds 401 when user not found", async () => {
    const email = "nouser@example.com";
    const password = "12345678";

    User.findOne.mockResolvedValue(null);

    const req = { body: { email, password } };
    const res = createRes();

    await login(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Email or password is wrong");
  });

  test("responds 401 when password mismatch", async () => {
    const email = "user@example.com";
    const password = "badpass";
    const userRecord = {
      id: 1,
      email,
      password: "hashed",
      subscription: "starter",
      save: jest.fn().mockResolvedValue(undefined),
    };

    User.findOne.mockResolvedValue(userRecord);
    bcrypt.compare.mockResolvedValue(false);

    const req = { body: { email, password } };
    const res = createRes();

    await login(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(401);
    expect(err.message).toBe("Email or password is wrong");
  });

  test("responds 500 when JWT secret is missing", async () => {
    const prevSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    const email = "user@example.com";
    const password = "pass1234";
    const userRecord = {
      id: 1,
      email,
      password: "hashed",
      subscription: "starter",
      save: jest.fn().mockResolvedValue(undefined),
    };

    User.findOne.mockResolvedValue(userRecord);
    bcrypt.compare.mockResolvedValue(true);

    const req = { body: { email, password } };
    const res = createRes();

    await login(req, res, next);

    expect(next).toHaveBeenCalled();
    const err = next.mock.calls[0][0];
    expect(err.status).toBe(500);
    expect(err.message).toBe("JWT secret not configured");

    process.env.JWT_SECRET = prevSecret;
  });
});
