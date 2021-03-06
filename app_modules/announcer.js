var _ = require('lodash');
var chalk = require('chalk');
var sfx = require('sfx');

var announcer = (function() {
    const VOICES = [
        'victoria', 'agnes', 'albert', 'alex', 'bad news', 'bahh', 'bells', 'boing', 'bruce', 'bubbles', 'cellos', 'deranged', 'fred', 'good news', 'hysterical', 'junior', 'kathy', 'pipe organ', 'princess', 'ralph', 'trinoids', 'vicki', 'whisper','zarvox'
    ];
    
    var chimeSound = 'chime.wav';
    var chimeVolume = 100;
    var isPlaying = false;
    var soundsDir = 'sfx/';
    var voice = VOICES[0];
    
    function setVoice(voiceStr) {
        var cv = voiceStr;
        var v = (cv && typeof cv === 'string') ? cv.toLowerCase() : '';
        if(v.length && VOICES.indexOf(v) > -1) {
            voice = v;
        }
        voiceStr = null;
    }
    
    function announce(msgStr) {
        if(isPlaying) {
            return;
        }
        isPlaying = true;
        var log = chalk.yellow('Announcing: ') + msgStr;
        sfx.play(chimeSound, chimeVolume, function() {
            sfx.say(msgStr, voice, function() {
                sfx.play(chimeSound, chimeVolume, function() {
                    msgStr = null;
                    log = null;
                    isPlaying = false;
                });
            });
        });
        console.log(log);
    }
    
    function init(assetsDir) {
        soundsDir = assetsDir + soundsDir;
        chimeSound = soundsDir + chimeSound;
        return {
            announce: announce,
            setVoice: setVoice
        };
    }
    
    return {
        init: init
    };
})();

module.exports = announcer;