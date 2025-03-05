class Settings {
	constructor() {
		const instance = this.constructor.instance;

		if (instance) {
			return this.constructor.instance;
		}

		this.constructor.instance = this;

		this._defaultSize = cc.size(640, 1136);
		this._gameSize = cc.size(640, 1136);
		this._scale = 1;
		this._isLandscape = false;
		this._screenBaseRatio = 1.45;
	}

	get defaultSize () { return this._defaultSize.clone(); }
	get gameSize () { return this._gameSize.clone(); }
	get isLandscape() { return this._isLandscape; }

	get halfWidth() { return this._gameSize.width * .5; }
	get halfHeight() { return this._gameSize.height * .5; }
	get scale() { return this._scale; }
	get screenBaseRatio() { return this._screenBaseRatio; }
	get screenRatio() { return Math.max(this.gameSize.width, this.gameSize.height) / Math.min(this.gameSize.width, this.gameSize.height) }

	_updateSettings() {
		this._gameSize = cc.size(cc.winSize);
		this._isLandscape = this._gameSize.width > this._gameSize.height;
		this._scale = this._calculateScale();
	}

	_chooseDefaultWidth() {
		const width = this.isLandscape ? this.defaultSize.width : this.defaultSize.height;

		return width;
	}

	_chooseDefaultHeight() {
		const height = this.isLandscape ? this.defaultSize.height : this.defaultSize.width;

		return height;
	}

	_calculateScale() {
		const widthRatio = this.gameSize.width / this._chooseDefaultWidth();
		const heightRatio = this.gameSize.height / this._chooseDefaultHeight();
		const minRatio = Math.min(widthRatio, heightRatio);

		return minRatio;
	}
}


module.export = saykit.settings = new Settings();
