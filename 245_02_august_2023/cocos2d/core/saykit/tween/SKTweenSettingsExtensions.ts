const { ccclass } = cc._decorator;

@ccclass("saykit.TweenSettingsExtensions")
export default class SKTweenSettingsExtensions {
	//#region Tweeners + Sequences

	// Sets the autoKill behaviour of the tween.
	// Has no effect if the tween has already started or if it's added to a Sequence
	// "autoKillOnCompletion" - If TRUE the tween will be automatically killed when complete
	public static setAutoKill(t: saykit.Tween, autoKillOnCompletion: boolean = true): saykit.Tween {
		if (t == null || !t.active || t.creationLocked) return t;

		t.autoKill = autoKillOnCompletion;
		return t;
	}

	// Sets an ID for the tween, which can then be used as a filter with DOTween's static methods.
	// "objectId" - The ID to assign to this tween. Can be an int, a string, an object or anything else.
	public static setId(t: saykit.Tween, id: any): saykit.Tween {
		if (t == null || !t.active) return t;

		t.id = id;
		return t;
	}

	// Sets the looping options for the tween.
	// Has no effect if the tween has already started
	// "loops" - Number of cycles to play (-1 for infinite - will be converted to 1 in case the tween is nested in a Sequence)
	// "loopType" - Loop behaviour type (default: LoopType.Restart)
	public static setLoops(t: saykit.Tween, loops: number, loopType?: saykit.LoopType): saykit.Tween {
		if (t == null || !t.active || t.creationLocked) return t;

		if (loops < -1) loops = -1;
		else if (loops == 0) loops = 1;
		t.loops = loops;
		if (loopType) t.loopType = loopType;
		if (t.tweenType == saykit.TweenType.Tweener) {
			if (loops > -1) t.fullDuration = t.duration * loops;
			else t.fullDuration = Infinity;
		}
		return t;
	}

	// Sets the ease of the tween.
	// If applied to Sequences eases the whole sequence animation
	public static setEase(t: saykit.Tween, easeFunc: Function): saykit.Tween {
		if (t == null || !t.active) return t;
		if (!(easeFunc instanceof Function)) return t;

		t.easeType = easeFunc;
		return t;
	}

	// Sets the recycling behaviour for the tween.
	// "recyclable" - If TRUE the tween will be recycled after being killed, otherwise it will be destroyed.
	public static setRecyclable(t: saykit.Tween, recyclable: boolean = true): saykit.Tween {
		if (t == null || !t.active) return t;

		t.isRecyclable = true;
		return t;
	}

	// Sets the type of update for the tween and lets you choose if it should be independent from timeScale
	// "updateType" - The type of update
	// "isIndependentUpdate" - If TRUE the tween will ignore timeScale
	public static setUpdate(
		t: saykit.Tween,
		updateType: saykit.UpdateType = saykit.UpdateType.Normal,
		isIndependentUpdate: boolean = saykit.DOTween.defaultTimeScaleIndependent
	): saykit.Tween {
		if (t == null || !t.active) return t;

		saykit.TweenManager.setUpdateType(t, updateType, isIndependentUpdate);
		return t;
	}

	// Inverts this tween, so that it will play from the end to the beginning
	// (playing it backwards will actually play it from the beginning to the end).
	// Has no effect if the tween has already started or if it's added to a Sequence
	// "inverted">If TRUE the tween will be inverted, otherwise it won't
	public static setInverted(t: saykit.Tween, inverted: boolean = true): saykit.Tween {
		if (t == null || !t.active || t.creationLocked) return t;

		t.isInverted = inverted;
		return t;
	}

	// Sets the onStartCallback callback for the tween, clearing any previous onStartCallback callback that was set.
	// Called the first time the tween is set in a playing state, after any eventual delay
	public static onStart(t: saykit.Tween, action: Function): saykit.Tween {
		if (t == null || !t.active) return t;

		t.onStartCallback = action;
		return t;
	}

	// Sets the onPlayCallback callback for the tween, clearing any previous onPlayCallback callback that was set.
	// Called when the tween is set in a playing state, after any eventual delay.
	// Also called each time the tween resumes playing from a paused state
	public static onPlay(t: saykit.Tween, action: Function): saykit.Tween {
		if (t == null || !t.active) return t;

		t.onPlayCallback = action;
		return t;
	}

	// Sets the onPauseCallback callback for the tween, clearing any previous onPauseCallback callback that was set.
	// Called when the tween state changes from playing to paused.
	// If the tween has autoKill set to FALSE, this is called also when the tween reaches completion.
	public static onPause(t: saykit.Tween, action: Function): saykit.Tween {
		if (t == null || !t.active) return t;

		t.onPauseCallback = action;
		return t;
	}

	// Sets the onRewindCallback callback for the tween, clearing any previous onRewindCallback callback that was set.
	// Called when the tween is rewinded,
	// either by calling Rewind or by reaching the start position while playing backwards.
	// Rewinding a tween that is already rewinded will not fire this callback
	public static onRewind(t: saykit.Tween, action: Function): saykit.Tween {
		if (t == null || !t.active) return t;

		t.onRewindCallback = action;
		return t;
	}

	// Sets the onUpdateCallback callback for the tween, clearing any previous onUpdateCallback callback that was set.
	// Called each time the tween updates
	public static onUpdate(t: saykit.Tween, action: Function): saykit.Tween {
		if (t == null || !t.active) return t;

		t.onUpdateCallback = action;
		return t;
	}

	// Sets the onStepCompleteCallback callback for the tween, clearing any previous onStepCompleteCallback callback that was set.
	// Called the moment the tween completes one loop cycle, even when going backwards
	public static onStepComplete(t: saykit.Tween, action: Function): saykit.Tween {
		if (t == null || !t.active) return t;

		t.onStepCompleteCallback = action;
		return t;
	}

	// Sets the onCompleteCallback callback for the tween, clearing any previous onCompleteCallback callback that was set.
	// Called the moment the tween reaches its final forward position, loops included
	public static onComplete(t: saykit.Tween, action: Function): saykit.Tween {
		if (t == null || !t.active) return t;

		t.onCompleteCallback = action;
		return t;
	}

	// Sets the onKillCallback callback for the tween, clearing any previous onKillCallback callback that was set.
	// Called the moment the tween is killed
	public static onKill(t: saykit.Tween, action: Function): saykit.Tween {
		if (t == null || !t.active) return t;

		t.onKillCallback = action;
		return t;
	}

	// Sets the parameters of the tween (id, ease, loops, delay, timeScale, callbacks, etc) as the parameters of the given TweenParams.
	// Has no effect if the tween has already started.
	// "tweenParams" - TweenParams from which to copy the parameters
	// Tween from which to copy the parameters
	public static setAs(t: saykit.Tween, tweenParams: saykit.TweenParams | saykit.Tween | any): saykit.Tween {
		if (t == null || !t.active || t.creationLocked) return t;

		if (tweenParams.updateType) saykit.TweenManager.setUpdateType(t, tweenParams.updateType, tweenParams.isIndependentUpdate);
		if (tweenParams.id) t.id = tweenParams.id;

		if (tweenParams.onStartCallback) t.onStart(tweenParams.onStartCallback);
		if (tweenParams.onPlayCallback) t.onPlay(tweenParams.onPlayCallback);
		if (tweenParams.onRewindCallback) t.onRewind(tweenParams.onRewindCallback);
		if (tweenParams.onUpdateCallback) t.onUpdate(tweenParams.onUpdateCallback);
		if (tweenParams.onStepCompleteCallback) t.onStepComplete(tweenParams.onStepCompleteCallback);
		if (tweenParams.onCompleteCallback) t.onComplete(tweenParams.onCompleteCallback);
		if (tweenParams.onKillCallback) t.onKill(tweenParams.onKillCallback);

		if (tweenParams.isRecyclable != undefined) t.setRecyclable(tweenParams.isRecyclable);
		if (tweenParams.isSpeedBased != undefined) t.setSpeedBased(tweenParams.isSpeedBased);
		if (tweenParams.autoStart === false) t.pause();
		if (tweenParams.autoKill != undefined) t.setAutoKill(tweenParams.autoKill);
		if (tweenParams.loops) {
			t.setLoops(tweenParams.loops, tweenParams.loopType || saykit.LoopType.Restart);
			if (t.tweenType == saykit.TweenType.Tweener) {
				if (t.loops > -1) t.fullDuration = t.duration * t.loops;
				else t.fullDuration = Infinity;
			}
		}

		if (tweenParams.delay != undefined) {
			t.setDelay(tweenParams.delay);
			t.delayComplete = t.delay <= 0;
		}
		if (tweenParams.isRelative != undefined) t.setRelative(tweenParams.isRelative);
		if (tweenParams.easeType) t.easeType = tweenParams.easeType;
		// t.easeType = t.tweenType == saykit.TweenType.Sequence ? cc.easing.linear : saykit.DOTween.defaultEaseType;
		if (tweenParams.snapping != undefined && t.tweenPlugin) {
			if (t.tweenPlugin instanceof saykit.FloatPlugin) t.setOptions(tweenParams.snapping);
			else if (t.tweenPlugin instanceof saykit.Vector3Plugin) t.setOptionsVec3(saykit.AxisConstraint.None, tweenParams.snapping);
		}

		return t;
	}

	// Sets a delayed startup for the tween with options to choose how the delay is applied in case of Sequences.
	// Has no effect if the tween has already started
	// "asPrependedIntervalIfSequence" - Only used by <see cref="Sequence"/> types: If FALSE sets the delay as a one-time occurrence
	// (defaults to this for <see cref="Tweener"/> types),
	// otherwise as a Sequence interval which will repeat at the beginning of every loop cycle
	public static setDelay(t: saykit.Tween, delay: number, asPrependedIntervalIfSequence: boolean = true): saykit.Tween {
		if (t == null || !t.active || t.creationLocked) return t;

		let isSequence: boolean = t.tweenType == saykit.TweenType.Sequence;
		if (!isSequence || !asPrependedIntervalIfSequence) {
			t.delay = delay;
			t.delayComplete = delay <= 0;
		} else {
			(t as saykit.Sequence).prependInterval(delay);
		}
		return t;
	}

	// If isRelative is TRUE sets the tween as relative
	// (the endValue will be calculated as startValue + endValue instead than being used directly).
	// Has no effect on Sequences or if the tween has already started
	public static setRelative(t: saykit.Tween, isRelative: boolean = true): saykit.Tween {
		if (t == null || !t.active || t.creationLocked || t.isFrom || t.isBlendable) return t;

		t.isRelative = isRelative;
		return t;
	}

	//#endregion Tweeners + Sequences

	//#region Tweeners-only

	public static insertCallback(t: saykit.Tweener, atPosition: number, callback: Function): saykit.Tweener {
		if (callback == null) return t;

		saykit.Tweener.doInsertCallback(t as saykit.TweenerCore<any, any, saykit.IPlugOptions>, callback, atPosition);
		return t;
	}

	// Changes a TO tween into a FROM tween: sets the current value of the target as the endValue,
	// and the previously passed endValue as the actual startValue.
	// "setImmediately" - If TRUE sets the target to from value immediately, otherwise waits for the tween to start
	// "isRelative" - If TRUE the FROM value will be calculated as relative to the current one
	public static from(t: saykit.Tweener, isRelative: boolean, fromValue?: any, setImmediately: boolean = true): saykit.Tween {
		if (t == null || !t.active || t.creationLocked || !t.isFromAllowed) return t;

		t.isFrom = true;
		t.setFrom(isRelative, fromValue, setImmediately);
		return t;
	}

	// If isSpeedBased is TRUE sets the tween as speed based
	// (the duration will represent the number of units the tween moves x second).
	// Has no effect on Sequences, nested tweens, or if the tween has already started
	public static setSpeedBased(t: saykit.Tween, isSpeedBased: boolean = true): saykit.Tween {
		if (t == null || !t.active || t.creationLocked) return t;

		t.isSpeedBased = isSpeedBased;
		return t;
	}

	//#endregion Tweeners-only

	//#region Tweeners Extra Options

	// Options for float tweens
	// "snapping" - If TRUE the tween will smoothly snap all values to integers
	public static setOptions(t: saykit.TweenerCore<number, number, saykit.FloatOptions>, snapping: boolean): saykit.Tween {
		if (t == null || !t.active) return t;

		t.plugOptions.snapping = snapping;
		return t;
	}

	public static setOptionsVec3(
		t: saykit.TweenerCore<any, any, saykit.VectorOptions>,
		axisConstraint: saykit.AxisConstraint,
		snapping: boolean = false
	): saykit.Tween {
		if (t == null || !t.active) return t;

		t.plugOptions.axisConstraint = axisConstraint;
		t.plugOptions.snapping = snapping;
		return t;
	}

	//#endregion Tweeners Extra Options
}

saykit.TweenSettingsExtensions = SKTweenSettingsExtensions;
