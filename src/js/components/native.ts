import Type from './interfaces/media/type';
import File from './interfaces/media/file';

export default class Native implements Type {
    element: HTMLMediaElement;
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
