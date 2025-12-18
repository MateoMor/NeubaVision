import numpy as np
from sklearn.cluster import DBSCAN

def merge_hough_lines(image_shape: tuple[int, int], rhos: np.ndarray, thetas: np.ndarray, eps: float = 0.025, min_samples: int = 1) -> tuple[np.ndarray, np.ndarray]:
    # --- Merge lines using DBSCAN clustering ---
    # Prepare data: normalize rho and theta for distance calculation
    # rho ranges from 0 to max_rho (diagonal of image)
    # theta ranges from 0 to pi
    
    max_rho = np.sqrt(image_shape[0]**2 + image_shape[1]**2)
    
    # Create feature matrix: normalize rho and theta to similar scales
    # theta is in radians [0, pi], rho in pixels [0, max_rho]
    features = np.column_stack([
        np.abs(rhos) / max_rho,  # normalize rho to [0, 1]
        np.cos(thetas * 2) * 0.25   # normalize theta to [0, 1]
    ])
    
    # Apply DBSCAN clustering
    # eps: maximum distance between points in a cluster
    # min_samples: minimum number of points to form a core point
    clustering = DBSCAN(eps=eps, min_samples=min_samples).fit(features)
    labels = clustering.labels_
    
    # Group lines by cluster
    unique_labels = np.unique(labels)
    merged_rhos = []
    merged_thetas = []
    
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

        merged_rhos.append(mean_rho)
        merged_thetas.append(mean_theta_rad)

    return merged_rhos, merged_thetas