"use strict";
var __createBinding =
	(this && this.__createBinding) ||
	(Object.create
		? function (o, m, k, k2) {
				if (k2 === undefined) k2 = k;
				Object.defineProperty(o, k2, {
					enumerable: true,
					get: function () {
						return m[k];
					},
				});
		  }
		: function (o, m, k, k2) {
				if (k2 === undefined) k2 = k;
				o[k2] = m[k];
		  });
var __setModuleDefault =
	(this && this.__setModuleDefault) ||
	(Object.create
		? function (o, v) {
				Object.defineProperty(o, "default", { enumerable: true, value: v });
		  }
		: function (o, v) {
				o["default"] = v;
		  });
var __importStar =
	(this && this.__importStar) ||
	function (mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		__setModuleDefault(result, mod);
		return result;
	};
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
const jszip = __importStar(require("jszip"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const config_1 = __importDefault(require("./config"));
const uglify = __importStar(require("uglify-js"));
const utils_1 = __importDefault(require("./common/utils"));
const log_1 = __importDefault(require("./common/log"));

const js_obfuscator = require("../custom_script/javascript-obfuscator.js");
const clean_css = require("clean-css");
let _s_html_content = "";
//不压缩的资源
let _dict_res_no_zip = {};
//资源压缩率
let _dict_res_zip_ratio = {};
//所有资源
let l_all_path = [];
class task {
	constructor(_config) {
		this._config = _config;
		_s_html_content = "";
		_dict_res_no_zip = {};
	}
	/** 每一次重新构建，重置 */
	static clear() {
		l_all_path = [];
	}
	async build() {
		let cut_size = 0;
		return new Promise((resolve, reject) => {
			this._step_html(this._config.path_html);

			this._cutLocalization();
			this._replaceSomeStringInEngine();
			this._addSpVars();
			this._removeSplashForMintegral();
			resolve({});
		})
			.then(async () => {
				//一次构建会生成多个平台，不需要每个平台都重新读取资源
				if (!l_all_path || l_all_path.length === 0) {
					l_all_path = utils_1.default.get_dir_all_file(this._config.path_input_dir);
					for (let i = 0; i < l_all_path.length; i++) {
						let filePath = l_all_path[i];
						// 注意,存储时删除BASE_PATH前置
						filePath = filePath.replace(/\\/g, "/");
						if (config_1.default.RES_FILTER_EXTNAME_SET.has(path.extname(filePath))) {
							l_all_path.splice(i, 1);
							i--;
						}
					}

					await this._compression_ratio(l_all_path);
					// <0表示不压缩
					if (this._config.max_size >= 0) {
						//计算哪些文件需要压缩
						let must_size = this.get_must_size();
						let size = this._config.max_size - must_size;
						let list = [];
						for (let k in _dict_res_zip_ratio) {
							if (_dict_res_zip_ratio[k].ratio >= 1) {
								_dict_res_zip_ratio[k].enable_zip = false;
								size -= _dict_res_zip_ratio[k].org_size;
							} else {
								list.push(_dict_res_zip_ratio[k]);
							}
						}
						list.sort((a, b) => {
							return a.ratio < b.ratio ? -1 : 1;
						});

						function get_size(i, temp_size) {
							for (let j = i + 1; j < list.length; j++) {
								temp_size -= list[j].org_size;
							}
							return temp_size;
						}
						if (get_size(-1, size) < 0) {
							//每次寻找压缩率最大的文件
							for (let i = 0; i < list.length; i++) {
								size -= list[i].zip_size;

								list[i].enable_zip = true;
								if (get_size(i, size) >= 0) {
									break;
								}
							}
						}
						let len = 0;
						let cut_all_size = 0;
						for (let k in list) {
							if (list[k].enable_zip) {
								len++;
								cut_size += list[k].cut_size;
								log_1.default.debug("enable_zip", list[k].enable_zip, list[k].key);
							}
							cut_all_size += list[k].cut_size;
						}
						// log_1.default.log("zip file count " + Object.keys(_dict_res_zip_ratio).length);
						// log_1.default.log("zip file count " + len);

						let ttfCount = 0;

						list.forEach((obj) => {
							if (obj.key.endsWith(".ttf")) {
								ttfCount++;
							}
						});

						if (ttfCount == 2) {
							log_1.default.error("ttf >=", 2);
						} else {
							log_1.default.log("ttf", ttfCount);
						}
						log_1.default.log("zip cut size " + utils_1.default.b_to_kb(cut_size));
					}
				}
				return Promise.resolve();
			})
			.then(async () => {
				return this._step_res(l_all_path);
			})
			.then(() => {
				let content = JSON.stringify(_dict_res_no_zip);
				content = `window.__res=${content};`;
				this.addJs2Html(content);
				return this._step_script();
			})
			.then(() => {
				fs.writeFileSync(this._config.path_out_file, _s_html_content);
				log_1.default.info(`Size ` + utils_1.default.str_kb_size(_s_html_content), _dict_res_zip_ratio);
				log_1.default.success("Success");
			})
			.catch((err) => {
				log_1.default.error(err, err.message);
				throw err;
			});
	}

	async _removeSplashForMintegral() {
		this.addJs2Html(`if(window.document){var e=document.getElementById("splash");"mintegral"===spNetwork?e&&(e.style.display="none"):e&&(e.style.display="block")}`);
	}

	async _replaceSomeStringInEngine() {
		let engineString = fs.default.readFileSync(path.default.join(this._config.path_html, "../", "cocos2d-js-min.js"), "utf8");

		engineString = engineString.replace(
			",!cc.macro.CLEANUP_IMAGE_CACHE&&o&&(o.enabled=!0),cc.sys.browserType==cc.sys.BROWSER_TYPE_CHROME&&parseFloat(cc.sys.browserVersion)>=69&&(o.enabled=!1)",
			"",
			1,
		);
		engineString = engineString.replace(
			",!cc.macro.CLEANUP_IMAGE_CACHE&&a&&(a.enabled=!0),cc.sys.browserType==cc.sys.BROWSER_TYPE_CHROME&&parseFloat(cc.sys.browserVersion)>=69&&(a.enabled=!1)",
			"",
			1,
		);
		engineString = engineString.replace("localStorage", "local_Storage");
		engineString = engineString.replace('if(s._loadingScene="",i)', 'if(s._loadingScene="")');
		engineString = engineString.replace('if(s._loadingScene="",n)', 'if(s._loadingScene="")');
		engineString = engineString.replace("n)),i.stopPropagation(),i.preventDefault()}}),", "n)),i.stopPropagation(),(i.type!=='touchcancel')&&i.preventDefault()}}),");
		engineString = engineString.replace("i)),n.stopPropagation(),n.preventDefault()}}),", "i)),n.stopPropagation(),(n.type!=='touchcancel')&&n.preventDefault()}}),");
		engineString = engineString.replace("i)),t.stopPropagation(),t.preventDefault()}}),", "i)),t.stopPropagation(),(t.type!=='touchcancel')&&t.preventDefault()}}),");

		fs.default.writeFileSync(path.default.join(this._config.path_html, "../", "cocos2d-js-min.js"), engineString);
	}

	async _cutLocalization() {
		let indexJs = fs.default.readFileSync(path.default.join(this._config.path_html, "../assets/main", "index.js"), "utf8");

		fs.default.writeFileSync(path.default.join(this._config.path_html, "../assets/main", "index.js"), indexJs.replace(`"Localization","`, `"`));
	}

	async _addSpVars() {
		let config_temp;
		let localization_temp;
		let configString;
		let localizationString;
		let configJson;
		let localizationJson;
		let spVars;
		let sayPlayablesTemplate;

		try {
			config_temp = fs.default.readFileSync(path.default.join(this._config.path_html, "../../../assets/Config", "Config.json.js"), "utf8");
		} catch (error) {
			log_1.default.error("Failed to read Config.json.js", error);
		}

		try {
			localization_temp = fs.default.readFileSync(path.default.join(this._config.path_html, "../../../assets/Config", "Localization.json.js"), "utf8");
		} catch (error) {
			log_1.default.error("Failed to read Localization.json.js", error);
		}

		try {
			configString = config_temp;
			configString = this.wrapObjectKeysInQuotes(config_temp);
		} catch (error) {
			log_1.default.error("Failed to wrap object keys in quotes for config", error);
		}

		try {
			localizationString = localization_temp;
			localizationString = this.wrapObjectKeysInQuotes(localization_temp);
		} catch (error) {
			log_1.default.error("Failed to wrap object keys in quotes for localization", error);
		}

		try {
			configJson = JSON.parse(configString.replace("window.spVars = ", "", 1).toString());
		} catch (error) {
			log_1.default.info("spConfig", configString);
			log_1.default.error("Failed to parse configJson", error);
		}

		try {
			localizationJson = JSON.parse(localizationString.replace("window.spLocalization = ", "", 1).toString());
		} catch (error) {
			log_1.default.info("spLocalization", localizationString);
			log_1.default.error("Failed to parse localizationJson", error);
		}

		try {
			configJson["localization"] = {
				value: JSON.stringify(localizationJson),
				type: "string",
			};
		} catch (error) {
			log_1.default.error("Failed to set localization on configJson", error);
		}

		try {
			spVars = JSON.stringify(configJson);
		} catch (error) {
			log_1.default.error("Failed to stringify configJson", error);
		}

		try {
			sayPlayablesTemplate = fs.default.readFileSync(path.default.join(path.default.join(__dirname, "/template", "sayPlayablesTemplate.js")), "utf8");
		} catch (error) {
			log_1.default.error("Failed to read sayPlayablesTemplate.js", error);
		}

		this.addJs2Html(`${sayPlayablesTemplate.replace("var spVars = {};", `var spVars = ${spVars};`)}`);
	}

	wrapObjectKeysInQuotes(str) {
		// Wrap keys in quotes
		const wrappedKeys = str.replace(/(\s*)([a-zA-Z0-9_]+)(\s*:(?=[,\s*{]))/g, (match, p1, p2, p3) => {
			return `${p1}"${p2}"${p3}`;
		});

		// Convert functions into strings, considering nested braces
		const functionRegex = /"function":\s*function\s*\([\w\s,]*\)\s*{/g;
		let currentIndex = 0;
		let convertFunctionStrings = wrappedKeys;
		let match;
		while ((match = functionRegex.exec(convertFunctionStrings)) !== null) {
			let openBracesCount = 1;
			let i = match.index + match[0].length;
			while (openBracesCount !== 0 && i < convertFunctionStrings.length) {
				if (convertFunctionStrings[i] === "{") {
					openBracesCount++;
				} else if (convertFunctionStrings[i] === "}") {
					openBracesCount--;
				}
				i++;
			}
			const functionBody = convertFunctionStrings.slice(match.index + match[0].length, i - 1);
			const singleQuotedString = functionBody.replace(/"/g, "'");
			const formattedFunction = singleQuotedString.replace(/\n\s*/g, "");
			convertFunctionStrings = convertFunctionStrings.slice(0, match.index) + `"function": "function () {${formattedFunction}}",` + convertFunctionStrings.slice(i);
		}

		// Remove "function () {}" from the function strings
		const extractCodeFromFunctionBody = convertFunctionStrings.replace(/"function"\s*:\s*"function\s*\(\)\s*\{([\s\S]*?)}",/g, (match, p1) => {
			return `"function": "${p1.trim()}"`;
		});

		// Remove trailing commas from objects and arrays
		const removeTrailingCommasFromObjects = extractCodeFromFunctionBody.replace(/,(?=\s*})/g, "");
		const removeTrailingCommasFromArrays = removeTrailingCommasFromObjects.replace(/,(?=\s*])/g, "");

		let finalResult = removeTrailingCommasFromArrays;
		finalResult = finalResult.replace(/\s+$/, ""); // Удалить пробелы и символы новой строки в конце строки

		if (finalResult.slice(-1) === ";") {
			finalResult = finalResult.slice(0, -1);
		}

		return finalResult;
	}

	async _step_html(path_html) {
		// html
		_s_html_content = utils_1.default.read_file_toString(path_html);
		//提取html中的css文件
		var reg = /type="text\/css" href="(.*)"/;
		let path_css = null;
		try {
			const list = reg.exec(_s_html_content);
			if (list && list[1]) {
				path_css = path.join(this._config.path_input_dir, list[1].trim());
			}
		} catch (error) {
			log_1.default.error("未识别到html中的css文件，可能会有异常");
		}
		_s_html_content = _s_html_content.replace(/ *<!--.*-->/g, "");
		_s_html_content = _s_html_content.replace(/<link rel="stylesheet".*\/>/gs, "");
		_s_html_content = _s_html_content.replace(/<script.*<\/script>/gs, "");
		//正则删除空行
		_s_html_content = _s_html_content.replace(/\n\s*\n/g, "\n");
		// css
		if (!path_css) {
			return;
		}
		let content = this.red_css(path_css);
		_s_html_content = _s_html_content.replace(/<\/head>/, `${content}\n</head>`);
	}
	/** 计算压缩率 */
	async _compression_ratio(l_path) {
		_dict_res_zip_ratio = {};
		return new Promise((resolve, reject) => {
			const inputPath = this._config.path_input_dir.replace(/\\/g, "/").replace("./", "");
			let i_task = 0;
			l_path.forEach((filePath) => {
				i_task++;
				var zips = new jszip.default();
				filePath = filePath.replace(/\\/g, "/");
				// 注意,存储时删除BASE_PATH前置
				let store_path = filePath.replace(new RegExp(`[.]*${inputPath}/`), "");
				let value;
				if (path.extname(filePath) == ".js") {
					value = this.get_js(filePath);
				} else if (config_1.default.RES_STRING_EXTNAME_SET.has(path.extname(filePath))) {
					value = utils_1.default.read_file_toString(filePath);
				} else {
					value = utils_1.default.read_file_base64(filePath);
				}
				zips.file(store_path, value, { compression: "DEFLATE" });
				zips.generateAsync({ type: "nodebuffer" }).then((content) => {
					let str_base64 = Buffer.from(content).toString("base64");
					let ratio = Number((str_base64.length / value.length).toFixed(2));
					_dict_res_zip_ratio[store_path] = {
						key: store_path,
						ratio: ratio,
						org_size: value.length,
						zip_size: str_base64.length,
						cut_size: value.length - str_base64.length,
						enable_zip: false,
					};
					i_task--;
					if (i_task <= 0) {
						resolve({});
					}
				});
			});
		});
	}
	async _step_res(l_path) {
		await new Promise((resolve, reject) => {
			var zips = new jszip.default();
			const inputPath = this._config.path_input_dir.replace(/\\/g, "/").replace("./", "");
			l_path.forEach((filePath) => {
				filePath = filePath.replace(/\\/g, "/");
				// 注意,存储时删除BASE_PATH前置
				let store_path = filePath.replace(new RegExp(`[.]*${inputPath}/`), "");
				let value;
				if (path.extname(filePath) == ".js") {
					value = this.get_js(filePath);
				} else if (config_1.default.RES_STRING_EXTNAME_SET.has(path.extname(filePath))) {
					value = utils_1.default.read_file_toString(filePath);
				} else {
					value = utils_1.default.read_file_base64(filePath);
				}
				if (!_dict_res_zip_ratio[store_path].enable_zip) {
					_dict_res_no_zip[store_path] = value;
				} else {
					zips.file(store_path, value, { compression: "DEFLATE" });
				}
			});
			if (Object.keys(zips.files).length) {
				//导入库
				this.addJs2Html(this._get_zip_script());
				zips.generateAsync({ type: "nodebuffer" }).then((content) => {
					let str_base64 = Buffer.from(content).toString("base64");
					str_base64 = `var __zip = "${str_base64}";`;
					this.addJs2Html(str_base64);
					resolve({});
				});
			} else {
				resolve({});
			}
		});
	}
	//获得压缩库
	_get_zip_script() {
		return utils_1.default.read_file_toString(config_1.default.ZIP_SCRIPT);
	}
	//获得自定义脚本
	_get_custom_script() {
		let contents = "";
		this._config.l_custom_script.forEach((filePath) => {
			const content = this.get_js(filePath);
			contents += "(function(){" + content + "})();";
		});
		return contents;
	}

	async _step_script() {
		this.addJs2Html(this._get_custom_script());
		let customFunction = fs.default.readFileSync(path.default.join(path.default.join(__dirname, "/template", "customFunction.js")), "utf8");

		this.addJs2Html(customFunction);
	}
	red_css(filePath) {
		let css = utils_1.default.read_file_toString(filePath);
		//提取html中的css文件
		var reg = /url\((.*)\)/;
		try {
			const list = reg.exec(css);
			if (list && list[1]) {
				const trim = list[1].trim();
				const base64 = utils_1.default.read_file_base64(path.join(this._config.path_input_dir, trim));
				css = css.replace(trim, base64);
			}
		} catch (error) {
			// log_1.default.log("no find css", error);
		}
		if (config_1.default.is_min_css) {
			css = new clean_css().minify(css).styles;
		}
		return `<style>\n${css}</style>`;
	}
	/** 将js文件转化为html文件内容(包括压缩过程) */
	get_js(filePath) {
		let js = utils_1.default.read_file_toString(filePath);
		while (true) {
			if (js.length > 1024 * 500) {
				break;
			}
			if (filePath.indexOf("min.js") != -1) {
				break;
			}
			if (this._config.enable_obfuscator) {
				log_1.default.debug("obfuscator", filePath, js.length);
				const result = js_obfuscator.obfuscate(js, {
					compact: true,
					controlFlowFlattening: false,
					deadCodeInjection: false,
					debugProtection: false,
					debugProtectionInterval: false,
					disableConsoleOutput: false,
					identifierNamesGenerator: "mangled",
					log: false,
					numbersToExpressions: false,
					renameGlobals: false,
					/** 保留标识符，让其不被混淆，支持正则表达式。 */
					reservedNames: [],
					rotateStringArray: true,
					selfDefending: false,
					shuffleStringArray: true,
					simplify: true,
					splitStrings: false,
					stringArray: true,
					stringArrayEncoding: [],
					stringArrayIndexShift: true,
					stringArrayWrappersCount: 1,
					stringArrayWrappersChainedCalls: true,
					stringArrayWrappersParametersMaxCount: 2,
					stringArrayWrappersType: "variable",
					stringArrayThreshold: 0.75,
					unicodeEscapeSequence: false,
				});
				js = result.getObfuscatedCode();
			} else {
				if (config_1.default.is_min_js) {
					log_1.default.debug("minify", filePath, js.length);
					var options = {};
					js = uglify.minify(js, options).code;
				}
			}
			break;
		}
		return js;
	}
	addJs2Html(content) {
		content = `<script type="text/javascript">\n${content}\n</script>`;
		_s_html_content = _s_html_content.replace("</body>", () => `${content}\n</body>`);
	}
	/** 获得必须的文件大小 */
	get_must_size() {
		return this._get_custom_script().length + this._get_zip_script().length + _s_html_content.length;
	}
}
exports.default = task;
