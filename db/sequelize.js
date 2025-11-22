import { Sequelize } from "sequelize";

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;

export const sequelize = new Sequelize({
  dialect: "postgres",
  username: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  host: DB_HOST,
  port: Number(DB_PORT),
  dialectOptions: {
    ssl: true,
  },
});
