const { ccclass, property, menu } = cc._decorator;

saykit.GameEvent.VIRTUAL_JOYSTICK_PLACE = "VIRTUAL_JOYSTICK_PLACE";
saykit.GameEvent.VIRTUAL_JOYSTICK_MOVE = "VIRTUAL_JOYSTICK_MOVE";
saykit.GameEvent.VIRTUAL_JOYSTICK_RETURN = "VIRTUAL_JOYSTICK_RETURN";
saykit.GameEvent.VIRTUAL_JOYSTICK_LOCK = "VIRTUAL_JOYSTICK_LOCK";

@ccclass("saykit.VirtualJoystick")
@menu("Ui/VirtualJoystick")
export class SKVirtualJoystick extends saykit.AnimatedUiElement {
	//#region Editor Properties
	@property(cc.Boolean) resetOnLock: boolean = true;
	@property(cc.Boolean) returnOnLock: boolean = false;
	@property(cc.String) dispatchedEvent: string = "PLAYER_MOVE";
	@property(cc.Float) rangeValue: number = 1;
	@property(cc.Node) stick: any = null;
	@property(cc.Node)
	set pad(value: any) {
		this._pad = value;

		this._setSize();
	}
	get pad(): any {
		return this._pad;
	}
	//#endregion Editor Properties

	//#region Protected Properties
	@property(cc.Node) protected _pad: any = null;

	set value(value: any) {
		this._value.set(value);

		this._onValueChange();
	}
	get value(): any {
		return this._value.clone();
	}

	set isLocked(value: boolean) {
		this._isLocked = value;

		if (this._isLocked) {
			this._returnJoystick();
			this._updateValue();
		}
	}
	get isLocked(): boolean {
		return this._isLocked;
	}

	protected _value: any = cc.Vec2.ZERO;
	protected _isLocked: boolean = false;
	//#endregion Protected Properties

	//#region LifeCycle
	onLoad() {
		super.onLoad();

		this._setSize();
	}
	onEnable() {
		this._subscribeToEvents(true);
	}
	onDsiable() {
		this._subscribeToEvents(false);
	}
	//#endregion

	//#region Protected
	protected _setSize(): void {
		if (this.pad) {
			this.node.width = this.pad.width;
			this.node.height = this.pad.height;
		}
	}
	protected _placeJoystick(worldPosition: any): void {
		const position = this.node.convertToNodeSpaceAR(worldPosition);

		this.pad && this.pad.setPosition(position);
		this.stick && this.stick.setPosition(position);
	}
	protected _resetStick(): void {
		this.pad && this.stick && this.stick.setPosition(this.pad.position);
	}
	protected _moveStick(worldPosition: any) {
		const position = this.node.convertToNodeSpaceAR(worldPosition);

		this.stick && this.stick.setPosition(position);
	}
	protected _clampStick() {
		if (!this.stick || !this.pad) return;

		const maxDistance = this.pad.width * Math.abs(this.pad.scaleX) * 0.5 * this.rangeValue;
		const maxDistanceSqr = maxDistance * maxDistance;
		const stickVector = cc.v2(this.stick.position).sub(cc.v2(this.pad.position));
		const stickDistanceSqr = stickVector.magSqr();

		if (stickDistanceSqr > maxDistanceSqr) {
			stickVector.normalizeSelf().mulSelf(maxDistance);
			const stickPosition = cc.v2(this.pad.position).add(stickVector);

			this.stick && this.stick.setPosition(stickPosition);
		}
	}
	protected _updateValue() {
		if (!this.stick || !this.pad) return;

		const maxDistance = this.pad.width * Math.abs(this.pad.scaleX) * 0.5 * this.rangeValue;
		const stickVector = cc.v2(this.stick.position).sub(cc.v2(this.pad.position));

		this.value = stickVector.div(maxDistance);
	}
	protected _returnJoystick() {
		this.pad && this.pad.setPosition(0, 0);
		this.stick && this.stick.setPosition(0, 0);
	}
	protected _onValueChange(): void {
		this.dispatchedEvent && cc.systemEvent.emit(this.dispatchedEvent, this.value);
	}
	//#endregion Protected

	//#region Private
	private _subscribeToEvents(isOn: boolean): void {
		const func = isOn ? "on" : "off";

		this.node[func](saykit.GameEvent.VIRTUAL_JOYSTICK_PLACE, this.onVirtualJoystickPlace, this);
		this.node[func](saykit.GameEvent.VIRTUAL_JOYSTICK_MOVE, this.onVirtualJoystickMove, this);
		this.node[func](saykit.GameEvent.VIRTUAL_JOYSTICK_RETURN, this.onVirtualJoystickReturn, this);
		this.node[func](saykit.GameEvent.VIRTUAL_JOYSTICK_LOCK, this.onVirtualJoystickLock, this);

		cc.systemEvent[func](saykit.GameEvent.VIRTUAL_JOYSTICK_PLACE, this.onVirtualJoystickPlace, this);
		cc.systemEvent[func](saykit.GameEvent.VIRTUAL_JOYSTICK_MOVE, this.onVirtualJoystickMove, this);
		cc.systemEvent[func](saykit.GameEvent.VIRTUAL_JOYSTICK_RETURN, this.onVirtualJoystickReturn, this);
		cc.systemEvent[func](saykit.GameEvent.VIRTUAL_JOYSTICK_LOCK, this.onVirtualJoystickLock, this);

		cc.systemEvent[func](saykit.Event.SIZE_CHANGE, this.onSizeChange, this);
	}
	//#endregion Private

	//#region Events Handlers
	protected onVirtualJoystickPlace(worldPosition: any): void {
		if (this.isLocked) return;

		this._placeJoystick(worldPosition);
	}
	protected onVirtualJoystickMove(worldPosition: any): void {
		if (this.isLocked) return;

		this._moveStick(worldPosition);
		this._clampStick();
		this._updateValue();
	}
	protected onVirtualJoystickReturn(): void {
		this._returnJoystick();
		this._updateValue();
	}
	protected onVirtualJoystickLock(isLock: boolean): void {
		this.isLocked = isLock;
	}
	protected onSizeChange(): void {
		this._returnJoystick();
		this._updateValue();
	}
	//#endregion Events Handlers
}

saykit.VirtualJoystick = SKVirtualJoystick;
