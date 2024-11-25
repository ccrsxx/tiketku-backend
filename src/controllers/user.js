import { UserService } from '../services/user.js';

/** @import {Request,Response} from 'express' */
/** @import {User} from '@prisma/client' */
/** @import {ValidUserPayload} from '../middlewares/validation/user.js' */

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
 * @param {Request<{ id: string }, ValidUserPayload>} req
 * @param {Response<unknown, { user: User }>} res
 */
async function updateCurrentUserProfile(req, res) {
  const user = await UserService.updateUserProfile(
    res.locals.user.id,
    req.body
  );

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
 * @param {Request<unknown, unknown, ValidUserPayload>} req
 * @param {Response} res
 */
async function createUser(req, res) {
  const user = await UserService.createUser(req.body);

  res.status(201).json({ data: user });
}

export const UserController = {
  getUser,
  getCurrentUser,
  updateCurrentUserProfile,
  getUsers,
  createUser
};
