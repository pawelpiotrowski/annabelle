/* tasks */
var _ = require('lodash');
var chalk = require('chalk');

const STR_NO = 'no';
const STR_ONLY = 'only';
const STR_YES = 'yes';
const AVAILABLE_TASKS = [
    {
        name: 'visioneers',
        useEmitter: STR_NO // 'yes', 'no', 'only'
    },
    {
        name: 'connectivity',
        useEmitter: STR_ONLY
    },
    {
        name: 'intruder',
        useEmitter: STR_ONLY
    }
];
const DEFAULT_TASK_INDEX = 0;
const TASKS_DIR = './tasks/';

var tasks = {};
tasks.slugs = [];
tasks.objects = [];
tasks.active = [];
tasks.modules = {};

AVAILABLE_TASKS.forEach(function(task) {
    var thisTask = _.clone(task);
    thisTask.initiated = false;
    tasks.objects.push(thisTask);
    tasks.slugs.push(task.name);
});

function getTaskSlug(taskOrSlug) {
    var defaultSlug = tasks.slugs[DEFAULT_TASK_INDEX];
    if(!taskOrSlug) {
        return defaultSlug;
    }
    var taskSlug = (typeof taskOrSlug === 'object') ? taskOrSlug.name : taskOrSlug;
    var taskIndex = tasks.slugs.indexOf(taskSlug);
    return (taskIndex > -1) ? taskSlug : defaultSlug;
};

function getTaskModule(taskSlug) {
    if(!tasks.modules[taskSlug]) {
        tasks.modules[taskSlug] = require(TASKS_DIR + taskSlug);
    }
    return tasks.modules[taskSlug];
}

function getTasks() {
    return tasks;
}

function deactivateTask(task) {
    var taskSlug = getTaskSlug(task);
    if(tasks.active.indexOf(taskSlug) > -1) {
        tasks.active.push(taskSlug);
        tasks.active = _.without(tasks.active, taskSlug);
    }
    return tasks.active;
}

function activateTask(task) {
    var taskSlug = getTaskSlug(task);
    if(tasks.active.indexOf(taskSlug) < 0) {
        tasks.active.push(taskSlug);
    }
    return tasks.active;
}

function getTask(task) {
    var taskSlug = getTaskSlug(task);
    return getTaskModule(taskSlug);
}

function tasksExec() {
    var msg = 'EXEC TASKS!!!';
    console.log(chalk.green(msg));
    msg = null;

    tasks.active.forEach(function(activeTaskSlug) {
        var thisTaskIndex = tasks.slugs.indexOf(activeTaskSlug);
        var thisTaskObject = tasks.objects[thisTaskIndex];

        if(!thisTaskObject.initiated || thisTaskObject.useEmitter !== STR_ONLY) {
            process.nextTick(getTask(activeTaskSlug).execTask);
            thisTaskObject.initiated = true;
        }

        thisTaskIndex = null;
        thisTaskObject = null;

    });
    return true;
}

module.exports = {
    activateTask: activateTask,
    deactivateTask: deactivateTask,
    getTasks: getTasks,
    tasksExec: tasksExec
};