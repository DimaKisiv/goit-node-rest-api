import { Contact } from "../db/sequelize.js";

async function listContacts() {
  const records = await Contact.findAll({ order: [["created_at", "DESC"]] });
  return records.map((r) => r.toJSON());
}

async function getContactById(contactId) {
  const record = await Contact.findByPk(contactId);
  return record ? record.toJSON() : null;
}

async function removeContact(contactId) {
  const record = await Contact.findByPk(contactId);
  if (!record) return null;
  const removed = record.toJSON();
  await record.destroy();
  return removed;
}

async function addContact(name, email, phone) {
  const record = await Contact.create({ name, email, phone });
  return record.toJSON();
}

async function updateContact(contactId, data) {
  const record = await Contact.findByPk(contactId);
  if (!record) return null;
  // only update allowed fields
  const payload = {};
  if (data.name !== undefined) payload.name = data.name;
  if (data.email !== undefined) payload.email = data.email;
  if (data.phone !== undefined) payload.phone = data.phone;
  if (data.favorite !== undefined) payload.favorite = data.favorite;
  await record.update(payload);
  return record.toJSON();
}
async function updateStatusContact(contactId, { favorite }) {
  const record = await Contact.findByPk(contactId);
  if (!record) return null;
  await record.update({ favorite });
  return record.toJSON();
}

export {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};

const contactsService = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};

export default contactsService;
