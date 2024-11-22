import { io } from '../loaders/socket.js';
import { prisma } from '../utils/db.js';
import { HttpError } from '../utils/error.js';
import { AuthService } from './auth.js';

/** @import {ValidUserPayload} from '../middlewares/validation/user.js' */

export class UserService {
  /** @param {string} id */
  static async getUser(id) {
    const user = await prisma.user.findUnique({
      where: {
        id
      }
    });

    if (!user) {
      throw new HttpError(404, 'User not found');
    }

    return user;
  }

  static async getUsers() {
    const users = await prisma.user.findMany();

    return users;
  }

  /** @param {ValidUserPayload} user */
  static async createUser(user) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: user.email
      }
    });

    if (existingUser) {
      throw new HttpError(409, 'User already registered');
    }

    user.password = await AuthService.hashPassword(user.password);

    const data = await prisma.user.create({
      data: user
    });

    io.emit(
      'notifications:new-user',
      `A new user has been registered with email ${data.email}`
    );

    return data;
  }

  /**
   * @param {string} id
   * @param {ValidUserPayload} payload
   */
  static async updateUserProfile(id, payload) {
    const existingUser = await prisma.user.findUnique({
      where: {
        id
      }
    });

    if (!existingUser) {
      throw new HttpError(404, 'User not found');
    }

    const { image } = payload;

    const data = await prisma.user.update({
      where: {
        id
      },
      data: {
        image
      }
    });

    return data;
  }
}
