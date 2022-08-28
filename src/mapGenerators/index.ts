import { NotImplementedError } from "../errors";

import { HexMap } from "../hex";

export abstract class IMapGenerator {
    static generate(map: HexMap): void {
        throw new NotImplementedError();
    }
}
