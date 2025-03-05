const { ccclass } = cc._decorator;

interface SKITweenParams {
	target: Object;
	props: Object;
	duration: number;
	easing?: Function;
	autoStart?: boolean;
	delay?: number;
	snapping?: boolean;

	onStart?: Function;
	onComplete?: Function;
	onUpdate?: Function;
}

@ccclass("saykit.DOTween")
export default class SKDOTween {
	// Global DOTween timeScale.
	// Default: 1
	public static timeScale: number = 1;
	// If TRUE, DOTween will use Time.smoothDeltaTime instead of Time.deltaTime for saykit.UpdateType.Normal and saykit.UpdateType.Late tweens
	// (unless they're set as timeScaleIndependent, in which case a value between the last timestep
	// and <see cref="maxSmoothUnscaledTime"/> will be used instead).
	// Setting this to TRUE will lead to smoother animations.
	// Default: FALSE
	public static useSmoothDeltaTime: boolean;
	// If <see cref="useSmoothDeltaTime"/> is TRUE, this indicates the max timeStep that an independent update call can last.
	// Setting this to TRUE will lead to smoother animations.
	// Default: FALSE
	public static maxSmoothUnscaledTime: number = 0.15;
	// Internal ► Can only be set via DOTween's Utility Panel
	public static rewindCallbackMode: saykit.RewindCallbackMode = saykit.RewindCallbackMode.FireIfPositionChanged;

	// Default options for Tweens

	// Default updateType for new tweens.
	// Default: saykit.UpdateType.Normal
	public static defaultUpdateType: saykit.UpdateType = saykit.UpdateType.Normal;
	// Sets whether Unity's timeScale should be taken into account by default or not.
	// Default: false
	public static defaultTimeScaleIndependent: boolean = false;
	// Default autoPlay behaviour for new tweens.
	// Default: saykit.AutoPlay.All
	public static defaultAutoPlay: saykit.AutoPlay = saykit.AutoPlay.All;
	// Default autoKillOnComplete behaviour for new tweens.
	// Default: TRUE
	public static defaultAutoKill: boolean = true;
	// Default loopType applied to all new tweens.
	// Default: saykit.LoopType.Restart
	public static defaultLoopType: saykit.LoopType = saykit.LoopType.Restart;
	// If TRUE all newly created tweens are set as recyclable, otherwise not.
	// Default: FALSE
	public static defaultRecyclable: boolean;
	// Default ease applied to all new Tweeners (not to Sequences which always have Ease.Linear as default).
	// Default: cc.easing.linear
	public static defaultEaseType: Function; // = cc.easing.linear;
	public static initialized: boolean; // Can be set to false by DOTweenComponent OnDestroy

	// Returns the total number of active tweens.
	// A tween is considered active if it wasn't killed, regardless if it's playing or paused
	public static get totalActiveTweens(): number {
		return saykit.TweenManager.totActiveTweens;
	}
	// Returns the total number of active and playing tweens.
	// A tween is considered as playing even if its delay is actually playing
	public static get totalPlayingTweens(): number {
		return saykit.TweenManager.totalPlayingTweens();
	}
	// Returns a list of all active tweens in a playing state.
	// Returns NULL if there are no active playing tweens.
	public static get playingTweens(): Array<saykit.Tween> {
		let fillableList = [];
		return saykit.TweenManager.getActiveTweens(true, fillableList);
	}

	// Returns a list of all active tweens in a paused state.
	// Returns NULL if there are no active paused tweens.
	public static get pausedTweens(): Array<saykit.Tween> {
		let fillableList = [];
		return saykit.TweenManager.getActiveTweens(false, fillableList);
	}
	//#region Public Methods

	static autoInit(): void {
		SKDOTween.init();
	}
	public static init(recycleAllByDefault: boolean = false): void {
		SKDOTween.initialized = true;
		if (recycleAllByDefault != null) SKDOTween.defaultRecyclable = <boolean>recycleAllByDefault;
		SKDOTween.timeScale = 1;
		SKDOTween.useSmoothDeltaTime = false;
		SKDOTween.maxSmoothUnscaledTime = 0.15;
		SKDOTween.rewindCallbackMode = saykit.RewindCallbackMode.FireIfPositionChanged;
		SKDOTween.defaultRecyclable = <boolean>recycleAllByDefault;
		SKDOTween.defaultAutoPlay = saykit.AutoPlay.All;
		SKDOTween.defaultUpdateType = saykit.UpdateType.Normal;
		SKDOTween.defaultTimeScaleIndependent = false;
		SKDOTween.defaultEaseType = cc.easing.linear;
		SKDOTween.defaultAutoKill = true;
		SKDOTween.defaultLoopType = saykit.LoopType.Restart;

		// cc.log("DOTween initialization (recycling: " + (DOTween.defaultRecyclable ? "ON" : "OFF" + ")"));
		return;
	}

	public static setTweensCapacity(tweenersCapacity: number, sequencesCapacity: number): void {
		saykit.TweenManager.setCapacities(tweenersCapacity, sequencesCapacity);
	}

	public static clear(destroy: boolean = false, isApplicationQuitting: boolean = false): void {
		saykit.TweenManager.purgeAll(isApplicationQuitting);
		saykit.PluginsManager.purgeAll();
		if (!destroy) return;

		SKDOTween.initialized = false;
	}

	public static clearCachedTweens(): void {
		saykit.TweenManager.purgePools();
	}

	public static validate(): number {
		return saykit.TweenManager.validate();
	}

	// Updates all tweens that are set to <see cref="UpdateType.Manual"/>.
	public static manualUpdate(deltaTime: number, unscaledDeltaTime: number): void {
		SKDOTween._initCheck();

		if (saykit.TweenManager.hasActiveManualTweens) {
			saykit.TweenManager.updateTweensWithType(
				saykit.UpdateType.Manual,
				deltaTime * SKDOTween.timeScale,
				unscaledDeltaTime * SKDOTween.timeScale
			);
		}
	}

	//#endregion Public Methods

	// PUBLIC TWEEN CREATION METHODS

	//#region Tween TO

	// Tweens a property or field to the given value using default plugins
	// "getter" - A getter for the field or property to tween.
	// Example usage with lambda:()=> myProperty
	// "setter" - A setter for the field or property to tween
	// Example usage with lambda:x=> myProperty = x
	// "endValue" - The end value to reach"duration" - The tween's duration
	public static add<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		getter: () => T1,
		setter: (value: T1) => void,
		endValue: T2,
		duration: number,
		params?: saykit.TweenParams | any
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		let t = SKDOTween.applyTo(getter, setter, endValue, duration);
		if (params instanceof Object) t.setAs(params);
		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	// props = {
	//   property1 : value1,
	//   property2 : value2,
	//   ...
	//   propertyN : valueN,
	// }
	public static addWithProps<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		props: Object,
		duration: number,
		easing?: Function,
		autoStart?: boolean,
		delay?: number,
		snapping?: boolean,
		startCallback?: Function,
		completeCallback?: Function,
		updateCallback?: Function
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		let keys: any[] = [];
		let startValues: any[] = [];
		let endValues: any[] = [];

		for (let key in props) {
			keys.push(key);

			if (props[key] instanceof Array) {
				const startValue = props[key][0];
				const endValue = props[key][props[key].length - 1];

				startValues.push(startValue);
				endValues.push(endValue);
			} else {
				endValues.push(props[key]);
				startValues.push(target[key]);
			}
		}

		let t = SKDOTween.add(
			() => {
				return startValues;
			},
			(values) => {
				let i = 0;
				for (let prop in props) {
					target[prop] = values[i];
					i++;
				}
			},
			endValues,
			duration
		);

		if (easing) t.setEase(easing);
		if (autoStart === false) t.pause();
		if (delay > 0) t.setDelay(delay);
		if (startCallback) t.onStart(startCallback);
		if (completeCallback) t.onComplete(completeCallback);
		if (updateCallback) t.onUpdate(updateCallback);
		if (snapping) t.setOptions(snapping);

		return t as saykit.TweenerCore<any, any, TPlugOptions>;
	}
	public static addWithObj<T1, T2, TPlugOptions extends saykit.IPlugOptions>(tweenParams: SKITweenParams) {
		return SKDOTween.addWithProps(
			tweenParams.target,
			tweenParams.props,
			tweenParams.duration,
			tweenParams.easing,
			tweenParams.autoStart,
			tweenParams.delay,
			tweenParams.snapping,

			tweenParams.onStart,
			tweenParams.onComplete,
			tweenParams.onUpdate
		);
	}

	public static addSequence(): saykit.Sequence {
		SKDOTween._initCheck();
		let sequence = saykit.TweenManager.getSequence();
		saykit.Sequence.setup(sequence);
		return sequence;
	}

	//#region Play Operations

	// Completes all tweens and returns the number of actual tweens completed
	// (meaning tweens that don't have infinite loops and were not already complete)
	// "withCallbacks" - For Sequences only: if TRUE also internal Sequence callbacks will be fired,
	// otherwise they will be ignored
	public static completeAll(withCallbacks: boolean = false): number {
		return saykit.TweenManager.filteredOperation(
			saykit.OperationType.Complete,
			saykit.FilterType.All,
			null,
			false,
			withCallbacks ? 1 : 0
		);
	}
	// Completes all tweens with the given ID and returns the number of actual tweens completed
	// (meaning the tweens that don't have infinite loops and were not already complete)
	// "withCallbacks" - For Sequences only: if TRUE internal Sequence callbacks will be fired,
	// otherwise they will be ignored
	public static complete(id: any, withCallbacks: boolean = false): number {
		if (id == null) return 0;
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Complete, saykit.FilterType.Id, id, false, withCallbacks ? 1 : 0);
	}
	// Used internally to complete a tween and return only the number of killed tweens instead than just the completed ones
	// (necessary for Kill(complete) operation. Sets optionalBool to TRUE)
	private static _completeAndReturnKilledTot(id?: any): number {
		if (!id) return saykit.TweenManager.filteredOperation(saykit.OperationType.Complete, saykit.FilterType.All, null, true, 0);
		else return saykit.TweenManager.filteredOperation(saykit.OperationType.Complete, saykit.FilterType.Id, id, true, 0);
	}
	private static _completeAndReturnKilledTotExceptFor(excludeIds: Array<Object>): number {
		// excludeIds is never NULL (checked by DOTween.killAll)
		return saykit.TweenManager.filteredOperation(
			saykit.OperationType.Complete,
			saykit.FilterType.AllExceptIds,
			null,
			true,
			0,
			null,
			excludeIds
		);
	}

	// Flips all tweens (changing their direction to forward if it was backwards and viceversa),
	// then returns the number of actual tweens flipped
	public static flipAll(): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Flip, saykit.FilterType.All, null, false, 0);
	}
	// Flips the tweens with the given ID (changing their direction to forward if it was backwards and viceversa),
	// then returns the number of actual tweens flipped
	public static flip(id: any): number {
		if (id == null) return 0;
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Flip, saykit.FilterType.Id, id, false, 0);
	}

	// Sends all tweens to the given position (calculating also eventual loop cycles) and returns the actual tweens involved
	public static gotoAll(to: number, andPlay: boolean = false): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Goto, saykit.FilterType.All, null, andPlay, to);
	}
	// Sends all tweens with the given ID to the given position (calculating also eventual loop cycles)
	// and returns the actual tweens involved
	public static goto(id: any, to: number, andPlay: boolean = false): number {
		if (id == null) return 0;
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Goto, saykit.FilterType.Id, id, andPlay, to);
	}

	// Kills all tweens and returns the number of actual tweens killed
	// "complete" - If TRUE completes the tweens before killing them
	// "idsToExclude" - Eventual IDs  to exclude from the killing
	public static killAll(complete: boolean = false, idsToExclude?: Array<Object>): number {
		let tot: number;
		if (!idsToExclude) {
			tot = complete ? SKDOTween._completeAndReturnKilledTot() : 0;
			return tot + saykit.TweenManager.despawnAll();
		}
		tot = complete ? SKDOTween._completeAndReturnKilledTotExceptFor(idsToExclude) : 0;
		return (
			tot +
			saykit.TweenManager.filteredOperation(
				saykit.OperationType.Despawn,
				saykit.FilterType.AllExceptIds,
				null,
				false,
				0,
				null,
				idsToExclude
			)
		);
	}
	// Kills all tweens with the given ID, and returns the number of actual tweens killed
	// "complete" - If TRUE completes the tweens before killing them
	public static kill(complete: boolean = false, id: any): number {
		if (id == null) return 0;
		let tot: number = complete ? SKDOTween._completeAndReturnKilledTot(id) : 0;
		let count = saykit.TweenManager.filteredOperation(saykit.OperationType.Despawn, saykit.FilterType.Id, id, false, 0);
		return tot + count;
	}

	// Pauses all tweens and returns the number of actual tweens paused
	public static pauseAll(): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Pause, saykit.FilterType.All, null, false, 0);
	}
	// Pauses all tweens with the given ID and returns the number of actual tweens paused
	// (meaning the tweens that were actually playing and have been paused)
	public static pause(id: any): number {
		if (id == null) return 0;
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Pause, saykit.FilterType.Id, id, false, 0);
	}

	// Plays all tweens and returns the number of actual tweens played
	// (meaning tweens that were not already playing or complete)
	public static playAll(): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Play, saykit.FilterType.All, null, false, 0);
	}
	// Plays all tweens with the given ID  and returns the number of actual tweens played
	// (meaning the tweens that were not already playing or complete)
	public static play(id: any): number {
		if (id == null) return 0;
		else saykit.TweenManager.filteredOperation(saykit.OperationType.Play, saykit.FilterType.Id, id, false, 0);
	}
	// Plays backwards all tweens and returns the number of actual tweens played
	// (meaning tweens that were not already started, playing backwards or rewinded)
	public static playBackwardsAll(): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.PlayBackwards, saykit.FilterType.All, null, false, 0);
	}
	// Plays backwards all tweens with the given  ID and returns the number of actual tweens played
	// (meaning the tweens that were not already started, playing backwards or rewinded)
	public static playBackwards(id: any): number {
		if (id == null) return 0;
		else return saykit.TweenManager.filteredOperation(saykit.OperationType.PlayBackwards, saykit.FilterType.Id, id, false, 0);
	}
	// Plays forward all tweens and returns the number of actual tweens played
	// (meaning tweens that were not already playing forward or complete)
	public static playForwardAll(): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.PlayForward, saykit.FilterType.All, null, false, 0);
	}
	// Plays forward all tweens with the given  ID and returns the number of actual tweens played
	// (meaning the tweens that were not already started, playing backwards or rewinded)
	public static playForward(id: any): number {
		if (id == null) return 0;
		else return saykit.TweenManager.filteredOperation(saykit.OperationType.PlayForward, saykit.FilterType.Id, id, false, 0);
	}
	// Restarts all tweens, then returns the number of actual tweens restarted
	public static restartAll(includeDelay: boolean = true): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Restart, saykit.FilterType.All, null, includeDelay, 0);
	}
	// Restarts all tweens with the given ID, then returns the number of actual tweens restarted
	// "includeDelay" - If TRUE includes the eventual tweens delays, otherwise skips them
	// "changeDelayTo" - If >= 0 changes the startup delay of all involved tweens to this value, otherwise doesn't touch it
	public static restart(id: any, includeDelay: boolean = true, changeDelayTo: number = -1): number {
		if (id == null) return 0;
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Restart, saykit.FilterType.Id, id, includeDelay, changeDelayTo);
	}
	// Rewinds and pauses all tweens, then returns the number of actual tweens rewinded
	// (meaning tweens that were not already rewinded)
	public static rewindAll(includeDelay: boolean = true): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Rewind, saykit.FilterType.All, null, includeDelay, 0);
	}
	// Rewinds and pauses all tweens with the given ID, then returns the number of actual tweens rewinded
	// (meaning the tweens that were not already rewinded)
	public static rewind(id: any, includeDelay: boolean = true): number {
		if (id == null) return 0;
		return saykit.TweenManager.filteredOperation(saykit.OperationType.Rewind, saykit.FilterType.Id, id, includeDelay, 0);
	}
	// Smoothly rewinds all tweens (delays excluded), then returns the number of actual tweens rewinding/rewinded
	// (meaning tweens that were not already rewinded).
	// A "smooth rewind" animates the tween to its start position,
	// skipping all elapsed loops (except in case of saykit.LoopType.Incremental) while keeping the animation fluent.
	// Note that a tween that was smoothly rewinded will have its play direction flipped
	public static smoothRewindAll(): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.SmoothRewind, saykit.FilterType.All, null, false, 0);
	}
	// Smoothly rewinds all tweens (delays excluded) with the given ID, then returns the number of actual tweens rewinding/rewinded
	// (meaning the tweens that were not already rewinded).
	// A "smooth rewind" animates the tween to its start position,
	// skipping all elapsed loops (except in case of saykit.LoopType.Incremental) while keeping the animation fluent.
	// Note that a tween that was smoothly rewinded will have its play direction flipped
	public static smoothRewind(id: any): number {
		if (id == null) return 0;
		return saykit.TweenManager.filteredOperation(saykit.OperationType.SmoothRewind, saykit.FilterType.Id, id, false, 0);
	}

	// Toggles the play state of all tweens and returns the number of actual tweens toggled
	// (meaning tweens that could be played or paused, depending on the toggle state)
	public static togglePauseAll(): number {
		return saykit.TweenManager.filteredOperation(saykit.OperationType.TogglePause, saykit.FilterType.All, null, false, 0);
	}
	// Toggles the play state of all tweens with the given ID and returns the number of actual tweens toggled
	// (meaning the tweens that could be played or paused, depending on the toggle state)
	public static togglePause(id: any): number {
		if (id == null) return 0;
		return saykit.TweenManager.filteredOperation(saykit.OperationType.TogglePause, saykit.FilterType.Id, id, false, 0);
	}

	//#endregion Play Operations

	//#region Global Info Getters

	// Returns TRUE if a tween with the given ID is active.
	// "id" - The ID to look for
	// "alsoCheckIfIsPlaying" - If FALSE (default) returns TRUE as long as a tween for the given ID is active,
	// otherwise also requires it to be playing
	public static isTweening(id: any, alsoCheckIfIsPlaying: boolean = false): boolean {
		return (
			saykit.TweenManager.filteredOperation(saykit.OperationType.IsTweening, saykit.FilterType.Id, id, alsoCheckIfIsPlaying, 0) > 0
		);
	}

	// Returns a list of all active tweens with the given id.
	// Returns NULL if there are no active tweens with the given id.
	// Beware: each time you call this method a new list is generated
	// "playingOnly" - If TRUE returns only the tweens with the given ID that are currently playing
	// "fillableList" - If NULL creates a new list, otherwise clears and fills this one (and thus saves allocations)
	public static tweensById(id: any, playingOnly: boolean = false, fillableList: Array<saykit.Tween> = null): Array<saykit.Tween> {
		if (id == null) return null;

		if (fillableList != null) fillableList = [];
		return saykit.TweenManager.getTweensById(id, playingOnly, fillableList);
	}

	//#endregion Global Info Getters

	// METHODS
	private static _initCheck(): void {
		if (SKDOTween.initialized) return;

		SKDOTween.autoInit();
	}

	public static applyTo<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		getter: () => T1,
		setter: (value: T1) => void,
		endValue: T2,
		duration: number,
		plugin = null
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		SKDOTween._initCheck();
		let tweener: saykit.TweenerCore<T1, T2, TPlugOptions> = saykit.TweenManager.getTweener<T1, T2, TPlugOptions>();
		let setupSuccessful: boolean = saykit.Tweener.setup(tweener, getter, setter, endValue, duration, plugin);
		if (!setupSuccessful) {
			saykit.TweenManager.despawn(tweener);
			return null;
		}
		return tweener;
	}
}

saykit.DOTween = SKDOTween;
