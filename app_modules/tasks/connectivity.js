/* task connectivity */
var hub = require.main.require('./hub');
var moment = require('moment');

//    hub.on('taskstick', function() {
//        console.log('Task tick recevied');
//    });
function execTask() {
    var msg = 'Task exec in connectivity @ ' + moment()._d;
    console.log(msg);
    msg = null;
    return true;
}

module.exports.execTask = execTask;