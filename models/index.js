import { User } from "./User.js";
import { Contact } from "./Contact.js";

User.hasMany(Contact, {
  as: "contacts",
  foreignKey: "owner",
  onDelete: "CASCADE",
});
Contact.belongsTo(User, { as: "ownerUser", foreignKey: "owner" });

export { User, Contact };
