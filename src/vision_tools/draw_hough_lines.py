import cv2 as cv
import numpy as np

def draw_hough_lines(img: np.ndarray, rhos: np.ndarray, thetas: np.ndarray, line_color=(0, 0, 255), line_thickness: int =2) -> np.ndarray:
    """
    Draws Hough lines on the input image.

    Args:
        img (numpy.ndarray): Input image (grayscale or BGR).
        rhos (list or numpy.ndarray): List of rho values of the lines.
        thetas (list or numpy.ndarray): List of theta values of the lines.
        line_color (tuple, optional): Color of the lines in BGR format. Default is red (0, 0, 255).
        line_thickness (int, optional): Thickness of the lines. Default is 2.

    Returns:
        numpy.ndarray: Image with Hough lines drawn.
    """
    # Convert grayscale to BGR if necessary
    if len(img.shape) == 2:
        img_with_lines = cv.cvtColor(img, cv.COLOR_GRAY2BGR)
    else:
        img_with_lines = img.copy()

    for rho, theta in zip(rhos, thetas):
        a = np.cos(theta)
        b = np.sin(theta)
        x0 = a * rho
        y0 = b * rho
        offset = 1000  # Length of the line segment to draw

        x1 = int(x0 + offset * (-b))
        y1 = int(y0 + offset * (a))
        x2 = int(x0 - offset * (-b))
        y2 = int(y0 - offset * (a))

        cv.line(img_with_lines, (x1, y1), (x2, y2), line_color, line_thickness)

    return img_with_lines