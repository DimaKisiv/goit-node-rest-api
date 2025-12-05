import nodemailer from "nodemailer";

export const sendVerificationEmail = async (to, verifyLink) => {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: true,
    auth: { user, pass },
  });

  const from = process.env.SMTP_FROM;

  const info = await transporter.sendMail({
    from,
    to,
    subject: "Verify your email",
    text: `Please verify your email by visiting: ${verifyLink}`,
    html: `<p>Please verify your email by clicking <a href="${verifyLink}">this link</a>.</p>`,
  });

  return info;
};

export const sendVerificationEmailLink = async (to, token) => {
  const baseUrl =
    process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
  const verifyLink = `${baseUrl}/api/auth/verify/${token}`;
  return sendVerificationEmail(to, verifyLink);
};
