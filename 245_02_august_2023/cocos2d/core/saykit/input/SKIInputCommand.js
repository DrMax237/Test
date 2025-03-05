class SKInputTouchInfo {
	constructor(event) {
		this.time = cc.director.getTotalTime() / 1000;
		this.location = event.touch.getLocation();
		this.worldPositions = {};

		for (let i in cc.Camera.cameras) {
			const camera = cc.Camera.cameras[i];
			this.worldPositions[camera.node.name] = camera.getScreenToWorldPoint(this.location);
		}

		this.worldPosition = this.worldPositions['Main Camera'];
	}
}

class SKInputTouch {
	constructor(id, event) {
		event.touch.__id = id;

		this.touchId = id;
		this.eventId = event.getID();

		this.down = new SKInputTouchInfo(event);
		this.last = new SKInputTouchInfo(event);
		this.current = new SKInputTouchInfo(event);
	}

	get id() {
		return this.eventId;
	}
	get _id() {
		return this.touchId;
	}

	refresh(event) {
		this.last = this.current;
		this.current = new SKInputTouchInfo(event);
	}

	static create(event) {
		const touches = SKInputTouch.touches;
		let id = touches.indexOf(null);

		if (id === -1) {
			id = touches.length;
			touches.push(null);
		}

		const touch = new SKInputTouch(id, event);
		touches[id] = touch;

		return touch;
	}
	static destroy(event) {
		SKInputTouch.touches[event.touch.__id] = null;
	}
	static refresh(event) {
		const touch = SKInputTouch.touches[event.touch.__id];

		touch && touch.refresh(event);

		return touch;
	}
	static get touches() {
		return saykit.inputManager.touches;
	}
}

class SKIInputCommand {
	constructor(manager) {
		this._currentTouch = null;
	}

	get touch() {
		return this._currentTouch;
	}
	set touch(value) {
		this._currentTouch = value;
	}

	_onDown(event, place, target) {
		this.onDown(SKInputTouch.create(event), place, target);
	}
	_onMove(event, place, target) {
		this.onMove(SKInputTouch.refresh(event), place, target);
	}
	_onUp(event, place, target) {
		this.onUp(SKInputTouch.refresh(event), place, target);
		SKInputTouch.destroy(event);
	}
	_onCancel(event, place, target) {
		this.onCancel(SKInputTouch.refresh(event), place, target);
		SKInputTouch.destroy(event);
	}

	onDown(touch, place, target) {}
	onMove(touch, place, target) {}
	onUp(touch, place, target) {}
	onCancel(touch, place, target) {}
}

saykit.InputTouchInfo = module.exports = SKInputTouchInfo;
saykit.InputTouch = module.exports = SKInputTouch;
saykit.IInputCommand = module.exports = SKIInputCommand;
