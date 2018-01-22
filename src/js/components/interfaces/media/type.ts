import File from './file';

export default interface Type {
    media: File;
    promise: Promise<any>;
}
