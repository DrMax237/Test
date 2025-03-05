/****************************************************************************
 Copyright (c) 2019 Xiamen Yaji Software Co., Ltd.

 https://www.cocos.com/

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated engine source code (the "Software"), a limited,
  worldwide, royalty-free, non-assignable, revocable and non-exclusive license
 to use Cocos Creator solely to develop games on your target platforms. You shall
  not use Cocos Creator software for developing other software or tools that's
  used for developing games. You are not granted to publish, distribute,
  sublicense, and/or sell copies of Cocos Creator.

 The software or tools in this License Agreement are licensed, not sold.
 Xiamen Yaji Software Co., Ltd. reserves all rights not expressly granted to you.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/
const { parseParameters } = require("./utilities");

function downloadFile(url, options, onProgress, onComplete) {
	var { options, onProgress, onComplete } = parseParameters(options, onProgress, onComplete);

	if (SK_BUILD) {
		return skDownloadFile(url, options, onProgress, onComplete);
	} else {
		return ccDownloadFile(url, options, onProgress, onComplete);
	}
}
function skDownloadFile(url, options, onProgress, onComplete) {
	let file = window.resMap && window.resMap[url];

	switch (true) {
		case options.fileType === "json": {
			file = JSON.parse(file);

			onComplete && onComplete(null, file);
			break;
		}

		case options.fileType === "image": {
			const img = new Image();
			function loadCallback() {
				img.removeEventListener("load", loadCallback);
				img.removeEventListener("error", errorCallback);

				onComplete(null, img);
			}
			function errorCallback() {
				img.removeEventListener("load", loadCallback);
				img.removeEventListener("error", errorCallback);

				onComplete(new Error("Load image (" + url + ") failed"));
			}

			img.addEventListener("load", loadCallback);
			img.addEventListener("error", errorCallback);

			img.src = file;

			break;
		}

		case options.fileType === "audio":
			{
				const audioSupport = cc.sys.__audioSupport;
				const formatSupport = audioSupport.format;
				const context = audioSupport.context;

				function base64toArray(base64) {
					var bstr = atob(base64),
						n = bstr.length,
						u8arr = new Uint8Array(n);
					while (n--) {
						u8arr[n] = bstr.charCodeAt(n);
					}

					return u8arr;
				}

				const data = base64toArray(file);

				if (data) {
					context["decodeAudioData"](
						data.buffer,
						function (buffer) {
							onComplete(null, buffer);
						},
						function () {
							onComplete(new Error("Decode error - " + url), null);
						}
					);
				} else {
					onComplete(new Error("request error - " + url), null);
				}
			}

			break;

		case options.fileType === "video": {
			const b64Data = file;
			const byteCharacters = atob(b64Data);

			const byteNumbers = new Array(byteCharacters.length);
			for (let i = 0; i < byteCharacters.length; i++) {
				byteNumbers[i] = byteCharacters.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);

			const blob = new Blob([byteArray], { type: "video/mp4" });

			const newUrl = URL.createObjectURL(blob);
			onComplete(null, newUrl);
			break;
		}

		case options.responseType === "arraybuffer": {
			onComplete(
				null,
				(file = (function (e) {
					for (var r = atob(e), n = r.length, o = new Uint8Array(n); n--; ) o[n] = r.charCodeAt(n);
					return o;
				})(file))
			);
			break;
		}

		default:
			console.log("aaaaaaaa", url, options);
			onComplete(new Error("Load  (" + url + ") failed"));
			break;
	}
}

function ccDownloadFile(url, options, onProgress, onComplete) {
	var xhr = new XMLHttpRequest(),
		errInfo = "download failed: " + url + ", status: ";

	xhr.open("GET", url, true);

	if (options.responseType !== undefined) xhr.responseType = options.responseType;
	if (options.withCredentials !== undefined) xhr.withCredentials = options.withCredentials;
	if (options.mimeType !== undefined && xhr.overrideMimeType) xhr.overrideMimeType(options.mimeType);
	if (options.timeout !== undefined) xhr.timeout = options.timeout;

	if (options.header) {
		for (var header in options.header) {
			xhr.setRequestHeader(header, options.header[header]);
		}
	}

	xhr.onload = function () {
		if (xhr.status === 200 || xhr.status === 0) {
			onComplete && onComplete(null, xhr.response);
		} else {
			onComplete && onComplete(new Error(errInfo + xhr.status + "(no response)"));
		}
	};

	if (onProgress) {
		xhr.onprogress = function (e) {
			if (e.lengthComputable) {
				onProgress(e.loaded, e.total);
			}
		};
	}

	xhr.onerror = function () {
		onComplete && onComplete(new Error(errInfo + xhr.status + "(error)"));
	};

	xhr.ontimeout = function () {
		onComplete && onComplete(new Error(errInfo + xhr.status + "(time out)"));
	};

	xhr.onabort = function () {
		onComplete && onComplete(new Error(errInfo + xhr.status + "(abort)"));
	};

	xhr.send(null);

	return xhr;
}

module.exports = downloadFile;
