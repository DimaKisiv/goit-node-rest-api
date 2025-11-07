import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { nanoid } from "nanoid";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const contactsPath = path.join(__dirname, "../db", "contacts.json");

async function readContactsFile() {
  const data = await fs.readFile(contactsPath, "utf-8");
  return JSON.parse(data);
}

async function writeContactsFile(contacts) {
  await fs.writeFile(contactsPath, JSON.stringify(contacts, null, 2));
}

async function listContacts() {
  return await readContactsFile();
}

async function getContactById(contactId) {
  const contacts = await readContactsFile();
  const id = String(contactId);
  return contacts.find((c) => c.id === id) || null;
}

async function removeContact(contactId) {
  const contacts = await readContactsFile();
  const id = String(contactId);
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const [removed] = contacts.splice(index, 1);
  await writeContactsFile(contacts);
  return removed;
}

async function addContact(name, email, phone) {
  const contacts = await readContactsFile();
  const newContact = {
    id: nanoid(),
    name,
    email,
    phone,
  };
  contacts.push(newContact);
  await writeContactsFile(contacts);
  return newContact;
}

async function updateContact(contactId, data) {
  const contacts = await readContactsFile();
  const id = String(contactId);
  const index = contacts.findIndex((c) => c.id === id);
  if (index === -1) return null;
  const current = contacts[index];
  const updated = { ...current, ...data };
  contacts[index] = updated;
  await writeContactsFile(contacts);
  return updated;
}

export {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
};
