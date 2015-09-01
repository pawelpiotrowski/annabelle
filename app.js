/* core */
var _ = require('lodash');
var chalk = require('chalk');
var fork = require('child_process').fork;
var hub = require.main.require('./hub');
var moment = require('moment');

const HEART_BEAT_MS = 1000;
const MODULES_DIR = './app_modules/';
const ASSETS_DIR = './assets/';
const CLIENT_DIR = __dirname + '/client';

var alive = null;
var announcer = require(MODULES_DIR + 'announcer').init(ASSETS_DIR);
var config = {
    interval: 1,
    intervalUnits: 'minutes',
    onStart: 'yes',
    voice: ''
};
config.tasks = [];


var server = fork('server.js', [ CLIENT_DIR ]);

//var heart;
//var heartBeat = function beat() {
//    if(!alive) {
//        return;
//    }
//    process.nextTick(checkTasks);
//};

var heartBeat = function beat() {
    if(!alive) {
        return false;
    }
    process.nextTick(checkTasks);
    var heart = setTimeout(beat, HEART_BEAT_MS);
    return true;
};

var hubListenersHandler = {
    message: {
        fn: function msgFn(hubEvent) {
            var msg = 'Got hub message from: ' + hubEvent.from;
            console.log(chalk.blue(msg));
            announcer.announce(hubEvent.payload);
            server.send(hubEvent);
            msg = null;
            hubEvent = null;
            return true;
        },
        isSet: false,
        slug: 'message'
    },
    schedule: {
        fn: function schFn(hubEvent) {
            var msg = 'Got hub schedule: ';
            console.log(msg, hubEvent);
            msg = null;
            hubEvent = null;
            return true;
        },
        isSet: false,
        slug: 'schedule'
    }
};

var tasks = require(MODULES_DIR + 'tasks');
var tasksActive = [];
var taskNextExecTime = null;
var taskNextExecTimeSet = function tnets(fromMoment) {
    var from = (moment.isMoment(fromMoment)) ? fromMoment : moment();
    taskNextExecTime = moment(from).add(config.interval, config.intervalUnits);
    taskNextExecTime = taskNextExecTime.milliseconds(0);
    from = null;
    return true;
};

function checkTasks() {
    if(!tasks.getTasks().active.length) {
        return false;
    }

    var now = moment();
//    var mem = process.memoryUsage();
//    console.log(mem);
//    mem = null;
    if(moment(now).isAfter(taskNextExecTime) || moment(now).isSame(taskNextExecTime)) {
        var msg = 'Exec time @ ' + now._d;
        taskNextExecTimeSet(now);
        console.log(chalk.red(msg));
        msg = null;
        now = null;
        return tasks.tasksExec();
    }

    emitTasksTick();
    now = null;
    return false;
}

function emitTasksTick() {
    if(!hub.listeners('taskstick', true)) {
        return;
    }
    var msg = 'Emmiting taskstick';
    console.log(msg);
    hub.emit('taskstick');
    msg = null;
}

function setTasks() {
    if(!config.tasks.length) {
        tasksActive = tasks.activateTask();    
    } else {
        config.tasks.forEach(function(task) {
            tasks.activateTask(task);
        });
        tasksActive = tasks.getTasks().active;
    }
}

function setConfig(options) {
    if(!options || typeof options !== 'object') {
        return;
    }

    var setConfigMsg = 'ANNABELLE CONFIG ->';

    Object.keys(config).forEach(function(configKey) {
        if(options[configKey]) {
            config[configKey] = options[configKey];
        }
        setConfigMsg += ' ' + configKey + ': "' + config[configKey] + '"';
    });

    announcer.setVoice(config.voice);

    console.log(chalk.red.bold(setConfigMsg));
    setConfigMsg = null;
    options = null;
}

function removeHubListeners() {
    _.forIn(hubListenersHandler, function(handlerObj, handlerSlug) {
        if(handlerObj.isSet) {
            hub.removeListener(handlerSlug, handlerObj.fn);
            handlerObj.isSet = false;
        }
    });
}

function setHubListeners() {
    _.forIn(hubListenersHandler, function(handlerObj, handlerSlug) {
        if(!handlerObj.isSet) {
            hub.on(handlerSlug, handlerObj.fn);
            handlerObj.isSet = true;
        }
    });
}

function initiate() {
    if(alive) {
        return;
    }
    alive = moment();
    var initArgs = require('minimist')(process.argv.slice(2));
    var initMsg = 'START ANNABELLE @ ' + moment()._d;
    if(initArgs._.length) {
        initArgs.tasks = initArgs._.slice();
        initArgs._ = null;
    }
    setConfig(initArgs);
    setTasks();
    taskNextExecTimeSet();
    //heart = setInterval(heartBeat, HEART_BEAT_MS);
    heartBeat();
    setHubListeners();
    if(config.onStart === 'yes') {
        tasks.tasksExec();
    }
    console.log(chalk.red.bold(initMsg));
    initArgs = null;
    initMsg = null;
    return true;
}

initiate();