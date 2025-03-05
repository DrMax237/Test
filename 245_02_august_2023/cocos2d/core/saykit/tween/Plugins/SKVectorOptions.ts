const { ccclass } = cc._decorator;

@ccclass("saykit.VectorOptions")
export class SKVectorOptions extends saykit.IPlugOptions {
	public axisConstraint: saykit.AxisConstraint;
	public snapping: boolean = false;

	public reset(): void {
		this.axisConstraint = saykit.AxisConstraint.None;
		this.snapping = false;
	}
}

saykit.VectorOptions = SKVectorOptions;
