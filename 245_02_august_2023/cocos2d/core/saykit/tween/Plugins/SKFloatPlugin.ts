const { ccclass } = cc._decorator;

@ccclass("saykit.FloatPlugin")
export default class SKFloatPlugin extends saykit.ABSTweenPlugin<number, number, saykit.FloatOptions> {
	public setFrom(
		t: saykit.TweenerCore<number, number, saykit.FloatOptions>,
		isRelative: boolean,
		fromValue?: number,
		setImmediately: boolean = true
	): void {
		if (fromValue) {
			if (isRelative) {
				let currVal = t.getter();
				t.endValue += currVal;
				fromValue += currVal;
			}
			t.startValue = fromValue;
			if (setImmediately) t.setter(!t.plugOptions.snapping ? fromValue : Math.round(fromValue));
		} else {
			let prevEndVal: number = t.endValue;
			t.endValue = t.getter();
			t.startValue = isRelative ? t.endValue + prevEndVal : prevEndVal;
			t.setter(!t.plugOptions.snapping ? t.startValue : Math.round(t.startValue));
		}
	}
	public convertToStartValue(t: saykit.TweenerCore<number, number, saykit.FloatOptions>, value: number): number {
		return value;
	}
	public setRelativeEndValue(t: saykit.TweenerCore<number, number, saykit.FloatOptions>): void {
		t.endValue += t.startValue;
	}
	public setChangeValue(t: saykit.TweenerCore<number, number, saykit.FloatOptions>): void {
		t.changeValue = t.endValue - t.startValue;
	}
	public getSpeedBasedDuration(options: saykit.FloatOptions, unitsXSecond: number, changeValue: number): number {
		let res: number = changeValue / unitsXSecond;
		if (res < 0) res = -res;
		return res;
	}
	public evaluateAndApply(
		options: saykit.FloatOptions,
		t: saykit.Tween,
		isRelative: boolean,
		getter: () => number,
		setter: (value: number) => void,
		elapsed: number,
		startValue: number,
		changeValue: number,
		duration: number
	): void {
		if (t.loopType == saykit.LoopType.Incremental) startValue += changeValue * (t.isComplete ? t.completedLoops - 1 : t.completedLoops);
		if (t.isSequenced && t.sequenceParent.loopType == saykit.LoopType.Incremental) {
			startValue +=
				changeValue *
				(t.loopType == saykit.LoopType.Incremental ? t.loops : 1) *
				(t.sequenceParent.isComplete ? t.sequenceParent.completedLoops - 1 : t.sequenceParent.completedLoops);
		}

		const value = startValue + changeValue * t.easeType(elapsed / duration);
		setter(!options.snapping ? value : Math.round(value));
	}
	public reset(t: saykit.TweenerCore<number, number, saykit.FloatOptions>): void {}
}

saykit.FloatPlugin = SKFloatPlugin;
