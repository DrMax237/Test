const { ccclass, property, menu } = cc._decorator;

enum UiScreenType {
	None = 0,
	Start = 1,
	Ingame = 2,
	Result = 3,
	Tutorial = 4,
	AlwaysOn = 5,
	Redirect = 6,
}

cc.Enum(UiScreenType);

saykit.GameEvent.UI_SCREEN_TOGGLE = "UI_SCREEN_TOGGLE";

@ccclass("saykit.UiScreen")
@menu("Ui/Screen")
export class SKUiScreen extends cc.Component {
	//#region type
	@property(cc.Boolean)
	get isCustomType(): boolean {
		return this._isCustomType;
	}
	set isCustomType(value: boolean) {
		this._isCustomType = value;

		if (!this._isCustomType && UiScreenType[this._typeKey] === undefined) {
			this._typeKey = UiScreenType[UiScreenType.None];
		}
	}
	@property({
		type: cc.String,
		visible() {
			return this.isCustomType;
		},
	})
	get customType(): string {
		return this._typeKey;
	}
	set customType(value: string) {
		this._typeKey = value;
	}
	@property({
		type: UiScreenType,
		visible() {
			return !this.isCustomType;
		},
	})
	get basicType(): UiScreenType {
		if (this.isCustomType) return UiScreenType.None;

		return UiScreenType[this._typeKey];
	}
	set basicType(value: UiScreenType) {
		this._typeKey = UiScreenType[value];
	}
	@property({ type: UiScreenType, visible: false })
	get type(): UiScreenType {
		return UiScreenType[this._typeKey];
	}
	//#endregion type

	//#region input
	@property(cc.Boolean)
	get isInput(): boolean {
		return this._isInput;
	}
	set isInput(value: boolean) {
		this._isInput = value;
		this._checkInput();
	}
	//#endregion input

	//#region active
	@property(cc.Boolean)
	get active(): boolean {
		return this._active;
	}
	set active(value: boolean) {
		this._toggle(value);
	}
	//#endregion active

	@property(cc.Boolean)
	get REFRESH_LIST(): boolean {
		return false;
	}
	set REFRESH_LIST(value: boolean) {
		this._REFRESH_LIST();
	}

	@property([cc.Prefab]) uiElements: any[] = [];

	@property(cc.Boolean) private _isCustomType: boolean = false;
	@property(cc.Boolean) private _active: boolean = true;
	@property(cc.Boolean) private _isInput: boolean = false;
	@property(cc.String) private _typeKey: string = "None";

	private _uiElements: saykit.UiElement[] = [];
	private _inputCatcher: saykit.InputCatcher = null;
	private _resize: any = null;

	static readonly UiScreenType = UiScreenType;

	//#region LifeCycle

	onLoad() {
		this._checkInput();
		this._getUiElements();
		this._createUiElements();

		cc.systemEvent.on(saykit.GameEvent.UI_SCREEN_TOGGLE, this.onUiScreenToggle, this);
	}
	onEnable() {}
	onDisable() {}
	start() {
		this.node.active = this.active;
	}
	//#endregion

	//#region Public
	public toggleInput(isOn: boolean): void {
		if (this._inputCatcher) this._inputCatcher.enabled = isOn;
	}
	public toggleUiElements(isOn: boolean, isInstant: boolean, callback: (isOn: boolean, screen: SKUiScreen) => void): void {
		const elements = this._uiElements;
		const elementsCount = elements.length;
		let toggledCount = 0;

		if (elementsCount === 0) {
			callback && callback(isOn, this);
		} else {
			for (let e of elements) {
				if (!e) continue;

				const compete = () => {
					toggledCount += 1;
					if (toggledCount === elementsCount) callback && callback(isOn, this);
				};

				if (!e.toggleWithScreen) {
					compete();
				} else {
					if (e.active !== isOn) {
						e.toggle(isOn, isInstant, compete);
					} else {
						compete();
					}
				}
			}
		}
	}
	public getUiElements(): saykit.UiElement[] {
		return [...this._uiElements];
	}
	//#endregion Public

	//#region Private
	private _REFRESH_LIST(): void {
		this.uiElements = this.uiElements.filter((element) => element instanceof cc.Prefab);
	}
	private _checkInput(): void {
		if (this._isInput) {
			this._addInputCatcher();
			this._addResize();
		} else {
			this._resize && this._resize.destroy();
			this._resize = null;

			this._inputCatcher && this._inputCatcher.destroy();
			this._inputCatcher = null;
		}
	}
	private _createUiElements(): void {
		this._destroyUiElements();

		for (let prefab of this.uiElements) {
			if (!prefab) continue;

			const node = cc.instantiate(prefab);
			node.setParent(this.node);
			const uiElement = node.getComponent(saykit.UiElement);

			uiElement && this._uiElements.push(uiElement);
		}
	}
	private _getUiElements(): void {
		const elements = [];

		for (let child of this.node.children) {
			if (!child) continue;

			const uiElement = child.getComponent(saykit.UiElement);

			uiElement && elements.push(uiElement);
		}

		this._uiElements.push(...elements);
	}
	private _destroyUiElements(): void {
		for (let element of this._uiElements) {
			element && element.node && element.node.destroy();
		}

		this._uiElements.length = 0;
	}
	private _addInputCatcher(): void {
		this._inputCatcher = this.getComponent(saykit.InputCatcher) || this.addComponent(saykit.InputCatcher);
	}
	private _addResize(): void {
		const resize = this.getComponent(saykit.Resize) || this.addComponent(saykit.Resize);

		resize.isChangingPosition = false;
		resize.isChangingScale = false;
		resize.isChangingSize = true;

		resize.size.valueType = 1;

		const UniversalSize = saykit.ResizeValueTypes.SizeUniversalValue;
		const value = resize.size.value as saykit.SKSizeUniversalValue;
		value.portrait = cc.size(2, 2);
		value.landscape = cc.size(2, 2);

		this._resize = resize;
	}
	private _getUiScreenCommand(): saykit.UiScreenCommand {
		if (!saykit.UiScreenCommands) return null;

		const command: saykit.UiScreenCommand = saykit.UiScreenCommands[UiScreenType[this.type]] || saykit.UiScreenCommands.Default;

		return command;
	}
	private _toggle(isOn: boolean, isInstant: boolean = false, callback: { (): void } | null = null): void {
		if (isOn === this._active) return;

		this._active = isOn;

		if (CC_EDITOR) return;

		const command = this._getUiScreenCommand();

		if (!command) return;

		if (this._active) {
			command.onScreenEnable(this, isInstant, callback);
		} else {
			command.onScreenDisable(this, isInstant, callback);
		}
	}
	protected onUiScreenToggle(
		screenType: number | string,
		isOn: boolean,
		isInstant: boolean = false,
		callback: { (): void } | null
	): void {
		switch (typeof screenType) {
			case "string":
				if (screenType !== this._typeKey) return;
				break;
			case "number":
				if (screenType !== this.type) return;
				break;
		}

		this._toggle(isOn, isInstant, callback);
	}
	//#endregion Private
}

saykit.UiScreen = SKUiScreen;
