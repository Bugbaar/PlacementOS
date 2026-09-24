import dotenv from 'dotenv';
import { getEnv, resetEnvCache, type AppEnv } from './env';

dotenv.config();
resetEnvCache();

/** Validated process env — import this module before other app modules that need secrets. */
export const env: AppEnv = getEnv();
