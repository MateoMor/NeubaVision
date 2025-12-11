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

def closest_point(target: tuple[float, float], points: list[tuple[float, float]]) -> tuple[float, float] | None:
    """
    Finds the point in 'points' closest to 'target'.
    Args:
        target: tuple (x, y)
        points: list of tuples [(x1, y1), (x2, y2), ...]
    Returns:
        Closest point as tuple (x, y), or None if points is empty.
    """
    min_dist = float('inf')
    closest = None
    for point in points:
        dist = np.sqrt((point[0] - target[0])**2 + (point[1] - target[1])**2)
        if dist < min_dist:
            min_dist = dist
            closest = point
    return int(closest[0]), int(closest[1]) if closest is not None else None

def get_main_grid(img_shape, rhos, thetas, angle_tol=5):
    """
    Given a set of lines in Hough space (rhos, thetas), identify the main grid
    formed by horizontal and vertical lines, and compute the four corner points
    of the grid.

    Args:
        img_shape (tuple): Shape of the image (height, width).
        rhos (list or np.ndarray): List of rho values of the lines.
        thetas (list or np.ndarray): List of theta values of the lines.
        angle_tol (float, optional): Tolerance in degrees to classify lines as horizontal or vertical   (default is 5 degrees).

    Returns:
        dict: Dictionary with corner points of the grid:
            {
                'top_left': (x, y),
                'top_right': (x, y),
                'bottom_left': (x, y),
                'bottom_right': (x, y)
            }
        or None if the grid could not be determined.
    """
    
    lines_coords = list(zip(rhos, thetas))
    
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
    
    if len(horizontals) < 2 or len(verticals) < 2:
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
        print("Not enough intersections found.")
        return None
    
    # -------------------
    # 3) Find corners closest to image corners
    # -------------------
    img_height, img_width = img_shape[:2]
    
    # Define image corners
    img_top_left = (0, 0)
    img_top_right = (img_width, 0)
    img_bottom_left = (0, img_height)
    img_bottom_right = (img_width, img_height)
    
    top_left = closest_point(img_top_left, intersections)
    top_right = closest_point(img_top_right, intersections)
    bottom_left = closest_point(img_bottom_left, intersections)
    bottom_right = closest_point(img_bottom_right, intersections)
    
    if None in [top_left, top_right, bottom_left, bottom_right]:
        print("Could not calculate all corner intersections.")
        return None
    

    corners = {
        'tl': top_left,
        'tr': top_right,
        'bl': bottom_left,
        'br': bottom_right
    }

    print("Main grid corners:", corners)

    return corners