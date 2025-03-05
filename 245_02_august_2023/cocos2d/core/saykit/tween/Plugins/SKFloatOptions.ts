const { ccclass } = cc._decorator;

@ccclass("saykit.FloatOptions")
export class SKFloatOptions extends saykit.IPlugOptions {
	public snapping: boolean = false;

	public reset(): void {
		this.snapping = false;
	}
}

saykit.FloatOptions = SKFloatOptions;
