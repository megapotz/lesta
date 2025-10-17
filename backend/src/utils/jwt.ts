import jwt, { SignOptions } from 'jsonwebtoken';

import { env } from '../config/env';

export type AccessTokenPayload = {
  userId: number;
  role: string;
};

export const signAccessToken = (payload: AccessTokenPayload) => {
  const options: SignOptions = {
    expiresIn: env.ACCESS_TOKEN_TTL as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
};
