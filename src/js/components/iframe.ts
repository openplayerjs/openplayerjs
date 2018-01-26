import IFile from './interfaces/media/file';
import IType from './interfaces/media/type';

export default class Iframe implements IType {
    public element: HTMLIFrameElement;
    public media: IFile;
    public promise: Promise<any>;

    constructor(element, media) {
        this.element = element;
        this.media = media;
        this.promise = new Promise(resolve => {
            resolve();
        });
    }
}
