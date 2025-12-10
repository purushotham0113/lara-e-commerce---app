import asyncHandler from 'express-async-handler';

// @desc    Upload file to local storage or Cloudinary
// @route   POST /api/upload
// @access  Private/Admin/Vendor
const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  let imagePath;

  // If using Cloudinary, req.file.path is the URL.
  // If using Local, req.file.path is the directory path.
  if (req.file.path.startsWith('http')) {
     imagePath = req.file.path;
  } else {
     // Normalize local path (fix windows slashes if needed)
     imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
  }

  res.json({
    success: true,
    message: 'File uploaded successfully',
    data: imagePath
  });
});

export { uploadFile };