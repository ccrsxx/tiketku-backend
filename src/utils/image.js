import ImageKit from 'imagekit';
import { appEnv } from './env.js';

export const imageKit = new ImageKit({
  publicKey: appEnv.IMAGEKIT_PUBLIC_KEY,
  privateKey: appEnv.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: appEnv.IMAGEKIT_URL_ENDPOINT
});
