function updateClock() {
    //get the element time, and store it as variable
    const timeElement = document.getElementById('time');
    const now = new Date();

    //get the time
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();

    // paddin
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    //stringify
    const timeString = `${hours}:${minutes}:${seconds}`;

    // set the element thing
    timeElement.textContent = timeString;
}

// update every seconde
setInterval(updateClock, 1000);