import { Sequelize, DataTypes } from "sequelize";

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

export const Contact = sequelize.define(
  "contact",
  {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    favorite: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "contacts",
    underscored: true,
    timestamps: true,
  }
);

export const User = sequelize.define(
  "user",
  {
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    subscription: {
      type: DataTypes.ENUM("starter", "pro", "business"),
      defaultValue: "starter",
    },
    token: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
  },
  {
    tableName: "users",
    underscored: true,
    timestamps: true,
  }
);

// Associations
User.hasMany(Contact, {
  as: "contacts",
  foreignKey: "owner",
  onDelete: "CASCADE",
});
Contact.belongsTo(User, { as: "ownerUser", foreignKey: "owner" });
