//#endregion

const SKCameraController = cc.Class({
	name: "SKCameraController",
	extends: cc.Component,

	properties: {
		//#region editors fields and properties
		isCameraEvents: true,
		isAddCameraDictionary: false,
		target: { default: null, type: saykit.CameraTarget },

		lockXRotation: false,
		lockYRotation: false,
		lockZRotation: false,

		useFixedDt: false,
		fixedDt: {
			default: 0.0167,
			visible() {
				return this.useFixedDt;
			},
		},

		isSmooth: false,
		fps30Mode: {
			default: false,
			visible() {
				return this.isSmooth;
			},
		},
		followMoveSpeed: {
			default: 1,
			visible() {
				return this.isSmooth;
			},
		},
		followRotationSpeed: {
			default: 1,
			visible() {
				return this.isSmooth;
			},
		},

		isChangeCameraRectOnResize: {
			default: false,
			notify(old) {
				if (this.isChangeCameraRectOnResize !== old) {
					if (this.isChangeCameraRectOnResize) {
						this.cameraRectOnResize = new CameraRectResizeHelper();
					} else {
						this.cameraRectOnResize = null;
					}
				}
			},
		},

		cameraRectOnResize: {
			default: null,
			visible() {
				return this.isChangeCameraRectOnResize;
			},
		},

		//#endregion

		//#region public fields and properties

		targets: { default: [], serializable: false, visible: false },
		followTarget: {
			default: null,
			type: saykit.CameraTarget,
			serializable: false,
			visible: false,
		},

		//#endregion

		//#region private fields and properties
		_camera: { default: null, type: cc.Camera, serializable: false },
		_currentCameraRect: {
			default: new cc.Rect(0, 0, 1, 1),
			serializable: false,
		},

		_temporalNode: {
			default: null,
			type: saykit.TemporalCameraNode,
			serializable: false,
		},
		_tempTarget: {
			default: null,
			type: cc.Node,
			serializable: false,
		},

		_targetChangeTween: {
			default: null,
			type: saykit.Tween,
			serializable: false,
		},
		_targetInterpol: { default: 0, serializable: false },

		_zoomTween: { default: null, type: saykit.Tween, serializable: false },
		_zoomFactor: { default: 1, serializable: false },

		//#endregion
	},

	editor: CC_EDITOR && {
		menu: "SayKit/Camera/CameraController",
	},

	onLoad() {
		this._camera = this.getComponent(cc.Camera) || this.node.getComponentInChildren(cc.Camera);
		this.isAddCameraDictionary && saykit.dictionary.add(this.node.name, this._camera);
		this.followTarget = this.target;

		!this._temporalNode && this._createTemporalCameraNode();

		cc.systemEvent.on(saykit.GameEvent.CAMERA_ADD_TARGET, this.onCameraAddTarget, this);
		cc.systemEvent.on(saykit.GameEvent.CAMERA_DELETE_TARGET, this.onCameraDeleteTarget, this);
	},

	start() {
		this._follow(1);
	},

	onEnable() {
		this._resize();
		this.isCameraEvents && this._toggleEventsSubscription(true);
	},

	onDisable() {
		this.isCameraEvents && this._toggleEventsSubscription(false);
	},

	lateUpdate(dt) {
		this._follow(this.useFixedDt ? this.fixedDt : dt);
	},
	//#endregion

	//#region public methods
	_follow(dt) {
		if (!(this.followTarget instanceof saykit.CameraTarget)) return;
		//set position
		this._updatePosition(dt);

		//set rotation
		this._updateRotation(dt);

		//set zoom
		this._camera.zoomRatio = this.followTarget.followZoom.getValue() * this._zoomFactor;

		//set fov
		if (this._camera.ortho) {
			this._camera.orthoSize = this.followTarget.followFov.getValue();
		} else {
			this._camera.fov = this.followTarget.followFov.getValue();
		}
	},
	//#endregion

	//#region private methods

	_toggleEventsSubscription(isOn) {
		const func = isOn ? "on" : "off";

		cc.systemEvent[func](saykit.Event.SIZE_CHANGE, this.onSizeChange, this);

		cc.systemEvent[func](saykit.GameEvent.CAMERA_ZOOM, this.onCameraZoom, this);
		cc.systemEvent[func](saykit.GameEvent.CAMERA_SWITCH_TARGET, this.onCameraSwitchTarget, this);
		cc.systemEvent[func](saykit.GameEvent.CAMERA_MOVE_TO_TARGET, this.onCameraMoveToTarget, this);
	},

	_resize() {
		if (this.isChangeCameraRectOnResize) {
			const key = saykit.settings.isLandscape ? "landscape" : "portrait";
			this._currentCameraRect = this.cameraRectOnResize[key];
			this._camera.rect = this._currentCameraRect;
		}

		if (!this.followTarget) return;

		this._setPositionToTarget();
	},

	_updatePosition(dt) {
		const node = this.followTarget.node;
		const followOffset = this.followTarget.followOffset.getValue();
		let targetWorldPositionOffset = cc.v3();

		if (this.followTarget.isNodeRotationAffectsOffset) {
			const targetWorldPosition = node.getWorldPosition(cc.v3());
			const direction = node.convertToWorldSpaceAR(followOffset).sub(targetWorldPosition).normalize();
			targetWorldPositionOffset = targetWorldPosition.add(direction.mul(followOffset.mag()));
		} else {
			targetWorldPositionOffset = node.convertToWorldSpaceAR(cc.Vec3.ZERO).add(followOffset);
		}

		const targetPositionInCameraSpace = this.node.parent.convertToNodeSpaceAR(targetWorldPositionOffset);
		let position = cc.v3();

		if (this.isSmooth && dt !== 0) {
			const coef = (this.fps30Mode ? 30 : 60) * dt;
			const ratio = cc.misc.clampf(coef * this.followMoveSpeed, 0, 1);
			position = this.node.position.lerp(targetPositionInCameraSpace, ratio);
		} else {
			position = targetPositionInCameraSpace;
		}

		this.node.setPosition(position);
	},

	_updateRotation(dt) {
		let targetRotation = cc.quat().fromEuler(this.followTarget.followRotation.getValue());

		if (this.followTarget.isUseNodeRotation) {
			const followTargetRotation = this.followTarget.node.getWorldRotation();
			targetRotation = followTargetRotation.multiply(targetRotation);
		}

		let rotation = targetRotation.clone();

		if (this.isSmooth && dt !== 0) {
			const coef = (this.fps30Mode ? 30 : 60) * dt;
			const ratio = cc.misc.clampf(coef * this.followRotationSpeed, 0, 1);
			const currentRotation = this.node.getRotation(cc.quat());
			rotation = currentRotation.lerp(targetRotation, ratio);
		}

		const angles = rotation.toEuler(cc.v3());

		angles.x = this.lockXRotation ? 0 : angles.x;
		angles.y = this.lockYRotation ? 0 : angles.y;
		angles.z = this.lockZRotation ? 0 : angles.z;

		const r = cc.quat().fromEuler(angles);

		this.node.setRotation(r);
	},

	_setPositionToTarget() {
		this._updatePosition(0);
	},

	_createTemporalCameraNode() {
		this._temporalNode = new saykit.TemporalCameraNode();
		this._temporalNode.init();
	},

	_findTarget(keyOrCameraTarget) {
		let target = this._checkForCameraTarget(keyOrCameraTarget);

		if (!target && keyOrCameraTarget instanceof saykit.CameraTarget) {
			target = this._addCameraTarget(keyOrCameraTarget);
		}

		return target;
	},

	_addCameraTarget(target) {
		this.targets.push(target);
	},

	_checkForCameraTarget(keyOrCameraTarget) {
		let out = null;

		for (let target of this.targets) {
			if (target === keyOrCameraTarget || (target.node && target.node.activeInHierarchy && keyOrCameraTarget === target.key)) {
				out = target;

				break;
			}
		}

		return out;
	},

	_switchTarget(newTarget, time, easing = "linear", isInterrupt = true, callback = null) {
		if (time === 0 || !this.target) {
			this.target = newTarget;
			this.followTarget = this.target;
			this._setPositionToTarget();
			callback && callback();

			return;
		}

		if (this._targetChangeTween && !isInterrupt) {
			this._targetChangeTween.onComplete(() => {
				this._targetChangeTween = null;
				this.followTarget = this.target;
				this._switchTarget(newTarget, time, easing, isInterrupt, callback);
			});

			return;
		}

		this._targetInterpol = 0;
		this._targetChangeTween && this._targetChangeTween.kill();
		this._destroyTempTarget();
		this._targetChangeTween = saykit.DOTween.addWithProps(this, { _targetInterpol: 1 }, time, cc.easing[easing])
			.onUpdate(() => {
				//interpolate
				//from last position and params of previous target
				//to current position and params of current target
				this._temporalNode.lerp(fromCameraTarget, toCameraTarget, this._targetInterpol);
			})
			.onComplete(() => {
				//set follow to current target
				this._targetChangeTween = null;
				this.followTarget = this.target;
				callback && callback();
			});

		const fromCameraTarget = this.target;
		const toCameraTarget = newTarget;

		//change target
		this.target = newTarget;

		//set temporal target to last position and params of previos target
		this._temporalNode.start(fromCameraTarget);
		//set follow to temporal target
		this.followTarget = this._temporalNode.cameraTarget;
	},

	_moveToTarget(newTarget, time, easing = "linear") {
		if (time === 0 || !this.target) {
			this.target = newTarget;
			this.followTarget = this.target;
			this._setPositionToTarget();

			return;
		}

		this._targetInterpol = 0;
		this._targetChangeTween && this._targetChangeTween.kill();
		this._destroyTempTarget();
		this._targetChangeTween = saykit.DOTween.addWithProps(this, { _targetInterpol: 1 }, time, cc.easing[easing]);

		this.tempTarget = cc.instantiate(this._temporalNode.node);
		this.tempTarget.setParent(this._temporalNode.node.parent);

		const fromCameraTarget = this.tempTarget.getComponent(saykit.CameraTarget);
		const toCameraTarget = newTarget;

		//change target
		this.target = newTarget;

		//set temporal target to last position and params of previos target
		this._temporalNode.start(fromCameraTarget);
		//set follow to temporal target
		this.followTarget = this._temporalNode.cameraTarget;

		this._targetChangeTween
			.onUpdate(() => {
				//interpolate
				//from last position and params of previous target
				//to current position and params of current target
				this._temporalNode.lerp(fromCameraTarget, toCameraTarget, this._targetInterpol);
			})
			.onComplete(() => {
				//set follow to current target
				this.tempTarget.destroy();
				this.tempTarget = null;

				this.followTarget = this.target;
			});
	},

	_destroyTempTarget() {
		this.tempTarget && this.tempTarget.destroy();
		this.tempTarget = null;
	},

	//#endregion

	//#region event handlers

	onSizeChange() {
		this._resize();
	},

	onCameraSwitchTarget(keyOrCameraTarget, time = 0, easing = "linear", isInterrupt = true, callback = null) {
		const target = this._findTarget(keyOrCameraTarget);

		if (!target) return cc.warn("CameraTarget doesn't exist");

		this._switchTarget(target, time, easing, isInterrupt, callback);
	},
	onCameraMoveToTarget(keyOrCameraTarget, time = 0, easing = "linear") {
		const target = this._findTarget(keyOrCameraTarget);

		if (!target) return cc.warn("CameraTarget doesn't exist");

		this._moveToTarget(target, time, easing);
	},

	onCameraAddTarget(cameraTarget) {
		if (!(cameraTarget instanceof saykit.CameraTarget)) return cc.warn(cameraTarget, "is not instanceof CameraTarget");

		let isAlreadyAdded = this._checkForCameraTarget(cameraTarget);

		if (isAlreadyAdded) return;

		this._addCameraTarget(cameraTarget);
	},
	onCameraDeleteTarget(cameraTarget) {
		cc.warn("TODO");

		for (let index in this.targets) {
			if (cameraTarget.uuid === this.targets[index].uuid) {
				this.targets.splice(index, 1);
			}
		}

		if (this.followTarget && this.followTarget.uuid === cameraTarget.uuid) {
			this.followTarget = null;
		}
	},

	onCameraZoom(value, time = 0, easing) {
		if (time > 0) {
			this._zoomTween && this._zoomTween.kill();
			this._zoomTween = saykit.DOTween.addWithProps(this, { _zoomFactor: value }, time, easing);
			this._zoomTween.onComplete = () => {
				this._zoomTween = null;
				this._zoomFactor = value;
			};
		} else {
			this._zoomFactor = value;
		}
	},

	//#endregion
});

saykit.CameraController = module.exports = SKCameraController;
