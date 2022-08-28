import { random, noise2D } from "../random";
import { lerp } from "../utils";

import { HexMap, Hex } from "../hex";

import { IMapGenerator } from ".";

export class ElevationGenerator implements IMapGenerator {
    static initialElevation = -0.4;

    static generate(map: HexMap): void {
        const numContinents = 1;

        this.setInitialElevation(map);
        this.addContinentSplats(map, numContinents);
        this.addLandNoise(map);
        this.normalizePoles(map);
    }

    /**
     * Sets the initial elevation to the class setting
     * @param map
     */
    private static setInitialElevation(map: HexMap): void {
        for (let row = 0; row < map.numRows; row++) {
            if (!map.hexes[row]) map.hexes[row] = [];
            for (let col = 0; col < map.numCols; col++) {
                map.hexes[row][col].elevation = this.initialElevation;
            }
        }
    }

    /**
     * Add varying ranges of large hex 'splats' as the foundation of the continents
     * each splat gets a elvation like 'mound' starting from the center to focus
     * mountain and hill creation near the center of our continents
     * @param map
     * @param numContinents
     */
    private static addContinentSplats(
        map: HexMap,
        numContinents: number
    ): void {
        for (let continent = 0; continent < numContinents; continent++) {
            const numSplats = random.range(5, 7);
            console.log({ numSplats });
            for (let splat = 0; splat < numSplats; splat++) {
                const range = random.range(5, 7);
                const row = random.range(range + 1, map.numRows - range - 1);
                const col = random.range(10, 20) + numContinents;

                this.elevateArea(map, row, col, range);
            }
        }
    }

    /**
     * Creates a mound starting from the center of the given area to the edge of the
     * hexes in range
     * @param map
     * @param row
     * @param col
     * @param range
     */
    private static elevateArea(
        map: HexMap,
        row: number,
        col: number,
        range: number
    ): void {
        const centerHex = map.getHexAt(row, col);
        if (!centerHex) {
            return;
        }
        const hexes = map.getHexesInRange(centerHex, range);
        hexes.forEach((areaHex) => {
            const powerBase = Hex.distance(centerHex, areaHex) / range;
            const lerpAmount = Math.pow(powerBase, 2);
            areaHex.elevation = 1 * lerp(1, 0.35, lerpAmount);
        });
    }

    /**
     * Add some simplex noise to make islands, lakes, and rougher edges
     * @param map
     */
    private static addLandNoise(map: HexMap): void {
        const noiseResolution = 60;
        const noiseScale = 0.75;

        const maxMapLength = Math.max(map.numCols, map.numRows);
        for (let row = 0; row < map.numRows; row++) {
            for (let col = 0; col < map.numCols; col++) {
                const hex = map.getHexAt(row, col);
                const noise =
                    noise2D(
                        (col / maxMapLength) * noiseResolution,
                        (row / maxMapLength) * noiseResolution
                    ) - 0.33;
                hex!.elevation += noise * noiseScale;
            }
        }
    }

    /**
     * Allow at least two hexes north and south for safe passage around the poles
     * @param map
     */
    private static normalizePoles(map: HexMap): void {
        const edgeRows = [0, 1, map.numRows - 2, map.numRows - 1];
        edgeRows.forEach((edgeRow) => {
            for (let col = 0; col < map.numCols; col++) {
                if (map.hexes[edgeRow][col].elevation >= 0) {
                    map.hexes[edgeRow][col].elevation = this.initialElevation;
                }
            }
        });
    }
}
