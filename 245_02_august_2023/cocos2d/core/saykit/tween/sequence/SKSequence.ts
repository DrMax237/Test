const { ccclass } = cc._decorator;

@ccclass("saykit.Sequence")
export default class SKSequence extends saykit.Tween {
	// SETUP DATA

	public lastTweenInsertTime: number; // Used to insert a tween at the position of the previous one
	public sequencedTweens = new Array<saykit.Tween>(); // Only Tweens (used for despawning and validation)
	private _sequencedObjs = new Array<saykit.ABSSequentiable>(); // Tweens plus SequenceCallbacks

	constructor() {
		super();
		this.tweenType = saykit.TweenType.Sequence;
		this.reset();
	}

	//#region Creation Methods

	public static doPrepend(inSequence: SKSequence, t: saykit.Tween): SKSequence {
		if (t.loops == -1) t.loops = 1;

		let tFullTime = t.delay + t.duration * t.loops;
		inSequence.duration += tFullTime;

		let len = inSequence._sequencedObjs.length;
		for (let i = 0; i < len; ++i) {
			let sequentiable: saykit.ABSSequentiable = inSequence._sequencedObjs[i];
			sequentiable.sequencedPosition += tFullTime;
			sequentiable.sequencedEndPosition += tFullTime;
		}

		return this.doInsert(inSequence, t, 0);
	}

	public static doInsert(inSequence: SKSequence, t: saykit.Tween, atPosition: number): SKSequence {
		saykit.TweenManager.addActiveTweenToSequence(t);

		// If t has a delay add it as an interval
		atPosition += t.delay;
		inSequence.lastTweenInsertTime = atPosition;

		t.isSequenced = t.creationLocked = true;
		t.sequenceParent = inSequence;
		if (t.loops == -1) t.loops = 1;

		let tFullTime = t.duration * t.loops;
		t.autoKill = false;
		t.delay = t.elapsedDelay = 0;
		t.delayComplete = true;
		t.isSpeedBased = false;
		t.sequencedPosition = atPosition;
		t.sequencedEndPosition = atPosition + tFullTime;

		if (t.sequencedEndPosition > inSequence.duration) inSequence.duration = t.sequencedEndPosition;
		inSequence._sequencedObjs.push(t);
		inSequence.sequencedTweens.push(t);

		return inSequence;
	}

	public static doAppendInterval(inSequence: SKSequence, interval: number): SKSequence {
		inSequence.lastTweenInsertTime = inSequence.duration;
		inSequence.duration += interval;
		return inSequence;
	}

	public static doPrependInterval(inSequence: SKSequence, interval: number): SKSequence {
		inSequence.lastTweenInsertTime = 0;
		inSequence.duration += interval;
		let len = inSequence._sequencedObjs.length;
		for (let i = 0; i < len; ++i) {
			let sequentiable: saykit.ABSSequentiable = inSequence._sequencedObjs[i];
			sequentiable.sequencedPosition += interval;
			sequentiable.sequencedEndPosition += interval;
		}

		return inSequence;
	}

	public static doInsertCallback(inSequence: SKSequence, callback: Function, atPosition: number): SKSequence {
		inSequence.lastTweenInsertTime = atPosition;
		let c: saykit.ABSSequentiable = new saykit.ABSSequentiable(atPosition, callback);
		c.sequencedPosition = c.sequencedEndPosition = atPosition;
		inSequence._sequencedObjs.push(c);
		if (inSequence.duration < atPosition) inSequence.duration = atPosition;
		return inSequence;
	}

	//#endregion Creation Methods

	public updateDelay(elapsed: number): number {
		let tweenDelay = this.delay;
		if (elapsed > tweenDelay) {
			// Delay complete
			this.elapsedDelay = tweenDelay;
			this.delayComplete = true;
			return elapsed - tweenDelay;
		}
		this.elapsedDelay = elapsed;
		return 0;
	}

	public reset(): void {
		super.reset();

		this.sequencedTweens = [];
		this._sequencedObjs = [];
		this.lastTweenInsertTime = 0;
	}

	// Called by TweenManager.applyTo.
	// Returns TRUE if the tween is valid
	public validate(): boolean {
		let len = this.sequencedTweens.length;
		for (let i = 0; i < len; i++) {
			if (!this.sequencedTweens[i].validate()) return false;
		}
		return true;
	}

	// CALLED BY Tween the moment the tween starts.
	// Returns TRUE in case of success
	public startup(): boolean {
		return SKSequence.doStartup(this);
	}

	public applyTween(
		prevPosition: number,
		prevCompletedLoops: number,
		newCompletedSteps: number,
		useInversePosition: boolean,
		updateMode: saykit.UpdateMode
	): boolean {
		return SKSequence.doApplyTween(this, prevPosition, prevCompletedLoops, newCompletedSteps, useInversePosition, updateMode);
	}

	// Called by DOTween when spawning/creating a new Sequence.
	public static setup(s: SKSequence): void {
		s.autoKill = saykit.DOTween.defaultAutoKill;
		s.isRecyclable = saykit.DOTween.defaultRecyclable;
		s.isPlaying =
			saykit.DOTween.defaultAutoPlay == saykit.AutoPlay.All || saykit.DOTween.defaultAutoPlay == saykit.AutoPlay.AutoPlaySequences;
		s.loopType = saykit.DOTween.defaultLoopType;
		s.easeType = cc.easing.linear;
	}

	// Returns TRUE in case of success
	public static doStartup(s: SKSequence): boolean {
		let sequencedObjsLen = s._sequencedObjs.length;
		if (s.sequencedTweens.length == 0 && sequencedObjsLen == 0 && !this._isAnyCallbackSet(s)) {
			return false; // Empty Sequence without any callback set
		}

		s.startupDone = true;
		s.fullDuration = s.loops > -1 ? s.duration * s.loops : Infinity;
		// Order sequencedObjs by start position
		SKSequence._stableSortSequencedObjs(s._sequencedObjs);
		// Set relative nested tweens
		if (s.isRelative) {
			for (let len = s.sequencedTweens.length, i = 0; i < len; ++i) {
				let t: saykit.Tween = s.sequencedTweens[i];
				if (!s.isBlendable) s.sequencedTweens[i].isRelative = true;
			}
		}
		if (s.isInverted) {
			// Complete all tweens on startup and invert them, so that we can start from the end
			for (let i = 0; i < sequencedObjsLen; i++) {
				let sequentiable: saykit.ABSSequentiable = s._sequencedObjs[i];
				if (sequentiable.tweenType == saykit.TweenType.Tweener) {
					let t: saykit.Tween = <saykit.Tween>sequentiable;
					saykit.TweenManager.goto(t, t.duration * t.loops, false, saykit.UpdateMode.IgnoreOnComplete);
					t.isInverted = true;
				}
			}
		}
		return true;
	}

	// Applies the tween set by doGoto.
	// Returns TRUE if the tween needs to be killed
	public static doApplyTween(
		s: SKSequence,
		prevPosition: number,
		prevCompletedLoops: number,
		newCompletedSteps: number,
		useInversePosition: boolean,
		updateMode: saykit.UpdateMode
	): boolean {
		// Adapt to eventual ease position
		let prevPos = prevPosition;
		let newPos = s.position;
		if (s.isInverted) useInversePosition = !useInversePosition;
		if (s.easeType != cc.easing.linear) {
			prevPos = s.duration * s.easeType(prevPos / s.duration);
			newPos = s.duration * s.easeType(newPos / s.duration);
		}

		let from = 0;
		let to = 0;
		// Determine if prevPos was inverse.
		// Used to calculate correct "from" value when applying internal cycle
		// and also in case of multiple loops within a single update
		let prevPosIsInverse: boolean =
			(s.loops == -1 || s.loops > 1) &&
			s.loopType == saykit.LoopType.Yoyo &&
			(prevPos < s.duration ? prevCompletedLoops % 2 != 0 : prevCompletedLoops % 2 == 0);
		if (s.isBackwards) prevPosIsInverse = !prevPosIsInverse;
		if (s.isInverted) prevPosIsInverse = !prevPosIsInverse;
		// Update multiple loop cycles within the same update
		if (newCompletedSteps > 0) {
			//                Debug.Log(Time.frameCount + " <color=#FFEC03>newCompletedSteps = " + newCompletedSteps + "</color> - completedLoops: " + s.completedLoops + " - updateMode: " + updateMode);
			// Store expected completedLoops and position, in order to check them after the update cycles.
			let expectedCompletedLoops: number = s.completedLoops;
			let expectedPosition: number = s.position;
			//
			let cycles: number = newCompletedSteps;
			let cyclesDone: number = 0;
			from = prevPos;
			if (updateMode == saykit.UpdateMode.Update) {
				// Run all cycles elapsed since last update
				while (cyclesDone < cycles) {
					if (cyclesDone > 0) from = to;
					else if (prevPosIsInverse && !s.isBackwards) from = s.duration - from;
					to = prevPosIsInverse ? 0 : s.duration;
					if (SKSequence._applyInternalCycle(s, from, to, updateMode, useInversePosition, prevPosIsInverse, true)) return true;
					cyclesDone++;
					if (s.hasLoops && s.loopType == saykit.LoopType.Yoyo) prevPosIsInverse = !prevPosIsInverse;
				}
				// If completedLoops or position were changed by some callback, exit here
				//                    Debug.Log("     Internal Cycle Ended > expecteCompletedLoops/completedLoops: " + expectedCompletedLoops + "/" + s.completedLoops + " - expectedPosition/position: " + expectedPosition + "/" + s.position);
				if (expectedCompletedLoops != s.completedLoops || Math.abs(expectedPosition - s.position) > Number.MIN_VALUE)
					return !s.active;
			} else {
				// Simply determine correct prevPosition after steps
				if (s.hasLoops && s.loopType == saykit.LoopType.Yoyo && newCompletedSteps % 2 != 0) {
					prevPosIsInverse = !prevPosIsInverse;
					prevPos = s.duration - prevPos;
				}
				newCompletedSteps = 0;
			}
		}
		// Run current cycle
		if (newCompletedSteps == 1 && s.isComplete) return false; // Skip update if complete because multicycle took care of it
		if (newCompletedSteps > 0 && !s.isComplete) {
			from = useInversePosition ? s.duration : 0;
			// In case of Restart loop rewind all tweens (keep "to > 0" or remove it?)
			if (s.loopType == saykit.LoopType.Restart && to > 0)
				SKSequence._applyInternalCycle(s, s.duration, 0, saykit.UpdateMode.Goto, false, false, false);
		} else from = useInversePosition ? s.duration - prevPos : prevPos;
		return SKSequence._applyInternalCycle(
			s,
			from,
			useInversePosition ? s.duration - newPos : newPos,
			updateMode,
			useInversePosition,
			prevPosIsInverse
		);
	}

	// METHODS

	// Returns TRUE if the tween needs to be killed
	private static _applyInternalCycle(
		s: SKSequence,
		fromPos: number,
		toPos: number,
		updateMode: saykit.UpdateMode,
		useInverse: boolean,
		prevPosIsInverse: boolean,
		multiCycleStep: boolean = false
	): boolean {
		let wasPlaying = s.isPlaying; // Used to interrupt for loops in case a callback pauses a running Sequence
		let isBackwardsUpdate = toPos < fromPos;

		if (isBackwardsUpdate) {
			let len = s._sequencedObjs.length - 1;
			for (let i = len; i > -1; --i) {
				if (!s.active) return true; // Killed by some internal callback
				if (!s.isPlaying && wasPlaying) return false; // Paused by internal callback
				let sequentiable: saykit.ABSSequentiable = s._sequencedObjs[i];
				if (sequentiable.sequencedEndPosition < toPos || sequentiable.sequencedPosition > fromPos) continue;
				if (sequentiable.tweenType == saykit.TweenType.Callback) {
					if (updateMode == saykit.UpdateMode.Update && prevPosIsInverse) {
						this.onTweenCallback(sequentiable.onStartCallback, s);
					}
				} else {
					// Nested Tweener/Sequence
					let gotoPos: number = toPos - sequentiable.sequencedPosition;
					if (gotoPos < 0) gotoPos = 0;
					let t: saykit.Tween = <saykit.Tween>sequentiable;
					if (!t.startupDone) continue; // since we're going backwards and this tween never started just ignore it
					t.isBackwards = true;
					if (s.isInverted) gotoPos = t.fullDuration - gotoPos;
					if (saykit.TweenManager.goto(t, gotoPos, false, updateMode)) {
						// Nested tween failed. If it's the only tween and there's no callbacks mark for killing the whole sequence
						// if (DOTween.nestedTweenFailureBehaviour == NestedTweenFailureBehaviour.KillWholeSequence) return true;
						if (s.sequencedTweens.length == 1 && s._sequencedObjs.length == 1 && !SKSequence._isAnyCallbackSet(s)) return true;
						// ...otherwise remove failed tween from Sequence and continue
						saykit.TweenManager.despawn(t, false);
						s._sequencedObjs.splice(i, 1);
						s.sequencedTweens.splice(s.sequencedTweens.indexOf(t));
						--i;
						--len;
						continue;
					}

					// Fixes nested callbacks not being called correctly if main sequence has loops and nested ones don't
					if (multiCycleStep && t.tweenType == saykit.TweenType.Sequence) {
						if (s.position <= 0 && s.completedLoops == 0) t.position = 0;
						else {
							let toZero: boolean = s.completedLoops == 0 || (s.isBackwards && (s.completedLoops < s.loops || s.loops == -1));
							if (t.isBackwards) toZero = !toZero;
							if (useInverse) toZero = !toZero;
							if (s.isBackwards && !useInverse && !prevPosIsInverse) toZero = !toZero;
							t.position = toZero ? 0 : t.duration;
						}
					}
				}
			}
		} else {
			let len = s._sequencedObjs.length;
			for (let i = 0; i < len; ++i) {
				if (!s.active) return true; // Killed by some internal callback
				if (!s.isPlaying && wasPlaying) return false; // Paused by internal callback
				let sequentiable: saykit.ABSSequentiable = s._sequencedObjs[i];
				// Fix rare case with high FPS when a tween/callback might happen in same exact time as it's set
				// This fixes it but should check for backwards tweens and loops
				if (
					sequentiable.sequencedPosition > toPos ||
					(sequentiable.sequencedPosition > 0 && sequentiable.sequencedEndPosition <= fromPos) ||
					(sequentiable.sequencedPosition <= 0 && sequentiable.sequencedEndPosition < fromPos)
				)
					continue;
				if (sequentiable.tweenType == saykit.TweenType.Callback) {
					if (updateMode == saykit.UpdateMode.Update) {
						let fire: boolean =
							(!s.isBackwards && !useInverse && !prevPosIsInverse) || (s.isBackwards && useInverse && !prevPosIsInverse);
						if (fire) this.onTweenCallback(sequentiable.onStartCallback, s);
					}
				} else {
					// Nested Tweener/Sequence
					let gotoPos: number = toPos - sequentiable.sequencedPosition;
					if (gotoPos < 0) gotoPos = 0;
					let t: saykit.Tween = <saykit.Tween>sequentiable;
					// Fix for final nested tween not calling onComplete in some cases
					if (toPos >= sequentiable.sequencedEndPosition) {
						if (!t.startupDone) saykit.TweenManager.forceInit(t, true);
						if (gotoPos < t.fullDuration) gotoPos = t.fullDuration;
					}
					t.isBackwards = false;
					if (s.isInverted) gotoPos = t.fullDuration - gotoPos;
					if (saykit.TweenManager.goto(t, gotoPos, false, updateMode)) {
						// Nested tween failed. If it's the only tween and there's no callbacks mark for killing the whole sequence
						// if (DOTween.nestedTweenFailureBehaviour == NestedTweenFailureBehaviour.KillWholeSequence) return true;
						if (s.sequencedTweens.length == 1 && s._sequencedObjs.length == 1 && !SKSequence._isAnyCallbackSet(s)) return true;
						// ...otherwise remove failed tween from Sequence and continue
						saykit.TweenManager.despawn(t, false);
						s._sequencedObjs.splice(i, 1);
						s.sequencedTweens.splice(s.sequencedTweens.indexOf(t));
						--i;
						--len;
						continue;
					}

					// Fixes nested callbacks not being called correctly if main sequence has loops and nested ones don't
					if (multiCycleStep && t.tweenType == saykit.TweenType.Sequence) {
						if (s.position <= 0 && s.completedLoops == 0) t.position = 0;
						else {
							let toZero: boolean =
								s.completedLoops == 0 || (!s.isBackwards && (s.completedLoops < s.loops || s.loops == -1));
							if (t.isBackwards) toZero = !toZero;
							if (useInverse) toZero = !toZero;
							if (s.isBackwards && !useInverse && !prevPosIsInverse) toZero = !toZero;
							t.position = toZero ? 0 : t.duration;
						}
					}
				}
			}
		}
		return false;
	}

	private static _stableSortSequencedObjs(list: Array<saykit.ABSSequentiable>): void {
		let len = list.length;
		for (let i = 1; i < len; i++) {
			let j = i;
			let temp: saykit.ABSSequentiable = list[i];
			while (j > 0 && list[j - 1].sequencedPosition > temp.sequencedPosition) {
				list[j] = list[j - 1];
				j = j - 1;
			}
			list[j] = temp;
		}
	}

	private static _isAnyCallbackSet(s: SKSequence): boolean {
		return (
			s.onCompleteCallback != null ||
			s.onKillCallback != null ||
			s.onPauseCallback != null ||
			s.onPlayCallback != null ||
			s.onRewindCallback != null ||
			s.onStartCallback != null ||
			s.onStepCompleteCallback != null ||
			s.onUpdateCallback != null
		);
	}
}

saykit.Sequence = SKSequence;
