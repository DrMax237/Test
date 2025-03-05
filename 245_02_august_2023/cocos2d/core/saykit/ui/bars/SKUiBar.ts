const { ccclass, property, menu } = cc._decorator;

saykit.GameEvent.UI_BAR_PROGRESS_ADD = "UI_BAR_PROGRESS_ADD";
saykit.GameEvent.UI_BAR_PROGRESS_CHANGE = "UI_BAR_PROGRESS_CHANGE";
saykit.GameEvent.UI_BAR_PROGRESS_SET = "UI_BAR_PROGRESS_SET";

@ccclass("saykit.UiBar")
@menu("Ui/Bars/Bar")
export class SKUiBar extends saykit.AnimatedUiElement {
	@property(cc.Float) fillSpeed: number = 1;
	@property(cc.Float)
	set progress(value: number) {
		if (!CC_EDITOR) return;

		this._setProgress(value);
	}
	get progress(): number {
		return this._targetProgress;
	}

	@property(cc.Float) _targetProgress: number = 0;
	@property(cc.Float) _currentProgress: number = 0;

	protected _progressTween: saykit.Tween = null;

	onLoad() {
		super.onLoad();

		this._subscribeToEvents(true);
	}
	onEnable() {
		this._refreshBar();
		this._subscribeToEvents(true);
	}
	onDisable() {
		this._subscribeToEvents(false);
	}

	//#region Public
	public addProgress(value: number): void {
		this._addProgress(value);
	}
	public changeProgress(value: number): void {
		this._changeProgress(value);
	}
	public setProgress(value: number): void {
		this._setProgress(value);
	}
	//#endregion Public

	//#region Protected
	protected _addProgress(value: number, callback: () => void = null) {
		this._targetProgress = cc.misc.clampf(this._targetProgress + value, 0, 1);

		this._startTween(callback);
	}
	protected _changeProgress(value: number, callback: () => void = null) {
		this._targetProgress = value;

		this._startTween(callback);
	}
	protected _setProgress(value: number, callback: () => void = null) {
		this._cancelTween();

		this._targetProgress = value;
		this._currentProgress = value;

		this._refreshBar();

		callback && callback();
	}
	protected _checkProgressFull(): void {}
	protected _startTween(callback: () => void = null): void {
		this._cancelTween();

		if (this.fillSpeed === 0) {
			this._currentProgress = this._targetProgress;

			this._refreshBar();

			return;
		}

		const time = Math.abs(this._targetProgress - this._currentProgress) / Math.abs(this.fillSpeed);

		this._progressTween = saykit.DOTween.addWithProps(this, { _currentProgress: this._targetProgress }, time)
			.setAutoKill(false)
			.onUpdate(() => {
				this._refreshBar();
				this._checkProgressFull();
			})
			.onComplete(() => {
				this._progressTween = null;
				this._currentProgress = this._targetProgress;

				this._refreshBar();
				this._checkProgressFull();

				callback && callback();
			});
	}
	protected _cancelTween(): void {
		this._progressTween && this._progressTween.kill();
		this._progressTween = null;
	}
	protected _refreshBar(): void {}

	private _subscribeToEvents(isOn: boolean): void {
		const func = isOn ? "on" : "off";

		this.node[func](saykit.GameEvent.UI_BAR_PROGRESS_ADD, this.onUiBarProgressAdd, this);
		this.node[func](saykit.GameEvent.UI_BAR_PROGRESS_CHANGE, this.onUiBarProgressChange, this);
		this.node[func](saykit.GameEvent.UI_BAR_PROGRESS_SET, this.onUiBarProgressSet, this);

		cc.systemEvent[func](saykit.GameEvent.UI_BAR_PROGRESS_ADD, this.onUiBarProgressAddByKey, this);
		cc.systemEvent[func](saykit.GameEvent.UI_BAR_PROGRESS_CHANGE, this.onUiBarProgressChangeByKey, this);
		cc.systemEvent[func](saykit.GameEvent.UI_BAR_PROGRESS_SET, this.onUiBarProgressSetByKey, this);
	}

	protected onUiBarProgressAdd(value: number, callback: () => void = null) {
		this._addProgress(value, callback);
	}
	protected onUiBarProgressChange(value: number, callback: () => void = null) {
		this._changeProgress(value, callback);
	}
	protected onUiBarProgressSet(value: number, callback: () => void = null) {
		this._setProgress(value, callback);
	}
	protected onUiBarProgressAddByKey(key: string = "", value: number, callback: () => void = null) {
		if (this.key !== key) return;

		this._addProgress(value, callback);
	}
	protected onUiBarProgressChangeByKey(key: string = "", value: number, callback: () => void = null) {
		if (this.key !== key) return;

		this._changeProgress(value, callback);
	}
	protected onUiBarProgressSetByKey(key: string = "", value: number, callback: () => void = null) {
		if (this.key !== key) return;

		this._setProgress(value, callback);
	}
	//#endregion Protected
}

saykit.UiBar = SKUiBar;
