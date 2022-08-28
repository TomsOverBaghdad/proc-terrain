import { Color4, float } from "@babylonjs/core";
import { ElevationGenerator } from "./mapGenerators/elevation";

/**
 * TODO MOVE TO BETTER PLACE
 */
const rbgToColor4 = (r: number, g: number, b: number): Color4 => {
    return new Color4(r / 255, g / 255, b / 255);
};

/**
 * TODO MOVE TO BETTER PLACE
 */
// const COAST = rbgToColor4(87, 154, 193);
export const DESERT = rbgToColor4(199, 157, 103);
export const GRASS = rbgToColor4(62, 113, 10);
export const HILLS = rbgToColor4(72, 92, 10);
// const GROUND = rbgToColor4(90, 50, 10); // DIRT
// const MARSH = rbgToColor4(98, 138, 47);
export const MOUNTAIN = rbgToColor4(185, 175, 173);
export const OCEAN = rbgToColor4(15, 35, 138);
export const NONE = rbgToColor4(255, 255, 255);

/**
 * HEX
 */

export class Hex {
    /**
     * Game Hex
     */
    elevation = 0.0;
    terrain = NONE;

    /**
     * Hex
     */
    readonly q;
    readonly r;
    readonly s;

    readonly radius = 1; // size
    readonly height = 2 * this.radius;
    readonly width = Math.sqrt(3) * this.radius;

    readonly verticalPosition;
    readonly horizontalPosition;

    constructor(row: number, col: number) {
        this.r = row;
        this.q = col;
        this.s = -(this.q + this.r);

        this.verticalPosition = this.height * 0.75 * this.r;
        this.horizontalPosition = this.width * (this.q + this.r / 2);
    }

    // https://www.redblobgames.com/grids/hexagons/#distances-axial
    static distance(a: Hex, b: Hex): float {
        // this method is flawed if we are wrapping our map
        return (
            (Math.abs(a.q - b.q) +
                Math.abs(a.q + a.r - b.q - b.r) +
                Math.abs(a.r - b.r)) /
            2
        );
    }
}

export class HexMap {
    numRows: number;
    numCols: number;
    hexes: Hex[][];

    private readonly wrapEastWest = true;

    constructor(numRows = 30, numCols = 60) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.hexes = [];
        for (let row = 0; row < this.numRows; row++) {
            if (!this.hexes[row]) this.hexes[row] = [];
            for (let col = 0; col < this.numCols; col++) {
                const hex = new Hex(row, col);
                this.hexes[row][col] = hex;
            }
        }
        this.generateMap();
    }

    getHexAt(row: number, col: number): Hex | null {
        if (this.wrapEastWest) {
            col = col % this.numCols;
            if (col < 0) {
                col += this.numCols;
            }
        }
        try {
            return this.hexes[row][col];
        } catch {
            console.warn(`No hex for (row, col): (${row}, ${col})`);
            return null;
        }
    }

    // https://www.redblobgames.com/grids/hexagons/#range-coordinate
    getHexesInRange(centerHex: Hex, range: number): Hex[] {
        const hexesInRange: Hex[] = [];
        for (let q = -range; q <= range; q++) {
            for (
                let r = Math.max(-range, -q - range);
                r <= Math.min(range, -q + range);
                r++
            ) {
                const hexInRange = this.getHexAt(
                    centerHex.r + r,
                    centerHex.q + q
                );
                if (hexInRange) {
                    hexesInRange.push(hexInRange);
                }
            }
        }
        return hexesInRange;
    }

    // TODO: move to game controller?
    generateMap(): void {
        ElevationGenerator.generate(this);
    }
}
