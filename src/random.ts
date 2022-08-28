import Alea from "alea";
import { createNoise2D } from "simplex-noise";

export class Random {
    readonly seed;

    private rng: () => number;

    constructor(seed: any = undefined) {
        this.seed = seed;
        this.rng = this.seed ? Alea(this.seed) : Alea();
    }

    /**
     * Gets the next random number between 0 and 1
     * @returns
     */
    next() {
        return this.rng();
    }

    /**
     * Gets a random number in range of the min and max inclusive.
     * @param min
     * @param max
     * @returns
     */
    range(min: number, max: number): number {
        max = max + 1; // inclusive
        min = min - 1; // inclusive
        const diff = max - min;
        return Math.floor(this.rng() * diff) + min;
    }
}

// revert to using SEED when testing a specific map
// const SEED = "boobies";
// const SEED = 8008135;
// let SEED = new Random().range(0, 999999);
const SEED = 295675;
console.log({ SEED });
export const random = new Random(SEED);

export const noise2D = createNoise2D(() => random.next());
// const noise2D = createNoise2D(Alea());

// simondev
// https://youtu.be/U9q-jM3-Phc?t=332
// https://github.com/simondevyoutube/ProceduralTerrain_Part2/blob/master/src/noise.js#L66
function getNoise(x: number, y: number) {
    const options = {
        scale: 7, // how close or far from the "terrain", bigger numbers get you closer (bigger land masses)
        persistence: 0.5,
        octaves: 5,
        lacunarity: 1,
        exponentiation: 7, // higher number makes more valleys / islands
        height: 1,
    };

    const xs = x / options.scale;
    const ys = y / options.scale;
    const G = Math.pow(2.0, -options.persistence);
    let amplitude = 1.0;
    let frequency = 1.0;
    let normalization = 0;
    let total = 0;
    for (let o = 0; o < options.octaves; o++) {
        let noiseValue = noise2D(xs * frequency, ys * frequency); // number between -1 and 1
        noiseValue = noiseValue * 0.5 + 0.5; // normalize to be between 0 and 1
        total += noiseValue * amplitude;
        normalization += amplitude;
        amplitude *= G;
        frequency *= options.lacunarity;
    }
    total /= normalization;
    return Math.pow(total, options.exponentiation) * options.height;
}
