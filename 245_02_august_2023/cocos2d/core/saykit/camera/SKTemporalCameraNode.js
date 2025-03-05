const SKTemporalCameraNode = cc.Class({
	name: "SKTemporalCameraNode",
	properties: {
		node: { default: null, type: cc.Node, visible: false },
		cameraTarget: { default: null, type: saykit.CameraTarget },

		_fromPosition: { default: cc.Vec3.ZERO, serializable: false },
	},

	init() {
		!this.node && this._createTemporalFollowNode();
		!this.cameraTarget && this._createCameraTarget();
	},

	start(fromCameraTarget) {
		//set node position
		this._fromPosition = fromCameraTarget.node.getWorldPosition(cc.v3());

		this._fromRotation = fromCameraTarget.node.getWorldRotation(cc.quat());
		// this._fromRotation = fromCameraTarget.node.getWorldRotation(cc.quat()).toEuler(cc.v3());

		this.node.setWorldPosition(this._fromPosition);
		this.node.setWorldRotation(this._fromRotation);

		this.cameraTarget.isUseNodeRotation = fromCameraTarget.isUseNodeRotation;

		//set camera target
		this.cameraTarget.set(fromCameraTarget);
	},

	lerp(fromCameraTarget, toCameraTarget, ratio) {
		//update node position
		const toPosition = toCameraTarget.node.getWorldPosition(cc.v3());
		const worldPosition = this._fromPosition.lerp(toPosition, ratio);
		this.node.setWorldPosition(worldPosition);

		const toRotation = toCameraTarget.node.getWorldRotation(cc.quat());
		const worldRotation = this._fromRotation.lerp(toRotation, ratio);
		// const toRotation = toCameraTarget.node.getWorldRotation(cc.quat()).toEuler(cc.v3());
		// const worldRotation = cc.quat().fromEuler(this._fromRotation.lerp(toRotation, ratio));

		this.node.setWorldRotation(worldRotation);

		//update camera target
		this.cameraTarget.lerp(fromCameraTarget, toCameraTarget, ratio);
	},

	_createTemporalFollowNode() {
		const node = new cc.Node("CameraTemporalFollowNode");
		node.setParent(cc.director.getScene());
		node.is3DNode = true;

		this.node = node;
	},

	_createCameraTarget() {
		this.cameraTarget = this.node.addComponent(saykit.CameraTarget);
	},
});

saykit.TemporalCameraNode = module.exports = SKTemporalCameraNode;
