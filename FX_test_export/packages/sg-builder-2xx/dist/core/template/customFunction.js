var SG_GAME_CREATED = false;
var SG_GAME_PAUSED = false;
var SG_GAME_VOLUME = 1;

function spBoot() {
    window.SG_GAME_CREATED = true;
    if (window["cc"]) ccBoot();
}
function spPauseGame() {
    window.SG_GAME_PAUSED = true;
}
function spResumeGame() {
    window.SG_GAME_PAUSED = false;
}
function spSetVolume(e) {
    window.SG_GAME_VOLUME = e;
    if (window["cc"]) ccSetVolume(e);
}
