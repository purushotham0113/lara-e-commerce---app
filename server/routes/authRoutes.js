import express from 'express';
import { loginUser, registerUser, verifyEmail, getMe, updateUserProfile, logoutUser } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest, validateRegister, validateLogin } from '../middleware/validationMiddleware.js';

const router = express.Router();

router.post('/register', validateRegister, validateRequest, registerUser);
router.post('/verify', verifyEmail);
router.post('/login', validateLogin, validateRequest, loginUser);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateUserProfile);
router.post('/logout', protect, logoutUser);

export default router;