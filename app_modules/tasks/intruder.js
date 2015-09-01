/* task intruder */
var five = require('johnny-five');
var hub = require.main.require('./hub');

const PING_PIN = 7;

var board = null;
var activeLed = -1;
var leds = [
    {
        condition: 20,
        pin: 10
    },
    {
        condition: 32,
        pin: 11
    },
    {
        condition: 45,
        pin: 12
    }
];
var ledsLength = leds.length;
var ping = null;
var pingRange = leds[ledsLength - 1].condition;

function activeLedDeactivate() {
    leds[activeLed].active = false;
    leds[activeLed].led.off();
    activeLed = -1;
}

function ledsController(ledOnIndex) {
    // if active led is active or no active set or found
    if(ledOnIndex === activeLed || typeof ledOnIndex !== 'number' && activeLed === -1) {
        return false;
    }
    // if no active found switch off active one
    if(typeof ledOnIndex !== 'number') {
        activeLedDeactivate();
        return false;
    }
    // active found check is we have active set
    if(activeLed > -1) {
        activeLedDeactivate();
    }
    // activate active
    leds[ledOnIndex].active = true;
    leds[ledOnIndex].led.on();
    activeLed = ledOnIndex;
    if(activeLed === 0) {
        emitMessage();
    }
    return true;
}

function pingHandler() {
    var inch = Number(this.in);
    if(inch >= pingRange) {
        ledsController();
        return;
    }
    for(var i = 0; i < ledsLength; i++) {
        if(inch < leds[i].condition) {
            ledsController(i);
            break;
        }
    }
    inch = null;
}

function setLeds() {
    leds.forEach(function(l) {
        l.active = false;
        l.led = new five.Led(l.pin);
    });
}

function setPing() {
    ping = new five.Ping(PING_PIN);
    ping.on('change', pingHandler);
}

function boardReady() {
    var msg = 'Task exec in intruder: board connected';
    setLeds();
    setPing();
    console.log(msg);
    msg = null;
}

function emitMessage() {
    hub.emit('message', {
        type: 'message',
        payload: 'Intruder alert!!',
        from: 'intruder'
    });
}

function execTask() {
    if(board) {
        return false;
    }
    board = new five.Board();
    board.on('ready', boardReady);
    return true;
}

module.exports.execTask = execTask;