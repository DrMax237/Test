const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.TweenedUiElement")
@menu("Ui/Elements/TweenedUiElement")
export class SKTweenedUiElement extends saykit.UiElement {
	@property(cc.Node) target: any = null;

	@property() showDuration: number = 1;
	@property() hideDuration: number = 1;

	public showTween: saykit.Tween = null;
	public idleTween: saykit.Tween = null;
	public hideTween: saykit.Tween = null;

	//#region Lifecycle
	onLoad() {
		this._setupTweens();

		super.onLoad();
	}
	//#endregion Lifecycle

	//#region Public
	//#endregion Public

	//#region Protected
	protected _enableElement(isInstant: boolean, callback: () => void): void {
		this.node.active = true;

		this.showTween && this.showTween.pause();
		this.idleTween && this.idleTween.pause();
		this.hideTween && this.hideTween.pause();

		//setup show tween
		this._setupShowTween();

		//1. runs show tween if has any and not instant toggle
		//2. runs idle tween if has no show tween
		if (this.showTween && !isInstant && !this.skipShow) {
			this.showTween.restart();

			const completeCallback = this.showTween.onCompleteCallback;

			this.showTween.onComplete(() => {
				completeCallback && completeCallback();
				callback && callback();
			});
		} else {
			if (this.showTween && this.showTween.onCompleteCallback) {
				this.showTween.onCompleteCallback();
			} else {
				this._setupIdleTween();

				this.idleTween && this.idleTween.restart();
			}

			callback && callback();
		}
	}
	protected _disableElement(isInstant: boolean, callback: () => void): void {
		this.showTween && this.showTween.pause();
		this.stopIdleOnHide && this.idleTween && this.idleTween.pause();
		this.hideTween && this.hideTween.pause();

		//setup hide tween
		this._setupHideTween();

		//1. runs hide tween if has any and not instant toggle
		if (this.hideTween && !isInstant && !this.skipHide) {
			this.hideTween.restart();
			const completeCallback = this.hideTween.onCompleteCallback;
			this.hideTween.onComplete(() => {
				completeCallback && completeCallback();
				callback && callback();
			});
		} else {
			this.hideTween && this.hideTween.onCompleteCallback && this.hideTween.onCompleteCallback();
			callback && callback();
		}
	}
	protected _onShowEnd(): void {
		this._isToggling = false;

		this._setupIdleTween();

		if (this.idleTween) this.idleTween.restart();
	}
	protected _onIdleEnd(): void {
		this._setupIdleTween();

		this.idleTween && this.idleTween.restart();
	}
	protected _onHideEnd(): void {
		this._isToggling = false;

		this.node.active = false;
	}

	protected _setupTweens(): void {
		const target = this.target || this.node;

		target.opacity = 0;
		this.showTween = saykit.DOTween.addWithProps(target, { opacity: 255 }, this.showDuration, cc.easing.linear, false)
			.setAutoKill(false)
			.onStart(() => {
				target.opacity = 0;
			})
			.onComplete(() => {
				target.opacity = 255;
				this._onShowEnd();
			});

		target.opacity = 255;
		this.hideTween = saykit.DOTween.addWithProps(target, { opacity: 0 }, this.hideDuration, cc.easing.linear, false)
			.setAutoKill(false)
			.onStart(() => {
				target.opacity = 255;
			})
			.onComplete(() => {
				target.opacity = 0;
				this._onHideEnd();
			});
	}

	protected _setupShowTween(): void {}
	protected _setupIdleTween(): void {}
	protected _setupHideTween(): void {}
	//#endregion Protected

	//#region Private
	//#endregion Private

	//#region Event Handlers
	//#endregion Event Handlers
}

saykit.TweenedUiElement = SKTweenedUiElement;
