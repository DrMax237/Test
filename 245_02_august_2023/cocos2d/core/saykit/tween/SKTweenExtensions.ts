const { ccclass } = cc._decorator;

@ccclass("saykit.TweenExtensions")
export default class SKTweenExtensions {
	// TWEENERS + SEQUENCES

	//#region Runtime Operations

	// completes the tween
	// "withCallbacks" - For Sequences only: if TRUE also internal Sequence callbacks will be fired,
	// otherwise they will be ignored
	public static complete(t: saykit.Tween, withCallbacks?: boolean): void {
		if (!this._validateTweenAll(t)) return;
		if (withCallbacks === undefined) saykit.TweenManager.complete(t, false);
		else saykit.TweenManager.complete(t, true, withCallbacks ? saykit.UpdateMode.Update : saykit.UpdateMode.Goto);
	}

	// Flips the direction of this tween (backwards if it was going forward or viceversa)
	public static flip(t: saykit.Tween): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.flip(t);
	}

	// Forces the tween to initialize its settings immediately
	public static forceInit(t: saykit.Tween): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.forceInit(t);
	}

	// Send the tween to the given position in time
	// "to" - Time position to reach
	// (if higher than the whole tween duration the tween will simply reach its end)
	// "andPlay" - If TRUE will play the tween after reaching the given position, otherwise it will pause it
	public static goto(t: saykit.Tween, to: number, andPlay: boolean = false): void {
		SKTweenExtensions._doGoto(t, to, andPlay, false);
	}
	// Send the tween to the given position in time while also executing any callback between the previous time position and the new one
	// "to" - Time position to reach
	// (if higher than the whole tween duration the tween will simply reach its end)
	// "andPlay" - If TRUE will play the tween after reaching the given position, otherwise it will pause it
	public static gotoWithCallbacks(t: saykit.Tween, to: number, andPlay: boolean = false): void {
		SKTweenExtensions._doGoto(t, to, andPlay, true);
	}
	private static _doGoto(t: saykit.Tween, to: number, andPlay: boolean, withCallbacks: boolean): void {
		if (!this._validateTweenAll(t)) return;
		if (to < 0) to = 0;
		if (!t.startupDone) saykit.TweenManager.forceInit(t); // Initialize the tween if it's not initialized already (required)
		saykit.TweenManager.goto(t, to, andPlay, withCallbacks ? saykit.UpdateMode.Update : saykit.UpdateMode.Goto);
	}

	// Kills the tween
	// "complete" - If TRUE completes the tween before killing it
	public static kill(t: saykit.Tween, complete: boolean = false): void {
		if (!saykit.DOTween.initialized) return;
		if (!this._validateTweenAll(t, true)) return;

		if (complete) {
			saykit.TweenManager.complete(t);
			if (t.autoKill && t.loops >= 0) return; // Already killed by complete, so no need to go on
		}

		if (saykit.TweenManager.isUpdateLoop) {
			// Just mark it for killing, so the update loop will take care of it
			t.active = false;
		} else saykit.TweenManager.despawn(t);
	}

	// Forces this tween to update manually, regardless of the <see cref="UpdateType"/> set via setUpdate.
	// Note that the tween will still be subject to normal tween rules, so if for example it's paused this method will do nothing.<para/>
	// Also note that if you only want to update this tween instance manually you'll have to set it to <see cref="UpdateType.Manual"/> anyway,
	// so that it's not updated automatically.
	// "deltaTime" - Manual deltaTime
	// "unscaledDeltaTime" - Unscaled delta time (used with tweens set as timeScaleIndependent)
	public static manualUpdate(t: saykit.Tween, deltaTime: number, unscaledDeltaTime: number): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.updateTweens(t, deltaTime, unscaledDeltaTime, true);
	}

	// Pauses the tween
	public static pause(t: saykit.Tween): saykit.Tween {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.pause(t);
		return t;
	}

	// Plays the tween
	public static play(t: saykit.Tween): saykit.Tween {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.play(t);
		return t;
	}

	// Sets the tween in a backwards direction and plays it
	public static playBackwards(t: saykit.Tween): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.playBackwards(t);
	}

	// Sets the tween in a forward direction and plays it
	public static playForward(t: saykit.Tween): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.playForward(t);
	}

	// Restarts the tween from the beginning
	// "includeDelay" - Ignored in case of Sequences. If TRUE includes the eventual tween delay, otherwise skips it
	// "changeDelayTo" - Ignored in case of Sequences. If >= 0 changes the startup delay to this value, otherwise doesn't touch it
	public static restart(t: saykit.Tween, includeDelay: boolean = true, changeDelayTo: number = -1): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.restart(t, includeDelay, changeDelayTo);
	}

	// Rewinds and pauses the tween
	// "includeDelay" - Ignored in case of Sequences. If TRUE includes the eventual tween delay, otherwise skips it
	public static rewind(t: saykit.Tween, includeDelay: boolean = true): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.rewind(t, includeDelay);
	}

	// Smoothly rewinds the tween (delays excluded).
	// A "smooth rewind" animates the tween to its start position,
	// skipping all elapsed loops (except in case of LoopType.Incremental) while keeping the animation fluent.
	// If called on a tween who is still waiting for its delay to happen, it will simply set the delay to 0 and pause the tween.
	// Note that a tween that was smoothly rewinded will have its play direction flipped
	public static smoothRewind(t: saykit.Tween): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.smoothRewind(t);
	}

	// Plays the tween if it was paused, pauses it if it was playing
	public static togglePause(t: saykit.Tween): void {
		if (!this._validateTweenAll(t)) return;
		saykit.TweenManager.togglePause(t);
	}

	//#endregion Runtime Operations

	//#region Info Getters

	// Returns the total number of loops completed by this tween
	public static getCompletedLoops(t: saykit.Tween): number {
		if (!this._validateTweenInvalid(t)) return 0;
		return t.completedLoops;
	}

	// Returns the eventual delay set for this tween
	public static getDelay(t: saykit.Tween): number {
		if (!this._validateTweenInvalid(t)) return 0;
		return t.delay;
	}

	// Returns the eventual elapsed delay set for this tween
	public static getElapsedDelay(t: saykit.Tween): number {
		if (!this._validateTweenInvalid(t)) return 0;
		return t.elapsedDelay;
	}

	// Returns the duration of this tween (delays excluded).
	// NOTE: when using settings like SpeedBased, the duration will be recalculated when the tween starts
	// "includeLoops" - If TRUE returns the full duration loops included,
	//  otherwise the duration of a single loop cycle
	public static getDuration(t: saykit.Tween, includeLoops: boolean = true): number {
		if (!this._validateTweenInvalid(t)) return 0;
		// Calculate duration here instead than getting fullDuration because fullDuration might
		// not be set yet, since it's set inside doStartup
		if (includeLoops) return t.loops == -1 ? Infinity : t.duration * t.loops;
		return t.duration;
	}

	// Returns the elapsed time for this tween (delays exluded)
	// "includeLoops" - If TRUE returns the elapsed time since startup loops included,
	//  otherwise the elapsed time within the current loop cycle
	public static getElapsed(t: saykit.Tween, includeLoops: boolean = true): number {
		if (!this._validateTweenInvalid(t)) return 0;
		if (includeLoops) {
			let loopsToCount = t.position >= t.duration ? t.completedLoops - 1 : t.completedLoops;
			return loopsToCount * t.duration + t.position;
		}
		return t.position;
	}
	// Returns the elapsed percentage (0 to 1) of this tween (delays exluded)
	// "includeLoops" - If TRUE returns the elapsed percentage since startup loops included,
	// otherwise the elapsed percentage within the current loop cycle
	public static getElapsedPercentage(t: saykit.Tween, includeLoops: boolean = true): number {
		if (!this._validateTweenInvalid(t)) return 0;
		if (includeLoops) {
			if (t.fullDuration <= 0) return 0;
			let loopsToCount = t.position >= t.duration ? t.completedLoops - 1 : t.completedLoops;
			return (loopsToCount * t.duration + t.position) / t.fullDuration;
		}
		return t.position / t.duration;
	}
	// Returns the elapsed percentage (0 to 1) of this tween (delays exluded),
	// based on a single loop, and calculating eventual backwards Yoyo loops as 1 to 0 instead of 0 to 1
	public static getElapsedDirectionalPercentage(t: saykit.Tween): number {
		if (!this._validateTweenInvalid(t)) return 0;

		let perc: number = t.position / t.duration;
		let isInverse: boolean =
			t.completedLoops > 0 &&
			t.hasLoops &&
			t.loopType == saykit.LoopType.Yoyo &&
			((!t.isComplete && t.completedLoops % 2 != 0) || (t.isComplete && t.completedLoops % 2 == 0));

		return isInverse ? 1 - perc : perc;
	}

	// Returns FALSE if this tween has been killed or is NULL, TRUE otherwise.
	// BEWARE: if this tween is recyclable it might have been spawned again for another use and thus return TRUE anyway.
	// When working with recyclable tweens you should take care to know when a tween has been killed and manually set your references to NULL.
	// If you want to be sure your references are set to NULL when a tween is killed you can use the <code>onKill</code> callback like this:
	// <code>.onKill(()=> myTweenReference = null)</code>
	public static getIsActive(t: saykit.Tween): boolean {
		return t != null && t.active;
	}

	// Returns TRUE if this tween was reversed and is set to go backwards
	public static getIsBackwards(t: saykit.Tween): boolean {
		if (!this._validateTweenInvalid(t)) return false;
		return t.isBackwards;
	}

	// Returns TRUE if the tween is complete
	// (silently fails and returns FALSE if the tween has been killed)
	public static getIsComplete(t: saykit.Tween): boolean {
		if (!this._validateTweenInvalid(t)) return false;
		return t.isComplete;
	}

	// Returns TRUE if this tween has been initialized
	public static getIsInitialized(t: saykit.Tween): boolean {
		if (!this._validateTweenInvalid(t)) return false;
		return t.startupDone;
	}

	// Returns TRUE if this tween is playing
	public static getIsPlaying(t: saykit.Tween): boolean {
		if (!this._validateTweenInvalid(t)) return false;
		return t.isPlaying;
	}

	// Returns the total number of loops set for this tween
	// (returns -1 if the loops are infinite)
	public static getLoops(t: saykit.Tween): number {
		if (!this._validateTweenInvalid(t)) return 0;
		return t.loops;
	}

	//#endregion Info Getters

	//#region Validate

	private static _validateTweenAll(t: saykit.Tween, isForced: boolean = false): boolean {
		if (t == null) {
			cc.log("Null saykit.Tween");
			return false;
		} else if (!t.active) {
			cc.log("This saykit.Tween has been killed and is now invalid");
			return false;
		} else if (t.isSequenced) {
			if (!isForced) {
				cc.log("This saykit.Tween was added to a Sequence and can't be controlled directly", t);
				return false;
			}
		}
		return true;
	}
	private static _validateTweenInvalid(t: saykit.Tween): boolean {
		if (!t.active) {
			cc.log("This saykit.Tween has been killed and is now invalid");
			return false;
		}
		return true;
	}

	//#endregion Validate
}

saykit.TweenExtensions = SKTweenExtensions;
