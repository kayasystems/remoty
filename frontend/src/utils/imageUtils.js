/**
 * Utility functions for handling image URLs and thumbnails
 */

/**
 * Get the best thumbnail URL for an image with fallback to original
 * @param {Object} image - Image object with thumbnail URLs
 * @param {string} size - Preferred thumbnail size ('small', 'medium', 'large')
 * @returns {string} - Complete image URL ready to use
 */
export const getThumbnailUrl = (image, size = 'medium') => {
  if (!image) return '';
  
  let thumbnailUrl;
  
  // Select thumbnail based on size preference
  switch (size) {
    case 'small':
      thumbnailUrl = image.thumbnail_small_url || image.thumbnail_url || image.image_url;
      break;
    case 'large':
      thumbnailUrl = image.thumbnail_url || image.thumbnail_medium_url || image.image_url;
      break;
    case 'medium':
    default:
      thumbnailUrl = image.thumbnail_medium_url || image.thumbnail_url || image.image_url;
      break;
  }
  
  // Handle full URLs vs relative paths
  if (!thumbnailUrl) return '';
  
  if (thumbnailUrl.startsWith('http')) {
    return thumbnailUrl;
  } else {
    return `http://localhost:8001${thumbnailUrl}`;
  }
};

/**
 * Get optimized image URL for different display contexts
 * @param {Object} image - Image object
 * @param {string} context - Display context ('list', 'card', 'detail', 'modal')
 * @returns {string} - Optimized image URL
 */
export const getOptimizedImageUrl = (image, context = 'card') => {
  const sizeMap = {
    'list': 'small',      // For small list items
    'card': 'medium',     // For card displays
    'detail': 'large',    // For detail views
    'modal': 'original'   // For modal/full view
  };
  
  if (context === 'modal') {
    // For modals, use original image for best quality
    const originalUrl = image.image_url;
    return originalUrl?.startsWith('http') ? originalUrl : `http://localhost:8001${originalUrl}`;
  }
  
  return getThumbnailUrl(image, sizeMap[context] || 'medium');
};
