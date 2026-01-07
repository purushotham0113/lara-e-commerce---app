import asyncHandler from 'express-async-handler';

// @desc    Upload file to Cloudinary or Local
// @route   POST /api/upload
// @access  Private/Admin/Vendor
const uploadFile = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error('No file uploaded');
    }

    let imagePath;

    // Cloudinary returns full HTTPS link
    if (req.file.path.startsWith('http')) {
      imagePath = req.file.path;
    } else {
      // Local upload fallback (fix slashes for Windows)
      imagePath = '/' + req.file.path.replace(/\\/g, '/');
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: imagePath,
    });
  } catch (err) {
    console.error('Upload error:', err);

    res.status(500).json({
      success: false,
      message: err.message || 'Upload failed',
    });
  }
});

export { uploadFile };
