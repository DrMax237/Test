const _DefaultMaxTweeners = 50;
const _DefaultMaxSequences = 10;
const _EpsilonVsTimeCheck = 0.000001;

const { ccclass } = cc._decorator;

@ccclass("saykit.TweenManager")
export default class SKTweenManager {
	public static maxActive = _DefaultMaxTweeners + _DefaultMaxSequences; // Always equal to maxTweeners + maxSequences
	public static maxTweeners = _DefaultMaxTweeners; // Always >= maxSequences
	public static maxSequences = _DefaultMaxSequences; // Always <= maxTweeners
	public static hasActiveTweens: boolean = false;
	public static hasActiveDefaultTweens: boolean = false;
	public static hasActiveLateTweens: boolean = false;
	public static hasActiveManualTweens: boolean = false;
	public static totActiveTweens: number = 0;
	public static totActiveDefaultTweens: number = 0;
	public static totActiveLateTweens: number = 0;
	public static totActiveManualTweens: number = 0;
	public static totActiveTweeners: number = 0;
	public static totActiveSequences: number = 0;
	public static totPooledTweeners: number = 0;
	public static totPooledSequences: number = 0;
	public static totTweeners: number = 0;
	public static totSequences: number = 0; // Both active and pooled
	public static isUpdateLoop: boolean = false; // TRUE while an update cycle is running (used to treat direct tween Kills differently)

	// Tweens contained in Sequences are not inside the active lists
	// Arrays are organized (max once per update) so that existing elements are next to each other from 0 to (totActiveTweens - 1)
	private static _activeTweens: saykit.Tween[] = new Array(_DefaultMaxTweeners + _DefaultMaxSequences); // Internal just to allow DOTweenInspector to access it
	private static _pooledTweeners: saykit.Tween[] = new Array(_DefaultMaxTweeners);
	private static _PooledSequences: saykit.Tween[] = new Array(_DefaultMaxSequences);
	private static _killList: Array<saykit.Tween> = new Array<saykit.Tween>();

	private static _maxActiveLookupId: number = -1; // Highest full ID in _activeTweens
	private static _requiresActiveReorganization: boolean; // True when _activeTweens need to be reorganized to fill empty spaces
	private static _reorganizeFromId: number = -1; // First null ID from which to reorganize
	private static _minPooledTweenerId: number = -1; // Lowest PooledTweeners id that is actually full
	private static _maxPooledTweenerId: number = -1; // Highest PooledTweeners id that is actually full

	// Used to prevent tweens from being re-killed at the end of an update loop if killAll was called during said loop
	private static _despawnAllCalledFromUpdateLoopCallback: boolean;

	constructor() {
		cc.director.on(cc.Director.EVENT_BEFORE_UPDATE, this.update, this);
		cc.director.on(cc.Director.EVENT_AFTER_UPDATE, this.lateUpdate, this);
	}

	private update() {
		const dt: number = cc.director.getDeltaTime();
		if (SKTweenManager.hasActiveDefaultTweens) {
			SKTweenManager.updateTweensWithType(saykit.UpdateType.Normal, dt * saykit.DOTween.timeScale, dt);
		}
	}

	private lateUpdate() {
		const dt: number = cc.director.getDeltaTime();
		if (SKTweenManager.hasActiveLateTweens) {
			SKTweenManager.updateTweensWithType(saykit.UpdateType.Late, dt * saykit.DOTween.timeScale, dt);
		}
	}

	//#region Main

	// Returns a new Tweener, from the pool if there's one available,
	// otherwise by instantiating a new one
	public static getTweener<T1, T2, TPlugOptions extends saykit.IPlugOptions>(): saykit.TweenerCore<T1, T2, TPlugOptions> {
		let t: saykit.TweenerCore<T1, T2, TPlugOptions>;
		// Search inside pool
		if (SKTweenManager.totPooledTweeners > 0) {
			for (let i = SKTweenManager._maxPooledTweenerId; i > SKTweenManager._minPooledTweenerId - 1; --i) {
				let tween: saykit.Tween = SKTweenManager._pooledTweeners[i];
				if (tween != null) {
					// Pooled Tweener exists: spawn it
					t = <saykit.TweenerCore<T1, T2, TPlugOptions>>tween;
					SKTweenManager._addActiveTween(t);
					SKTweenManager._pooledTweeners[i] = null;
					if (SKTweenManager._maxPooledTweenerId != SKTweenManager._minPooledTweenerId) {
						if (i == SKTweenManager._maxPooledTweenerId) SKTweenManager._maxPooledTweenerId--;
						else if (i == SKTweenManager._minPooledTweenerId) SKTweenManager._minPooledTweenerId++;
					}
					SKTweenManager.totPooledTweeners--;
					return t;
				}
			}
			// Not found: remove a tween from the pool in case it's full
			if (SKTweenManager.totTweeners >= SKTweenManager.maxTweeners) {
				SKTweenManager._pooledTweeners[SKTweenManager._maxPooledTweenerId] = null;
				SKTweenManager._maxPooledTweenerId--;
				SKTweenManager.totPooledTweeners--;
				SKTweenManager.totTweeners--;
			}
		} else {
			// Increase capacity in case max number of Tweeners has already been reached, then continue
			if (SKTweenManager.totTweeners >= SKTweenManager.maxTweeners - 1) {
				SKTweenManager._increaseCapacities(saykit.CapacityIncreaseMode.TweenersOnly);
			}
		}
		// Not found: create new TweenerController
		t = new saykit.TweenerCore<T1, T2, TPlugOptions>();
		SKTweenManager.totTweeners++;
		SKTweenManager._addActiveTween(t);
		return t;
	}

	// Returns a new Sequence, from the pool if there's one available,
	// otherwise by instantiating a new one
	public static getSequence(): saykit.Sequence {
		let s: saykit.Sequence;
		if (SKTweenManager.totPooledSequences > 0) {
			s = <saykit.Sequence>SKTweenManager._PooledSequences.pop();
			SKTweenManager._addActiveTween(s);
			SKTweenManager.totPooledSequences--;
			return s;
		}
		// Increase capacity in case max number of Sequences has already been reached, then continue
		if (SKTweenManager.totSequences >= SKTweenManager.maxSequences - 1) {
			SKTweenManager._increaseCapacities(saykit.CapacityIncreaseMode.SequencesOnly);
		}
		// Not found: create new Sequence
		s = new saykit.Sequence();
		SKTweenManager.totSequences++;
		SKTweenManager._addActiveTween(s);
		return s;
	}

	public static setUpdateType(t: saykit.Tween, updateType: saykit.UpdateType, isIndependentUpdate: boolean): void {
		if (!t.active || t.updateType == updateType) {
			t.updateType = updateType;
			t.isIndependentUpdate = isIndependentUpdate;
			return;
		}
		// Remove previous update type
		if (t.updateType == saykit.UpdateType.Normal) {
			SKTweenManager.totActiveDefaultTweens--;
			SKTweenManager.hasActiveDefaultTweens = SKTweenManager.totActiveDefaultTweens > 0;
		} else {
			switch (t.updateType) {
				case saykit.UpdateType.Late:
					SKTweenManager.totActiveLateTweens--;
					SKTweenManager.hasActiveLateTweens = SKTweenManager.totActiveLateTweens > 0;
					break;
				default:
					// Manual
					SKTweenManager.totActiveManualTweens--;
					SKTweenManager.hasActiveManualTweens = SKTweenManager.totActiveManualTweens > 0;
					break;
			}
		}
		// Assign new one
		t.updateType = updateType;
		t.isIndependentUpdate = isIndependentUpdate;
		if (updateType == saykit.UpdateType.Normal) {
			SKTweenManager.totActiveDefaultTweens++;
			SKTweenManager.hasActiveDefaultTweens = true;
		} else {
			switch (updateType) {
				case saykit.UpdateType.Late:
					SKTweenManager.totActiveLateTweens++;
					SKTweenManager.hasActiveLateTweens = true;
					break;
				default:
					// Manual
					SKTweenManager.totActiveManualTweens++;
					SKTweenManager.hasActiveManualTweens = true;
					break;
			}
		}
	}

	// Removes the given tween from the active tweens list
	public static addActiveTweenToSequence(t: saykit.Tween): void {
		SKTweenManager._removeActiveTween(t);
	}

	// Despawn all
	public static despawnAll(): number {
		let totDespawned = SKTweenManager.totActiveTweens;
		for (let i = 0; i < SKTweenManager._maxActiveLookupId + 1; ++i) {
			let t: saykit.Tween = SKTweenManager._activeTweens[i];
			if (t != null) SKTweenManager.despawn(t, false);
		}
		SKTweenManager._clearTweenArray(SKTweenManager._activeTweens);
		SKTweenManager.hasActiveTweens =
			SKTweenManager.hasActiveDefaultTweens =
			SKTweenManager.hasActiveLateTweens =
			SKTweenManager.hasActiveManualTweens =
				false;
		SKTweenManager.totActiveTweens =
			SKTweenManager.totActiveDefaultTweens =
			SKTweenManager.totActiveLateTweens =
			SKTweenManager.totActiveManualTweens =
				0;
		SKTweenManager.totActiveTweeners = SKTweenManager.totActiveSequences = 0;
		SKTweenManager._maxActiveLookupId = SKTweenManager._reorganizeFromId = -1;
		SKTweenManager._requiresActiveReorganization = false;

		if (SKTweenManager.isUpdateLoop) SKTweenManager._despawnAllCalledFromUpdateLoopCallback = true;

		return totDespawned;
	}

	public static despawn(t: saykit.Tween, modifyActiveLists: boolean = true): void {
		// Callbacks
		if (t.onKillCallback != null) saykit.Tween.onTweenCallback(t.onKillCallback, t);

		if (modifyActiveLists) {
			// Remove tween from active list
			SKTweenManager._removeActiveTween(t);
		}
		if (t.isRecyclable) {
			// Put the tween inside a pool
			switch (t.tweenType) {
				case saykit.TweenType.Sequence:
					SKTweenManager._PooledSequences.push(t);
					SKTweenManager.totPooledSequences++;
					// Despawn sequenced tweens
					let s: saykit.Sequence = <saykit.Sequence>t;
					let len = s.sequencedTweens.length;
					for (let i = 0; i < len; ++i) SKTweenManager.despawn(s.sequencedTweens[i], false);
					break;
				case saykit.TweenType.Tweener:
					if (SKTweenManager._maxPooledTweenerId == -1) {
						SKTweenManager._maxPooledTweenerId = SKTweenManager.maxTweeners - 1;
						SKTweenManager._minPooledTweenerId = SKTweenManager.maxTweeners - 1;
					}
					if (SKTweenManager._maxPooledTweenerId < SKTweenManager.maxTweeners - 1) {
						SKTweenManager._pooledTweeners[SKTweenManager._maxPooledTweenerId + 1] = t;
						SKTweenManager._maxPooledTweenerId++;
						if (SKTweenManager._minPooledTweenerId > SKTweenManager._maxPooledTweenerId)
							SKTweenManager._minPooledTweenerId = SKTweenManager._maxPooledTweenerId;
					} else {
						for (let i = SKTweenManager._maxPooledTweenerId; i > -1; --i) {
							if (SKTweenManager._pooledTweeners[i] != null) continue;
							SKTweenManager._pooledTweeners[i] = t;
							if (i < SKTweenManager._minPooledTweenerId) SKTweenManager._minPooledTweenerId = i;
							if (SKTweenManager._maxPooledTweenerId < SKTweenManager._minPooledTweenerId)
								SKTweenManager._maxPooledTweenerId = SKTweenManager._minPooledTweenerId;
							break;
						}
					}
					SKTweenManager.totPooledTweeners++;
					break;
			}
		} else {
			// Remove
			switch (t.tweenType) {
				case saykit.TweenType.Sequence:
					SKTweenManager.totSequences--;
					// Despawn sequenced tweens
					let s: saykit.Sequence = <saykit.Sequence>t;
					let len = s.sequencedTweens.length;
					for (let i = 0; i < len; ++i) SKTweenManager.despawn(s.sequencedTweens[i], false);
					break;
				case saykit.TweenType.Tweener:
					SKTweenManager.totTweeners--;
					break;
			}
		}
		t.active = false;
		t.reset();
	}

	// Destroys any active tween without putting them back in a pool,
	// then purges all pools and resets capacities
	public static purgeAll(isApplicationQuitting: boolean): void {
		if (!isApplicationQuitting) {
			// Fire eventual onKillCallback callbacks
			for (let i = 0; i < SKTweenManager.maxActive; ++i) {
				let t: saykit.Tween = SKTweenManager._activeTweens[i];
				if (t != null && t.active) {
					t.active = false;
					if (t.onKillCallback != null) saykit.Tween.onTweenCallback(t.onKillCallback, t);
				}
			}
		}

		SKTweenManager._clearTweenArray(SKTweenManager._activeTweens);
		SKTweenManager.hasActiveTweens =
			SKTweenManager.hasActiveDefaultTweens =
			SKTweenManager.hasActiveLateTweens =
			SKTweenManager.hasActiveManualTweens =
				false;
		SKTweenManager.totActiveTweens =
			SKTweenManager.totActiveDefaultTweens =
			SKTweenManager.totActiveLateTweens =
			SKTweenManager.totActiveManualTweens =
				0;
		SKTweenManager.totActiveTweeners = SKTweenManager.totActiveSequences = 0;
		SKTweenManager._maxActiveLookupId = SKTweenManager._reorganizeFromId = -1;
		SKTweenManager._requiresActiveReorganization = false;
		SKTweenManager.purgePools();
		SKTweenManager._resetCapacities();
		SKTweenManager.totTweeners = SKTweenManager.totSequences = 0;
	}

	// Removes any cached tween from the pools
	public static purgePools(): void {
		SKTweenManager.totTweeners -= SKTweenManager.totPooledTweeners;
		SKTweenManager.totSequences -= SKTweenManager.totPooledSequences;
		SKTweenManager._clearTweenArray(SKTweenManager._pooledTweeners);
		SKTweenManager._PooledSequences = [];
		SKTweenManager.totPooledTweeners = SKTweenManager.totPooledSequences = 0;
		SKTweenManager._minPooledTweenerId = SKTweenManager._maxPooledTweenerId = -1;
	}

	private static _resetCapacities(): void {
		SKTweenManager.setCapacities(_DefaultMaxTweeners, _DefaultMaxSequences);
	}

	public static setCapacities(tweenersCapacity: number, sequencesCapacity: number): void {
		if (tweenersCapacity < sequencesCapacity) tweenersCapacity = sequencesCapacity;

		SKTweenManager.maxActive = tweenersCapacity + sequencesCapacity;
		SKTweenManager.maxTweeners = tweenersCapacity;
		SKTweenManager.maxSequences = sequencesCapacity;
	}

	// Looks through all active tweens and removes the ones whose getters generate errors
	// (usually meaning their target has become NULL).
	// Returns the total number of invalid tweens found and removed
	// BEWARE: this is an expensive operation
	public static validate(): number {
		if (SKTweenManager._requiresActiveReorganization) SKTweenManager._reorganizeActiveTweens();

		let totInvalid: number = 0;
		for (let i = 0; i < SKTweenManager._maxActiveLookupId + 1; ++i) {
			let t: saykit.Tween = SKTweenManager._activeTweens[i];
			if (!t.validate()) {
				totInvalid++;
				SKTweenManager._markForKilling(t);
			}
		}
		// Kill all eventually marked tweens
		if (totInvalid > 0) {
			SKTweenManager._despawnActiveTweens(SKTweenManager._killList);
			SKTweenManager._killList = [];
		}
		return totInvalid;
	}

	public static updateTweensWithType(updateType: saykit.UpdateType, deltaTime: number, independentTime: number): void {
		if (SKTweenManager._requiresActiveReorganization) SKTweenManager._reorganizeActiveTweens();

		SKTweenManager.isUpdateLoop = true;

		let willKill: boolean = false;
		let len: number = SKTweenManager._maxActiveLookupId + 1; // Stored here so if _maxActiveLookupId changed during update loop (like if new tween is created at onCompleteCallback) new tweens are still ignored
		for (let i = 0; i < len; ++i) {
			let t: saykit.Tween = SKTweenManager._activeTweens[i];
			if (t == null || t.updateType != updateType) continue; // Wrong updateType or was added to a Sequence (thus removed from active list) while inside current updateLoop
			if (SKTweenManager.updateTweens(t, deltaTime, independentTime, false)) willKill = true;
		}
		// Kill all eventually marked tweens
		if (willKill) {
			if (SKTweenManager._despawnAllCalledFromUpdateLoopCallback) {
				// Do not despawn tweens again, since Kill/DespawnAll was already called
				SKTweenManager._despawnAllCalledFromUpdateLoopCallback = false;
			} else {
				SKTweenManager._despawnActiveTweens(SKTweenManager._killList);
			}
			SKTweenManager._killList = [];
		}
		SKTweenManager.isUpdateLoop = false;
	}
	// Returns TRUE if the tween should be killed
	public static updateTweens(t: saykit.Tween, deltaTime: number, independentTime: number, isSingleTweenManualUpdate?: boolean): boolean {
		if (!t.active) {
			// Manually killed by another tween's callback
			SKTweenManager._markForKilling(t, isSingleTweenManualUpdate);
			return true;
		}
		if (!t.isPlaying) return false;
		t.creationLocked = true; // Lock tween creation methods from now on
		let tDeltaTime: number = (t.isIndependentUpdate ? independentTime : deltaTime) * t.timeScale;
		if (tDeltaTime < _EpsilonVsTimeCheck && tDeltaTime > -_EpsilonVsTimeCheck) return false; // Skip update in case time is approximately 0
		if (!t.delayComplete) {
			tDeltaTime = t.updateDelay(t.elapsedDelay + tDeltaTime);
			if (tDeltaTime <= -1) {
				// Error during startup (can happen with FROM tweens): mark tween for killing
				SKTweenManager._markForKilling(t, isSingleTweenManualUpdate);
				return true;
			}
			if (tDeltaTime <= 0) return false;
			// Delay elapsed - call onPlay if required
			if (t.playedOnce && t.onPlayCallback != null) {
				// Don't call in case it hasn't started because onStartCallback routine will call it
				saykit.Tween.onTweenCallback(t.onPlayCallback, t);
			}
		}
		// Startup (needs to be here other than in Tween.doGoto in case of speed-based tweens, to calculate duration correctly)
		if (!t.startupDone) {
			if (!t.startup()) {
				// startup failure: mark for killing
				SKTweenManager._markForKilling(t, isSingleTweenManualUpdate);
				return true;
			}
		}
		// Find update data
		let toPosition: number = t.position;
		let wasEndPosition: boolean = toPosition >= t.duration;
		let toCompletedLoops: number = t.completedLoops;
		if (t.duration <= 0) {
			toPosition = 0;
			toCompletedLoops = t.loops == -1 ? t.completedLoops + 1 : t.loops;
		} else {
			if (t.isBackwards) {
				toPosition -= tDeltaTime;
				while (toPosition < 0 && toCompletedLoops > -1) {
					toPosition += t.duration;
					toCompletedLoops--;
				}
				if (toCompletedLoops < 0 || (wasEndPosition && toCompletedLoops < 1)) {
					// Result is equivalent to a rewind, so set values according to it
					toPosition = 0;
					toCompletedLoops = wasEndPosition ? 1 : 0;
				}
			} else {
				toPosition += tDeltaTime;
				while (toPosition >= t.duration && (t.loops == -1 || toCompletedLoops < t.loops)) {
					toPosition -= t.duration;
					toCompletedLoops++;
				}
			}
			if (wasEndPosition) toCompletedLoops--;
			if (t.loops != -1 && toCompletedLoops >= t.loops) toPosition = t.duration;
		}
		// Goto
		let needsKilling: boolean = saykit.Tween.doGoto(t, toPosition, toCompletedLoops, saykit.UpdateMode.Update);
		if (needsKilling) {
			SKTweenManager._markForKilling(t, isSingleTweenManualUpdate);
			return true;
		}
		return false;
	}

	public static filteredOperation(
		operationType: saykit.OperationType,
		filterType: saykit.FilterType,
		id: any,
		optionalBool: boolean,
		optionalFloat: number,
		optionalArray: Object[] = null
	): number {
		let totInvolved: number = 0;
		let hasDespawned: boolean = false;
		let optionalArrayLen: number = optionalArray == null ? 0 : optionalArray.length;

		for (let i = SKTweenManager._maxActiveLookupId; i > -1; --i) {
			let t: saykit.Tween = SKTweenManager._activeTweens[i];
			if (t == null || !t.active) continue;

			let isFilterCompliant: boolean = false;
			switch (filterType) {
				case saykit.FilterType.All:
					isFilterCompliant = true;
					break;
				case saykit.FilterType.Id:
					isFilterCompliant = t.id != null && id === t.id;
					break;
				case saykit.FilterType.AllExceptIds:
					isFilterCompliant = true;
					for (let c = 0; c < optionalArrayLen; c++) {
						let id: any = optionalArray[c];
						if (t.id != null && id === t.id) {
							isFilterCompliant = false;
							break;
						}
					}
					break;
			}
			if (isFilterCompliant) {
				switch (operationType) {
					case saykit.OperationType.Despawn:
						totInvolved++;
						t.active = false; // Mark it as inactive immediately, so eventual kills called inside a kill won't have effect
						if (SKTweenManager.isUpdateLoop) break; // Just mark it for killing, the update loop will take care of the rest
						SKTweenManager.despawn(t, false);
						hasDespawned = true;
						SKTweenManager._killList.push(t);
						break;
					case saykit.OperationType.Complete:
						let hasAutoKill: boolean = t.autoKill;
						if (!t.startupDone) SKTweenManager.forceInit(t); // Initialize the tween if it's not initialized already (required for speed-based)
						// If optionalFloat is > 0 completes with callbacks
						if (SKTweenManager.complete(t, false, optionalFloat > 0 ? saykit.UpdateMode.Update : saykit.UpdateMode.Goto)) {
							// If optionalBool is TRUE only returns tweens killed by completion
							totInvolved += !optionalBool ? 1 : hasAutoKill ? 1 : 0;
							if (hasAutoKill) {
								if (SKTweenManager.isUpdateLoop) t.active = false;
								// Just mark it for killing, so the update loop will take care of it
								else {
									hasDespawned = true;
									SKTweenManager._killList.push(t);
								}
							}
						}
						break;
					case saykit.OperationType.Flip:
						if (SKTweenManager.flip(t)) totInvolved++;
						break;
					case saykit.OperationType.Goto:
						if (!t.startupDone) SKTweenManager.forceInit(t); // Initialize the tween if it's not initialized already (required for speed-based)
						SKTweenManager.goto(t, optionalFloat, optionalBool);
						totInvolved++;
						break;
					case saykit.OperationType.Pause:
						if (SKTweenManager.pause(t)) totInvolved++;
						break;
					case saykit.OperationType.Play:
						if (SKTweenManager.play(t)) totInvolved++;
						break;
					case saykit.OperationType.PlayBackwards:
						if (SKTweenManager.playBackwards(t)) totInvolved++;
						break;
					case saykit.OperationType.PlayForward:
						if (SKTweenManager.playForward(t)) totInvolved++;
						break;
					case saykit.OperationType.Restart:
						if (SKTweenManager.restart(t, optionalBool, optionalFloat)) totInvolved++;
						break;
					case saykit.OperationType.Rewind:
						if (SKTweenManager.rewind(t, optionalBool)) totInvolved++;
						break;
					case saykit.OperationType.SmoothRewind:
						if (SKTweenManager.smoothRewind(t)) totInvolved++;
						break;
					case saykit.OperationType.TogglePause:
						if (SKTweenManager.togglePause(t)) totInvolved++;
						break;
					case saykit.OperationType.IsTweening:
						if ((!t.isComplete || !t.autoKill) && (!optionalBool || t.isPlaying)) totInvolved++;
						break;
				}
			}
		}
		// Special additional operations in case of despawn
		if (hasDespawned) {
			let count: number = SKTweenManager._killList.length - 1;
			for (let i = count; i > -1; --i) {
				let t: saykit.Tween = SKTweenManager._killList[i];
				// Ignore tweens with activeId -1, since they were already killed and removed
				//  by nested onComplete callbacks
				if (t.activeId != -1) SKTweenManager._removeActiveTween(t);
			}
			SKTweenManager._killList = [];
		}

		return totInvolved;
	}

	//#endregion Main

	//#region Play Operations

	public static complete(
		t: saykit.Tween,
		modifyActiveLists: boolean = true,
		updateMode: saykit.UpdateMode = saykit.UpdateMode.Goto
	): boolean {
		if (t.loops == -1) return false;
		if (!t.isComplete) {
			saykit.Tween.doGoto(t, t.duration, t.loops, updateMode);
			t.isPlaying = false;
			// Despawn if needed
			if (t.autoKill) {
				if (SKTweenManager.isUpdateLoop) t.active = false;
				// Just mark it for killing, so the update loop will take care of it
				else SKTweenManager.despawn(t, modifyActiveLists);
			}
			return true;
		}
		return false;
	}

	public static flip(t: saykit.Tween): boolean {
		t.isBackwards = !t.isBackwards;
		return true;
	}

	// Forces the tween to startup and initialize all its data
	public static forceInit(t: saykit.Tween, isSequenced: boolean = false): void {
		if (t.startupDone) return;

		if (!t.startup() && !isSequenced) {
			// startup failed: kill tween
			if (SKTweenManager.isUpdateLoop) t.active = false;
			// Just mark it for killing, so the update loop will take care of it
			else SKTweenManager._removeActiveTween(t);
		}
	}

	// Returns TRUE if there was an error and the tween needs to be destroyed
	public static goto(
		t: saykit.Tween,
		to: number,
		andPlay: boolean = false,
		updateMode: saykit.UpdateMode = saykit.UpdateMode.Goto
	): boolean {
		let wasPlaying: boolean = t.isPlaying;
		t.isPlaying = andPlay;
		t.delayComplete = true;
		t.elapsedDelay = t.delay;
		let toCompletedLoops: number = t.duration <= 0 ? 1 : Math.floor(to / t.duration); // Still generates imprecision with some values (like 0.4)
		let toPosition: number = to % t.duration;
		if (t.loops != -1 && toCompletedLoops >= t.loops) {
			toCompletedLoops = t.loops;
			toPosition = t.duration;
		} else if (toPosition >= t.duration) toPosition = 0;
		// If andPlay is FALSE manage onPauseCallback from here because doGoto won't detect it (since t.isPlaying was already set from here)
		let needsKilling: boolean = saykit.Tween.doGoto(t, toPosition, toCompletedLoops, updateMode);
		if (!andPlay && wasPlaying && !needsKilling && t.onPauseCallback != null) saykit.Tween.onTweenCallback(t.onPauseCallback, t);
		return needsKilling;
	}

	// Returns TRUE if the given tween was not already paused
	public static pause(t: saykit.Tween): boolean {
		if (t.isPlaying) {
			t.isPlaying = false;
			if (t.onPauseCallback != null) saykit.Tween.onTweenCallback(t.onPauseCallback, t);
			return true;
		}
		return false;
	}

	// Returns TRUE if the given tween was not already playing and is not complete
	public static play(t: saykit.Tween): boolean {
		if (!t.isPlaying && ((!t.isBackwards && !t.isComplete) || (t.isBackwards && (t.completedLoops > 0 || t.position > 0)))) {
			t.isPlaying = true;
			if (t.playedOnce && t.delayComplete && t.onPlayCallback != null) {
				// Don't call in case there's a delay to run or if it hasn't started because onStartCallback routine will call it
				saykit.Tween.onTweenCallback(t.onPlayCallback, t);
			}
			return true;
		}
		return false;
	}

	public static playBackwards(t: saykit.Tween): boolean {
		if (t.completedLoops == 0 && t.position <= 0) {
			// Already rewinded, manage onRewind callback
			SKTweenManager._manageonRewindCallbackWhenAlreadyRewinded(t, true);
			t.isBackwards = true;
			t.isPlaying = false;
			return false;
		}
		if (!t.isBackwards) {
			t.isBackwards = true;
			SKTweenManager.play(t);
			return true;
		}
		return SKTweenManager.play(t);
	}

	public static playForward(t: saykit.Tween): boolean {
		if (t.isComplete) {
			t.isBackwards = false;
			t.isPlaying = false;
			return false;
		}
		if (t.isBackwards) {
			t.isBackwards = false;
			SKTweenManager.play(t);
			return true;
		}
		return SKTweenManager.play(t);
	}

	public static restart(t: saykit.Tween, includeDelay: boolean = true, changeDelayTo: number = -1): boolean {
		let wasPaused: boolean = !t.isPlaying;
		t.isBackwards = false;
		if (changeDelayTo >= 0 && t.tweenType == saykit.TweenType.Tweener) t.delay = changeDelayTo;
		SKTweenManager.rewind(t, includeDelay);
		t.isPlaying = true;
		if (wasPaused && t.playedOnce && t.delayComplete && t.onPlayCallback != null) {
			// Don't call in case there's a delay to run or if it hasn't started because onStartCallback routine will call it
			saykit.Tween.onTweenCallback(t.onPlayCallback, t);
		}
		return true;
	}

	public static rewind(t: saykit.Tween, includeDelay: boolean = true): boolean {
		let wasPlaying: boolean = t.isPlaying; // Manage onPauseCallback from this method because doGoto won't detect it
		t.isPlaying = false;
		let rewinded: boolean = false;
		if (t.delay > 0) {
			if (includeDelay) {
				rewinded = t.delay > 0 && t.elapsedDelay > 0;
				t.elapsedDelay = 0;
				t.delayComplete = false;
			} else {
				rewinded = t.elapsedDelay < t.delay;
				t.elapsedDelay = t.delay;
				t.delayComplete = true;
			}
		}
		if (t.position > 0 || t.completedLoops > 0 || !t.startupDone) {
			rewinded = true;
			let needsKilling: boolean = saykit.Tween.doGoto(t, 0, 0, saykit.UpdateMode.Goto);
			if (!needsKilling && wasPlaying && t.onPauseCallback != null) saykit.Tween.onTweenCallback(t.onPauseCallback, t);
		} else {
			// Alread rewinded
			SKTweenManager._manageonRewindCallbackWhenAlreadyRewinded(t, false);
		}
		return rewinded;
	}

	public static smoothRewind(t: saykit.Tween): boolean {
		let rewinded: boolean = false;
		if (t.delay > 0) {
			rewinded = t.elapsedDelay < t.delay;
			t.elapsedDelay = t.delay;
			t.delayComplete = true;
		}
		if (t.position > 0 || t.completedLoops > 0 || !t.startupDone) {
			rewinded = true;
			if (t.loopType == saykit.LoopType.Incremental) t.playBackwards();
			else {
				t.goto(t.getElapsedDirectionalPercentage() * t.duration);
				t.playBackwards();
			}
		} else {
			// Already rewinded
			t.isPlaying = false;
			SKTweenManager._manageonRewindCallbackWhenAlreadyRewinded(t, true);
		}
		return rewinded;
	}

	public static togglePause(t: saykit.Tween): boolean {
		if (t.isPlaying) return SKTweenManager.pause(t);
		return SKTweenManager.play(t);
	}

	//#endregion Play Operations

	//#region Info Getters

	public static totalPooledTweens(): number {
		return SKTweenManager.totPooledTweeners + SKTweenManager.totPooledSequences;
	}

	public static totalPlayingTweens(): number {
		if (!SKTweenManager.hasActiveTweens) return 0;

		if (SKTweenManager._requiresActiveReorganization) SKTweenManager._reorganizeActiveTweens();

		let tot: number = 0;
		for (let i = 0; i < SKTweenManager._maxActiveLookupId + 1; ++i) {
			let t: saykit.Tween = SKTweenManager._activeTweens[i];
			if (t != null && t.isPlaying) tot++;
		}
		return tot;
	}

	// If playing is FALSE returns active paused tweens, otherwise active playing tweens
	public static getActiveTweens(playing: boolean, fillableList: Array<saykit.Tween> = null): Array<saykit.Tween> {
		if (SKTweenManager._requiresActiveReorganization) SKTweenManager._reorganizeActiveTweens();

		if (SKTweenManager.totActiveTweens <= 0) return null;
		let len: number = SKTweenManager.totActiveTweens;
		if (fillableList == null) fillableList = new Array<saykit.Tween>(len);
		for (let i = 0; i < len; ++i) {
			let t: saykit.Tween = SKTweenManager._activeTweens[i];
			if (t.isPlaying == playing) fillableList.push(t);
		}
		if (fillableList.length > 0) return fillableList;
		return null;
	}

	// Returns all active tweens with the given id
	public static getTweensById(id: any, playingOnly: boolean, fillableList: Array<saykit.Tween> = null): Array<saykit.Tween> {
		if (SKTweenManager._requiresActiveReorganization) SKTweenManager._reorganizeActiveTweens();

		if (SKTweenManager.totActiveTweens <= 0) return null;
		let len: number = SKTweenManager.totActiveTweens;
		if (fillableList == null) fillableList = new Array<saykit.Tween>(len);

		for (let i = 0; i < len; ++i) {
			let t: saykit.Tween = SKTweenManager._activeTweens[i];
			if (t == null) continue;
			if (t.id == null || id !== t.id) continue;
			if (!playingOnly || t.isPlaying) fillableList.push(t);
		}
		if (fillableList.length > 0) return fillableList;
		return null;
	}

	//#endregion Info Getters

	//#region Private Methods

	// If isSingleTweenManualUpdate is TRUE will kill the tween immediately instead of adding it to the KillList
	private static _markForKilling(t: saykit.Tween, isSingleTweenManualUpdate: boolean = false): void {
		if (isSingleTweenManualUpdate && !SKTweenManager.isUpdateLoop) {
			// Kill immediately
			SKTweenManager.despawn(t);
		} else {
			t.active = false;
			SKTweenManager._killList.push(t);
		}
	}

	// Adds the given tween to the active tweens list (updateType is always Normal, but can be changed by setUpdateType)
	private static _addActiveTween(t: saykit.Tween): void {
		if (SKTweenManager._requiresActiveReorganization) SKTweenManager._reorganizeActiveTweens();

		// Safety check (IndexOutOfRangeException)
		if (SKTweenManager.totActiveTweens < 0) {
			cc.log("totActiveTweens < 0", t);
			SKTweenManager.totActiveTweens = 0;
		}

		t.active = true;
		t.updateType = saykit.DOTween.defaultUpdateType;
		t.isIndependentUpdate = saykit.DOTween.defaultTimeScaleIndependent;
		t.activeId = SKTweenManager._maxActiveLookupId = SKTweenManager.totActiveTweens;
		SKTweenManager._activeTweens[SKTweenManager.totActiveTweens] = t;
		if (t.updateType == saykit.UpdateType.Normal) {
			SKTweenManager.totActiveDefaultTweens++;
			SKTweenManager.hasActiveDefaultTweens = true;
		} else {
			switch (t.updateType) {
				case saykit.UpdateType.Late:
					SKTweenManager.totActiveLateTweens++;
					SKTweenManager.hasActiveLateTweens = true;
					break;
				default:
					SKTweenManager.totActiveManualTweens++;
					SKTweenManager.hasActiveManualTweens = true;
					break;
			}
		}

		SKTweenManager.totActiveTweens++;
		if (t.tweenType == saykit.TweenType.Tweener) SKTweenManager.totActiveTweeners++;
		else SKTweenManager.totActiveSequences++;
		SKTweenManager.hasActiveTweens = true;
	}

	private static _reorganizeActiveTweens(): void {
		if (SKTweenManager.totActiveTweens <= 0) {
			SKTweenManager._maxActiveLookupId = -1;
			SKTweenManager._requiresActiveReorganization = false;
			SKTweenManager._reorganizeFromId = -1;
			return;
		} else if (SKTweenManager._reorganizeFromId == SKTweenManager._maxActiveLookupId) {
			SKTweenManager._maxActiveLookupId--;
			SKTweenManager._requiresActiveReorganization = false;
			SKTweenManager._reorganizeFromId = -1;
			return;
		}

		let shift: number = 1;
		let len: number = SKTweenManager._maxActiveLookupId + 1;
		SKTweenManager._maxActiveLookupId = SKTweenManager._reorganizeFromId - 1;
		for (let i = SKTweenManager._reorganizeFromId + 1; i < len; ++i) {
			let t: saykit.Tween = SKTweenManager._activeTweens[i];
			if (t == null) {
				shift++;
				continue;
			}
			t.activeId = SKTweenManager._maxActiveLookupId = i - shift;
			SKTweenManager._activeTweens[i - shift] = t;
			SKTweenManager._activeTweens[i] = null;
		}
		SKTweenManager._requiresActiveReorganization = false;
		SKTweenManager._reorganizeFromId = -1;
	}

	private static _despawnActiveTweens(tweens: Array<saykit.Tween>): void {
		let count: number = tweens.length - 1;
		for (let i = count; i > -1; --i) SKTweenManager.despawn(tweens[i]);
	}

	// Removes a tween from the active list, then reorganizes said list and decreases the given total.
	private static _removeActiveTween(t: saykit.Tween): void {
		let index: number = t.activeId;

		t.activeId = -1;
		SKTweenManager._requiresActiveReorganization = true;
		if (SKTweenManager._reorganizeFromId == -1 || SKTweenManager._reorganizeFromId > index) SKTweenManager._reorganizeFromId = index;
		SKTweenManager._activeTweens[index] = null;

		if (t.updateType == saykit.UpdateType.Normal) {
			// Safety check (IndexOutOfRangeException)
			if (SKTweenManager.totActiveDefaultTweens > 0) {
				SKTweenManager.totActiveDefaultTweens--;
				SKTweenManager.hasActiveDefaultTweens = SKTweenManager.totActiveDefaultTweens > 0;
			} else {
				cc.log("totActiveDefaultTweens < 0", t);
			}
		} else {
			switch (t.updateType) {
				case saykit.UpdateType.Late:
					// Safety check (IndexOutOfRangeException)
					if (SKTweenManager.totActiveLateTweens > 0) {
						SKTweenManager.totActiveLateTweens--;
						SKTweenManager.hasActiveLateTweens = SKTweenManager.totActiveLateTweens > 0;
					} else {
						cc.log("totActiveLateTweens < 0", t);
					}
					break;
				default:
					// Safety check (IndexOutOfRangeException)
					if (SKTweenManager.totActiveManualTweens > 0) {
						SKTweenManager.totActiveManualTweens--;
						SKTweenManager.hasActiveManualTweens = SKTweenManager.totActiveManualTweens > 0;
					} else {
						cc.log("totActiveManualTweens < 0", t);
					}
					break;
			}
		}
		SKTweenManager.totActiveTweens--;
		SKTweenManager.hasActiveTweens = SKTweenManager.totActiveTweens > 0;
		if (t.tweenType == saykit.TweenType.Tweener) SKTweenManager.totActiveTweeners--;
		else SKTweenManager.totActiveSequences--;
		// Safety check (IndexOutOfRangeException)
		if (SKTweenManager.totActiveTweens < 0) {
			SKTweenManager.totActiveTweens = 0;
			cc.log("totActiveTweens < 0", t);
		}
		// Safety check (IndexOutOfRangeException)
		if (SKTweenManager.totActiveTweeners < 0) {
			SKTweenManager.totActiveTweeners = 0;
			cc.log("totActiveTweeners < 0", t);
		}
		// Safety check (IndexOutOfRangeException)
		if (SKTweenManager.totActiveSequences < 0) {
			SKTweenManager.totActiveSequences = 0;
			cc.log("totActiveSequences < 0", t);
		}
	}

	private static _clearTweenArray(tweens: saykit.Tween[]): void {
		let len: number = tweens.length;
		for (let i = 0; i < len; i++) tweens[i] = null;
	}

	private static _increaseCapacities(increaseMode: saykit.CapacityIncreaseMode): void {
		let killAdd: number = 0;
		let increaseTweenersBy: number = Math.max(Math.round(SKTweenManager.maxTweeners * 1.5), _DefaultMaxTweeners);
		let increaseSequencesBy: number = Math.max(Math.round(SKTweenManager.maxSequences * 1.5), _DefaultMaxSequences);
		switch (increaseMode) {
			case saykit.CapacityIncreaseMode.TweenersOnly:
				killAdd += increaseTweenersBy;
				SKTweenManager.maxTweeners += increaseTweenersBy;
				break;
			case saykit.CapacityIncreaseMode.SequencesOnly:
				killAdd += increaseSequencesBy;
				SKTweenManager.maxSequences += increaseSequencesBy;
				break;
			default:
				killAdd += increaseTweenersBy + increaseSequencesBy;
				SKTweenManager.maxTweeners += increaseTweenersBy;
				SKTweenManager.maxSequences += increaseSequencesBy;
				break;
		}
		SKTweenManager.maxActive = SKTweenManager.maxTweeners + SKTweenManager.maxSequences;
	}

	//#region Helpers

	// If isPlayBackwardsOrSmoothRewind is FALSE, it means this was a Rewind command
	private static _manageonRewindCallbackWhenAlreadyRewinded(t: saykit.Tween, isPlayBackwardsOrSmoothRewind: boolean): void {
		if (t.onRewindCallback == null) return;
		if (isPlayBackwardsOrSmoothRewind) {
			// PlayBackwards or smoothRewind
			if (saykit.DOTween.rewindCallbackMode == saykit.RewindCallbackMode.FireAlways) t.onRewindCallback();
		} else {
			// Rewind
			if (saykit.DOTween.rewindCallbackMode != saykit.RewindCallbackMode.FireIfPositionChanged) t.onRewindCallback();
		}
	}

	//#endregion Helpers

	//#endregion Private Methods
}

saykit.TweenManager = SKTweenManager;
new SKTweenManager();
