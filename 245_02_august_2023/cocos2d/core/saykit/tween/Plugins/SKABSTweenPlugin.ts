const { ccclass } = cc._decorator;

@ccclass("saykit.ABSTweenPlugin")
export abstract class SKABSTweenPlugin<T1, T2, TPlugOptions extends saykit.IPlugOptions> {
	public abstract reset(t: saykit.TweenerCore<T1, T2, TPlugOptions>): void; // resets specific TweenerCore stuff, not the plugin itself
	public abstract setFrom(
		t: saykit.TweenerCore<T1, T2, TPlugOptions>,
		isRelative: boolean,
		fromValue?: T2,
		setImmediately?: boolean
	): void;
	public abstract convertToStartValue(t: saykit.TweenerCore<T1, T2, TPlugOptions>, value: T1): T2;
	public abstract setRelativeEndValue(t: saykit.TweenerCore<T1, T2, TPlugOptions>): void;
	public abstract setChangeValue(t: saykit.TweenerCore<T1, T2, TPlugOptions>): void;
	public abstract getSpeedBasedDuration(options: TPlugOptions, unitsXSecond: number, changeValue: T2): number;
	public abstract evaluateAndApply(
		options: TPlugOptions,
		t: saykit.Tween,
		isRelative: boolean,
		getter: () => T1,
		setter: (value: T1) => void,
		elapsed: number,
		startValue: T2,
		changeValue: T2,
		duration: number
	): void;
}

saykit.ABSTweenPlugin = SKABSTweenPlugin;
