import cv2 as cv
import numpy as np
import matplotlib.pyplot as plt
import os


def main():
    file_path = os.path.dirname(os.path.abspath(__file__))
    img_path = os.path.join(file_path, "images", "test_image.jpeg")
    img = cv.imread(img_path, cv.IMREAD_GRAYSCALE)

    lines_coords = hough_line_transform(img, debug=True)
    for line in lines_coords:
        print(f"Line coordinates: {line}")
    print("-----")
    print(f"Lines detected: {len(lines_coords)}")
    
    


def hough_line_transform(
    img, kernel_size=5, canny_threshold1=30, canny_threshold2=90, k=3000, hough_threshold=160, debug=False
):
    img_blured = cv.GaussianBlur(img, (kernel_size, kernel_size), 1.5)
    canny_edges = cv.Canny(img_blured, canny_threshold1, canny_threshold2)

    if debug:
        plt.figure(figsize=(12, 10), dpi=100)
        plt.subplot(221)
        plt.imshow(img, cmap="gray")

    distance_resolution = 1
    angle_resolution = np.pi / 180

    lines = cv.HoughLines(canny_edges, distance_resolution, angle_resolution, hough_threshold)

    lines_coords = []
    for curline in lines:
        rho, theta = curline[0]
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a * rho
        y0 = b * rho
        x1 = int(x0 + k * (-b))
        y1 = int(y0 + k * (a))
        x2 = int(x0 - k * (-b))
        y2 = int(y0 - k * (a))
        line_coords = (x1, y1, x2, y2)
        lines_coords.append(line_coords)
        if debug:
            cv.line(img, (x1, y1), (x2, y2), (255, 0, 0), 2)

    if debug:
        plt.axis("off")
        plt.title("Original")
        plt.subplot(222)
        plt.imshow(img_blured, cmap="gray")
        plt.axis("off")
        plt.title("Blured")
        plt.subplot(223)
        plt.imshow(canny_edges, cmap="gray")
        plt.axis("off")
        plt.title("Canny edges")
        plt.subplot(224)
        plt.imshow(img, cmap="gray")
        plt.axis("off")
        plt.title("Hough lines")
        plt.tight_layout()
        plt.show()

    return lines_coords


if __name__ == "__main__":
    main()
