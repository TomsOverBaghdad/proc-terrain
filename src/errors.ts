export class NotImplementedError extends Error {
    constructor() {
        super("Function not implemented");
        this.name = "NotImplementedError";
    }
}
