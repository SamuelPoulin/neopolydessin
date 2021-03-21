import express from 'express';
import httpStatus from 'http-status-codes';
import * as jwtUtils from '../utils/jwt-util';

export const jwtVerify = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const jwtToken = req.headers.authorization;
    if (jwtToken) {
      req.params._id = jwtUtils.decodeAccessToken(jwtToken);
      next();
    } else {
      throw new Error();
    }
  } catch (error) {
    res.status(httpStatus.FORBIDDEN).json({ error: 'invalid access token' });
  }
};
