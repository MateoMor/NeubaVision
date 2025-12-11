import numpy as np


def line_intersection(line1, line2) -> tuple[float, float] | None:
    """
    Calculate the intersection between two lines in Hough space (rho, theta).
    
    Each line is defined as: x*cos(theta) + y*sin(theta) = rho
    
    Args:
        line1, line2: tuples (rho, theta)
    
    Returns:
        (x, y) intersection point, or None if lines are parallel
    
    """
    rho1, theta1 = line1
    rho2, theta2 = line2
    
    # Build linear system: A * [x, y]^T = b
    A = np.array([
        [np.cos(theta1), np.sin(theta1)],
        [np.cos(theta2), np.sin(theta2)]
    ])
    b = np.array([[rho1], [rho2]])
    
    try:
        point = np.linalg.solve(A, b)
        return (float(point[0, 0]), float(point[1, 0]))
    except np.linalg.LinAlgError:
        # Parallel or near-parallel lines
        return None


def get_main_grid(img, lines_coords, angle_tol=5, debug=False):
    """
    Finds the 4 corner intersections of the main grid.
    
    Args:
        img (numpy.ndarray): Input grayscale image
        lines_coords (list): List of tuples (rho, theta) representing lines in Hough space
        angle_tol (float, optional): Angular tolerance in degrees for classifying lines as 
                                     horizontal or vertical. Default is 5 degrees.
        debug (bool, optional): If True, prints intermediate information for debugging. Default is False.
    
    Returns:
        dict: Dictionary with keys 'top_left', 'top_right', 'bottom_left', 'bottom_right',
              each containing a tuple (x, y) of the corner coordinates.
              Returns None if insufficient lines are detected.
    """
    
    if debug:
        print("Lines coordinates received (rho, theta):")
        for line in lines_coords:
            print(line)
        print("------")
        print(f"Total lines: {len(lines_coords)}")
    
    # -------------------
    # 1) Separate lines by orientation
    # -------------------
    horizontals = []
    verticals = []
    
    angle_tol_rad = np.deg2rad(angle_tol)
    
    for rho, theta in lines_coords:
        # theta is the angle of the normal to the line
        # Normalize to [0, pi)
        theta_norm = theta % np.pi
        
        # A line is horizontal if its normal is vertical (theta ≈ π/2)
        # A line is vertical if its normal is horizontal (theta ≈ 0 or π)
        
        if abs(theta_norm - np.pi/2) < angle_tol_rad:
            horizontals.append((rho, theta))
        elif abs(theta_norm) < angle_tol_rad or abs(theta_norm - np.pi) < angle_tol_rad:
            verticals.append((rho, theta))
    
    if debug:
        print(f"Horizontals: {len(horizontals)} | Verticals: {len(verticals)}")
    
    if len(horizontals) < 2 or len(verticals) < 2:
        if debug:
            print("Not enough lines to form a grid.")
        return None
    
    # -------------------
    # 2) Calculate all intersections
    # -------------------
    intersections = []
    for h_line in horizontals:
        for v_line in verticals:
            point = line_intersection(h_line, v_line)
            if point is not None:
                intersections.append(point)
    
    if len(intersections) < 4:
        if debug:
            print("Not enough intersections found.")
        return None
    
    if debug:
        print(f"\nTotal intersections found: {len(intersections)}")
    
    # -------------------
    # 3) Find corners closest to image corners
    # -------------------
    img_height, img_width = img.shape[:2]
    
    # Define image corners
    img_top_left = (0, 0)
    img_top_right = (img_width, 0)
    img_bottom_left = (0, img_height)
    img_bottom_right = (img_width, img_height)
    
    # Find intersection closest to each image corner
    def closest_point(target, points):
        min_dist = float('inf')
        closest = None
        for point in points:
            dist = np.sqrt((point[0] - target[0])**2 + (point[1] - target[1])**2)
            if dist < min_dist:
                min_dist = dist
                closest = point
        return closest
    
    top_left = closest_point(img_top_left, intersections)
    top_right = closest_point(img_top_right, intersections)
    bottom_left = closest_point(img_bottom_left, intersections)
    bottom_right = closest_point(img_bottom_right, intersections)
    
    if None in [top_left, top_right, bottom_left, bottom_right]:
        if debug:
            print("Could not calculate all corner intersections.")
        return None
    
    corners = {
        'top_left': top_left,
        'top_right': top_right,
        'bottom_left': bottom_left,
        'bottom_right': bottom_right
    }
    
    if debug:
        print("\n--- Grid Corners ---")
        for name, point in corners.items():
            print(f"  {name}: ({point[0]:.2f}, {point[1]:.2f})")
        
        # Draw the 4 grid lines on the image
        import cv2 as cv
        img_with_grid = cv.cvtColor(img, cv.COLOR_GRAY2BGR) if len(img.shape) == 2 else img.copy()
        
        # Draw the 4 grid lines in red
        # Top line
        cv.line(img_with_grid, (int(top_left[0]), int(top_left[1])), 
                (int(top_right[0]), int(top_right[1])), (0, 0, 255), 2)
        # Bottom line
        cv.line(img_with_grid, (int(bottom_left[0]), int(bottom_left[1])), 
                (int(bottom_right[0]), int(bottom_right[1])), (0, 0, 255), 2)
        # Left line
        cv.line(img_with_grid, (int(top_left[0]), int(top_left[1])), 
                (int(bottom_left[0]), int(bottom_left[1])), (0, 0, 255), 2)
        # Right line
        cv.line(img_with_grid, (int(top_right[0]), int(top_right[1])), 
                (int(bottom_right[0]), int(bottom_right[1])), (0, 0, 255), 2)
        
        # Display the image with grid lines
        cv.imshow("Grid Corners", img_with_grid)
        cv.waitKey(0)
        cv.destroyAllWindows()
    
    return corners