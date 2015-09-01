(function init() {
    var animationTimings = {
        defaultT: 8500,
        intruder: 2500,
        visioneers: 8500
    }
    var amount = animationTimings.defaultT;
    var animating = false;
    var atime = 0;
    var dstep = 0;

    var msg = document.getElementById('message');
    var socket = io.connect('http://localhost:2357');

    var start = null;

    function resetAnimation() {
        setTimeout(function() {
            amount = 0;
            dstep = 0;
            msg.innerHTML = '.';
            msg.style.transform = 'translate3d(0,0,0)';
            animating = false;
            start = null;
        }, 200);
    }

    function setAnimation() {
        amount = msg.getBoundingClientRect().right;
        dstep = amount / atime;
        animating = true;
        console.log('Amount: ', amount);
        console.log('Time: ', atime);
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
        if(animating) {
            return;
        }
        var at = animationTimings[data.from];
        atime = (at) ? at : animationTimings.defaultT;
        msg.innerHTML = data.payload;
        setAnimation();
        setTimeout(function() {
            window.requestAnimationFrame(step);
        }, 2000);
    });
})();