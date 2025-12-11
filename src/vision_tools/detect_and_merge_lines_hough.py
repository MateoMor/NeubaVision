import cv2 as cv
import numpy as np
import matplotlib.pyplot as plt
from sklearn.cluster import DBSCAN


def detect_and_merge_lines_hough(
    img, kernel_size=5, canny_threshold1=30, canny_threshold2=90,
    k=3000, hough_threshold=160, debug=False
) -> list[tuple[float, float]]:
    """
    Detects straight lines in an image using the Hough Line Transform and merges
    multiple nearly-parallel and overlapping detections into single representative
    lines using DBSCAN clustering in (rho, theta) parameter space.

    Returns:
        list of tuples (rho, theta) representing merged lines in Hough space.
        rho: distance from origin to the line
        theta: angle in radians

    This is the refactored function (moved to `src/` for reuse). See the project
    code for parameter descriptions.
    """

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
        hough_threshold
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

    # Print original lines
    print("\n=== ORIGINAL LINES (before clustering) ===")
    print(f"Total: {len(rhos)} lines")
    for i, (rho, theta) in enumerate(zip(rhos, thetas)):
        print(f"  Line {i}: rho={rho:.2f}, theta={np.rad2deg(theta):.2f}°")

    # --- Merge lines using DBSCAN clustering ---
    # Prepare data: normalize rho and theta for distance calculation
    # rho ranges from 0 to max_rho (diagonal of image)
    # theta ranges from 0 to pi
    
    max_rho = np.sqrt(img.shape[0]**2 + img.shape[1]**2)
    
    # Create feature matrix: normalize rho and theta to similar scales
    # theta is in radians [0, pi], rho in pixels [0, max_rho]
    features = np.column_stack([
        np.abs(rhos) / max_rho,  # normalize rho to [0, 1]
        np.cos(thetas * 2) * 0.25   # normalize theta to [0, 1]
    ])
    
    # Apply DBSCAN clustering
    # eps: maximum distance between points in a cluster
    # min_samples: minimum number of points to form a core point
    clustering = DBSCAN(eps=0.025, min_samples=1).fit(features)
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

        

        print("Cluster thetas:", np.rad2deg(cluster_thetas))

        # Calculamos el promedio usando 2θ para evitar ambigüedad
        sen_theta = np.sin(cluster_thetas * 2)
        cos_theta = np.cos(cluster_thetas * 2)
        mean_sen = np.mean(sen_theta)
        mean_cos = np.mean(cos_theta)
        mean_theta = np.arctan2(mean_sen, mean_cos) / 2

        # Convertimos a grados y normalizamos a [0°, 180°)
        mean_theta_deg = np.rad2deg(mean_theta)
        mean_theta_deg = (mean_theta_deg + 180) % 180

        print("Mean theta:", mean_theta_deg)

        # Convertimos de nuevo a radianes antes de guardar
        mean_theta_rad = np.deg2rad(mean_theta_deg)

        #mean_theta = np.mean(cluster_thetas)

        merged_lines.append((mean_rho, mean_theta_rad))

    # --- Debug visual ---
    if debug:

        plt.subplot(233)
        plt.imshow(canny_edges, cmap="gray")
        plt.title("Canny Edges")
        plt.axis("off")

        # Draw original lines (before clustering)
        debug_img_original = img.copy()
        if len(debug_img_original.shape) == 2:
            debug_img_original = cv.cvtColor(debug_img_original, cv.COLOR_GRAY2BGR)
        
        for rho, theta in zip(rhos, thetas):
            a = np.cos(theta)
            b = np.sin(theta)
            x0 = a * rho
            y0 = b * rho
            x1 = int(x0 + k * (-b))
            y1 = int(y0 + k * (a))
            x2 = int(x0 - k * (-b))
            y2 = int(y0 - k * (a))
            cv.line(debug_img_original, (x1, y1), (x2, y2), (0, 255, 0), 1)  # Green for original
        
        plt.subplot(234)
        plt.imshow(cv.cvtColor(debug_img_original, cv.COLOR_BGR2RGB))
        plt.title(f"Original Lines ({len(rhos)})")
        plt.axis("off")

        # Draw merged lines (after clustering)
        debug_img = img.copy()
        if len(debug_img.shape) == 2:
            debug_img = cv.cvtColor(debug_img, cv.COLOR_GRAY2BGR)

        # Convertir (rho, theta) a (x1, y1, x2, y2) para dibujar
        for rho, theta in merged_lines:
            a = np.cos(theta)
            b = np.sin(theta)
            x0 = a * rho
            y0 = b * rho
            x1 = int(x0 + k * (-b))
            y1 = int(y0 + k * (a))
            x2 = int(x0 - k * (-b))
            y2 = int(y0 - k * (a))
            cv.line(debug_img, (x1, y1), (x2, y2), (255, 0, 0), 2)  # Red for merged

        plt.subplot(235)
        plt.imshow(cv.cvtColor(debug_img, cv.COLOR_BGR2RGB))
        plt.title(f"Merged Lines ({len(merged_lines)})")
        plt.axis("off")
        
        # Draw comparison (both overlaid)
        debug_img_compare = img.copy()
        if len(debug_img_compare.shape) == 2:
            debug_img_compare = cv.cvtColor(debug_img_compare, cv.COLOR_GRAY2BGR)
        
        # Original in green (thin)
        for rho, theta in zip(rhos, thetas):
            a = np.cos(theta)
            b = np.sin(theta)
            x0 = a * rho
            y0 = b * rho
            x1 = int(x0 + k * (-b))
            y1 = int(y0 + k * (a))
            x2 = int(x0 - k * (-b))
            y2 = int(y0 - k * (a))
            cv.line(debug_img_compare, (x1, y1), (x2, y2), (0, 255, 0), 1)
        
        # Merged in red (thick)
        for rho, theta in merged_lines:
            a = np.cos(theta)
            b = np.sin(theta)
            x0 = a * rho
            y0 = b * rho
            x1 = int(x0 + k * (-b))
            y1 = int(y0 + k * (a))
            x2 = int(x0 - k * (-b))
            y2 = int(y0 - k * (a))
            cv.line(debug_img_compare, (x1, y1), (x2, y2), (255, 0, 0), 2)
        
        plt.subplot(236)
        plt.imshow(cv.cvtColor(debug_img_compare, cv.COLOR_BGR2RGB))
        plt.title("Comparison (Green=Original, Red=Merged)")
        plt.axis("off")
        
        plt.tight_layout()
        plt.show()

    return merged_lines
