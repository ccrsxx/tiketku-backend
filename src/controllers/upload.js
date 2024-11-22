/** @import {Request,Response} from 'express' */

export class UploadController {
  /**
   * @param {Request} _req
   * @param {Response<unknown, { image: string }>} res
   */
  static uploadImage(_req, res) {
    const image = res.locals.image;

    res.status(200).json({ data: { image } });
  }
}
