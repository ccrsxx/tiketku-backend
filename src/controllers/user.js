import { UserService } from '../services/user.js';

/** @import {Request,Response} from 'express' */
/** @import {User} from '@prisma/client' */
/** @import {ValidCreateUserPayload,ValidUpdateUserPayload} from '../middlewares/validation/user.js' */

/**
 * @param {Request<{ id: string }>} req
 * @param {Response} res
 */
async function getUser(req, res) {
  const user = await UserService.getUser(req.params.id);

  res.status(200).json({ data: user });
}

/**
 * @param {Request<{ id: string }>} _req
 * @param {Response<unknown, { user: User }>} res
 */
async function getCurrentUser(_req, res) {
  const user = res.locals.user;

  res.status(200).json({ data: user });
}

/**
 * @param {Request} _req
 * @param {Response} res
 */
async function getUsers(_req, res) {
  const users = await UserService.getUsers();

  res.status(200).json({ data: users });
}

/**
 * @param {Request<unknown, unknown, ValidCreateUserPayload>} req
 * @param {Response} res
 */
async function createUser(req, res) {
  const user = await UserService.createUser(req.body);

  res.status(201).json({ data: user });
}

/**
 * @param {Request<unknown, unknown, ValidUpdateUserPayload>} req
 * @param {Response<unknown, { user: User }>} res
 */
async function updateCurrentUser(req, res) {
  await UserService.updateUser(res.locals.user.id, req.body);

  res.status(200).json({ message: 'User updated successfully' });
}

export const UserController = {
  getUser,
  getUsers,
  createUser,
  getCurrentUser,
  updateCurrentUser
};
