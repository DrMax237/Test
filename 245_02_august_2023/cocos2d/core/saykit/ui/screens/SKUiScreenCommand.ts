export default class SKUiScreenCommand {
	protected _toggleCallback: { (): void } | null;

	constructor() {
		this._toggleCallback = null;
	}

	public onScreenEnable(screen: saykit.UiScreen, isInstant: boolean, callback: { (): void } | null): void {
		this._toggleCallback = callback;
		screen.node.active = true;
		screen.toggleInput(true);
		screen.toggleUiElements(true, isInstant, () => {
			this.onAllElementsToggled(true, screen);
		});

		this._onScreenEnable(screen, isInstant);
	}
	public onScreenDisable(screen: saykit.UiScreen, isInstant: boolean, callback: { (): void } | null): void {
		this._toggleCallback = callback;
		screen.toggleInput(false);
		screen.toggleUiElements(false, isInstant, () => {
			this.onAllElementsToggled(false, screen);
		});

		this._onScreenDisable(screen, isInstant);
	}
	public onAllElementsToggled(isOn: boolean, screen: saykit.UiScreen): void {
		!isOn && (screen.node.active = false);

		this._toggleCallback && this._toggleCallback();
	}

	protected _onScreenEnable(screen: saykit.UiScreen, isInstant: boolean): void {}
	protected _onScreenDisable(screen: saykit.UiScreen, isInstant: boolean): void {}
}

saykit.UiScreenCommand = SKUiScreenCommand;
saykit.UiScreenCommands = {
	Default: new SKUiScreenCommand(),
};
