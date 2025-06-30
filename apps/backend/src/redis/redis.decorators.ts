import { Inject } from '@nestjs/common';
import { REDIS_MODULE_CONNECTION_TOKEN } from './redis.constants';
export const InjectRedis = (connection?: string) => {
  return Inject(connection || REDIS_MODULE_CONNECTION_TOKEN);
};
