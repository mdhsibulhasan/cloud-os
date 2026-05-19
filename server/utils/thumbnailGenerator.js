const cloudinary = require('cloudinary').v2;

/**
 * Generate a thumbnail URL from a Cloudinary file URL.
 * For images: uses Cloudinary transformations.
 * For PDFs: uses Cloudinary's built-in PDF thumbnail (page 1).
 * For other docs: returns a default thumb path.
 *
 * @param {string} fileUrl - Cloudinary secure URL of the uploaded file
 * @param {string} mimetype - MIME type of the file
 * @returns {string} - Thumbnail URL
 */
function generateThumbnail(fileUrl, mimetype) {
  try {
    if (!fileUrl) return '/assets/images/default-thumb.jpg';

    if (mimetype.startsWith('image/')) {
      // Use Cloudinary URL transformation to generate a thumbnail
      // Replace /upload/ with /upload/w_300,h_400,c_fill,q_auto/
      return fileUrl.replace('/upload/', '/upload/w_300,h_400,c_fill,q_auto/');
    }

    if (mimetype === 'application/pdf') {
      // Cloudinary can render page 1 of a PDF as an image
      // Replace /upload/ with transformation and change extension to .jpg
      const thumbUrl = fileUrl
        .replace('/upload/', '/upload/w_300,h_400,c_fill,q_auto,pg_1/')
        .replace(/\.pdf$/i, '.jpg');
      return thumbUrl;
    }

    // For Word, Excel, etc. — return default icon
    return '/assets/images/default-thumb.jpg';

  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return '/assets/images/default-thumb.jpg';
  }
}

/**
 * Delete a file from Cloudinary by its public_id.
 * thumbnailPath is now a Cloudinary URL, so we extract the public_id.
 *
 * @param {string} cloudinaryUrl - Cloudinary URL of the file to delete
 * @param {string} resourceType - 'image', 'raw', or 'auto' (default: 'image')
 */
async function deleteThumbnail(cloudinaryUrl, resourceType = 'image') {
  // Thumbnails are now just derived URLs, nothing to delete separately
  // This function is kept for backward compatibility
  return;
}

/**
 * Delete a file from Cloudinary using its URL.
 * Extracts the public_id from the URL and calls cloudinary.uploader.destroy.
 *
 * @param {string} cloudinaryUrl - Full Cloudinary secure URL
 * @param {string} resourceType - 'image' or 'raw' (PDFs/docs are 'raw')
 */
async function deleteFromCloudinary(cloudinaryUrl, resourceType = 'auto') {
  try {
    if (!cloudinaryUrl || cloudinaryUrl.startsWith('/assets/')) return;

    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123456/folder/public_id.ext
    const matches = cloudinaryUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/);
    if (!matches) return;

    const publicId = matches[1];
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
  }
}

module.exports = {
  generateThumbnail,
  deleteThumbnail,
  deleteFromCloudinary
};
