// https://www.redblobgames.com/grids/hexagons/#line-drawing
export function lerp(a: number, b: number, t: number): number {
    if (t < 0 || t > 1) {
        throw new RangeError(
            `Argument t is out of range, ${t} must be between 0 and 1`
        );
    }
    return a + (b - a) * t;
}
