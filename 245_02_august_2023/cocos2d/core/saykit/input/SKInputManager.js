class SKInputManager {
	constructor() {
		if (this.constructor.instance) return this.constructor.instance;
		this.constructor.instance = this;

		this.touches = [];
		this.commands = {};
		this.lastTapTime = 0;

		cc.systemEvent.on(saykit.GameEvent.INPUT, this.onInput, this);
		cc.director.on(cc.Director.EVENT_AFTER_UPDATE, this.onLateUpdate, this);
	}

	add(key, protoOrCommand) {
		const command = (protoOrCommand instanceof Function && new protoOrCommand(this)) || protoOrCommand;

		this.commands[key] = command;
		this.commands[saykit.InputSource[key]] = command;
	}

	onInput(type, source, event, place, target) {
		const command = this.commands[source];

		this.lastTapTime = 0;

		switch (type) {
			case saykit.InputType.Down:
				command && command._onDown(event, place, target);

				break;

			case saykit.InputType.Move:
				command && command._onMove(event, place, target);

				break;

			case saykit.InputType.Up:
				command && command._onUp(event, place, target);

				break;

			case saykit.InputType.Cancel:
				command && command._onCancel(event, place, target);

				break;
		}
	}

	onLateUpdate() {
		this.lastTapTime += cc.director.getDeltaTime();
	}
}

module.export = saykit.inputManager = new SKInputManager();
