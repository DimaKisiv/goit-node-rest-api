import { Contact } from "../models/index.js";

async function listContacts(options = {}, userId) {
  const { page, limit, favorite } = options;
  const order = [["created_at", "DESC"]];
  const where = { owner: userId };
  if (favorite !== undefined) {
    where.favorite = favorite;
  }
  if (limit !== undefined && page !== undefined) {
    const safeLimit = Number(limit) > 0 ? Number(limit) : 20;
    const safePage = Number(page) > 0 ? Number(page) : 1;
    const offset = (safePage - 1) * safeLimit;
    const records = await Contact.findAll({
      order,
      where,
      limit: safeLimit,
      offset,
    });
    return records.map((r) => r.toJSON());
  }
  const records = await Contact.findAll({ order, where });
  return records.map((r) => r.toJSON());
}

async function getContactById(contactId, userId) {
  const record = await Contact.findOne({
    where: { id: contactId, owner: userId },
  });
  return record ? record.toJSON() : null;
}

async function removeContact(contactId, userId) {
  const record = await Contact.findOne({
    where: { id: contactId, owner: userId },
  });
  if (!record) return null;
  const removed = record.toJSON();
  await record.destroy();
  return removed;
}

async function addContact(name, email, phone, userId) {
  const record = await Contact.create({ name, email, phone, owner: userId });
  return record.toJSON();
}

async function updateContact(contactId, data, userId) {
  const record = await Contact.findOne({
    where: { id: contactId, owner: userId },
  });
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
async function updateStatusContact(contactId, { favorite }, userId) {
  const record = await Contact.findOne({
    where: { id: contactId, owner: userId },
  });
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
