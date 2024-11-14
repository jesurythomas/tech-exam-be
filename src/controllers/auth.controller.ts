import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { sendResetPasswordEmail } from '../utils/email'

export const signup = async (req: Request, res: Response) => {
    try {
        const { email, password, firstName, lastName } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const user = new User({
            email,
            password,
            firstName,
            lastName,
            role: 'user',
            status: 'inactive'
        });

        await user.save();
        res.status(201).json({ message: 'User created, waiting for admin approval' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || user.status === 'inactive') {
            return res.status(401).json({ error: 'Invalid credentials or inactive account' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, { expiresIn: '24h' });
        res.json({ token, user: { id: user._id, email: user.email, role: user.role, status: user.status, firstName: user.firstName, lastName: user.lastName } });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

export const forgotPassword = async (req: Request, res: Response) => {
    try {

        console.log('hit')
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'If an account exists, password reset instructions will be sent' });
        }

        const resetToken = jwt.sign(
            {
                id: user._id,
                type: 'password_reset',
                exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
            },
            process.env.JWT_SECRET!
        );

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        console.log(email)
        const resetLink = `${process.env.APP_URL}/reset-password?token=${resetToken}`;
        await sendResetPasswordEmail(email, resetLink);

        res.json({ message: 'If an account exists, password reset instructions will be sent' });
    } catch (error) {
        console.error('Password reset error:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const { token, newPassword } = req.body;

        if (!token) {
            return res.status(400).json({ error: 'Reset token is required' });
        }

        if (!newPassword) {
            return res.status(400).json({ error: 'New password is required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string, type: string };

        if (decoded.type !== 'password_reset') {
            return res.status(400).json({ error: 'Invalid reset token' });
        }

        const user = await User.findOne({
            _id: decoded.id,
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        user.password = newPassword;
        user.resetPasswordToken = '';
        user.resetPasswordExpires = new Date(Date.now() - 3600000);
        await user.save();

        res.json({ message: 'Password has been reset' });
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ error: 'Invalid reset token' });
        }
        res.status(500).json({ error: 'Server error' });
    }
};

export const me = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            user: {
                id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                status: user.status
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
}; 