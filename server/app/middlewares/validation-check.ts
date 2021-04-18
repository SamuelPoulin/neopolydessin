import express from 'express';
import { validationResult } from 'express-validator';
import httpStatus from 'http-status-codes';

export const validationCheck = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(httpStatus.BAD_REQUEST).json({ errors: errors.array() });
  } else {
    next();
  }
};
