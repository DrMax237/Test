//#region import

const ResizeValues = saykit.ResizeValues;

const Position = ResizeValues.Position;
const Scale = ResizeValues.Scale;
const Size = ResizeValues.Size;
const Rotation = ResizeValues.Rotation;
const Anchor = ResizeValues.Anchor;

const Resize = cc.Class({
	name: 'Resize',
	extends: cc.Component,

	editor: CC_EDITOR && {
		menu: 'SayKit/Resize',
	},

	properties: {
		isRelativeToParent: false,
		is3D: {
			default: false,
			notify(old) {
				if (this.is3D === old) return;

				this.position && (this.position.is3D = this.is3D);
				this.scale && (this.scale.is3D = this.is3D);
				this.size && (this.size.is3D = this.is3D);
				this.rotation && (this.rotation.is3D = this.is3D);
				this.anchor && (this.anchor.is3D = this.is3D);
			},
		},
		isSeparate: {
			default: false,
			notify(old) {
				if (this.isSeparate === old) return;

				this.position && (this.position.isSeparate = this.isSeparate);
				this.scale && (this.scale.isSeparate = this.isSeparate);
				this.size && (this.size.isSeparate = this.isSeparate);
				this.rotation && (this.rotation.isSeparate = this.isSeparate);
				this.anchor && (this.anchor.isSeparate = this.isSeparate);
			},
		},
		isChangingPosition: {
			default: true,
			notify(old) {
				if (this.isChangingPosition === old) return;

				if (this.isChangingPosition) {
					this.position = new Position();
					this.position.is3D = this.is3D;
					this.position.isSeparate = this.isSeparate;
				} else {
					this.position = null;
				}
			},
		},
		position: {
			default() {
				return new Position();
			},
			type: Position,
			visible() {
				return this.isChangingPosition;
			},
		},

		isChangingScale: {
			default: true,
			notify(old) {
				if (this.isChangingScale === old) return;

				if (this.isChangingScale) {
					this.scale = new Scale();
					this.scale.is3D = this.is3D;
					this.scale.isSeparate = this.isSeparate;
				} else {
					this.scale = null;
				}

				this.sizeReference = null;
			},
		},
		scale: {
			default() {
				return new Scale();
			},
			type: Scale,
			visible() {
				return this.isChangingScale;
			},
		},
		sizeReference: {
			default: null,
			type: cc.Node,
			visible() {
				return this.isChangingScale;
			},
		},

		isChangingSize: {
			default: false,
			notify(old) {
				if (this.isChangingSize === old) return;

				if (this.isChangingSize) {
					this.size = new Size();
					this.size.is3D = this.is3D;
					this.size.isSeparate = this.isSeparate;
				} else {
					this.size = null;
				}
			},
		},
		size: {
			default: null,
			type: Size,
			visible() {
				return this.isChangingSize;
			},
		},

		isChangingRotation: {
			default: false,
			notify(old) {
				if (this.isChangingRotation === old) return;

				if (this.isChangingRotation) {
					this.rotation = new Rotation();
					this.rotation.is3D = this.is3D;
					this.rotation.isSeparate = this.isSeparate;
				} else {
					this.rotation = null;
				}
			},
		},
		rotation: {
			default: null,
			type: Rotation,
			visible() {
				return this.isChangingRotation;
			},
		},

		isChangingAnchor: {
			default: false,
			notify(old) {
				if (this.isChangingAnchor === old) return;

				if (this.isChangingAnchor) {
					this.anchor = new Anchor();
					this.anchor.is3D = this.is3D;
					this.anchor.isSeparate = this.isSeparate;
				} else {
					this.anchor = null;
				}
			},
		},
		anchor: {
			default: null,
			type: Anchor,
			visible() {
				return this.isChangingAnchor;
			},
		},

		_sizeReferenceResize: {
			default: null,
			type: Resize,
			serializable: false,
		},
	},

	onLoad() {
		if (this.sizeReference) {
			this._sizeReferenceResize = this.sizeReference.getComponent(Resize);
		}

		this.sizeReference = this.sizeReference || this.node;
	},

	start() {
		this.onSizeChange();
	},

	onEnable() {
		cc.systemEvent.on(saykit.Event.SIZE_CHANGE, this.onSizeChange, this);
		this.onSizeChange();
	},

	onDisable() {
		cc.systemEvent.off(saykit.Event.SIZE_CHANGE, this.onSizeChange, this);
	},

	_setRotation() {
		const value = this.rotation.getValue();

		if (value instanceof cc.Vec3) {
			const rotation = cc.quat().fromEuler(value);
			this.node.setRotation(rotation);
		} else if (typeof value === 'number') {
			this.node.angle = this.rotation.getValue();
		}
	},

	_setAnchor() {
		const anchor = this.anchor.getValue();

		this.node.setAnchorPoint(anchor.x, anchor.y);
	},

	_setScale(spaceSize) {
		const size = {
			width: this.sizeReference.width,
			height: this.sizeReference.height,
		};

		if (this.isChangingSize) {
			const original = this.size.getOriginalSize();

			size.width = original.width;
			size.height = original.height;
		}

		const value = this.scale.getValue(size, spaceSize, this.node.angle);

		this.node.setScale(value);
	},

	_setSize(spaceSize) {
		const source = this.sizeReference || this.node;
		const selfSize = {
			width: source.width,
			height: source.height,
		};
		const size = this.size.getValue(selfSize, spaceSize);

		this.node.width = size.width;
		this.node.height = size.height;
	},

	_setPosition(spaceSize, parent) {
		const value = this.position.getValue(spaceSize);

		if (this.isRelativeToParent && parent) {
			value.x /= parent.scaleX;
			value.y /= parent.scaleY;
		}

		this.node.setPosition(value);
	},

	resize() {
		this._sizeReferenceResize && this._sizeReferenceResize.resize();

		const size = saykit.settings.gameSize;
		const parent = this.node.getParent();

		if (this.isRelativeToParent && parent) {
			size.width = parent.width * parent.scaleX;
			size.height = parent.height * parent.scaleY;
		}

		this.isChangingRotation && this._setRotation();
		this.isChangingAnchor && this._setAnchor();
		this.isChangingSize && this._setSize(size);
		this.isChangingScale && this._setScale(size);
		this.isChangingPosition && this._setPosition(size, parent);
	},

	onSizeChange() {
		this.resize();
	},
});

saykit.Resize = module.exports = Resize;
