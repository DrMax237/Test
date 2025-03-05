const { ccclass } = cc._decorator;

@ccclass("saykit.ABSSequentiable")
export class SKABSSequentiable {
	public tweenType: saykit.TweenType;
	public sequencedPosition: number;
	public sequencedEndPosition: number;

	public onStartCallback: Function;

	constructor(sequencedPosition?: number, callback?: Function) {
		if (callback) {
			this.tweenType = saykit.TweenType.Callback;
			this.onStartCallback = callback;
		}
		if (sequencedPosition) this.sequencedPosition = sequencedPosition;
	}
}

saykit.ABSSequentiable = SKABSSequentiable;
