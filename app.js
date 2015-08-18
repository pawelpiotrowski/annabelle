var chalk = require('chalk');
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
    
    var tasks = require(MODULES_DIR + 'tasks');
    var tasksActive = [];
    var taskNextExecTime = null;
    var taskNextExecTimeSet = function(fromMoment) {
        var from = (moment.isMoment(fromMoment)) ? fromMoment : moment();
        taskNextExecTime = moment(from).add(config.interval, config.intervalUnits);
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
        }
        
        now = null;
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
        console.log(chalk.red.bold(initMsg));
        initArgs = null;
        initMsg = null;
    }
    return {
        initiate: initiate
    };
})();

Annabelle.initiate();