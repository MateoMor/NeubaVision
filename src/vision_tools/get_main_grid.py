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
    Detects and extracts the main grid region from an image using Hough line detection.
    
    This function:
    1. Separates detected lines into horizontal and vertical groups
    2. Calculates intersection points between horizontal and vertical lines
    3. Identifies the grid corner with the largest cell area
    4. Extracts a 4x4 grid region around that corner
    5. Normalizes the lines to the extracted region's coordinate system
    
    Args:
        img (numpy.ndarray): Input grayscale image
        lines_coords (list): List of tuples (rho, theta) representing lines in Hough space
        angle_tol (float, optional): Angular tolerance in degrees for classifying lines as 
                                     horizontal or vertical. Default is 5 degrees.
        debug (bool, optional): If True, prints intermediate information for debugging. Default is False.
    
    Returns:
        tuple: (main_grid_img, main_grid_lines) where:
            - main_grid_img (numpy.ndarray): Cropped image containing only the main grid region
            - main_grid_lines (dict): Dictionary with keys 'horizontals' and 'verticals', 
                                     each containing lists of (rho, theta) tuples normalized
                                     to the extracted region's coordinate system
    
    Raises:
        Returns empty list if insufficient lines are detected to form a valid grid.
    
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
        return []
    
    # -------------------
    # 2) Calculate intersections
    # -------------------
    points = []
    for h in horizontals:
        row = []
        for v in verticals:
            p = line_intersection(h, v)
            if p is not None:
                row.append(p)
        # Sort row left to right
        row = sorted(row, key=lambda p: p[0])
        if row:
            points.append(row)
    
    # Sort rows top to bottom
    points = sorted(points, key=lambda row: row[0][1] if len(row) > 0 else 0)
    
    if len(points) < 2:
        if debug:
            print("Not enough intersection points to form cells.")
        return []
    
    # -------------------
    # 3) Find anchor corner
    # -------------------
    
    if debug:
        counter = 0
        for i, row in enumerate(points):
            for j, p in enumerate(row):
                print(f"Point[{i}][{j}] = {p}")
                counter += 1
        print("-----")
        print(f"Total points: {counter}")
    
    corners = [(0, 0),(0, len(verticals)-1),(len(horizontals)-1, 0),(len(horizontals)-1, len(verticals)-1)]
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]
    
    anchor_corner_cell = 0
    anchor_corner_cell_area = 0
    for idx, (i, j) in enumerate(corners):
        cell_area = 1
        for di, dj in directions:
            ni, nj = i + di, j + dj
            if 0 <= ni < len(points) and 0 <= nj < len(points[ni]):
                dist = np.linalg.norm(np.array(points[i][j]) - np.array(points[ni][nj]))
                if debug:
                    print(f"Corner {idx} to direction ({di},{dj}): distance = {dist}")
                cell_area *= dist
        if idx == 0 or cell_area > anchor_corner_cell_area:
            anchor_corner_cell_area = cell_area
            anchor_corner_cell = idx
        
    if debug:
        print(f"Anchor corner cell selected: {anchor_corner_cell} with area {anchor_corner_cell_area}")
        
    # -------------------
    # 4) Extract main grid region and lines
    # -------------------
    
    grid_corners = []
    if anchor_corner_cell == 0:
        # Top-left
        grid_corners = [points[0][0], points[0][4], points[4][0], points[4][4]]
    elif anchor_corner_cell == 1:
        # Top-right
        grid_corners = [points[0][len(verticals)-5], points[0][len(verticals)-1], points[4][len(verticals)-5], points[4][len(verticals)-1]]
    elif anchor_corner_cell == 2:
        # Bottom-left
        grid_corners = [points[len(horizontals)-5][0], points[len(horizontals)-5][4], points[len(horizontals)-1][0], points[len(horizontals)-1][4]]
    elif anchor_corner_cell == 3:
        # Bottom-right
        grid_corners = [points[len(horizontals)-5][len(verticals)-5], points[len(horizontals)-5][len(verticals)-1], points[len(horizontals)-1][len(verticals)-5], points[len(horizontals)-1][len(verticals)-1]]
    
    # Extract pixel region from grid_corners
    xs = [p[0] for p in grid_corners]
    ys = [p[1] for p in grid_corners]
    x_min_px = int(round(min(xs)))
    x_max_px = int(round(max(xs)))
    y_min_px = int(round(min(ys)))
    y_max_px = int(round(max(ys)))
    
    # Ensure indices are within image bounds
    x_min_px = max(0, x_min_px)
    x_max_px = min(img.shape[1], x_max_px)
    y_min_px = max(0, y_min_px)
    y_max_px = min(img.shape[0], y_max_px)
    
    # Crop image
    main_grid_img = img[y_min_px:y_max_px, x_min_px:x_max_px].copy()
    
    # Normalize lines to new coordinate system
    # Only normalize lines that are within the extracted region
    offset_x = x_min_px
    offset_y = y_min_px
    
    # Determine which horizontal and vertical lines are in the region
    # by checking which ones contribute to grid_corners
    
    # Find indices of lines used in grid_corners
    h_indices = set()
    v_indices = set()
    
    if anchor_corner_cell == 0:
        h_indices = {0, 4}
        v_indices = {0, 4}
    elif anchor_corner_cell == 1:
        h_indices = {0, 4}
        v_indices = {len(verticals)-5, len(verticals)-1}
    elif anchor_corner_cell == 2:
        h_indices = {len(horizontals)-5, len(horizontals)-1}
        v_indices = {0, 4}
    elif anchor_corner_cell == 3:
        h_indices = {len(horizontals)-5, len(horizontals)-1}
        v_indices = {len(verticals)-5, len(verticals)-1}
    
    main_grid_lines = {
        "horizontals": [],
        "verticals": []
    }
    
    # Normalize only the horizontal lines in the subset
    for idx in sorted(h_indices):
        if idx < len(horizontals):
            rho, theta = horizontals[idx]
            rho_normalized = rho - offset_x * np.cos(theta) - offset_y * np.sin(theta)
            main_grid_lines["horizontals"].append((rho_normalized, theta))
    
    # Normalize only the vertical lines in the subset
    for idx in sorted(v_indices):
        if idx < len(verticals):
            rho, theta = verticals[idx]
            rho_normalized = rho - offset_x * np.cos(theta) - offset_y * np.sin(theta)
            main_grid_lines["verticals"].append((rho_normalized, theta))
    
    if debug:
        print("\n--- Extracted Region ---")
        print(f"Pixel coordinates: x [{x_min_px}:{x_max_px}], y [{y_min_px}:{y_max_px}]")
        print(f"main_grid_img shape: {main_grid_img.shape}")
        print(f"Normalized lines: {len(main_grid_lines['horizontals'])} H + {len(main_grid_lines['verticals'])} V")
    
    return main_grid_img, main_grid_lines