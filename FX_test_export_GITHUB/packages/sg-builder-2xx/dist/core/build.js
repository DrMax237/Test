"use strict";
var __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const log_1 = __importDefault(require("./common/log"));
const task_1 = __importDefault(require("./task"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));

const cache_1 = __importDefault(require("./common/cache"));
class build {
	constructor(engine_version, path_input_dir, path_out_dir, cb) {
		log_1.default.info("Start");

		let version = "24x";

		let templateMainJs = "/template/2xx";

		let newIndex = fs_1.default.readFileSync(path_1.default.join(path_1.default.join(__dirname, templateMainJs, "index.html")), "utf8");
		fs_1.default.writeFileSync(path_1.default.join(path_input_dir, "index.html"), newIndex);

		let newMainJs = fs_1.default.readFileSync(path_1.default.join(path_1.default.join(__dirname, templateMainJs, "main.js")), "utf8");
		fs_1.default.writeFileSync(path_1.default.join(path_input_dir, "main.js"), newMainJs);

		try {
			fs_1.default.unlinkSync(path_1.default.join(path_input_dir, "splash.png"));
		} catch (err) {}

		//@ts-ignore
		let l_custom_script = config_1.default.CUSTOM_SCRIPT["v" + version];

		if (config_1.default.is_debug) {
			config_1.default.is_min_js = false;
			config_1.default.is_min_css = false;
		}
		if (!fs_1.default.existsSync(path_out_dir)) {
			fs_1.default.mkdirSync(path_out_dir);
		}
		this.build(l_custom_script, path_input_dir, path_out_dir, cb);
	}

	async build(l_custom_script, path_input_dir, path_out_dir, cb) {
		task_1.default.clear();
		let _task = new task_1.default({
			l_custom_script: l_custom_script,
			path_input_dir: path_input_dir,
			path_html: path_1.default.join(path_input_dir, "index.html"),
			path_out_file: path_1.default.join(path_out_dir, "index.html"),
			enable_obfuscator: cache_1.default.get().enable_obfuscator,
			max_size: cache_1.default.get().max_size * 1024 * 1024,
		});
		await _task.build();

		// log_1.default.log("-- replace  splash--");
		let splashPath = path_1.default.join(path_input_dir, "../../", "splash.png");

		let splashBase64 = fs_1.default.readFileSync(splashPath).toString("base64");

		let styleJs = fs_1.default.readFileSync(path_1.default.join(path_1.default.join(__dirname, "/template/2xx", "style.css")), "utf8");

		let replacedStyles = fs_1.default
			.readFileSync(path_1.default.join(path_1.default.join(path_input_dir, "../", "index.html")), "utf8")
			.replace(/<style>[\s\S]*?<\/style>/gi, styleJs.replace("url()", `url(data:image/png;base64,${splashBase64})`));

		fs_1.default.writeFileSync(path_1.default.join(path_1.default.join(path_input_dir, "../", "index.html")), replacedStyles);

		cb && cb();
	}
}
exports.default = build;
