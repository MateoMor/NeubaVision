import os
import sys
import cv2 as cv
import matplotlib.pyplot as plt

# Add parent directory to path to import src modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.vision_tools.detect_and_merge_lines_hough import detect_hough_lines
from src.vision_tools.get_main_grid import get_main_grid
from src.vision_tools.draw_hough_lines import draw_hough_lines
from src.vision_tools.merge_hough_lines import merge_hough_lines

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
		rhos, thetas = detect_hough_lines(
			img, 
			hough_threshold=170,
			debug=debug,
		)

		if len(rhos) == 0:
			print("  No lines detected.")
			continue
		print(f"  Detected {len(rhos)} lines.")
		
		# Draw lines on the image
		img_with_hough_lines = draw_hough_lines(img, rhos, thetas)
		
		merged_rhos, merged_thetas = merge_hough_lines(
			img.shape, rhos, thetas,
			eps=0.03,
			min_samples=1
		)

		img_with_merged_lines = draw_hough_lines(img, merged_rhos, merged_thetas, line_color=(0, 255, 0))

		main_grid_corners = get_main_grid(
			img.shape, merged_rhos, merged_thetas,
		)

		image_with_main_grid = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
		
		if main_grid_corners is not None:
			cv.line(
				image_with_main_grid, 
				main_grid_corners['tl'], 
				main_grid_corners['tr'], 
				(255, 0, 0), 2
			)
			cv.line(
				image_with_main_grid, 
				main_grid_corners['tr'], 
				main_grid_corners['br'], 
				(255, 0, 0), 2
			)
			cv.line(
				image_with_main_grid, 
				main_grid_corners['br'], 
				main_grid_corners['bl'], 
				(255, 0, 0), 2
			)
			cv.line(
				image_with_main_grid, 
				main_grid_corners['bl'], 
				main_grid_corners['tl'], 
				(255, 0, 0), 2
			)
		else:
			print("  Could not determine main grid corners.")

		# Show results with matplotlib
		plt.figure(figsize=(14, 10), dpi=100)
		plt.suptitle(f"Image: {img_filename}", fontsize=16)
		plt.subplot(2, 2, 1)
		plt.imshow(img, cmap='gray')
		plt.title("Original Image")
		plt.axis("off")
		plt.subplot(2, 2, 2)
		plt.imshow(img_with_hough_lines)
		plt.title(f"Hough Lines ({len(rhos)})")
		plt.axis("off")	
		plt.subplot(2, 2, 3)
		plt.imshow(img_with_merged_lines)
		plt.title(f"Merged Lines ({len(merged_rhos)})")
		plt.axis("off")	
		plt.subplot(2, 2, 4)
		plt.imshow(image_with_main_grid, cmap='gray')
		plt.title("Main Grid")
		plt.axis("off")	
		plt.tight_layout()
		plt.show()
		


if __name__ == "__main__":
	process_test_images(debug=True)
