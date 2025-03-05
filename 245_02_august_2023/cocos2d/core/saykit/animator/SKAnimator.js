saykit.GameEvent.ANIMATOR_SWITCH_COMPONENT = "ANIMATOR_SWITCH_COMPONENT";
saykit.GameEvent.ANIMATOR_SWITCH_STATE = "ANIMATOR_SWITCH_STATE";

const SKAnimator = cc.Class({
	name: "saykit.Animator",
	extends: cc.Component,

	editor: CC_EDITOR && {
		menu: "SayKit/Animator",
	},

	properties: {
		_EDITING: {
			default: false,
			editorOnly: true,
		},
		EDITING: {
			get() {
				return this._EDITING;
			},
			set(value) {
				this._EDITING = value;

				if (this.EDITING) {
					this.__editor =
						this.node.getComponent(saykit.EditorClipList) ||
						this.node.addComponent(saykit.EditorClipList);

					this.__editor.__animator = this;
					this.node._components.unshift(this.node._components.pop());
				} else {
					this.node.removeComponent(saykit.EditorClipList);
					this.__editor = null;
				}
			},
		},

		animation: {
			default: null,
			type: cc.Component,
			notify() {
				if (CC_EDITOR) {
					if (this.animation instanceof cc.Component) {
						if (this.animation instanceof cc.Animation) return;

						this.animation =
							this.node.getComponent(cc.Animation) || null;
					}

					return;
				}

				this.node.emit(
					saykit.GameEvent.ANIMATOR_SWITCH_COMPONENT,
					this.animation,
					this
				);
			},
		},

		state: {
			default: null,
			serializable: false,
			visible: false,
			type: saykit.AnimatorState,
			notify() {
				if (CC_EDITOR) return;

				this.node.emit(
					saykit.GameEvent.ANIMATOR_SWITCH_STATE,
					this.state,
					this
				);
			},
		},

		clipList: {
			default: {},
			visible: false,
		},
	},
	onLoad() {
		this._subscribeToEvents(true);
	},
	onEnable() {
		this._subscribeToEvents(true);
	},
	onDisable() {
		this._subscribeToEvents(false);
	},

	update(dt) {
		this._process(dt, true);
	},

	play(stateData, funcCreateState) {
		let state = null;

		switch (true) {
			case stateData instanceof saykit.AnimatorState:
				state = stateData;
				break;

			case funcCreateState instanceof Function:
				state = new funcCreateState(this, stateData);
				break;

			case typeof stateData === "string":
				state = new saykit.BasicAnimatorState(this, { key: stateData });
				break;

			case (stateData instanceof Object && stateData.type === "basic") ||
				stateData.type === undefined:
				state = new saykit.BasicAnimatorState(this, stateData);
				break;

			case stateData instanceof Object && stateData.type === "transition":
				state = new saykit.TransitionAnimatorState(this, stateData);
				break;
		}

		this.state = state;
		this._process(0);

		return state;
	},
	stop() {
		this.state = null;
	},
	getClip(key) {
		return this.clipList[key] || null;
	},

	_process(time, isAutoUpdate = false) {
		const state = this.state;

		if (state instanceof saykit.AnimatorState) {
			if (isAutoUpdate) {
				if (!state.isAutoUpdate) return;
			}

			state.process(time);
		}
	},
	_subscribeToEvents(isOn) {
		const func = isOn ? "on" : "off";

		this.node[func](
			saykit.GameEvent.ANIMATOR_SWITCH_STATE,
			this.onSwitchState,
			this
		);
		this.node[func](
			saykit.GameEvent.ANIMATOR_SWITCH_COMPONENT,
			this._onSwitchComponent,
			this
		);
	},

	onSwitchState() {},
	_onSwitchComponent(animation) {
		this.state instanceof saykit.AnimatorState &&
			this.state.onRefreshAnimation(this, animation);
		this.onSwitchComponent();
	},
	onSwitchComponent(animation) {},
});

saykit.Animator = module.exports = SKAnimator;
