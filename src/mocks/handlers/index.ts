import { authHandlers } from './auth.handlers';
import { usersHandlers } from './users.handlers';

export const handlers = [...authHandlers, ...usersHandlers];
