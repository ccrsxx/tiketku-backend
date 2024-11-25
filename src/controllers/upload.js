/** @import {Request,Response} from 'express' */

/**
 * @param {Request} _req
 * @param {Response<unknown, { image: string }>} res
 */
function uploadImage(_req, res) {
  const image = res.locals.image;

  res.status(200).json({ data: { image } });
}

export const UploadController = {
  uploadImage
};
