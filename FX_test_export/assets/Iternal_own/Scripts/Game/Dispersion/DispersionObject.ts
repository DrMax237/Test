const { ccclass, property } = cc._decorator;
const __privateProperty = { visible: false, serializable: false };

@ccclass
export class DispersionObject extends cc.Component {
	@property(cc.Boolean) isSuit = false;
	@property(cc.v2) dispersion = cc.v2();
	@property(cc.Float) movingTime = 1;
	@property(cc.String) movingStartEasing = "quadOut";
	@property(cc.String) movingFinishEasing = "quadIn";
	@property(cc.Boolean) isRotating = false;
	@property(cc.Float) rotatingTime = 3;
	@property(cc.Float) zOffset = 500;

	@property({ visible: false })
	get target(): cc.Node {
		return this._target;
	}
	set target(value: cc.Node) {
		if (this._target === value) return;

		this._target = value;
		this._onSetTarget();
	}

	@property(__privateProperty) _target: cc.Node = null;
	@property(__privateProperty) tweenStart: any = null;
	@property(__privateProperty) tweenFinish: any = null;
	@property(__privateProperty) tweenRotate: any = null;
	@property(__privateProperty) dispersionPosition: cc.Vec2 = null;

	onLoad() {
		this._subscribeToEvents(true);
	}
	onEnable() {
		this._reset();
		this._setRandomAngle();
		this._subscribeToEvents(true);
	}
	onDisable() {
		this.tweenRotate && this.tweenRotate.stop();
		this._subscribeToEvents(false);
	}

	delete(): void {
		const poolableObject = this.node.getComponent(saykit.PoolableObject);

		this.node.destroy(true);
	}

	private _subscribeToEvents(isOn: boolean): void {
		const func = isOn ? "on" : "off";

		cc.systemEvent[func](saykit.Event.SIZE_CHANGE, this.onSizeChange, this);
	}
	private _reset(): void {
		this.target = null;
		this.tweenStart = null;
		this.tweenFinish = null;
		this.tweenRotate = null;
	}
	private _onSetTarget(): void {
		if (!this.target) return;

		this.dispersionPosition = cc.v2(
			(Math.random() - 0.5) * this.dispersion.x,
			(Math.random() - 0.5) * this.dispersion.y
		);

		const targetPosition = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);
		const time = this.dispersionPosition.x != 0 && this.dispersionPosition.y != 0 ? this.movingTime : 0.1;

		this.tweenStart = saykit.tweenManager.add(
			this.node,
			{
				x: this.node.x + this.dispersionPosition.x,
				y: this.node.y + this.dispersionPosition.y,
				z: this.zOffset,
			},
			time,
			this.movingStartEasing
		);

		this.tweenStart.addCompleteCallback(() => {
			this.tweenFinish = saykit.tweenManager.add(
				this.node,
				{
					x: targetPosition.x,
					y: targetPosition.y,
				},
				this.movingTime,
				this.movingFinishEasing
			);

			this.tweenFinish.addCompleteCallback(() => {
				this.onMovingEnd();
			});
		});

		if (this.isRotating) {
			this.tweenRotate = saykit.tweenManager.add(
				this.node,
				{
					rotation: 360,
					rotationX: 360,
					rotationY: 360,
				},
				this.rotatingTime
			);
		}
	}
	private _setRandomAngle(angle: number): void {
		if (!this.isRotating) return;

		this.node.rotation = -Math.random() * 360;
		this.node.rotationX = -Math.random() * 360;
		this.node.rotationY = -Math.random() * 360;
	}

	private onSizeChange(): void {
		if (!this.tweenFinish) return;

		const targetPosition = this.target.convertToWorldSpaceAR(cc.Vec2.ZERO);

		this.tweenFinish.changeProperties({
			x: { initial: this.dispersionPosition.x, finish: targetPosition.x },
			y: { initial: this.dispersionPosition.y, finish: targetPosition.y },
		});
	}
	private onMovingEnd(): void {
		this.delete();
	}
}
