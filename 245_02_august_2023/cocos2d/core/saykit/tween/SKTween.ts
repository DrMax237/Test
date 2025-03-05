const { ccclass } = cc._decorator;

@ccclass("saykit.Tween")
export default abstract class SKTween extends saykit.ABSSequentiable {
	public timeScale: number;
	public isBackwards: boolean;
	public isInverted: boolean;
	public id: any;
	public updateType: saykit.UpdateType;
	public isIndependentUpdate: boolean;

	public onPlayCallback: Function;
	public onPauseCallback: Function;
	public onRewindCallback: Function;
	public onUpdateCallback: Function;
	public onStepCompleteCallback: Function;
	public onCompleteCallback: Function;
	public onKillCallback: Function;

	// Fixed after creation
	public isFrom: boolean; // Used to prevent settings like isRelative from being applied on From tweens
	public isBlendable: boolean; // Set by blendable tweens, prevents isRelative to be applied
	public isRecyclable: boolean;
	public isSpeedBased: boolean;
	public autoKill: boolean;
	public duration: number;
	public loops: number;
	public loopType: saykit.LoopType;

	public delay: number;

	// Tweeners-only (ignored by Sequences), returns TRUE if the tween was set as relative
	public isRelative: boolean;
	public easeType = cc.easing.linear;

	// SETUP DATA

	protected typeofT1; // Only used by Tweeners
	protected typeofT2; // Only used by Tweeners
	protected typeofTPlugOptions; // Only used by Tweeners
	// FALSE when tween is (or should be) despawned - set only by TweenManager
	public active: boolean; // Required by Modules
	public isSequenced: boolean; // Set by Sequence when adding a Tween to it
	public sequenceParent: saykit.Sequence; // Set by Sequence when adding a Tween to it
	public activeId: number = -1; // Index inside its active list (touched only by TweenManager)

	// PLAY DATA

	// Gets and sets the time position (loops included, delays excluded) of the tween
	public get fullPosition(): number {
		return this.getElapsed(true);
	}
	public set fullPosition(value: number) {
		this.goto(value, this.isPlaying);
	}
	// Returns TRUE if the tween is set to loop (either a set number of times or infinitely)
	public get hasLoops(): boolean {
		return this.loops == -1 || this.loops > 1;
	}

	public creationLocked: boolean; // TRUE after the tween was updated the first time (even if it was delayed), or when added to a Sequence
	public startupDone: boolean; // TRUE the first time the actual tween starts, AFTER any delay has elapsed (unless it's a FROM tween)
	// TRUE after the tween was set in a play state at least once, AFTER any delay is elapsed
	public playedOnce: boolean;
	// Time position within a single loop cycle
	public position: number;
	public fullDuration: number; // Total duration loops included
	public completedLoops: number;
	public isPlaying: boolean; // Set by TweenManager when getting a new tween
	public isComplete: boolean;
	public elapsedDelay: number; // Amount of eventual delay elapsed (shared by Sequences only for compatibility reasons, otherwise not used)
	public delayComplete: boolean = true; // TRUE when the delay has elapsed or isn't set, also set by Delay extension method (shared by Sequences only for compatibility reasons, otherwise not used)

	//#region Abstracts + Overrideables

	// Doesn't reset active state, activeId and despawned, since those are only touched by TweenManager
	// Doesn't reset default values since those are set when Tweener.setup is called
	public reset(): void {
		this.timeScale = 1;
		this.isBackwards = false;
		this.id = null;
		this.isIndependentUpdate = false;
		this.onStartCallback =
			this.onPlayCallback =
			this.onRewindCallback =
			this.onUpdateCallback =
			this.onCompleteCallback =
			this.onStepCompleteCallback =
			this.onKillCallback =
				null;

		this.isFrom = false;
		this.isBlendable = false;
		this.isSpeedBased = false;
		this.duration = 0;
		this.loops = 1;
		this.delay = 0;
		this.isRelative = false;
		this.isSequenced = false;
		this.sequenceParent = null;
		this.creationLocked = this.startupDone = this.playedOnce = false;
		this.position = this.fullDuration = this.completedLoops = 0;
		this.isPlaying = this.isComplete = false;
		this.elapsedDelay = 0;
		this.delayComplete = true;

		// The following are set during a tween's setup
		//            isRecyclable = DOTween.defaultRecyclable;
		//            autoKill = DOTween.defaultAutoKill;
		//            loopType = DOTween.defaultLoopType;
		//            easeType = DOTween.defaultEaseType;

		// The following are set during TweenManager.addActiveTween
		// (so the previous updateType is still stored while removing tweens)
		//            updateType = UpdateType.Normal;
	}

	// Called by TweenManager.applyTo.
	// Returns TRUE if the tween is valid
	public abstract validate(): boolean;

	// Called by TweenManager in case a tween has a delay that needs to be updated.
	// Returns the eventual time in excess compared to the tween's delay time.
	public abstract updateDelay(elapsed: number): number;

	// Called the moment the tween starts.
	// For tweeners, that means AFTER any delay has elapsed
	// (unless it's a FROM tween, in which case it will be called BEFORE any eventual delay).
	// Returns TRUE in case of success,
	// FALSE if there are missing references and the tween needs to be killed
	public abstract startup(): boolean;

	// Applies the tween set by doGoto.
	// Returns TRUE if the tween needs to be killed.
	public abstract applyTween(
		prevPosition: number,
		prevCompletedLoops: number,
		newCompletedSteps: number,
		useInversePosition: boolean,
		updateMode: saykit.UpdateMode
	): boolean;

	//#endregion  Abstracts + Overrideables

	//#region Goto and Callbacks

	// Instead of advancing the tween from the previous position each time,
	// uses the given position to calculate running time since startup, and places the tween there like a Goto.
	// Executes regardless of whether the tween is playing.
	// Returns TRUE if the tween needs to be killed
	public static doGoto(t: SKTween, toPosition: number, toCompletedLoops: number, updateMode: saykit.UpdateMode): boolean {
		// startup
		if (!t.startupDone) {
			if (!t.startup()) return true;
		}
		// onStart and first onPlay callbacks
		if (!t.playedOnce && updateMode == saykit.UpdateMode.Update) {
			t.playedOnce = true;
			if (t.onStartCallback != null) {
				this.onTweenCallback(t.onStartCallback, t);
				if (!t.active) return true; // Tween might have been killed by onStartCallback callback
			}
			if (t.onPlayCallback != null) {
				this.onTweenCallback(t.onPlayCallback, t);
				if (!t.active) return true; // Tween might have been killed by onPlayCallback callback
			}
		}
		let prevPosition: number = t.position;
		let prevCompletedLoops: number = t.completedLoops;
		t.completedLoops = toCompletedLoops;
		let wasRewinded: boolean = t.position <= 0 && prevCompletedLoops <= 0;
		let wasComplete: boolean = t.isComplete;
		// Determine if it will be complete after update
		if (t.loops != -1) t.isComplete = t.completedLoops == t.loops;
		// Calculate newCompletedSteps (always useful with Sequences)
		let newCompletedSteps: number = 0;
		if (updateMode == saykit.UpdateMode.Update) {
			if (t.isBackwards) {
				newCompletedSteps =
					t.completedLoops < prevCompletedLoops ? prevCompletedLoops - t.completedLoops : toPosition <= 0 && !wasRewinded ? 1 : 0;
				if (wasComplete) newCompletedSteps--;
			} else newCompletedSteps = t.completedLoops > prevCompletedLoops ? t.completedLoops - prevCompletedLoops : 0;
		} else if (t.tweenType == saykit.TweenType.Sequence) {
			newCompletedSteps = prevCompletedLoops - toCompletedLoops;
			if (newCompletedSteps < 0) newCompletedSteps = -newCompletedSteps;
		}
		if (t.tweenType == saykit.TweenType.Tweener) {
			for (let customCallback of t.customCallbacks) {
				if (customCallback.sequencedPosition > t.position && customCallback.sequencedEndPosition <= toPosition)
					customCallback.onStartCallback();
			}
		}
		// Set position (makes position 0 equal to position "end" when looping)
		t.position = toPosition;
		if (t.position > t.duration) t.position = t.duration;
		else if (t.position <= 0) {
			if (t.completedLoops > 0 || t.isComplete) t.position = t.duration;
			else t.position = 0;
		}
		// Set playing state after update
		let wasPlaying: boolean = t.isPlaying;
		if (t.isPlaying) {
			if (!t.isBackwards) t.isPlaying = !t.isComplete;
			// Reached the end
			else t.isPlaying = !(t.completedLoops == 0 && t.position <= 0); // Rewinded
		}
		// updatePosition is different in case of Yoyo loop under certain circumstances
		let useInversePosition: boolean =
			t.hasLoops &&
			t.loopType == saykit.LoopType.Yoyo &&
			(t.position < t.duration ? t.completedLoops % 2 != 0 : t.completedLoops % 2 == 0);

		try {
			if (t.applyTween(prevPosition, prevCompletedLoops, newCompletedSteps, useInversePosition, updateMode)) return true;
		} catch {
			// cc.log("Can't apply tween setter. Tween is killed");
			t.kill(false);
		}
		// Additional callbacks
		if (t.onUpdateCallback != null && updateMode != saykit.UpdateMode.IgnoreOnUpdate) {
			this.onTweenCallback(t.onUpdateCallback, t);
		}
		if (t.position <= 0 && t.completedLoops <= 0 && !wasRewinded && t.onRewindCallback != null) {
			this.onTweenCallback(t.onRewindCallback, t);
		}
		if (newCompletedSteps > 0 && updateMode == saykit.UpdateMode.Update && t.onStepCompleteCallback != null) {
			for (let i = 0; i < newCompletedSteps; ++i) {
				this.onTweenCallback(t.onStepCompleteCallback, t);
				if (!t.active) break; // A stepComplete killed the tween
			}
		}
		if (t.isComplete && !wasComplete && updateMode != saykit.UpdateMode.IgnoreOnComplete && t.onCompleteCallback != null) {
			this.onTweenCallback(t.onCompleteCallback, t);
		}
		if (!t.isPlaying && wasPlaying && (!t.isComplete || !t.autoKill) && t.onPauseCallback != null) {
			this.onTweenCallback(t.onPauseCallback, t);
		}

		return t.autoKill && t.isComplete;
	}

	// Assumes that the callback exists (because it was previously checked).
	// Returns TRUE in case of success, FALSE in case of error
	public static onTweenCallback(callback: Function, t: SKTween, param?: any): boolean {
		if (callback instanceof Function) {
			param ? callback(param) : callback();
			return true;
		} else {
			return false;
		}
	}

	//#endregion Goto and Callbacks

	//#region saykit.TweenSettingsExtensions

	//#region Tweeners + Sequences
	public setAutoKill(eautoKillOnCompletion: boolean = true): saykit.Tween {
		return saykit.TweenSettingsExtensions.setAutoKill(this, eautoKillOnCompletion);
	}
	public setId(id: any): saykit.Tween {
		return saykit.TweenSettingsExtensions.setId(this, id);
	}
	public setLoops(loops: number, loopType?: saykit.LoopType): saykit.Tween {
		return saykit.TweenSettingsExtensions.setLoops(this, loops, loopType);
	}
	public setEase(easeFunc: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.setEase(this, easeFunc);
	}
	public setRecyclable(recyclable: boolean = true): saykit.Tween {
		return saykit.TweenSettingsExtensions.setRecyclable(this, recyclable);
	}
	public setUpdate(
		updateType: saykit.UpdateType = saykit.UpdateType.Normal,
		isIndependentUpdate: boolean = saykit.DOTween.defaultTimeScaleIndependent
	): saykit.Tween {
		return saykit.TweenSettingsExtensions.setUpdate(this, updateType, isIndependentUpdate);
	}
	public setInverted(inverted: boolean = true): saykit.Tween {
		return saykit.TweenSettingsExtensions.setInverted(this, inverted);
	}
	public onStart(action: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.onStart(this, action);
	}
	public onPlay(action: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.onPlay(this, action);
	}
	public onPause(action: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.onPause(this, action);
	}
	public onRewind(action: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.onRewind(this, action);
	}
	public onUpdate(action: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.onUpdate(this, action);
	}
	public onStepComplete(action: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.onStepComplete(this, action);
	}
	public onComplete(action: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.onComplete(this, action);
	}
	public onKill(action: Function): saykit.Tween {
		return saykit.TweenSettingsExtensions.onKill(this, action);
	}
	public insertCallback(atPosition: number, callback: Function): saykit.Tween {
		if (this.tweenType === saykit.TweenType.Sequence)
			return saykit.SequenceSettingsExtensions.insertCallback(this, atPosition, callback);
		if (this.tweenType === saykit.TweenType.Tweener) return saykit.TweenSettingsExtensions.insertCallback(this, atPosition, callback);
	}
	public setAs(tweenParams: saykit.TweenParams | saykit.Tween | any): saykit.Tween {
		return saykit.TweenSettingsExtensions.setAs(this, tweenParams);
	}
	public setDelay(delay: number, asPrependedIntervalIfSequence: boolean = true): saykit.Tween {
		return saykit.TweenSettingsExtensions.setDelay(this, delay, asPrependedIntervalIfSequence);
	}
	public setRelative(isRelative: boolean = true): saykit.Tween {
		return saykit.TweenSettingsExtensions.setRelative(this, isRelative);
	}
	//#endregion Tweeners + Sequences

	//#region Sequences-only
	public append(...tweens: Array<saykit.Tween>): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Sequence) return this;
		for (let t of tweens) {
			saykit.SequenceSettingsExtensions.append(this, t);
		}
		return this;
	}
	public prepend(t: saykit.Tween): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Sequence) return this;
		return saykit.SequenceSettingsExtensions.prepend(this, t);
	}
	public join(...tweens: Array<saykit.Tween>): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Sequence) return this;
		for (let t of tweens) {
			saykit.SequenceSettingsExtensions.join(this, t);
		}
		return this;
	}
	public insert(atPosition: number, ...tweens: Array<saykit.Tween>): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Sequence) return this;
		for (let t of tweens) {
			saykit.SequenceSettingsExtensions.insert(this, atPosition, t);
		}
		return this;
	}
	public appendInterval(interval: number): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Sequence) return this;
		return saykit.SequenceSettingsExtensions.appendInterval(this, interval);
	}
	public prependInterval(interval: number): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Sequence) return this;
		return saykit.SequenceSettingsExtensions.prependInterval(this, interval);
	}
	public appendCallback(callback: Function): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Sequence) return this;
		return saykit.SequenceSettingsExtensions.appendCallback(this, callback);
	}
	public prependCallback(callback: Function): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Sequence) return this;
		return saykit.SequenceSettingsExtensions.prependCallback(this, callback);
	}
	// //#endregion Sequences-only

	// //#region Tweeners-only
	public from(isRelative: boolean = false, fromValue?: any, setImmediately: boolean = true): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Tweener) return this;
		return saykit.TweenSettingsExtensions.from(this, isRelative, fromValue, setImmediately);
	}
	public setSpeedBased(isSpeedBased: boolean = true): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Tweener) return this;
		return saykit.TweenSettingsExtensions.setSpeedBased(this, isSpeedBased);
	}
	// //#endregion Tweeners-only

	// //#region Tweeners Extra Options
	public setOptions(snapping: boolean): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Tweener) return this;
		return saykit.TweenSettingsExtensions.setOptions(this, snapping);
	}
	public setOptionsVec3(axisConstraint: saykit.AxisConstraint, snapping: boolean = false): saykit.Tween {
		if (this.tweenType !== saykit.TweenType.Tweener) return this;
		return saykit.TweenSettingsExtensions.setOptionsVec3(this, axisConstraint, snapping);
	}
	//#endregion Tweeners Extra Options

	//#endregion saykit.TweenSettingsExtensions

	//#region saykit.TweenExtensions

	//#region Runtime Operations
	public complete(withCallbacks?: boolean): void {
		return saykit.TweenExtensions.complete(this, withCallbacks);
	}
	public flip(): void {
		return saykit.TweenExtensions.flip(this);
	}
	public forceInit(): void {
		return saykit.TweenExtensions.forceInit(this);
	}
	public goto(to: number, andPlay: boolean = false): void {
		return saykit.TweenExtensions.goto(this, to, andPlay);
	}
	public gotoWithCallbacks(to: number, andPlay: boolean = false): void {
		return saykit.TweenExtensions.gotoWithCallbacks(this, to, andPlay);
	}
	public kill(complete: boolean = false): void {
		return saykit.TweenExtensions.kill(this, complete);
	}
	public manualUpdate(deltaTime: number, unscaledDeltaTime: number): void {
		return saykit.TweenExtensions.manualUpdate(this, deltaTime, unscaledDeltaTime);
	}
	public pause(): saykit.Tween {
		return saykit.TweenExtensions.pause(this);
	}
	public play(): saykit.Tween {
		return saykit.TweenExtensions.play(this);
	}
	public playBackwards(): void {
		return saykit.TweenExtensions.playBackwards(this);
	}
	public playForward(): void {
		return saykit.TweenExtensions.playForward(this);
	}
	public restart(includeDelay: boolean = true): void {
		return saykit.TweenExtensions.restart(this, includeDelay);
	}
	public rewind(includeDelay: boolean = true): void {
		return saykit.TweenExtensions.rewind(this, includeDelay);
	}
	public smoothRewind(): void {
		return saykit.TweenExtensions.smoothRewind(this);
	}
	public togglePause(): void {
		return saykit.TweenExtensions.togglePause(this);
	}
	//#endregion Runtime Operations

	//#region Info Getters
	public getCompletedLoops(): number {
		return saykit.TweenExtensions.getCompletedLoops(this);
	}
	public getDelay(): number {
		return saykit.TweenExtensions.getDelay(this);
	}
	public getElapsedDelay(): number {
		return saykit.TweenExtensions.getElapsedDelay(this);
	}
	public getDuration(includeLoops: boolean = true): number {
		return saykit.TweenExtensions.getDuration(this, includeLoops);
	}
	public getElapsed(includeLoops: boolean = true): number {
		return saykit.TweenExtensions.getElapsed(this, includeLoops);
	}
	public getElapsedPercentage(includeLoops: boolean = true): number {
		return saykit.TweenExtensions.getElapsedPercentage(this, includeLoops);
	}
	public getElapsedDirectionalPercentage(): number {
		return saykit.TweenExtensions.getElapsedDirectionalPercentage(this);
	}
	public getIsInitialized(): boolean {
		return saykit.TweenExtensions.getIsInitialized(this);
	}
	public getIsActive(): boolean {
		return saykit.TweenExtensions.getIsActive(this);
	}
	public getIsBackwards(): boolean {
		return saykit.TweenExtensions.getIsBackwards(this);
	}
	public getIsComplete(): boolean {
		return saykit.TweenExtensions.getIsComplete(this);
	}
	public getIsPlaying(): boolean {
		return saykit.TweenExtensions.getIsPlaying(this);
	}
	public getLoops(): number {
		return saykit.TweenExtensions.getLoops(this);
	}
	//#endregion Info Getters

	//#endregion saykit.TweenExtensions
}

saykit.Tween = SKTween;
