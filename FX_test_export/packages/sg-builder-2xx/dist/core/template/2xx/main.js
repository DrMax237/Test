var CC_BOOT = false;

function ccBoot() {
    if (CC_BOOT) return;

    var settings = window._CCSettings;
    window._CCSettings = undefined;

    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;

    var splash = document.getElementById("splash");
    var progressBar = splash.querySelector(".progress-bar span");


    function setLoadingDisplay() {
        splash.style.display = "block";
        progressBar.style.width = "10%";

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            setTimeout(() => {
                console.timeEnd("Start")
                splash.style.display = "none";
                window.spTrackEvent instanceof Function && window.spTrackEvent("show");
            }, 500);
        });
    }

    function onProgress(completedCount, totalCount) {
        var percent = (100 * completedCount) / totalCount;
        if (progressBar) {
            progressBar.style.width = percent.toFixed(2) + "%";
        }
    }

    var option = {
        id: "GameCanvas",

        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
        renderMode: 0,
    };

    var onStart = function () {
        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {
            if (spNetwork !== "mintegral") setLoadingDisplay();
        }

        if (cc.sys.isMobile) {
            if (settings.orientation === "landscape") {
                cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
            } else if (settings.orientation === "portrait") {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
        }

        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });

        console.time("loadScene");
        bundle.loadScene(launchScene, null, onProgress, function (err, scene) {
            if (!err) {
                cc.director.runSceneImmediate(scene);
                if (cc.sys.isBrowser) {
                    // show canvas
                    var canvas = document.getElementById("GameCanvas");
                    canvas.style.visibility = "";
                    var div = document.getElementById("GameDiv");
                    if (div) {
                        div.style.backgroundImage = "";
                    }
                    console.log("Success to load scene:(custom!!!!) " + launchScene);
                    window.spTrackEvent instanceof Function && window.spTrackEvent("ready");
                    if (window.SG_GAME_PAUSED) {
                        spPauseGame();
                    }
                    ccSetVolume(window.SG_GAME_VOLUME);
                }
            }
        });
        console.timeEnd("loadScene");
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server,
    });

    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;

    function cb(err) {
        if (err) return console.error(err.message, err.stack);
        count++;
        if (count === bundleRoot.length) {
            cc.assetManager.loadBundle(MAIN, function (err) {
                if (!err) cc.game.run(option, onStart);
            });
        }
    }

    for (var i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }

    CC_BOOT = true;
}

function ccSetVolume(volume) {
    if (cc && cc.audioEngine) {
        cc.audioEngine.setEffectsVolume(volume);
        cc.audioEngine.setMusicVolume(volume);
    }
}

function spPauseGame() {
    window.SG_GAME_PAUSED = true;

    cc.director && cc.director.pause();

    if (cc.audioEngine !== undefined) {
        cc.audioEngine.pauseMusic();
        cc.audioEngine.pauseAllEffects();
    }
}

function spResumeGame() {
    window.SG_GAME_PAUSED = false;

    cc.director && cc.director.resume();

    if (cc.audioEngine !== undefined) {
        cc.audioEngine.resumeMusic();
        cc.audioEngine.resumeAllEffects();
    }
}
