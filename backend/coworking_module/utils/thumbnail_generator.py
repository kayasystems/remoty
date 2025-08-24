"""
Thumbnail generation utility for coworking space images
"""
import os
import uuid
from PIL import Image, ImageOps
from typing import Tuple, Dict
import logging

logger = logging.getLogger(__name__)

class ThumbnailGenerator:
    """Handles thumbnail generation for uploaded images"""
    
    # Thumbnail sizes
    SMALL_SIZE = (150, 150)
    MEDIUM_SIZE = (300, 300)
    LARGE_SIZE = (600, 600)
    
    def __init__(self, upload_dir: str = "uploads/coworking_images"):
        self.upload_dir = upload_dir
        self.thumbnails_dir = os.path.join(upload_dir, "thumbnails")
        
        # Create thumbnails directory if it doesn't exist
        os.makedirs(self.thumbnails_dir, exist_ok=True)
        os.makedirs(os.path.join(self.thumbnails_dir, "small"), exist_ok=True)
        os.makedirs(os.path.join(self.thumbnails_dir, "medium"), exist_ok=True)
        os.makedirs(os.path.join(self.thumbnails_dir, "large"), exist_ok=True)
    
    def generate_thumbnails(self, original_image_path: str, base_filename: str) -> Dict[str, str]:
        """
        Generate thumbnails for an image
        
        Args:
            original_image_path: Path to the original image
            base_filename: Base filename without extension
            
        Returns:
            Dictionary with thumbnail URLs
        """
        try:
            # Open and process the original image
            with Image.open(original_image_path) as img:
                # Convert to RGB if necessary (handles RGBA, P mode images)
                if img.mode in ('RGBA', 'LA', 'P'):
                    # Create a white background
                    background = Image.new('RGB', img.size, (255, 255, 255))
                    if img.mode == 'P':
                        img = img.convert('RGBA')
                    background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
                    img = background
                elif img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # Generate thumbnails
                thumbnails = {}
                
                # Small thumbnail (150x150)
                small_thumb = self._create_thumbnail(img, self.SMALL_SIZE)
                small_path = os.path.join(self.thumbnails_dir, "small", f"{base_filename}.jpg")
                small_thumb.save(small_path, "JPEG", quality=85, optimize=True)
                thumbnails['small'] = f"/uploads/coworking_images/thumbnails/small/{base_filename}.jpg"
                
                # Medium thumbnail (300x300)
                medium_thumb = self._create_thumbnail(img, self.MEDIUM_SIZE)
                medium_path = os.path.join(self.thumbnails_dir, "medium", f"{base_filename}.jpg")
                medium_thumb.save(medium_path, "JPEG", quality=90, optimize=True)
                thumbnails['medium'] = f"/uploads/coworking_images/thumbnails/medium/{base_filename}.jpg"
                
                # Large thumbnail (600x600) - for main display
                large_thumb = self._create_thumbnail(img, self.LARGE_SIZE)
                large_path = os.path.join(self.thumbnails_dir, "large", f"{base_filename}.jpg")
                large_thumb.save(large_path, "JPEG", quality=95, optimize=True)
                thumbnails['large'] = f"/uploads/coworking_images/thumbnails/large/{base_filename}.jpg"
                
                logger.info(f"Generated thumbnails for {base_filename}")
                return thumbnails
                
        except Exception as e:
            logger.error(f"Error generating thumbnails for {original_image_path}: {str(e)}")
            raise Exception(f"Failed to generate thumbnails: {str(e)}")
    
    def _create_thumbnail(self, img: Image.Image, size: Tuple[int, int]) -> Image.Image:
        """
        Create a thumbnail with proper aspect ratio handling
        
        Args:
            img: PIL Image object
            size: Target size tuple (width, height)
            
        Returns:
            Thumbnail Image object
        """
        # Use ImageOps.fit to create a thumbnail that fills the target size
        # This will crop the image to maintain aspect ratio
        thumbnail = ImageOps.fit(img, size, Image.Resampling.LANCZOS)
        return thumbnail
    
    def delete_thumbnails(self, base_filename: str):
        """
        Delete all thumbnails for a given base filename
        
        Args:
            base_filename: Base filename without extension
        """
        try:
            sizes = ['small', 'medium', 'large']
            for size in sizes:
                thumb_path = os.path.join(self.thumbnails_dir, size, f"{base_filename}.jpg")
                if os.path.exists(thumb_path):
                    os.remove(thumb_path)
                    logger.info(f"Deleted {size} thumbnail: {thumb_path}")
        except Exception as e:
            logger.error(f"Error deleting thumbnails for {base_filename}: {str(e)}")
    
    @staticmethod
    def get_base_filename_from_path(file_path: str) -> str:
        """Extract base filename without extension from a file path"""
        filename = os.path.basename(file_path)
        return os.path.splitext(filename)[0]
