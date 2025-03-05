const { ccclass, property, menu } = cc._decorator;

saykit.GameEvent.UI_COUNTER_ADD = "UI_COUNTER_ADD";
saykit.GameEvent.UI_COUNTER_SET = "UI_COUNTER_SET";
saykit.GameEvent.UI_COUNTER_CHANGE = "UI_COUNTER_CHANGE";

enum CountMode {
	Update = 0,
	Tween = 1,
}
cc.Enum(CountMode);

enum DisplayMode {
	Round = 0,
	Floor = 1,
	Ceil = 2,
	Float = 3,
}
cc.Enum(DisplayMode);

@ccclass("saykit.UiCounter")
@menu("Ui/Counters/Counter")
export class SKUiCounter extends saykit.AnimatedUiElement {
	//#region Editor Properties
	@property(cc.Float) countSpeed: number = 0;
	@property({ type: CountMode }) countMode: CountMode = CountMode.Tween;
	@property({ type: DisplayMode }) displayMode: DisplayMode = DisplayMode.Round;
	@property({
		type: cc.Integer,
		visible() {
			return this.displayMode === DisplayMode.Float;
		},
	})
	fractionalLength: number = 1;

	@property({
		visible() {
			return this.countMode === CountMode.Tween;
		},
	})
	easing: string = "linear";

	@property(cc.Float)
	get count(): number {
		return this._targetCount;
	}
	set count(value: number) {
		if (!CC_EDITOR) return;

		this._setValue(value);
	}

	//#endregion Editor Properties

	//#region Protected Properties
	@property(cc.Float) protected _targetCount: number = 0;
	@property(cc.Float) protected _currentCount: number = 0;
	@property(cc.Boolean) protected _isCountingUpdate: boolean = false;
	@property(saykit.Tween) protected _countTween: saykit.Tween = null;
	//#endregion

	//#region private
	private _callback: () => void = null;
	//#endregion

	//#region  Static
	static readonly CountMode = CountMode;
	static readonly DisplayMode = DisplayMode;

	//#region LifeCycle
	onLoad() {
		super.onLoad();

		this._subscribeToEvents(true);
	}
	onEnable() {
		this._refreshCounter();
		this._subscribeToEvents(true);
	}
	onDisable() {
		this._subscribeToEvents(false);
	}
	update(dt: number) {
		this._isCountingUpdate && this._updateCount(dt);
	}
	//#endregion

	//#region Public
	public addValue(value: number): void {
		this._addValue(value);
	}
	public changeValue(value: number): void {
		this._changeValue(value);
	}
	public setValue(value: number): void {
		this._setValue(value);
	}
	//#endregion Public

	//#region Protected
	protected _refreshCounter(): void {}
	protected _getDisplayedCount(): string {
		switch (this.displayMode) {
			case DisplayMode.Round:
				return Math.round(this._currentCount).toString();
			case DisplayMode.Floor:
				return Math.floor(this._currentCount).toString();
			case DisplayMode.Ceil:
				return Math.ceil(this._currentCount).toString();
			case DisplayMode.Float:
				return this._currentCount.toFixed(this.fractionalLength);
			default:
				return this._currentCount.toString();
		}
	}
	//#endregion Protected

	//#region Private
	private _subscribeToEvents(isOn: boolean): void {
		const func = isOn ? "on" : "off";

		this.node[func](saykit.GameEvent.UI_COUNTER_ADD, this.onCounterAdd, this);
		this.node[func](saykit.GameEvent.UI_COUNTER_SET, this.onCounterSet, this);
		this.node[func](saykit.GameEvent.UI_COUNTER_CHANGE, this.onCounterChange, this);

		cc.systemEvent[func](saykit.GameEvent.UI_COUNTER_ADD, this.onCounterAddByKey, this);
		cc.systemEvent[func](saykit.GameEvent.UI_COUNTER_SET, this.onCounterSetByKey, this);
		cc.systemEvent[func](saykit.GameEvent.UI_COUNTER_CHANGE, this.onCounterChangeByKey, this);
	}
	private _addValue(value: number, callback: () => void = null): void {
		this._targetCount += value;

		this._changeValue(this._targetCount + value, callback);
	}
	private _changeValue(value: number, callback: () => void = null): void {
		this._targetCount = value;

		if (this.countSpeed === 0) {
			this._currentCount = this._targetCount;
			this._refreshCounter();

			return;
		}

		switch (this.countMode) {
			case CountMode.Tween:
				this._cancelUpdate();
				this._startTween(callback);
				break;
			case CountMode.Update:
				this._cancelTween();
				this._startUpdate(callback);
				break;
		}
	}
	private _setValue(value: number, callback: () => void = null): void {
		this._cancelTween();
		this._cancelUpdate();

		this._targetCount = value;
		this._currentCount = value;

		this._refreshCounter();

		callback && callback();
	}
	private _updateCount(dt: number): void {
		const direction = Math.sign(this._targetCount - this._currentCount);
		const delta = dt * this.countSpeed * direction;
		let newCount = this._currentCount + delta;

		//check if reached
		const isReachedInc = direction === 1 && this._currentCount < this._targetCount && newCount >= this._targetCount;
		const isReachedDec = direction === -1 && this._currentCount > this._targetCount && newCount <= this._targetCount;
		const isReachedAlr = direction === 0;

		if (isReachedInc || isReachedDec || isReachedAlr) {
			newCount = this._targetCount;

			this._isCountingUpdate = false;

			this._refreshCounter();

			this._callback && this._callback();

			return;
		}

		this._currentCount = newCount;

		this._refreshCounter();
	}
	private _startTween(callback: () => void = null): void {
		this._cancelTween();

		const time = Math.abs(this._targetCount - this._currentCount) / Math.abs(this.countSpeed);
		const easing = cc.easing[this.easing] || cc.easing["linear"];

		this._countTween = saykit.DOTween.addWithProps(this, { _currentCount: this._targetCount }, time, easing)
			.setAutoKill(false)
			.onUpdate(() => {
				this._refreshCounter();
			})
			.onComplete(() => {
				this._countTween = null;
				this._currentCount = this._targetCount;

				this._refreshCounter();

				callback && callback();
			});
	}
	private _cancelTween(): void {
		this._countTween && this._countTween.kill();
		this._countTween = null;
	}
	private _startUpdate(callback: () => void = null): void {
		this._isCountingUpdate = true;
		this._callback = callback;
	}
	private _cancelUpdate(): void {
		this._isCountingUpdate = false;
		this._callback = null;
	}
	//#endregion Private

	//#region Event Handlers
	protected onCounterAdd(value: number, callback: () => void = null): void {
		this._addValue(value, callback);
	}
	protected onCounterSet(value: number, callback: () => void = null): void {
		this._setValue(value, callback);
	}
	protected onCounterChange(value: number, callback: () => void = null): void {
		this._changeValue(value, callback);
	}
	protected onCounterAddByKey(key: string = "", value: number, callback: () => void = null): void {
		if (this.key !== key || key === "") return;

		this._addValue(value, callback);
	}
	protected onCounterSetByKey(key: string = "", value: number, callback: () => void = null): void {
		if (this.key !== key || key === "") return;

		this._setValue(value, callback);
	}
	protected onCounterChangeByKey(key: string = "", value: number, callback: () => void = null): void {
		if (this.key !== key || key === "") return;

		this._changeValue(value, callback);
	}
	//#endregion Event Handlers
}

saykit.UiCounter = SKUiCounter;
