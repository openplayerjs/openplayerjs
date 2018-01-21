import Type from './interfaces/media/type';
import File from './interfaces/media/file';

export default class Iframe implements Type {
    element: HTMLIFrameElement;
    media: File;
    promise: Promise<any>;

    constructor (element, media) {
        this.element = element;
        this.media = media;
        this.promise = new Promise(resolve => {
            resolve();
        });
    }
}
