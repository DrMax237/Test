const { ccclass } = cc._decorator;

@ccclass("saykit.ArrayPlugin")
export default class SKArrayPlugin extends saykit.ABSTweenPlugin<any, any, saykit.FloatOptions> {
	public setFrom(
		t: saykit.TweenerCore<any, any, saykit.FloatOptions>,
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
	public convertToStartValue(t: saykit.TweenerCore<any, any, saykit.FloatOptions>, value: any): number {
		return value;
	}
	public setRelativeEndValue(t: saykit.TweenerCore<any, any, saykit.FloatOptions>): void {
		for (let i = 0; i < t.endValue.length; i++) {
			t.endValue[i] += t.startValue[i];
		}
	}
	public setChangeValue(t: saykit.TweenerCore<any, any, saykit.FloatOptions>): void {
		t.changeValue = [];
		for (let i = 0; i < t.endValue.length; i++) {
			t.changeValue[i] = t.endValue[i] - t.startValue[i];
		}
	}
	public getSpeedBasedDuration(options: saykit.FloatOptions, unitsXSecond: number, changeValue: number): number {
		let res: number = changeValue / unitsXSecond;
		if (res < 0) res = -res;
		return res;
	}
	public evaluateAndApply(
		options: saykit.FloatOptions,
		t: saykit.TweenerCore<any, any, saykit.FloatOptions>,
		isRelative: boolean,
		getter,
		setter,
		elapsed: number,
		startValue: any,
		changeValue: any,
		duration: number
	): void {
		if (t.loopType == saykit.LoopType.Incremental)
			for (let i = 0; i < t.endValue.length; i++) {
				startValue[i] += changeValue[i] * (t.isComplete ? t.completedLoops - 1 : t.completedLoops);
			}
		if (t.isSequenced && t.sequenceParent.loopType == saykit.LoopType.Incremental) {
			for (let i = 0; i < t.endValue.length; i++) {
				startValue[i] +=
					changeValue[i] *
					(t.loopType == saykit.LoopType.Incremental ? t.loops : 1) *
					(t.sequenceParent.isComplete ? t.sequenceParent.completedLoops - 1 : t.sequenceParent.completedLoops);
			}
		}

		let values = [];
		for (let i = 0; i < t.endValue.length; i++) {
			values.push(startValue[i] + changeValue[i] * t.easeType(elapsed / duration));
		}
		if (options.snapping)
			for (let i = 0; i < values.length; i++) {
				values[i] = Math.round(values[i]);
			}
		setter(values);
	}
	public reset(t: saykit.TweenerCore<any, any, saykit.FloatOptions>): void {}
}

saykit.ArrayPlugin = SKArrayPlugin;
