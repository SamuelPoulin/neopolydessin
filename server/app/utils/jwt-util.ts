import * as jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export interface TokenEncode {
  _id: string | ObjectId;
}

export interface AccessToken {
  _id: string;
  iat: number;
  exp: number;
}

export const decodeAccessToken = (accessToken: string) => {
  const decodedPayload: AccessToken = jwt.verify(accessToken, process.env.JWT_KEY as string) as AccessToken;
  return decodedPayload._id;
};

export const decodeRefreshToken = (refreshToken: string) => {
  const decodedPayload: AccessToken = jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY as string) as AccessToken;
  return decodedPayload._id;
};

export const encodeAccessToken = (toEncode: TokenEncode) => {
  return jwt.sign(toEncode, process.env.JWT_KEY as string, { expiresIn: '5m' });
};

export const encodeRefreshToken = (toEncode: TokenEncode) => {
  return jwt.sign(toEncode, process.env.JWT_REFRESH_KEY as string, { expiresIn: '1d' });
};
