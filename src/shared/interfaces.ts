import { JwtPayload as DefaultJwtPayload } from 'jsonwebtoken';
import User from '@shared/user.entity';

export type JwtPayload = DefaultJwtPayload & { user: User };
