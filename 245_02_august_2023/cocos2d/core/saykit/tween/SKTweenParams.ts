const { ccclass } = cc._decorator;

@ccclass("saykit.TweenParams")
export default class SKTweenParams {
	public id: any;
	public updateType: saykit.UpdateType;
	public isIndependentUpdate: boolean;

	public onStartCallback: Function;
	public onPlayCallback: Function;
	public onPauseCallback: Function;
	public onRewindCallback: Function;
	public onUpdateCallback: Function;
	public onStepCompleteCallback: Function;
	public onCompleteCallback: Function;
	public onKillCallback: Function;

	public isRecyclable: boolean;
	public isSpeedBased: boolean;
	public autoStart: boolean;
	public autoKill: boolean;
	public loops: number;
	public loopType: saykit.LoopType;
	public delay: number;
	public isRelative: boolean;
	public easeType: Function;
	public snapping: boolean;

	constructor() {
		this.clear();
	}

	//#region Methods

	// clears and resets this TweenParams instance using default values,
	// so it can be reused without instantiating another one
	public clear(): saykit.TweenParams {
		this.id = null;
		this.updateType = saykit.DOTween.defaultUpdateType;
		this.isIndependentUpdate = saykit.DOTween.defaultTimeScaleIndependent;
		this.onStartCallback =
			this.onPlayCallback =
			this.onRewindCallback =
			this.onUpdateCallback =
			this.onStepCompleteCallback =
			this.onCompleteCallback =
			this.onKillCallback =
				null;
		this.isRecyclable = saykit.DOTween.defaultRecyclable;
		this.isSpeedBased = false;
		this.autoStart = true;
		this.autoKill = saykit.DOTween.defaultAutoKill;
		this.loops = 1;
		this.loopType = saykit.DOTween.defaultLoopType;
		this.delay = 0;
		this.isRelative = false;
		this.easeType = cc.easing.linear;
		this.snapping = false;

		return this;
	}

	//#endregion Methods
}

saykit.TweenParams = SKTweenParams;
