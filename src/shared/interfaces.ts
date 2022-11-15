import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import User from './user.entity';

export type JwtPayload = DefaultJwtPayload & { user: User };
