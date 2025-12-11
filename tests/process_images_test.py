import os
import sys
import cv2 as cv

# Add parent directory to path to import src modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.vision_tools.detect_and_merge_lines_hough import detect_and_merge_lines_hough
from src.vision_tools.get_main_grid import get_main_grid


def process_test_images(debug):
	"""
	Process all images in the tests folder.
	
	Args:
		debug (bool, optional): If True, prints detailed information. Default is False.
	"""
	# Get the tests folder path
	tests_folder = os.path.dirname(os.path.abspath(__file__))
	imgs_folder = os.path.join(tests_folder, "imgs/grids")
 
	# Get all image files from tests folder
	image_extensions = ('.jpg', '.jpeg', '.png', '.bmp', '.tiff')
	image_files = [f for f in os.listdir(imgs_folder) 
	               if os.path.isfile(os.path.join(imgs_folder, f)) 
	               and f.lower().endswith(image_extensions)]
	
	if not image_files:
		print(f"No image files found in {imgs_folder}")
		return
	
	print(f"Found {len(image_files)} image(s) in {imgs_folder}\n")
	
	# Process each image
	for idx, img_filename in enumerate(image_files, 1):
		img_path = os.path.join(imgs_folder, img_filename)
		print(f"--- Processing image {idx}/{len(image_files)}: {img_filename} ---")
		
		# Read image in grayscale
		img = cv.imread(img_path, cv.IMREAD_GRAYSCALE)
		
		if img is None:
			print(f"  Error: Could not read image {img_filename}")
			continue
		
		print(f"  Image shape: {img.shape}")
		
		# Detect and merge lines
		lines_coords = detect_and_merge_lines_hough(
			img, 
			hough_threshold=170,
			debug=debug,
		)
		
		print(f"  Detected {len(lines_coords)} merged lines")
		
		if len(lines_coords) < 4:
			print("  Warning: Not enough lines detected (need at least 4)")
			continue
		
		# Extract main grid corners
		corners = get_main_grid(img, lines_coords, debug=debug)
		
		if corners is None:
			print("  Warning: Could not extract valid grid corners")
			continue
		
		print("  Grid corners extracted successfully")
		print("  Press any key to continue to next image...\n")
	
	print("All images processed.")


if __name__ == "__main__":
	# Run with debug=False by default
	# Use debug=True for detailed output
	process_test_images(debug=True)
