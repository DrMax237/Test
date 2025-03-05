const { ccclass, property, menu } = cc._decorator;

saykit.GameEvent.UI_FLASH_SHOW = "UI_FLASH_SHOW";

@ccclass("saykit.UiFlash")
@menu("Ui/Flash")
export class SKUiFlash extends saykit.AnimatedUiElement {
	//#region Editor Properties
	// @property({ type: cc.Boolean, override: true, visible: false, serializable: false }) toggleWithScreen: boolean = true;
	@property({ type: cc.Boolean, override: true, visible: false, serializable: false }) activeOnStart: boolean = false;
	@property({ type: cc.Boolean, override: true, visible: false, serializable: false }) skipShow: boolean = false;
	@property({ type: cc.Boolean, override: true, visible: false, serializable: false }) skipHide: boolean = false;
	@property({ type: cc.Boolean, override: true, visible: false, serializable: false }) stopIdleOnHide: boolean = true;
	@property({ type: cc.AnimationClip, override: true, visible: false })
	@property({ type: cc.AnimationClip, override: true, visible: false })
	set idleClip(value: any) {}
	get idleClip(): any {
		return null;
	}
	@property({ type: cc.AnimationClip, override: true, visible: false })
	set hideClip(value: any) {}
	get hideClip(): any {
		return null;
	}
	//#endregion

	//#region Protected Properties
	protected _maxCallback: () => void = null;
	protected _endCallback: () => void = null;
	//#endregion Protected Properties

	//#region LifeCycle
	onLoad() {
		super.onLoad();

		this.node.on(saykit.GameEvent.UI_FLASH_SHOW, this.onUiFlashShow, this);
		cc.systemEvent.on(saykit.GameEvent.UI_FLASH_SHOW, this.onUiFlashShow, this);
	}
	//#endregion

	//#region Private
	private _setupAnimation(): void {
		this.node.removeComponent(cc.Animation);
		this._animation = null;

		if (!this.showClip) return;

		this._animation = this.node.addComponent(cc.Animation);
		this.showClip instanceof cc.AnimationClip && this._animation.addClip(this.showClip, this.showClip.name);
	}
	//#endregion Private

	//#region Event Handlers
	protected onUiFlashShow(key: string, maxCallback: () => void = null, endCallback: () => void = null): void {
		if (this.key !== key) return;

		this._maxCallback = maxCallback;
		this._endCallback = endCallback;

		this.toggle(true);
	}
	protected onFlashMax() {
		this._maxCallback && this._maxCallback();
		this._maxCallback = null;
	}
	protected onFlashEnd() {
		this.toggle(false, true);

		this._endCallback && this._endCallback();
		this._endCallback = null;
	}
	//#endregion Event Handlers
}

saykit.UiFlash = SKUiFlash;
