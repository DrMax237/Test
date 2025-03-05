const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.UiCounterLabel")
@menu("Ui/Counters/CounterLabel")
export class SKUiCounterLabel extends saykit.UiCounter {
	@property(cc.Boolean)
	set findLabels(value: boolean) {
		if (!CC_EDITOR) return;

		this._getLabels();
		this._refreshCounter();
	}
	get findLabels(): boolean {
		return false;
	}
	@property([cc.Label]) labels: any[] = [];

	onLoad() {
		super.onLoad();
	}

	//#region Protected
	protected _refreshCounter(): void {
		const text = this._getDisplayedCount();

		for (let label of this.labels) {
			if (!label) continue;

			label.string = text;
		}
	}
	//#endregion Protected

	//#region Private
	private _getLabels(): void {
		const labels = this.node.getComponentsInChildren(cc.Label);

		if (labels) this.labels = labels;
	}
	//#endregion Private
}

saykit.UiCounterLabel = SKUiCounterLabel;
