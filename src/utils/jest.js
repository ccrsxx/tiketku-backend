import { jest } from '@jest/globals';
import { Prisma } from '@prisma/client';

/** @typedef {Prisma.TypeMap['meta']['modelProps']} ModelName */

/** @typedef {keyof Prisma.TypeMap['model']['User']['operations']} ModelAction */

/**
 * @typedef {{
 *   [Model in ModelName]: {
 *     [Action in ModelAction]: jest.Mock;
 *   };
 * }} PrismaMock
 */

/** @typedef {{ prisma: PrismaMock & { $transaction: jest.Mock } }} GeneratedPrismaMock */

/** @returns {GeneratedPrismaMock} */
export function generatePrismaMock() {
  const modelsName = /** @type {ModelName[]} */ (
    Prisma.dmmf.datamodel.models.map(({ name }) => name.toLowerCase())
  );

  /** @type {Record<ModelAction, jest.Mock>} */
  const modelOperation = {
    count: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    groupBy: jest.fn(),
    findMany: jest.fn(),
    aggregate: jest.fn(),
    findFirst: jest.fn(),
    updateMany: jest.fn(),
    createMany: jest.fn(),
    deleteMany: jest.fn(),
    findUnique: jest.fn(),
    findFirstOrThrow: jest.fn(),
    findUniqueOrThrow: jest.fn(),
    createManyAndReturn: jest.fn()
  };

  const prismaMock = modelsName.reduce((modelAccumulator, modelName) => {
    modelAccumulator[modelName] = modelOperation;
    return modelAccumulator;
  }, /** @type {PrismaMock} */ ({}));

  return {
    prisma: {
      ...prismaMock,
      $transaction: jest.fn()
    }
  };
}

/**
 * @typedef {{
 *   req?: Record<string, unknown>;
 *   res?: Record<string, unknown>;
 * }} ExpressMockOptions
 */

/** @param {ExpressMockOptions} options */
export function setupExpressMock({ req = {}, res = {} } = {}) {
  const parsedReq = {
    ...req
  };

  const parsedRes = {
    json: jest.fn(),
    status: jest.fn().mockReturnThis(),
    locals: {},
    ...res
  };

  const next = jest.fn();

  return { req: parsedReq, res: parsedRes, next };
}

/** @param {() => unknown | Promise<unknown>} fn */
export async function getFunctionThrownError(fn) {
  try {
    await fn();
  } catch (error) {
    return error;
  }
}
