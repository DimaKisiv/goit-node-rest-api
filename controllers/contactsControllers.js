import {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact as updateContactService,
} from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (_req, res, next) => {
  try {
    const contacts = await listContacts();
    res.status(200).json(contacts);
  } catch (err) {
    next(err);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const contact = await getContactById(id);
    if (!contact) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(contact);
  } catch (err) {
    next(err);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const removed = await removeContact(id);
    if (!removed) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(removed);
  } catch (err) {
    next(err);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;
    const newContact = await addContact(name, email, phone);
    res.status(201).json(newContact);
  } catch (err) {
    next(err);
  }
};

export const updateContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await updateContactService(id, data);
    if (!updated) {
      throw HttpError(404, "Not found");
    }
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
};
