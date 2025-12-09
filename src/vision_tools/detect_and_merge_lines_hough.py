import cv2 as cv
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN


def detect_and_merge_lines_hough(
    img, kernel_size=5, canny_threshold1=30, canny_threshold2=90,
    k=3000, hough_threshold=0.2, debug=False
) -> list[tuple[float, float]]:
    """
    Detects straight lines in an image using the Hough Line Transform and merges
    multiple nearly-parallel and overlapping detections into single representative
    lines using DBSCAN clustering in (rho, theta) parameter space.

    Args:
        img: Input image (grayscale)
        kernel_size: Gaussian blur kernel size (must be odd)
        canny_threshold1: Lower threshold for Canny edge detection
        canny_threshold2: Upper threshold for Canny edge detection
        k: Parameter for line drawing (for visualization)
        hough_threshold: Normalized threshold [0, 1] for Hough accumulator.
                        0 = very permissive (accepts noise)
                        0.2 = default (balanced)
                        1 = very restrictive (only strong lines)
        debug: If True, displays visualization panels

    Returns:
        list of tuples (rho, theta) representing merged lines in Hough space.
        rho: distance from origin to the line (in pixels)
        theta: angle in radians [0, pi)

    This is the refactored function (moved to `src/` for reuse).
    """

    # Calculate threshold based on image diagonal
    # The accumulator maximum value is roughly the diagonal (number of possible rho values)
    diagonal = int(np.sqrt(img.shape[0]**2 + img.shape[1]**2))
    scaled_threshold = max(20, int(hough_threshold * diagonal))
    if debug:
        print(f"Image size: {img.shape}")
        print(f"Diagonal: {diagonal} px")
        print(f"hough_threshold: {hough_threshold} → {scaled_threshold} votes")

    # --- Preprocesamiento ---
    img_blured = cv.GaussianBlur(img, (kernel_size, kernel_size), 1.5)
    canny_edges = cv.Canny(img_blured, canny_threshold1, canny_threshold2)

    if debug:
        plt.figure(figsize=(12, 10), dpi=100)
        plt.subplot(221)
        plt.imshow(img, cmap="gray")
        plt.title("Original")
        plt.axis("off")

    # --- Hough ---
    lines = cv.HoughLines(
        canny_edges,
        1,
        np.pi / 180,
        scaled_threshold
    )

    if lines is None:
        return []

    # Guardar originales
    rhos = []
    thetas = []
    for curline in lines:
        rho, theta = curline[0]
        rhos.append(rho)
        thetas.append(theta)

    rhos = np.array(rhos)
    thetas = np.array(thetas)

    # --- Merge lines using DBSCAN clustering ---
    # Prepare data: normalize rho and theta for distance calculation
    # rho ranges from 0 to max_rho (diagonal of image)
    # theta ranges from 0 to pi
    
    if debug:
        print(f"\nDetected {len(thetas)} lines:")
        for i, (rho, theta) in enumerate(zip(rhos, thetas)):
            normalized_theta = theta / np.pi
            print(f"  Line {i}: rho={rho:.2f}, theta={theta:.4f} rad, theta/π={normalized_theta:.4f}, cos(theta)={np.cos(theta):.4f}")
    max_rho = np.sqrt(img.shape[0]**2 + img.shape[1]**2)

    cos_thetas = np.cos(thetas * 2)
    #sin_thetas = np.sin(thetas * 2)

    #module_thetas = np.mod(thetas, np.pi)
    
    eps_rho = 1
    eps_angle = 0.25

    # Create feature matrix: normalize rho and theta to similar scales
    # theta is in radians [0, peps_anglei], rho in pixels [0, max_rho]
    features = np.column_stack([
        rhos / max_rho * eps_rho,  # normalize rho to [0, 1]
        #rhos / max_rho * eps_rho,
        #thetas / np.pi   # normalize theta to [0, 1]
        cos_thetas * eps_angle
        #sin_thetas * eps_angle
        #module_thetas * eps_angle
    ])
    
    # Apply DBSCAN clustering
    # eps: maximum distance between points in a cluster
    # min_samples: minimum number of points to form a core point
    clustering = DBSCAN(eps=0.007, min_samples=1).fit(features)
    labels = clustering.labels_
    
    # Group lines by cluster
    unique_labels = np.unique(labels)
    merged_lines = []
    
    for label in unique_labels:
        cluster_indices = np.where(labels == label)[0]
        cluster_rhos = rhos[cluster_indices]
        cluster_thetas = thetas[cluster_indices]
        
        # Average the cluster to get representative line
        mean_rho = np.mean(cluster_rhos)

        """ sen_theta = np.sin(cluster_thetas*2)
        cos_theta = np.cos(cluster_thetas*2)
        mean_sen = np.mean(sen_theta)
        mean_cos = np.mean(cos_theta)
        mean_theta = np.arctan2(mean_sen, mean_cos) / 2 """

        print("Cluster thetas:", cluster_thetas)

        mean_theta = np.mean(cluster_thetas)
        
        merged_lines.append((mean_rho, mean_theta))

    # --- Debug visual ---
    if debug:
        plt.subplot(222)
        plt.imshow(img_blured, cmap="gray")
        plt.title("Blured")
        plt.axis("off")

        plt.subplot(223)
        plt.imshow(canny_edges, cmap="gray")
        plt.title("Canny Edges")
        plt.axis("off")

        debug_img = img.copy()
        if len(debug_img.shape) == 2:
            debug_img = cv.cvtColor(debug_img, cv.COLOR_GRAY2BGR)

        # Convertir (rho, theta) a (x1, y1, x2, y2) para dibujar
        for i, (rho, theta) in enumerate(merged_lines):
            a = np.cos(theta)
            b = np.sin(theta)
            x0 = a * rho
            y0 = b * rho
            x1 = int(x0 + k * (-b))
            y1 = int(y0 + k * (a))
            x2 = int(x0 - k * (-b))
            y2 = int(y0 - k * (a))
            cv.line(debug_img, (x1, y1), (x2, y2), (255, 0, 0), 2)
            
            
            # Draw normalized theta value on the line
            normalized_theta = np.cos(theta*2) * eps_angle
            mid_x = (x1 + x2) // 2
            mid_y = (y1 + y2) // 2 + 100 + i * 5
            #text = f"{normalized_theta:.3f}, r={rho:.1f}"
            text = f"r={rho:.1f}"
            cv.putText(debug_img, text, (mid_x, mid_y), cv.FONT_HERSHEY_SIMPLEX, 
                      1, (0, 255, 255), 2)

        plt.subplot(224)
        plt.imshow(cv.cvtColor(debug_img, cv.COLOR_BGR2RGB))
        plt.title("Merged Hough Lines")
        plt.axis("off")
        plt.tight_layout()
        plt.show()

    return merged_lines
