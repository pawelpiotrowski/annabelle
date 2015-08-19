var _ = require('lodash');
var chalk = require('chalk');
var hub = require.main.require('./hub');
var moment = require('moment');

var Annabelle = (function init() {
    const HEART_BEAT_MS = 1000;
    const MODULES_DIR = './app_modules/';
    
    var alive = null;
    var config = {
        interval: 1,
        intervalUnits: 'minutes',
        voice: ''
    };
    config.tasks = [];
    
    var heart;
    var heartBeat = (function beat() {
        if(!alive) {
            return;
        }
        process.nextTick(checkTasks);
        heart = setTimeout(beat, HEART_BEAT_MS);
    });
    
    var hubListenersHandler = {
        message: {
            fn: function(hubEvent) {
                var msg = 'Got hub message: ';
                console.log(msg, hubEvent);
                msg = null;
                hubEvent = null;
            },
            isSet: false,
            slug: 'message'
        },
        schedule: {
            fn: function(hubEvent) {
                var msg = 'Got hub schedule: ';
                console.log(msg, hubEvent);
                msg = null;
                hubEvent = null;
            },
            isSet: false,
            slug: 'schedule'
        }
    };
    
    var tasks = require(MODULES_DIR + 'tasks');
    var tasksActive = [];
    var taskNextExecTime = null;
    var taskNextExecTimeSet = function(fromMoment) {
        var from = (moment.isMoment(fromMoment)) ? fromMoment : moment();
        taskNextExecTime = moment(from).add(config.interval, config.intervalUnits);
        taskNextExecTime = taskNextExecTime.milliseconds(0);
        from = null;
    };
    
    function checkTasks() {
        if(!tasks.getTasks().active.length) {
            return;
        }
        
        var now = moment();
        if(moment(now).isAfter(taskNextExecTime) || moment(now).isSame(taskNextExecTime)) {
            var msg = 'Exec time @ ' + now._d;
            taskNextExecTimeSet(now);
            console.log(chalk.red(msg));
            tasks.tasksExec();
            msg = null;
            now = null;
            return;
        }
        
        emitTasksTick();
        now = null;
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
        
        console.log(chalk.red.bold(setConfigMsg));
        setConfigMsg = null;
        options = null;
    }
    
    hub.on('connected', function(hubEvent) {
        console.log(hubEvent);
    });
    
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
        heartBeat();
        setHubListeners();
        console.log(chalk.red.bold(initMsg));
        initArgs = null;
        initMsg = null;
    }
    return {
        initiate: initiate
    };
})();

Annabelle.initiate();