import { Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticatedRequest } from '../types';

// export interface AuthenticatedRequest extends Request {
//   vendor: { vendor_id: any; role: any; };
// }

interface TokenPayload extends JwtPayload {
  user_id: number;
  user_uuid: string;
  id:number
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = (jwt.verify(token, process.env.JWT_SECRET!)) as TokenPayload;
      console.log("Decoded token:", decoded);
      req.user = {
        user_id: decoded.user_id as number,
        user_uuid: decoded.user_uuid as string,
        id: decoded.id as number,
        user_type: (decoded as any).user_type as string // Ensure user_type is present in the token payload
      };
      console.log("Authenticated user:", req.user);
      next();
    } catch(error) {
      res.status(401).json({ message: 'Invalid or expired token' });
    }
  } else {
    res.status(401).json({ message: 'Authorization header missing or malformed' });
  }
};
