class Time {
    constructor() {
        const current = document.createElement('time');
        current.className = 'om-controls__current';
        current.innerHTML = '<span class="om-current">0:00</span>';
        container.appendChild(current);

        const duration = document.createElement('time');
        duration.className = 'om-controls__duration';
        duration.innerHTML = '<span class="om-duration">0:00</span>';
        container.appendChild(duration);
    }
}

export default Time;
