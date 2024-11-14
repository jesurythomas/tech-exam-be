import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

interface AuthRequest extends Request {
    user?: IUser;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await User.findById(decoded.id);

        if (!user || user.status === 'inactive') {
            throw new Error('User inactive or not found');
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ error: 'Please authenticate' });
    }
};

export const adminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !['admin', 'super-admin'].includes(req.user.role)) {
            throw new Error('Insufficient permissions');
        }
        next();
    } catch (error) {
        res.status(403).json({ error: 'Admin access required' });
    }
};

export const superAdminAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user || req.user.role !== 'super-admin') {
            throw new Error('Insufficient permissions');
        }
        next();
    } catch (error) {
        res.status(403).json({ error: 'Super Admin access required' });
    }
}; 