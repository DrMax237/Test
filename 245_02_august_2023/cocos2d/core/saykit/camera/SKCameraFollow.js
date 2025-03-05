const SKCameraFollow = cc.Class({
	name: 'SKCameraFollow',
	extends: cc.Component,

	properties: {
		target: {
			default: null,
			type: cc.Node,
			notify() {
				this._isFollow = this.target instanceof cc.Node;
			},
		},
		screenOffset: cc.Vec2.ZERO,
	},

	editor: CC_EDITOR && {
		menu: 'SayKit/Camera/CameraFollow',
	},

	onLoad() {
		this._refreshTransform();
	},

	update(dt) {
		this._refreshTransform();
	},

	_refreshTransform() {
		if (!this.target) return;

		const targetPosition = this.target.getWorldPosition(cc.v3());
		const offset = this.node
			.convertToWorldSpaceAR(
				cc.v2(
					saykit.settings.gameSize.width * (this.screenOffset.x + 0.5),
					saykit.settings.gameSize.height * (this.screenOffset.y + 0.5)
				)
			)
			.sub(this.node.getWorldPosition(cc.v3()));
		const position = targetPosition.add(offset);

		this.node.setWorldPosition(position);
	},
});

saykit.CameraFollow = module.exports = SKCameraFollow;
