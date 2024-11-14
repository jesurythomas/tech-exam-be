import express from 'express';
import { auth } from '../middleware/auth';
import * as AuthController from '../controllers/auth.controller'
import { RequestHandler } from 'express';

const router = express.Router();

router.post('/signup', AuthController.signup as RequestHandler);
router.post('/login', AuthController.login as RequestHandler);
router.post('/forgot-password', AuthController.forgotPassword as RequestHandler);
router.post('/reset-password', AuthController.resetPassword as RequestHandler);
router.get('/me', auth, AuthController.me as RequestHandler);

export default router; 