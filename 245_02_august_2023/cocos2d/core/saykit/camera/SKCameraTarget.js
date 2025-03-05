const ResizeValueTypes = saykit.ResizeValueTypes;

const FollowValue = cc.Class({
	name: 'FollowValue',
	properties: {
		value: null,

		isSeparate: {
			default: false,
			visible: false,
			notify(old) {
				if (this.isSeparate !== old) {
					this._createValue();
				}
			},
		},
	},

	ctor() {
		this._createValue();
	},

	getValue() {
		const orientation = saykit.settings.isLandscape ? 'landscape' : 'portrait';
		let value = this.value[orientation];

		if (this.isSeparate) {
			const suff = saykit.settings.screenRatio > saykit.settings.screenBaseRatio ? 'Phone' : 'Tablet';
			value = this.value[orientation + suff];
		}

		return value;
	},

	set(newFollowValue) {
		if (!(newFollowValue instanceof FollowValue)) return;

		this.isSeparate = newFollowValue.isSeparate;
		this.value.set(newFollowValue.value);
	},

	lerp(fromFollowValue, toFollowValue, ratio, out) {
		const o = out || new FollowValue();

		o.isSeparate = toFollowValue.isSeparate;
		o.value.lerp(fromFollowValue.value, toFollowValue.value, ratio, o.value);

		return o;
	},

	_createValue() {},
});

const FollowOffset = cc.Class({
	name: 'FollowOffset',
	extends: FollowValue,
	properties: {},

	_createValue() {
		this.value = this.isSeparate
			? new ResizeValueTypes.Vec3SeparateValue()
			: new ResizeValueTypes.Vec3UniversalValue();
	},
});

const FollowRotation = cc.Class({
	name: 'FollowRotation',
	extends: FollowValue,
	properties: {},

	_createValue() {
		this.value = this.isSeparate
			? new ResizeValueTypes.Vec3SeparateValue()
			: new ResizeValueTypes.Vec3UniversalValue();
	},
});

const FollowZoom = cc.Class({
	name: 'FollowZoom',
	extends: FollowValue,
	properties: {},

	_createValue() {
		this.value = this.isSeparate
			? new ResizeValueTypes.NumberSeparateValue()
			: new ResizeValueTypes.NumberUniversalValue();
	},
});

const FollowFov = cc.Class({
	name: 'FollowFov',
	extends: FollowValue,
	properties: {},

	_createValue() {
		this.value = this.isSeparate
			? new ResizeValueTypes.NumberSeparateValue()
			: new ResizeValueTypes.NumberUniversalValue();
	},
});

const SKCameraTarget = cc.Class({
	name: 'SKCameraTarget',
	extends: cc.Component,

	properties: {
		isSeparate: {
			default: false,
			notify() {
				this.followOffset.isSeparate = this.isSeparate;
				this.followRotation.isSeparate = this.isSeparate;
				this.followZoom.isSeparate = this.isSeparate;
				this.followFov.isSeparate = this.isSeparate;
			},
		},

		followOffset: {
			default() {
				return new FollowOffset();
			},
			type: FollowOffset,
		},
		isUseNodeRotation: false,
		isNodeRotationAffectsOffset: false,
		followRotation: {
			default() {
				return new FollowRotation();
			},
			type: FollowRotation,
		},
		followZoom: {
			default() {
				return new FollowZoom();
			},
			type: FollowZoom,
		},
		followFov: {
			default() {
				return new FollowFov();
			},
			type: FollowFov,
		},

		key: {
			get() {
				return this.node.name;
			},
		},
	},

	editor: CC_EDITOR && {
		menu: 'SayKit/Camera/CameraTarget',
	},

	onLoad() {
		cc.systemEvent.emit(saykit.GameEvent.CAMERA_ADD_TARGET, this);
	},
	onDestroy() {
		cc.systemEvent.emit(saykit.GameEvent.CAMERA_DELETE_TARGET, this);
	},

	onEnable() {},

	onDisable() {},

	start() {},

	lerp(fromCameraTarget, toCameraTarget, ratio) {
		this.followOffset.lerp(fromCameraTarget.followOffset, toCameraTarget.followOffset, ratio, this.followOffset);
		this.followRotation.lerp(
			fromCameraTarget.followRotation,
			toCameraTarget.followRotation,
			ratio,
			this.followRotation
		);
		this.followZoom.lerp(fromCameraTarget.followZoom, toCameraTarget.followZoom, ratio, this.followZoom);
		this.followFov.lerp(fromCameraTarget.followFov, toCameraTarget.followFov, ratio, this.followFov);
	},

	set(newCameraTarget) {
		this.isSeparate = newCameraTarget.isSeparate;

		this.followOffset.set(newCameraTarget.followOffset);
		this.followRotation.set(newCameraTarget.followRotation);
		this.followZoom.set(newCameraTarget.followZoom);
		this.followFov.set(newCameraTarget.followFov);
	},
});

saykit.CameraTarget = module.exports = SKCameraTarget;
