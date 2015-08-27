var socket = io.connect('http://localhost:8000');
var msg = document.getElementById('message');


var start = null;
var atime = 11000;
var amount = 0;
var dstep = 0;

function setAnimation() {
    amount = msg.getBoundingClientRect().right + window.innerWidth;
    dstep = amount / atime;
    console.log(amount);
}

function resetAnimation() {
    setTimeout(function() {
        amount = 0;
        dstep = 0;
        msg.innerHTML = '';
        msg.style.transform = 'translateX(0px)';
        start = null;
    }, 200);
}

function step(timestamp) {
    if(!start) {
        start = timestamp;
    }
    var progress = timestamp - start;
    msg.style.transform = 'translateX(-' + (progress * dstep) + 'px)';
    if(progress < atime) {
        window.requestAnimationFrame(step);
    } else {
        resetAnimation();
    }
}

socket.on('notification', function(data) {
    msg.innerHTML = data;
    setAnimation();
    setTimeout(function() {
        window.requestAnimationFrame(step);
    }, 1500);
});