import * as express from 'express';
import * as httpStatus from 'http-status-codes';
import * as jwt from 'jsonwebtoken';

export const jwtVerify = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const jwtToken = req.headers.authorization;
    if (jwtToken && process.env.JWT_KEY) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const decodedJwt: any = jwt.verify(jwtToken, process.env.JWT_KEY);
      req.params._id = decodedJwt._id;
      next();
    } else {
      throw new Error('No secret key found');
    }

  } catch (error) {
    res.status(httpStatus.FORBIDDEN).json({ error: 'invalid access token' });
  }
};
