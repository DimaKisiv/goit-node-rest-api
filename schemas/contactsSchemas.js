import Joi from "joi";

export const createContactSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(5).required(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(2),
  email: Joi.string().email(),
  phone: Joi.string().min(5),
})
  .min(1)
  .messages({
    "object.min": "Body must have at least one field",
  });
