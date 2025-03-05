const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.UiBarFilled")
@menu("Ui/Bars/BarFilled")
export class SKUiBarFilled extends saykit.UiBar {
	//#region Editor Properties
	@property(cc.Sprite)
	get barFill(): any {
		return this._barFill;
	}
	set barFill(sprite: any) {
		if (sprite === this._barFill) return;

		this._barFill = sprite;
		this._refreshBar();
	}

	@property(cc.Sprite) _barFill: any = null;

	@property(cc.Float) fillMin: number = 0;
	@property(cc.Float) fillMax: number = 1;
	//#endregion Editor Properties

	//#region Protected Properties
	//#endregion

	//#region Protected
	protected _refreshBar(): void {
		if (!this.barFill) return;

		this.barFill.fillStart = this.fillMin;
		this.barFill.fillRange = this._currentProgress * (this.fillMax - this.fillMin) + this.fillMin;
	}
	//#endregion Protected
}

saykit.UiBarFilled = SKUiBarFilled;
