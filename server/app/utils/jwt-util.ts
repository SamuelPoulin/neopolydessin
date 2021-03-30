import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { ACCESS_TOKEN_LIFETIME, REFRESH_TOKEN_LIFETIME } from '../../../common/communication/login';

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
  return jwt.sign(toEncode, process.env.JWT_KEY as string, { expiresIn: ACCESS_TOKEN_LIFETIME });
};

export const encodeRefreshToken = (toEncode: TokenEncode) => {
  return jwt.sign(toEncode, process.env.JWT_REFRESH_KEY as string, { expiresIn: REFRESH_TOKEN_LIFETIME });
};
