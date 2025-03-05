let DefaultInputSource = cc.Enum({ None: 0 });

const InputCatcher = cc.Class({
	name: 'sk.InputCatcher',
	extends: cc.Component,

	editor: CC_EDITOR && {
		menu: 'SayKit/InputCatcher',
		executeInEditMode: true,
	},

	properties: {
		//#region editors fields and properties
		isUseCustomSource: {
			default: false,
			notify() {
				CC_EDITOR && this._refreshInspector();
			},
		},
		customSource: {
			get() {
				return this._source;
			},
			set(value) {
				this._source = value;
			},
			visible() {
				return this.isUseCustomSource;
			},
		},
		basicSource: {
			get() {
				if (this.isUseCustomSource) return 0;

				const sourceEnum = this.getSourceEnum();
				if (sourceEnum) {
					const sourceIndex = sourceEnum[this._source];

					if (sourceIndex !== undefined) {
						return sourceIndex;
					}
				}

				cc.warn(
					'InputCatcher',
					'Basic Source not found key of Input Source',
					this._source,
					this.node.name,
					sourceEnum
				);
				this.isUseCustomSource = true;
				return 0;
			},

			set(value) {
				const sourceEnum = this.getSourceEnum();
				const sourceName = sourceEnum[value];
				if (sourceName !== undefined) {
					this._source = sourceName;

					if (CC_EDITOR) {
						this._refreshInspector();
					}
				}
			},
			visible() {
				return !this.isUseCustomSource;
			},

			type: DefaultInputSource,
		},
		target: { default: null, type: cc.Component },
		//#endregion

		_source: { default: 'None', visible: false },
	},

	//#region life-cycle callbacks
	__preload() {
		if (CC_EDITOR) {
			this._refreshInspector();
		}
	},
	onEnable() {
		this._subscribeToEvents(true);
	},

	onDisable() {
		this._subscribeToEvents(false);
	},
	//#endregion

	//#region public methods
	toggle(isOn) {
		this._subscribeToEvents(isOn);
	},
	//#endregion

	//#region private methods
	_subscribeToEvents(actived) {
		const func = actived ? 'on' : 'off';

		this.node[func](cc.Node.EventType.TOUCH_START, this.onDown, this);
		this.node[func](cc.Node.EventType.TOUCH_MOVE, this.onMove, this);
		this.node[func](cc.Node.EventType.TOUCH_END, this.onUp, this);
		this.node[func](cc.Node.EventType.TOUCH_CANCEL, this.onCancel, this);
	},

	_refreshInspector:
		CC_EDITOR &&
		function () {
			const sourceEnum = this.getSourceEnum();

			cc.Class.Attr.setClassAttr(this, 'basicSource', 'type', 'Enum');
			cc.Class.Attr.setClassAttr(this, 'basicSource', 'enumList', cc.Enum.getList(sourceEnum));

			Editor.Utils.refreshSelectedInspector('node', this.node.uuid);
		},
	getSourceEnum() {
		const configKeys =
			(saykit.InputSource instanceof cc.Enum && saykit.InputSource) ||
			saykit.InputSource.list ||
			DefaultInputSource;

		const sourceObject = {};

		for (let key in configKeys) {
			if (typeof key === 'string') {
				sourceObject[key] = configKeys[key];
			}
		}

		return cc.Enum(sourceObject);
	},
	//#endregion

	//#region event handlers
	onDown(event) {
		cc.systemEvent.emit(saykit.GameEvent.INPUT, saykit.InputType.Down, this._source, event, this, this.target);
	},

	onMove(event) {
		cc.systemEvent.emit(saykit.GameEvent.INPUT, saykit.InputType.Move, this._source, event, this, this.target);
	},

	onUp(event) {
		cc.systemEvent.emit(saykit.GameEvent.INPUT, saykit.InputType.Up, this._source, event, this, this.target);
	},

	onCancel(event) {
		cc.systemEvent.emit(saykit.GameEvent.INPUT, saykit.InputType.Cancel, this._source, event, this, this.target);
	},
	//#endregion
});

saykit.InputCatcher = module.exports = InputCatcher;
