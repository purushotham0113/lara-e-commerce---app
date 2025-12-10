import express from 'express';
import upload from '../config/uploadConfig.js';
import { uploadFile } from '../controllers/uploadController.js';
import { protect, vendor } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route: POST /api/upload
// Security: Protected (Login Required) + Vendor/Admin Role Required
// Middleware: 'upload.single' handles the multipart/form-data
router.post('/', protect, vendor, upload.single('image'), uploadFile);

export default router;