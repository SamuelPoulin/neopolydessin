import * as express from 'express';
import * as httpStatus from 'http-status-codes';
import * as jwt from 'jsonwebtoken';

export const jwtVerify = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const jwtToken = req.headers.authorization;
        if (jwtToken && process.env.JWT_KEY) {
            const decodedJwt: {} = jwt.verify(jwtToken, process.env.JWT_KEY) as object;
            req.params = decodedJwt;
            next();
        } else {
            throw new Error('No secret key found');
        }

    } catch (error) {
        res.status(httpStatus.FORBIDDEN).json({ error: 'invalid access token' });
    }
};
