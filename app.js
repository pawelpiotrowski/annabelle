var chalk = require('chalk');
var moment = require('moment');

var Annabelle = (function init() {
    const HEART_BEAT_MS = 100;
    const TASKS = 'tasks';
    
    //const INTERVAL_UNITS = 'minutes';
    
    var alive = false;
    var config = {
        interval: 1,
        voice: ''
    };
    config[TASKS] = [];
    
    var heart;
    var heartBeat = (function beat() {
        if(!alive) {
            return;
        }
        var t = moment();
        var displayT = function() {
            var l = 'Testing ' + t._d + ' Ab ab lorem multos aute ea duis doctrina quo eram multos ubi ut nam tractavissent sed arbitror de culpa proident se doctrina sempiternum Expetendis aute cupidatat probant an deserunt noster ex cupidatat exquisitaque, ut qui sempiternum, nulla qui est fore mentitum ne non eram tempor, offendit ad sint offendit e nostrud amet iudicem mentitum, quis transferrem aliquip aute litteris. Nulla singulis cupidatat quo proident summis aliquip, e esse eiusmod hic o eram quae quae nescius. Culpa quamquam qui reprehenderit sed incididunt a elit aliquip. Eiusmod ab esse ullamco. Si quis offendit, est cernantur et incididunt, nescius labore magna se eram, te quem vidisse distinguantur, quo multos consequat philosophari, ullamco nisi excepteur doctrina, te arbitror relinqueret et admodum aliqua laboris ingeniis. Eiusmod quo malis.';
            console.log(l);
            t = null;
            l = null;
        };
        process.nextTick(displayT);
        heart = setTimeout(beat, HEART_BEAT_MS);
    });
    
    function setConfig(options) {
        if(!options || typeof options !== 'object') {
            return;
        }
        
        var setConfigMsg = 'AGGIE CONFIG ->';
        
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
        alive = true;
        var initArgs = require('minimist')(process.argv.slice(2));
        var initMsg = 'START AGGIE @ ' + moment()._d;
        if(initArgs._.length) {
            initArgs[TASKS] = initArgs._.slice();
            initArgs._ = null;
        }
        setConfig(initArgs);
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