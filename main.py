import os
import cv2 as cv
from src.vision_tools.detect_and_merge_lines_hough import detect_and_merge_lines_hough


def main():
	file_path = os.path.dirname(os.path.abspath(__file__))
	img_path = os.path.join(file_path, 'images', 'test_image.jpeg')
	img = cv.imread(img_path, cv.IMREAD_GRAYSCALE)

	# Llama a la función movida en src/
	lines_coords = detect_and_merge_lines_hough(img, angle_tol_deg=5.0, rho_tol=40.0, debug=True)

	for line in lines_coords:
		print(f"Line coordinates: {line}")
	print("-----")
	print(f"Lines detected: {len(lines_coords)}")


if __name__ == "__main__":
	main()

