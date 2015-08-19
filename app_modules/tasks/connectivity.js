var hub = require.main.require('./hub');
var moment = require('moment');

var connectivity = (function() {
//    hub.on('taskstick', function() {
//        console.log('Task tick recevied');
//    });
    function execTask() {
        var msg = 'Task exec in connectivity @ ' + moment()._d;
        console.log(msg);
        msg = null;
    }
    
    return {
        execTask: execTask
    };

})();

module.exports = connectivity;