const _TxtCantChangeSequencedValues: string = "You cannot change the values of a tween contained inside a Sequence";

const { ccclass } = cc._decorator;

@ccclass("saykit.TweenerCore")
export default class SKTweenerCore<T1, T2, TPlugOptions extends saykit.IPlugOptions> extends saykit.Tweener {
	// SETUP DATA

	public startValue: T2;
	public endValue: T2;
	public changeValue: T2;
	public getter: () => T1;
	public setter: (value: T1) => void;
	public plugOptions: TPlugOptions;
	public tweenPlugin: saykit.ABSTweenPlugin<T1, T2, TPlugOptions>;

	constructor() {
		super();
		this.tweenType = saykit.TweenType.Tweener;
		this.reset();
	}

	//#region Public Methods

	public changeStartValue(newStartValue: Object, newDuration: number = -1): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (this.isSequenced) {
			cc.log(_TxtCantChangeSequencedValues, this);
			return this;
		}
		return saykit.Tweener.doChangeStartValue(this, newStartValue, newDuration);
	}

	public changeEndValue(
		newEndValue: Object,
		newDuration: number = -1,
		snapStartValue: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (this.isSequenced) {
			cc.log(_TxtCantChangeSequencedValues, this);
			return this;
		}
		return saykit.Tweener.doChangeEndValue(this, newEndValue, newDuration, snapStartValue);
	}

	public changeValues(newStartValue: Object, newEndValue: Object, newDuration: number = -1): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (this.isSequenced) {
			cc.log(_TxtCantChangeSequencedValues, this);
			return this;
		}
		return saykit.Tweener.doChangeValues(this, newStartValue, newEndValue, newDuration);
	}

	// Sets From tweens, immediately sending the target to its endValue and assigning new start/endValues.
	// Called by TweenSettings.From.
	// Sets From tweens in an alternate way where you can set the start value directly
	// (instead of setting it from the endValue).
	public setFrom(relative: boolean, fromValue?: any, setImmediately?: boolean): saykit.Tweener {
		this.tweenPlugin.setFrom(this, relative, fromValue, setImmediately);
		this.hasManuallySetStartValue = true;
		return this;
	}

	// _tweenPlugin is not reset since it's useful to keep it as a reference
	public reset(): void {
		super.reset();

		if (this.tweenPlugin != null) this.tweenPlugin.reset(this);
		if (this.plugOptions != null) this.plugOptions.reset(); // Alternate fix that uses IPlugOptions reset
		this.getter = null;
		this.setter = null;
		this.hasManuallySetStartValue = false;
		this.isFromAllowed = true;
		this.customCallbacks = [];
	}

	// Called by TweenManager.applyTo.
	// Returns TRUE if the tween is valid
	public validate(): boolean {
		try {
			this.getter();
		} catch {
			return false;
		}
		return true;
	}

	// CALLED BY TweenManager at each update.
	// Returns TRUE if the tween needs to be killed
	public updateDelay(elapsed: number): number {
		return saykit.Tweener.doUpdateDelay(this, elapsed);
	}

	// CALLED BY Tween the moment the tween starts, AFTER any delay has elapsed
	// (unless it's a FROM tween, in which case it will be called BEFORE any eventual delay).
	// Returns TRUE in case of success,
	// FALSE if there are missing references and the tween needs to be killed
	public startup(): boolean {
		return saykit.Tweener.doStartup(this);
	}

	// Applies the tween set by doGoto.
	// Returns TRUE if the tween needs to be killed
	public applyTween(
		prevPosition: number,
		prevCompletedLoops: number,
		newCompletedSteps: number,
		useInversePosition: boolean,
		updateMode: saykit.UpdateMode
	): boolean {
		if (this.isInverted) useInversePosition = !useInversePosition;
		let updatePosition: number = useInversePosition ? this.duration - this.position : this.position;

		this.tweenPlugin.evaluateAndApply(
			this.plugOptions,
			this,
			this.isRelative,
			this.getter,
			this.setter,
			updatePosition,
			this.startValue,
			this.changeValue,
			this.duration
		);

		return false;
	}

	//#endregion Public Methods
}

saykit.TweenerCore = SKTweenerCore;
