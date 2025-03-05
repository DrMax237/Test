const { ccclass, property, menu } = cc._decorator;

saykit.GameEvent.UI_ELEMENT_TOGGLE = "UI_ELEMENT_TOGGLE";

@ccclass("saykit.UiElement")
@menu("Ui/Elements/UiElement")
export class SKUiElement extends cc.Component {
	//#region Editor Properties
	@property(cc.Boolean) toggleWithScreen: boolean = true;
	@property(cc.Boolean) activeOnStart: boolean = false;
	@property(cc.Boolean) skipShow: boolean = false;
	@property(cc.Boolean) skipHide: boolean = false;
	@property(cc.Boolean) stopIdleOnHide: boolean = true;

	@property(cc.String)
	get key(): string {
		return this.node.name;
	}
	//#endregion Editor Properties

	//#region Public Properties
	public active: boolean = null;
	//#endregion Public Properties

	//#region Protected Properties
	protected _isToggling: boolean = false;
	//#endregion Protected Properties

	//#region Lifecycle
	onLoad() {
		this.node.on(saykit.GameEvent.UI_ELEMENT_TOGGLE, this.onUiElementToggle, this);

		cc.systemEvent.on(saykit.GameEvent.UI_ELEMENT_TOGGLE, this.onUiElementToggleByKey, this);

		this._setActiveOnStart();
	}

	//#endregion Lifecycle

	//#region Public
	public toggle(isOn: boolean, isInstant: boolean = false, callback: () => void = null): void {
		if (this.active === isOn) return;
		if (this.node.parent && !(this.node.parent instanceof cc.Scene) && !this.node.parent.active && isOn) return;

		this.active = isOn;

		if (isOn) {
			this._enableElement(isInstant, callback);
		} else {
			this._disableElement(isInstant, callback);
		}
	}
	//#endregion Public

	//#region Protected
	protected _enableElement(isInstant: boolean = false, callback: () => void = null): void {
		this.node.active = true;

		callback && callback();
	}
	protected _disableElement(isInstant: boolean = false, callback: () => void = null): void {
		this.node.active = false;

		callback && callback();
	}

	protected _onShowEnd(): void {}
	protected _onIdleEnd(): void {}
	protected _onHideEnd(): void {}
	//#endregion Protected

	//#region private
	private _setActiveOnStart(): void {
		// this.node.active = this.activeOnStart;
		this.toggle(this.activeOnStart, true);
	}
	//#endregion

	//#region Event Handlers
	protected onUiElementToggle(isOn: boolean, isInstant = false, callback: () => void): void {
		this.toggle(isOn, isInstant, callback);
	}
	protected onUiElementToggleByKey(key: string, isOn: boolean, isInstant = false, callback: () => void): void {
		if (key !== this.key) return;

		this.toggle(isOn, isInstant, callback);
	}
	//#endregion Event Handlers
}

saykit.UiElement = SKUiElement;
