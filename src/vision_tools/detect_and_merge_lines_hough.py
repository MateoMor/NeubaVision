import cv2 as cv
import numpy as np
import matplotlib.pyplot as plt


def detect_and_merge_lines_hough(
    img, kernel_size=5, canny_threshold1=30, canny_threshold2=90,
    k=3000, hough_threshold=160, angle_tol_deg=2.0,
    rho_tol=20.0, debug=False
) -> list[tuple[float, float]]:
    """
    Detects straight lines in an image using the Hough Line Transform and merges
    multiple nearly-parallel and overlapping detections into single representative
    lines.

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

    used = np.zeros(len(lines), dtype=bool)
    merged_lines = []

    theta_threshold = np.deg2rad(angle_tol_deg)

    # --- Agrupación y fusión ---
    for i in range(len(lines)):
        if used[i]:
            continue

        group_rhos = [rhos[i]]
        group_thetas = [thetas[i]]
        used[i] = True

        for j in range(i + 1, len(lines)):
            if used[j]:
                continue

            if (abs(thetas[i] - thetas[j]) < theta_threshold and
                abs(rhos[i] - rhos[j]) < rho_tol):
                group_rhos.append(rhos[j])
                group_thetas.append(thetas[j])
                used[j] = True

        # Promedio del grupo
        mean_rho = np.mean(group_rhos)
        mean_theta = np.mean(group_thetas)

        # Guardar (rho, theta)
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
        for rho, theta in merged_lines:
            a = np.cos(theta)
            b = np.sin(theta)
            x0 = a * rho
            y0 = b * rho
            x1 = int(x0 + k * (-b))
            y1 = int(y0 + k * (a))
            x2 = int(x0 - k * (-b))
            y2 = int(y0 - k * (a))
            cv.line(debug_img, (x1, y1), (x2, y2), (255, 0, 0), 2)

        plt.subplot(224)
        plt.imshow(cv.cvtColor(debug_img, cv.COLOR_BGR2RGB))
        plt.title("Merged Hough Lines")
        plt.axis("off")
        plt.tight_layout()
        plt.show()

    return merged_lines
