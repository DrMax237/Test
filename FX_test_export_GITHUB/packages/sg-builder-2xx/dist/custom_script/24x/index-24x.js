var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
(function () {
	console.log("init sg-builder-2xx");
	console.time("Start")

	if (!window["JSZip"]) {
		_initJs();
		return;
	}
	_zip();
	function _zip() {
		console.log("init unzip");
		console.time("unzip & load");
		window.__res = window.__res || {};
		const zip = new JSZip();
		let progress = 0;
		zip.loadAsync(window.__zip, {
			base64: true,
		})
			.then(function (zip) {
				for (var filePath in zip.files) {
					if (zip.files[filePath].dir) continue;
					progress++;

					let key = filePath;
					zip.file(key)
						.async("string")
						.then(function (data) {
							var startTime = new Date();

							window.__res[key] = data;
							progress--;

							if (progress == 0) {
								console.timeEnd("unzip & load");
								_initJs();
								var endTime = new Date();
								var elapsedSeconds = endTime - startTime;
								console.log(`Time to unzip ${elapsedSeconds}`);
								window.spTrackEvent instanceof Function && window.spTrackEvent("unzip", elapsedSeconds);
							}
						});
				}
			})
			.catch((err) => {
				throw err;
			});
	}
	function _eval(txt) {
		eval.call(window, txt);
	}
	function _initJs() {
		console.time("init js");
		window.__js = {};
		for (var filePath in window.__res) {
			let suffix = filePath.split(".");
			suffix = "." + suffix[suffix.length - 1];
			if (suffix == ".js") {
				window.__js[filePath] = window.__res[filePath];
			}
		}

		var arr = ["src/settings.js", "main.js", "cocos2d-js.js", "cocos2d-js-min.js", "physics.js", "physics-min.js"];
		for (let i = 0; i < arr.length; i++) {
			_eval(window.__js[arr[i]]);
		}
		console.timeEnd("init js");
		_success();
	}

	function _success() {
		var funGameRun = cc.game.run;
		cc.game.run = function (option, onStart) {
			option.jsList = [];
			funGameRun.call(cc.game, option, () => {
				onStart();
			});
		};
		window.__custom();

		if (window.SG_GAME_CREATED) {
			window.ccBoot();
		}
		_eval(
			`"use strict";if(window.spVars.localization){let i=window.spVars.localization.value,t=JSON.parse(i);window.spLocalization=t}else window.spLocalization=window.spLocalization;function _defineProperty(i,t,a){return(t=_toPropertyKey(t))in i?Object.defineProperty(i,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):i[t]=a,i}function _toPropertyKey(i){var t=_toPrimitive(i,"string");return"symbol"==typeof t?t:String(t)}function _toPrimitive(i,t){if("object"!=typeof i||null===i)return i;var a=i[Symbol.toPrimitive];if(void 0!==a){var e=a.call(i,t||"default");if("object"!=typeof e)return e;throw TypeError("@@toPrimitive must return a primitive value.")}return("string"===t?String:Number)(i)}class SKLocalization{get currentConfig(){return window.spVars}get currentLocalization(){return window.spLocalization}set currentLocalization(i){window.spLocalization&&(window.spLocalization=i)}constructor(){if(_defineProperty(this,"language","en"),SKLocalization.instance)return SKLocalization.instance;if(window.spVars){if(window.spVars.localization){let i=window.spVars.localization.value,t=JSON.parse(i);window.spLocalization=t}}else window.spLocalization=window.spLocalization;if(SKLocalization.instance=this,!this.currentConfig||!this.currentConfig.localization)return;let a=JSON.parse(this.currentConfig.localization.value);this.currentLocalization=a,this.language=(navigator&&(navigator.languages&&navigator.languages[0]||navigator.language||navigator.browserLanguage||navigator.systemLanguage||navigator.userLanguage)||"en").substr(0,2)}get(i){let t=this.currentLocalization[i],a="";return t instanceof Object?a=(void 0===t[this.language]?t.en:t[this.language])||"":"string"!=typeof t&&"number"!=typeof t||(a=t+""),a}}_defineProperty(SKLocalization,"instance",null),saykit.Localization=SKLocalization,saykit.localization=new SKLocalization;`,
		);
	}
})();
