var socket = io.connect('http://localhost:8000');
var msg = document.getElementById('message');


var start = null;
var atime = 8500;
var amount = 0;
var dstep = 0;

function setAnimation() {
    amount = msg.getBoundingClientRect().right;
    dstep = amount / atime;
    console.log('Amount: ', amount);
    console.log('Time: ', atime);
}

function resetAnimation() {
    setTimeout(function() {
        amount = 0;
        dstep = 0;
        atime = 0;
        msg.innerHTML = '.';
        msg.style.transform = 'translate3d(0,0,0)';
        start = null;
    }, 200);
}

function step(timestamp) {
    if(!start) {
        start = timestamp;
    }
    var progress = timestamp - start;
    msg.style.transform = 'translate3d(-' + (progress * dstep) + 'px,0,0)';
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
    }, 2000);
});