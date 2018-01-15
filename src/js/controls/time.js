class Time {
    constructor() {
        this.current = document.createElement('time');
        this.current.className = 'om-controls__current';
        this.current.innerHTML = '<span class="om-current">0:00</span>';

        this.delimiter = document.createElement('span');
        this.delimiter.className = 'om-controls__time-delimiter';
        this.delimiter.innerText = '/';

        this.duration = document.createElement('time');
        this.duration.className = 'om-controls__duration';
        this.duration.innerHTML = '<span class="om-duration">0:00</span>';

        return this;
    }
}

export default Time;
