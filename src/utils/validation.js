import Joi from 'joi';

export const validStringSchema = Joi.string().trim().min(1);
