import { Color4, float } from "@babylonjs/core";
import Alea from "alea";

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
const DESERT = rbgToColor4(199, 157, 103);
const GRASS = rbgToColor4(62, 92, 10);
// const GROUND = rbgToColor4(90, 50, 10);
// const MARSH = rbgToColor4(98, 138, 47);
// const MOUNTAIN = rbgToColor4(107, 98, 96);
const OCEAN = rbgToColor4(15, 35, 138);

/**
 * HEX
 */

export class Hex {
    /**
     * Game Hex
     */
    elevation: float;
    terrain: Color4;

    /**
     * Hex
     */
    readonly q: number;
    readonly r: number;
    readonly s: number;

    readonly radius = 1; // size
    readonly height = 2 * this.radius;
    readonly width = Math.sqrt(3) * this.radius;

    // https://www.redblobgames.com/grids/hexagons/#distances-axial
    static distance(a: Hex, b: Hex): float {
        return (
            (Math.abs(a.q - b.q) +
                Math.abs(a.q + a.r - b.q - b.r) +
                Math.abs(a.r - b.r)) /
            2
        );
    }

    constructor(row: number, col: number) {
        this.r = row;
        this.q = col;
        this.s = -(this.q + this.r);

        this.elevation = -0.5;
        this.terrain = OCEAN;
    }

    verticalPosition() {
        return this.height * 0.75 * this.r;
    }

    horizontalPosition() {
        return this.width * (this.q + this.r / 2);
    }
}

export class HexMap {
    numRows: number;
    numCols: number;
    hexes: Hex[][] = [];

    private readonly wrapEastWest = true;

    // constructor(numRows: number = 74, numCols: number = 46) {
    constructor(numRows = 30, numCols = 60) {
        this.numRows = numRows;
        this.numCols = numCols;
        this.generateMap();
        console.log({ hexes: this.hexes });
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
        const mapGenerators: IMapGenerator[] = [
            new MapGenerator(),
            new ContinentGenerator(),
        ];
        mapGenerators.forEach((generator: IMapGenerator) => {
            generator.generate(this);
        });
    }
}

/**
 * RANDOM
 */

// const SEED = "testicles";
// const randomNumGenerator = Alea(SEED)
// revert to using SEED when testing a specific map
const randomNumGenerator = Alea();

const randNumInRange = (min: number, max: number): number => {
    const diff = max - min;
    return Math.floor(randomNumGenerator() * diff) + min;
};

// https://www.redblobgames.com/grids/hexagons/#line-drawing
function lerp(a: float, b: float, t: float) {
    return a + (b - a) * t;
}

/**
 * MAP GENERATORS
 */

interface IMapGenerator {
    generate(map: HexMap): void;
}

class ContinentGenerator implements IMapGenerator {
    generate(map: HexMap): void {
        const numContinents = 1;

        for (let continent = 0; continent < numContinents; continent++) {
            const numSplats = randNumInRange(4, 8);
            for (let splat = 0; splat < numSplats; splat++) {
                const range = randNumInRange(5, 8);
                const row = randNumInRange(range, map.numRows - range);
                const col = Math.floor(randNumInRange(10, 20) + numContinents);

                console.log("elevate area", { row, col, range });
                this.elevateArea(map, row, col, range);
            }
        }
    }

    private elevateArea(
        map: HexMap,
        row: number,
        col: number,
        range: number
    ): void {
        const centerHex = map.getHexAt(row, col);
        if (!centerHex) {
            return;
        }
        console.log(`gethex: q: ${centerHex.q} r: ${centerHex.r}`);
        const hexes = map.getHexesInRange(centerHex, range);
        hexes.forEach((areaHex) => {
            /**
             *
             * TODO; play around with these values to get shapes you like
             */

            const powerBase = Hex.distance(centerHex, areaHex) / range;
            const lerpAmount = Math.pow(powerBase, 2);
            console.log("lerp", {
                l: lerp(1, 0.25, lerpAmount),
                powerBase,
                lerpAmount,
                distance: Hex.distance(centerHex, areaHex),
                range,
            });
            areaHex.elevation = 0.8 * lerp(1, 0.25, lerpAmount);
            areaHex.terrain = GRASS;
        });
        centerHex.terrain = DESERT;
    }
}

class MapGenerator implements IMapGenerator {
    generate(map: HexMap): void {
        map.hexes = [];
        for (let row = 0; row < map.numRows; row++) {
            if (!map.hexes[row]) map.hexes[row] = [];
            for (let col = 0; col < map.numCols; col++) {
                map.hexes[row][col] = new Hex(row, col);
            }
        }
    }
}
