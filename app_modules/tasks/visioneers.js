var _ = require('lodash');
var hub = require.main.require('./hub');
var moment = require('moment');
require('moment-range');

var visioneers = (function() {
    const SHIFT = {
        start: {
            day: 1,
            hours: 10,
            minutes: 0
        },
        end: {
            day: 5,
            hours: 19,
            minutes: 0
        }
    };
    const STATES = [
        'DAYS-OFF-AFTER-WORKING-WEEK',
        'DAYS-OFF-BEFORE-WORKING-WEEK',
        'WORKING-WEEK-DAY-AFTER-WORK',
        'WORKING-WEEK-DAY-BEFORE-WORK',
        'WORKING-DAY-LAST-DAY-OF-WORK',
        'WORKING-DAY-AT-WORK'
    ];
    
    var start = SHIFT.start;
    var end = SHIFT.end;
    
    // calculating work hours
    var workingDayStart = moment().hours(start.hours).minutes(start.minutes).seconds(0);
    var workingDayEnd = moment().hours(end.hours).minutes(end.minutes).seconds(0);
    var workingRange = moment.range(workingDayStart, workingDayEnd).valueOf();
    var workingDuration = +(moment.duration(workingRange).as('hours')).toFixed(2);
    var workingDurationDays = (end.day - start.day) + 1;
    var workingShiftRange = workingRange * workingDurationDays;
    var workingShiftDuration = Math.round(moment.duration(workingShiftRange).as('minutes'));
    
    var getWorkingShiftDuration = function(forIsoDay) {
        if(!forIsoDay) {
            return workingShiftDuration;
        }
        var mltpl = workingRange * ((end.day - forIsoDay) + 1);
        return Math.round(moment.duration(mltpl).as('minutes'));
    };
    
    var firstAnnounceForDay = true;
    var getAnnounceString = function(taskObj) {
        var stateIndex = STATES.indexOf(taskObj.state);

        var say = '';
        var sayMinutesPart = ' minutes of productivity remaining';
        // precaution
        var timeLeftAbs = Math.abs(taskObj.timeLeft);
        var timeLeftFormat = new Intl.NumberFormat().format(timeLeftAbs);

        switch(stateIndex) {
        case 0:
            say += 'Enjoy your break. Next week you will have ' + timeLeftFormat;
            say += sayMinutesPart + ', before the weekend.';
        break;
        case 1:
            say += 'Get ready. This week you have ' + timeLeftFormat;
            say += sayMinutesPart + ', before the weekend.';
            firstAnnounceForDay = true;
        break;
        case 2:
            say += 'Working late? There are ' + timeLeftFormat;
            say += sayMinutesPart + ', before the weekend.';
        break;
        case 3:
            say += 'Do not get late! There are ' + timeLeftFormat;
            say += sayMinutesPart + ', before the weekend.';
            firstAnnounceForDay = true;
        break;
        case 4:
        case 5:
            if(firstAnnounceForDay) {
                say += 'Today is ' + moment(taskObj.timeNow).format('dddd') + '. ';
                firstAnnounceForDay = false;
            }
        default:
            say += 'There are ' + timeLeftFormat;
            say += sayMinutesPart + ', before the weekend.';
        }

        return say;
    };
    
    var getTimeBracketNow = function(timeNow) {
        var sd = start.day;
        var sh = start.hours;
        var sm = start.minutes;
        var ed = end.day;
        var eh = end.hours;
        var em = end.minutes;
        return {
            dayFrom: moment(timeNow).hours(sh).minutes(sm).seconds(0),
            dayTo: moment(timeNow).hours(eh).minutes(em).seconds(0),
            weekFrom: moment(timeNow).isoWeekday(sd).hours(sh).minutes(sm).seconds(0),
            weekTo: moment(timeNow).isoWeekday(ed).hours(eh).minutes(em).seconds(0)
        };
    };
    
    function emitMessage(msg) {
        hub.emit('message', {
            type: 'message',
            payload: msg,
            from: 'visioneers'
        });
        msg = null;
    }
    
    
    function execTask() {
        var task = {
            state: STATES[0],
            timeLeft: 0,
            timeNow: moment() //.isoWeekday(6).hours(6);
        };
        task = _.merge(task, getTimeBracketNow(task.timeNow));
        
        // not inside working shift ex Mon/morning || Fri/evening || Sat || Sun
        if(!moment(task.timeNow).isBetween(task.weekFrom, task.weekTo)) {
            task.timeLeft = workingShiftDuration;
            task.state = (moment(task.timeNow).isBefore(task.weekFrom)) ? 1 : 0;
            task.state = STATES[task.state];
            emitMessage(getAnnounceString(task));
            task = null;
            return;
        }
        
        // working shift but outside hours
        if(!moment(task.timeNow).isBetween(task.dayFrom, task.dayTo)) {
            task.isoDay = moment(task.timeNow).isoWeekday();
            task.isBefore = moment(task.timeNow).isBefore(task.dayFrom);
            task.state = STATES[3];
            // after work
            if(!task.isBefore) {
                task.isoDay += 1;
                task.state = STATES[2];
            }
            task.timeLeft = getWorkingShiftDuration(task.isoDay);
            emitMessage(getAnnounceString(task));
            task = null;
            return;
        }
        
        // working shift
        
        // last day of work
        if(moment(task.timeNow).isoWeekday() === end.day) {
            task.timeStart = moment(task.timeNow).seconds(0);
            task.timeLeftRange = moment.range(task.timeStart, task.weekTo).valueOf();
            task.timeLeftDur = moment.duration(task.timeLeftRange).as('minutes');
            task.timeLeft = Math.round(task.timeLeftDur);
            task.state = STATES[5];
            emitMessage(getAnnounceString(task));
            task = null;
            return;
        }
        
        // working time
        
        // calculate time for current day till finish
        task.dayTimeLeft = moment.range(moment(task.timeNow), task.dayTo).valueOf();
        task.dayTimeLeftDur = Math.round(moment.duration(task.dayTimeLeft).as('minutes'));
        
        // check how many days from today till end of working week
        task.timeNowIso = moment(task.timeNow).isoWeekday();
        task.hoursLeft = (end.day - task.timeNowIso) * workingDuration;
        task.hoursLeftDur = moment.duration(task.hoursLeft, 'hours');
        task.timeLeft = task.dayTimeLeftDur + task.hoursLeftDur.as('minutes');
        task.state = STATES[5];
        
        // AND FINALLY
        emitMessage(getAnnounceString(task));
        task = null;
        
    }
    
    return {
        execTask: execTask
    };

})();

module.exports = visioneers;