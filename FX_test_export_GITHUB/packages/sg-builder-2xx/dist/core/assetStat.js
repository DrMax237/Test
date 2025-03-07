"use strict";
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : {default: mod};
    };
Object.defineProperty(exports, "__esModule", {value: true});
const log = __importDefault(require("./common/log")).default;
const path = __importDefault(require("path")).default;
const fs = __importDefault(require("fs")).default;
const WARN_SIZE_LIMIT = 30000

class assetStat {
    constructor(options, cb) {
        this.globalCallback = cb;
        this.optionsStorage = options;
        this.calculate = this.calculate.bind(this);
    }

    async calculate() {
        try {
            let destinationRoot = this.optionsStorage.dest
            let files = this._getFileList(destinationRoot);
            files = Object.entries(files).map(([fullPath, size]) => ({
                fullPath,
                size,
                uid: this._getUidByPath(fullPath),
                info: Editor.assetdb._uuid2meta[this._getUidByPath(fullPath)],
                uid2path: Editor.assetdb._uuid2path[this._getUidByPath(fullPath)]
            }))
                .filter((file) => file.size >= WARN_SIZE_LIMIT);


            files.sort((a, b) => b.size - a.size);


            for (const object of files) {
                let kb = (object.size / 1024).toFixed(2)
                log.warn(`Big asset: [${kb} kb] Type: [${object.info?.importer}]`)
                delete object.info
                delete object.size
                log.info(object)
            }

            this.globalCallback && this.globalCallback();
        } catch (err) {
            Editor.error(err);
            this.globalCallback && this.globalCallback();
        }
    }

    _getUidByPath(fullPath) {
        return path.basename(fullPath, path.extname(fullPath))
    }

    _getFileList(destinationRoot) {
        let directoryPath = path.join(destinationRoot, "assets", "main", "native")
        const filesSizes = {};

        function traverseDirectory(currentPath) {
            const files = fs.readdirSync(currentPath);

            files.forEach((file) => {
                const filePath = path.join(currentPath, file);
                const fileStat = fs.statSync(filePath);

                if (fileStat.isFile()) {
                    filesSizes[filePath] = fileStat.size;
                } else if (fileStat.isDirectory()) {
                    traverseDirectory(filePath);
                }
            });
        }

        traverseDirectory(directoryPath);

        return filesSizes;
    }


}

exports
    .default = assetStat;
