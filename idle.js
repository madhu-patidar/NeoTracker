var elem = document.getElementById("timer"), timeout, startTimer = function timer() {
    elem.textContent++;
    timeout = setTimeout(timer, 1000)
}
function resetTimer() {
    // here you reset the timer...
    clearTimeout(timeout);
    elem.textContent = -1;
    startTimer();
    //... and also you could start again some other action
}
document.addEventListener("mousemove", resetTimer);
document.addEventListener("keypress", resetTimer);

startTimer();
