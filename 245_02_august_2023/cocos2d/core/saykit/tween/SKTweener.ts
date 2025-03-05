const { ccclass } = cc._decorator;

@ccclass("saykit.Tweener")
export default abstract class SKTweener extends saykit.Tween {
	// TRUE when start value has been changed via From or ChangeStart/Values (allows doStartup to take it into account).
	// reset by TweenerCore
	public hasManuallySetStartValue: boolean;
	public isFromAllowed: boolean = true; // if FALSE from tweens won't be allowed. reset by TweenerCore
	public customCallbacks: Array<saykit.ABSSequentiable> = [];
	// ABSTRACT METHODS
	// Changes the start value of a tween and rewinds it (without pausing it).
	// Has no effect with tweens that are inside Sequences
	// "newStartValue" - The new start value
	// "newDuration" - If bigger than 0 applies it as the new tween duration
	// public abstract ChangeStartValue(newStartValue: Object, newDuration: number): Tweener;
	// Changes the end value of a tween and rewinds it (without pausing it).
	// Has no effect with tweens that are inside Sequences
	// "newEndValue" - The new end value
	// "newDuration" - If bigger than 0 applies it as the new tween duration
	// "snapStartValue" - If TRUE the start value will become the current target's value, otherwise it will stay the same
	// public abstract ChangeEndValue(snapStartValue: boolean, newEndValue: Object, newDuration: number): Tweener;
	// Changes the start and end value of a tween and rewinds it (without pausing it).
	// Has no effect with tweens that are inside Sequences
	// "newStartValue" - The new start value
	// "newEndValue" - The new end value
	// "newDuration" - If bigger than 0 applies it as the new tween duration
	// public abstract ChangeValues(newStartValue: Object, newEndValue: Object, newDuration: number): Tweener;
	public abstract setFrom(relative: boolean, fromValue?: any, setImmediately?: boolean): SKTweener;

	// INTERNAL METHODS

	// CALLED BY DOTween when spawning/creating a new Tweener.
	// Returns TRUE if the setup is successful
	public static setup<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		t: saykit.TweenerCore<T1, T2, TPlugOptions>,
		getter: () => T1,
		setter: (value: T1) => void,
		endValue: T2,
		duration: number,
		plugin: saykit.ABSTweenPlugin<T1, T2, TPlugOptions> = null
	): boolean {
		if (plugin != null) t.tweenPlugin = plugin;
		else {
			if (t.tweenPlugin == null) saykit.PluginsManager.setDefaultPlugin<T1, T2, TPlugOptions>(t, endValue);

			if (t.tweenPlugin == null) {
				// No suitable plugin found. Kill
				cc.log("No suitable plugin found for this type");
				return false;
			}
		}

		t.getter = getter;
		t.setter = setter;
		t.endValue = endValue;
		t.duration = duration;
		// Defaults
		t.autoKill = saykit.DOTween.defaultAutoKill;
		t.isRecyclable = saykit.DOTween.defaultRecyclable;
		t.easeType = saykit.DOTween.defaultEaseType;
		t.loopType = saykit.DOTween.defaultLoopType;
		t.isPlaying =
			saykit.DOTween.defaultAutoPlay == saykit.AutoPlay.All || saykit.DOTween.defaultAutoPlay == saykit.AutoPlay.AutoPlayTweeners;
		return true;
	}

	// CALLED BY TweenerCore
	// Returns the elapsed time minus delay in case of success,
	// -1 if there are missing references and the tween needs to be killed
	public static doUpdateDelay<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		t: saykit.TweenerCore<T1, T2, TPlugOptions>,
		elapsed: number
	): number {
		let tweenDelay: number = t.delay;
		if (elapsed > tweenDelay) {
			// Delay complete
			t.elapsedDelay = tweenDelay;
			t.delayComplete = true;
			return elapsed - tweenDelay;
		}
		t.elapsedDelay = elapsed;
		return 0;
	}

	// CALLED VIA Tween the moment the tween starts, AFTER any delay has elapsed
	// (unless it's a FROM tween, in which case it will be called BEFORE any eventual delay).
	// Returns TRUE in case of success,
	// FALSE if there are missing references and the tween needs to be killed
	public static doStartup<T1, T2, TPlugOptions extends saykit.IPlugOptions>(t: saykit.TweenerCore<T1, T2, TPlugOptions>): boolean {
		t.startupDone = true;

		// Applied here so that the eventual duration derived from a speedBased tween has been set
		if (t.duration <= 0) {
			t.pause();
			return;
		}

		if (!t.hasManuallySetStartValue) {
			// Take start value from current target value
			if (t.isFrom) {
				// From tween without forced From value and where setImmediately was FALSE
				// (contrary to other forms of From tweens its values will be set at startup)
				t.setFrom(t.isRelative && !t.isBlendable);
				t.isRelative = false;
			} else t.startValue = t.tweenPlugin.convertToStartValue(t, t.getter());
		}

		if (t.isRelative) t.tweenPlugin.setRelativeEndValue(t);

		t.tweenPlugin.setChangeValue(t);

		// Duration based startup operations
		SKTweener.DOStartupDurationBased(t);

		return true;
	}

	// CALLED BY TweenerCore
	public static doChangeStartValue<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		t: saykit.TweenerCore<T1, T2, TPlugOptions>,
		newStartValue: any,
		newDuration: number
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		t.hasManuallySetStartValue = true;
		t.startValue = newStartValue;

		if (t.startupDone) {
			t.tweenPlugin.setChangeValue(t);
		}

		if (newDuration > 0) {
			t.duration = newDuration;
			if (t.startupDone) SKTweener.DOStartupDurationBased(t);
		}

		// Force rewind
		saykit.Tween.doGoto(t, 0, 0, saykit.UpdateMode.IgnoreOnUpdate);

		return t;
	}

	// CALLED BY TweenerCore
	public static doChangeEndValue<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		t: saykit.TweenerCore<T1, T2, TPlugOptions>,
		newEndValue: any,
		newDuration: number,
		snapStartValue: boolean
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		t.endValue = newEndValue;
		t.isRelative = false;

		if (t.startupDone) {
			if (snapStartValue) {
				// Reassign startValue with current target's value
				t.startValue = t.tweenPlugin.convertToStartValue(t, t.getter());
			}
			t.tweenPlugin.setChangeValue(t);
		}

		if (newDuration > 0) {
			t.duration = newDuration;
			if (t.startupDone) SKTweener.DOStartupDurationBased(t);
		}

		// Force rewind
		saykit.Tween.doGoto(t, 0, 0, saykit.UpdateMode.IgnoreOnUpdate);

		return t;
	}

	public static doChangeValues<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		t: saykit.TweenerCore<T1, T2, TPlugOptions>,
		newStartValue: any,
		newEndValue: any,
		newDuration: number
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		t.hasManuallySetStartValue = true;
		t.isRelative = t.isFrom = false;
		t.startValue = newStartValue;
		t.endValue = newEndValue;

		if (t.startupDone) {
			t.tweenPlugin.setChangeValue(t);
		}

		if (newDuration > 0) {
			t.duration = newDuration;
			if (t.startupDone) SKTweener.DOStartupDurationBased(t);
		}

		// Force rewind
		saykit.Tween.doGoto(t, 0, 0, saykit.UpdateMode.IgnoreOnUpdate);

		return t;
	}

	public static DOStartupDurationBased<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		t: saykit.TweenerCore<T1, T2, TPlugOptions>
	): void {
		if (t.isSpeedBased) t.duration = t.tweenPlugin.getSpeedBasedDuration(t.plugOptions, t.duration, t.changeValue);
		t.fullDuration = t.loops > -1 ? t.duration * t.loops : Infinity;
	}

	public static doInsertCallback<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		inTweener: saykit.TweenerCore<T1, T2, TPlugOptions>,
		callback: Function,
		atPosition: number
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		let c: saykit.ABSSequentiable = new saykit.ABSSequentiable(atPosition, callback);
		c.sequencedPosition = c.sequencedEndPosition = atPosition;
		inTweener.customCallbacks.push(c);
		// if (inTweener.duration < atPosition) inTweener.duration = atPosition;
		return inTweener;
	}
}

saykit.Tweener = SKTweener;
