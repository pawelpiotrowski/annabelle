var hub = require.main.require('./hub');
var moment = require('moment');

var visioneers = (function() {
    
    function execTask() {
        var msg = 'Task exec in visioneers @ ' + moment()._d;
        console.log(msg);
        msg = null;
        hub.emit('message', {
            type: 'message'
        });
    }
    
    return {
        execTask: execTask
    };

})();

module.exports = visioneers;