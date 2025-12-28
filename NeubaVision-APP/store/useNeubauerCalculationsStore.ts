import { create } from "zustand";

/**
 * Interface representing the state and actions for Neubauer chamber calculations.
 */
type NebauerCalculationsState = {
    /** The factor by which the original sample was diluted (e.g., 10 for 1:10 dilution). */
    dilutionFactor: number;
    /** The volume of a single counting square in cubic millimeters (mm³). */
    volumePerSquare: number;
    /** The average number of cells found in a single square. */
    cellsPerSquare: number;
    /** The final calculated concentration of cells per milliliter (cells/mL). */
    cellsPerMilliliter: number;
    
    /**
     * Updates the dilution factor used in calculations.
     * @param dilutionFactor - The new dilution factor.
     */
    setDilutionFactor: (dilutionFactor: number) => void;

    /**
     * Calculates and updates the average number of cells per square.
     * @param nCells - Total number of cells counted across all squares.
     * @param nSquares - Total number of squares counted.
     */
    calculateCellsPerSquare: (nCells: number, nSquares: number) => void;

    /**
     * Calculates and updates the volume of a single square based on its dimensions.
     * @param height - The height of the square (mm).
     * @param width - The width of the square (mm).
     * @param depth - The depth of the chamber (mm).
     */
    calculateVolumePerSquare: (height: number, width: number, depth: number) => void;

    /**
     * Calculates and updates the final concentration of cells per milliliter.
     * Formula: (Cells per Square / Volume per Square) * Dilution Factor * 1000.
     * Note: 1 mm³ = 1uL. Since there are 1000 uL in 1 mL, we multiply by 1000 to get mL.
     */
    calculateCellsPerMilliliter: () => void;
}

/**
 * Store for managing Neubauer chamber cell counting logic and results.
 */
export const useNeubauerCalculationsStore = create<NebauerCalculationsState>((set, get) => ({
    dilutionFactor: 10,
    volumePerSquare: 0,
    cellsPerSquare: 0,
    cellsPerMilliliter: 0,

    setDilutionFactor: (dilutionFactor: number) => 
        set({ dilutionFactor }),

    calculateCellsPerSquare: (nCells: number, nSquares: number) => {
        if (nSquares === 0) {
            set({ cellsPerSquare: 0 });
            return;
        }
        set({ cellsPerSquare: nCells / nSquares });
    },

    calculateVolumePerSquare: (height: number, width: number, depth: number) => 
        set({ volumePerSquare: height * width * depth }),

    calculateCellsPerMilliliter: () => {
        const { cellsPerSquare, volumePerSquare, dilutionFactor } = get();
        if (volumePerSquare === 0) {
            set({ cellsPerMilliliter: 0 });
            return;
        }
        // (Cells / mm³) * Dilution * (1000 mm³ / 1 mL)
        const concentration = (cellsPerSquare / volumePerSquare) * dilutionFactor * 1000;
        set({ cellsPerMilliliter: concentration });
    },
}));
