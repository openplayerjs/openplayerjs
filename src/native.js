class NativeMedia {
    constructor(element) {
        this.element = element;
        this.promise = new Promise(resolve => {
            resolve();
        });
        return this;
    }

    load() {
        this.promise.then(() => {
            this.element.load();
        });
    }
}

export default NativeMedia;
