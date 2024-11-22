import { UserService } from '../services/user.js';
import { AuthService } from '../services/auth.js';

/** @import {Request,Response} from 'express' */
/** @import {ValidResetPasswordPayload} from '../middlewares/validation/auth.js' */
/** @import {ValidUserPayload} from '../middlewares/validation/user.js' */
/** @import {ValidEmailPayload} from '../middlewares/validation/common.js' */

export class AuthController {
  /**
   * @param {Request<{ id: string }>} req
   * @param {Response} res
   */
  static async login(req, res) {
    const userWithToken = await AuthService.login(req.body);

    res.status(200).json({ data: userWithToken });
  }

  /**
   * @param {Request<unknown, unknown, ValidUserPayload>} req
   * @param {Response} res
   */
  static async register(req, res) {
    const user = await UserService.createUser(req.body);

    res.status(201).json({ data: user });
  }

  /**
   * @param {Request<unknown, unknown, ValidEmailPayload>} req
   * @param {Response} res
   */
  static async sendPasswordResetEmail(req, res) {
    await AuthService.sendPasswordResetEmail(req.body.email);

    res
      .status(200)
      .json({ message: 'Password reset email sent if email exists' });
  }

  /**
   * @param {Request<unknown, unknown, ValidResetPasswordPayload>} req
   * @param {Response} res
   */
  static async resetPassword(req, res) {
    await AuthService.resetPassword(req.body);

    res.status(200).json({ message: 'Password reset successful' });
  }

  /**
   * @param {Request<{ token: string }>} req
   * @param {Response} res
   */
  static async verifyPasswordResetToken(req, res) {
    await AuthService.verifyPasswordResetToken(req.params.token);

    res.status(200).json({ message: 'Password reset token is valid' });
  }
}
