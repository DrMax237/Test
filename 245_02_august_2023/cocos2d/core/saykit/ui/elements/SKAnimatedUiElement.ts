const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.AnimatedUiElement")
@menu("Ui/Elements/AnimatedUiElement")
export class SKAnimatedUiElement extends saykit.UiElement {
	@property(cc.AnimationClip)
	set showClip(value: any) {
		this._showClip = value;

		this._setupAnimation();
	}
	get showClip(): any {
		return this._showClip;
	}
	@property(cc.AnimationClip)
	set idleClip(value: any) {
		this._idleClip = value;

		this._setupAnimation();
	}
	get idleClip(): any {
		return this._idleClip;
	}
	@property(cc.AnimationClip)
	set hideClip(value: any) {
		this._hideClip = value;

		this._setupAnimation();
	}
	get hideClip(): any {
		return this._hideClip;
	}

	@property(cc.Animation) protected _animation: any = null;
	@property(cc.AnimationClip) protected _showClip: any = null;
	@property(cc.AnimationClip) protected _idleClip: any = null;
	@property(cc.AnimationClip) protected _hideClip: any = null;
	//#endregion Editor Properties

	//#region Lifecycle
	onLoad() {
		this._setupAnimation();

		super.onLoad();
	}

	//#endregion Lifecycle

	//#region Protected
	protected _enableElement(isInstant: boolean, callback: () => void): void {
		this.node.active = true;

		//if UiElement has no animation just run callback
		if (!this._animation) {
			callback && callback();
			return;
		}

		//stops currently playing animations
		this._animation.stop();
		//unschedule All toggle callbacks and animation callbacks
		this.unscheduleAllCallbacks();

		//1. plays show clip if has any and not instant toggle
		//2. plays idle clip if has no show clip
		if (this.showClip && !isInstant && !this.skipShow) {
			this._animation.playAdditive(this.showClip.name);
			this._isToggling = true;

			const duration = this.showClip.duration / this.showClip.speed;
			this.scheduleOnce(this._onShowEnd, duration);
			callback && this.scheduleOnce(callback, duration);
		} else if (this.idleClip) {
			this._isToggling = false;
			this._animation.play(this.idleClip.name);
			callback && callback();
		}

		//set animation to the beginning (avoid first frame glitch)
		this._animation.setCurrentTime(0);
	}
	protected _disableElement(isInstant: boolean, callback: () => void): void {
		//unschedule All toggle callbacks and animation callbacks
		this.unscheduleAllCallbacks();

		//if UiElement has no animation
		if (!this._animation) {
			this.node.active = false;
			callback && callback();
			return;
		}
		//stops toggle animations
		//stops idle animation if stopIdleOnHide enabled
		if (this.stopIdleOnHide) {
			this._animation.stop();
			//unschedule All toggle callbacks and animation callbacks
			this.unscheduleAllCallbacks();
		} else {
			this.showClip && this._animation.stop(this.showClip.name);
			this.hideClip && this._animation.stop(this.hideClip.name);
			//unschedule All toggle callbacks and animation callbacks
			this.unscheduleAllCallbacks();
		}
		//plays hide clip if has any and not instant toggle
		//plays idle clip if has no show clip
		if (this.hideClip && !isInstant && !this.skipHide) {
			this._animation.playAdditive(this.hideClip.name);
			this._isToggling = true;

			const duration = this.hideClip.duration / this.hideClip.speed;
			this.scheduleOnce(this._onHideEnd, duration);
			callback && this.scheduleOnce(callback, duration);
		} else {
			this._isToggling = false;
			this.node.active = false;
			callback && callback();
		}
	}
	protected _onShowEnd(): void {
		this._isToggling = false;

		if (this._animation && this.idleClip) {
			this._animation.play(this.idleClip.name);
			const duration = this.idleClip.duration / this.idleClip.speed;
			this.schedule(this._onIdleEnd, duration);
		}
	}
	protected _onIdleEnd(): void {}
	protected _onHideEnd(): void {
		this._isToggling = false;

		this.node.active = false;
	}
	protected _setupAnimation(): void {
		this.node.removeComponent(cc.Animation);
		this._animation = null;

		if (!this.showClip && !this.idleClip && !this.hideClip) return;

		this._animation = this.node.addComponent(cc.Animation);

		this.showClip instanceof cc.AnimationClip && this._animation.addClip(this.showClip, this.showClip.name);
		this.idleClip instanceof cc.AnimationClip && this._animation.addClip(this.idleClip, this.idleClip.name);
		this.hideClip instanceof cc.AnimationClip && this._animation.addClip(this.hideClip, this.hideClip.name);
	}
	//#endregion Protected

	//#region Private
	//#endregion Private

	//#region Event Handlers
	//#endregion Event Handlers
}

saykit.AnimatedUiElement = SKAnimatedUiElement;
