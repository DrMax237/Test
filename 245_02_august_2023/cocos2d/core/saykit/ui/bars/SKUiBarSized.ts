const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.UiBarSized")
@menu("Ui/Bars/BarSized")
export class SKUiBarSized extends saykit.UiBar {
	//#region Editor Properties
	@property(cc.Node)
	get barFill(): any {
		return this._barFill;
	}
	set barFill(node: any) {
		if (node === this._barFill) return;

		this._barFill = node;
		this.fullSize = node.width;
		this._refreshBar();
	}

	@property(cc.Float) fullSize: number = 100;
	//#endregion Editor Properties

	//#region Protected Properties
	@property(cc.Node) _barFill: any = null;
	//#endregion

	//#region Protected
	protected _refreshBar(): void {
		if (!this.barFill) return;

		this.barFill.width = this._currentProgress * this.fullSize;
	}
	//#endregion Protected
}

saykit.UiBarSized = SKUiBarSized;
