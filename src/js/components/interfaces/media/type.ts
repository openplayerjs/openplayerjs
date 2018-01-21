import File from "./file";

export default interface Type {
    /**
     * @type File
     */
    media: File;

    /**
     * @type Promise
     */
    promise: Promise<any>;
}
