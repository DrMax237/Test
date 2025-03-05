class SKRedirectInputCommand extends saykit.IInputCommand {
	constructor(manager) {
		super(manager);
	}

	onUp(event, place, target) {
		cc.systemEvent.emit(saykit.GameEvent.REDIRECT, 'game');
	}
}

saykit.inputManager.add('Redirect', SKRedirectInputCommand);
