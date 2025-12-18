import cv2 as cv
import numpy as np

def detect_hough_lines(
    img, kernel_size=5, canny_threshold1=30, canny_threshold2=90,
    k=3000, hough_threshold=160, debug=False
) -> tuple[np.ndarray, np.ndarray]:
    """

    Detects lines in the input image using the Hough Transform.
    Args:
        img (numpy.ndarray): Input grayscale image.
        kernel_size (int, optional): Size of the Gaussian kernel for blurring. Default is 5.
        canny_threshold1 (int, optional): First threshold for the Canny edge detector. Default is 30.
        canny_threshold2 (int, optional): Second threshold for the Canny edge detector. Default is 90.
        k (int, optional): Number of strongest lines to retain. Default is 3000.
        hough_threshold (int, optional): Threshold for the Hough Transform. Default is 160.
        debug (bool, optional): If True, displays intermediate images for debugging. Default is False.

    Returns:
        tuple: Two numpy arrays containing the rhos and thetas of the detected lines.

    """

    img_blured = cv.GaussianBlur(img, (kernel_size, kernel_size), 1.5)
    canny_edges = cv.Canny(img_blured, canny_threshold1, canny_threshold2)

    # --- Hough ---
    lines = cv.HoughLines(
        canny_edges,
        1,
        np.pi / 180,
        hough_threshold
    )

    if lines is None:
        return []

    # save orginals
    rhos = []
    thetas = []
    for curline in lines:
        rho, theta = curline[0]
        rhos.append(rho)
        thetas.append(theta)

    rhos = np.array(rhos)
    thetas = np.array(thetas)
    
    return rhos, thetas