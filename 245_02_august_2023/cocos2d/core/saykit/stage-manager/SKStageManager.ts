saykit.GameEvent.STAGE_ADD_SCREENS = "STAGE_ADD_SCREENS";
saykit.GameEvent.STAGE_ADD_ELEMENTS = "STAGE_ADD_ELEMENTS";

saykit.GameEvent.SWITCH_STAGE = "SWITCH_STAGE";
saykit.GameEvent.START_NEXT_STAGE = "START_NEXT_STAGE";
saykit.GameEvent.RESTART_STAGE = "RESTART_STAGE";

saykit.GameEvent.START_STAGE = "START_STAGE";

enum CallbackType {
	Property = "property",
	Function = "function",
	Event = "event",
}
interface ICallbackData {
	timeout: number;
	target: string;

	type: CallbackType.Property | CallbackType.Function | CallbackType.Event;
	key: string;

	value?: any;
	args: any[];
}
interface ISubscriptionData {
	desc?: string;

	function: string;
	event?: string;
	arguments?: string;
}
interface IStageData {
	screens?: string[];
	elements?: string[];

	callbacks?: ICallbackData[];
	subscriptions?: ISubscriptionData[];
}
interface ISubscription {
	id: number;
	event: string | undefined;
	callback: Function;
}

export class SKStageManager {
	public screens: string[] = [];
	public elements: string[] = [];

	private _subscriptions: Record<number, ISubscription> = {};
	private _subscribeID: number = 0;

	private _stageQueue: string[] = [];
	private _stages: Record<string, IStageData> = {};

	private get currentStageIndex(): number {
		return this._currentStageIndex;
	}
	private set currentStageIndex(value: number) {
		cc.systemEvent.emit(saykit.GameEvent.SWITCH_STAGE, this._currentStageIndex, value);

		this._currentStageIndex = value;
	}
	private _currentStageIndex: number = -1;

	constructor() {
		this._subscribeToEvents();
	}

	/**
	!#en Start Previous Stage
    */
	public startPrevStage(): void {
		this.currentStageIndex = Math.max(0, this.currentStageIndex - 1);
		this._setStage();
	}
	/**
	!#en Start Next Stage
    */
	public startNextStage(): void {
		this.currentStageIndex = Math.min(this._stageQueue.length, this.currentStageIndex + 1);
		this._setStage();
	}
	/**
	!#en Restart Stage
    */
	public restartStage(): void {
		this.currentStageIndex = this.currentStageIndex;
		this._setStage();
	}
	/**
	!#en Add screens
	@param keyScreens - String Key Screens, you can send String[] or use many paramentrs
	*/
	public addScreens(keyScreens: string | string[], ...otherKeyScreens: string[]): void {
		const screens = [...(keyScreens as string[]), ...otherKeyScreens];

		for (let screen of screens) {
			if (typeof screen !== "number" && typeof screen !== "string") continue;
			if (this.screens.indexOf(screen) === -1) this.screens.push(screen);
		}
	}
	/**
	!#en Add Elements
	@param keyElements - String Key Elements, you can send String[] or use many paramentrs
	*/
	public addElements(keyElements: string | string[], ...otherKeyElements: string[]): void {
		const elements = [...(keyElements as string[]), ...otherKeyElements];

		for (let element of elements) {
			if (typeof element !== "number" && typeof element !== "string") continue;
			if (this.elements.indexOf(element) === -1) this.elements.push(element);
		}
	}

	private _subscribeToEvents(): void {
		cc.systemEvent.on(saykit.GameEvent.STAGE_ADD_SCREENS, this.onAddScreens, this);
		cc.systemEvent.on(saykit.GameEvent.STAGE_ADD_ELEMENTS, this.onAddElements, this);

		cc.systemEvent.on(saykit.GameEvent.START_NEXT_STAGE, this.onStartNextStage, this);
		cc.systemEvent.on(saykit.GameEvent.RESTART_STAGE, this.onRestartStage, this);

		cc.systemEvent.on(saykit.GameEvent.START_STAGE, this.onStartStage, this);

		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onDebug, this);

		cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLaunch, this);
	}
	private _init(): void {
		if (CC_EDITOR) return;

		if (!spVars) {
			cc.error("StageManager:>> spVars not detected");
			return;
		}
		if (!spVars["stages"]) {
			cc.error('StageManager:>> Not found "stages" property in Config.json.js');
			return;
		}
		if (!spVars["stages"].value) {
			cc.error('StageManager:>> Incorrect value of "stages" property in Config.json.js');
			return;
		}

		const config = spVars["stages"].value;
		const data = config instanceof Object ? config : JSON.parse(config as string);

		this._stageQueue = data.queue;
		this._stages = data;
		delete this._stages.queue;
	}
	private _toggleScreens(screens: string[] = []): void {
		for (let screen of this.screens) {
			const active = screens.indexOf(screen) !== -1;
			cc.systemEvent.emit(saykit.GameEvent.UI_SCREEN_TOGGLE, screen, active);
		}
	}
	private _toggleElements(elements: string[] = []): void {
		for (let element of this.elements) {
			const active = elements.indexOf(element) !== -1;
			cc.systemEvent.emit(saykit.GameEvent.UI_ELEMENT_TOGGLE, element, active);
		}
	}
	private _setCallbacks(callbacks: ICallbackData[] = []): void {
		for (let data of callbacks) {
			let callback = null;
			const target = saykit.dictionary.get(data.target);

			switch (data.type) {
				case CallbackType.Event:
					callback = () => {
						cc.systemEvent.emit(data.key, ...data.args);
					};
					break;
				case CallbackType.Property:
					if (!(target instanceof Object)) continue;

					callback = () => {
						target[data.key] = data.value;
					};
					break;
				default:
					if (!(target instanceof Object) || !(target[data.key] instanceof Function)) continue;

					callback = () => {
						target[data.key](...data.args);
					};
					break;
			}

			if (!callback) continue;

			if (data.timeout > 0) setTimeout(callback, data.timeout);
			else callback();
		}
	}
	private _applyDataSubscriptions(subscriptions: ISubscriptionData[] = []): void {
		for (let id in this._subscriptions) this._createSubscription(false, this._subscriptions[id]);

		for (let data of subscriptions) {
			let func = null;

			try {
				switch (typeof data.function) {
					case "function":
						{
							func = data.function;
						}
						break;
					case "string":
						{
							func = new Function(data.arguments, data.function);
						}
						break;

					default:
						break;
				}
			} catch (error) {
				cc.warn(data.arguments, data.function, error);
			}

			switch (true) {
				case data.event === undefined:
				case data.event === "NONE":
					data.desc && cc.log(data.desc);
					func instanceof Function && func.call(this);

					break;
				default:
					const subscription: ISubscription = {
						id: this._subscribeID++,
						event: data.event,
						callback: () => {},
					};

					subscription.callback = (...args: any[]): void => {
						data.desc && cc.log(data.desc);

						const result: boolean = func instanceof Function && func.call(this, ...args);
						if (result) this._createSubscription(false, subscription);
					};

					this._createSubscription(true, subscription);

					break;
			}
		}
	}
	private _createSubscription(isOn: boolean, subscription: ISubscription): void {
		cc.systemEvent[isOn ? "on" : "off"](subscription.event, subscription.callback);

		if (isOn) this._subscriptions[subscription.id] = subscription;
		else delete this._subscriptions[subscription.id];
	}
	private _setStage(stageData: IStageData = this._stages[this._stageQueue[this._currentStageIndex]]): void {
		if (!stageData) return;

		this._toggleScreens(stageData.screens);
		this._toggleElements(stageData.elements);

		this._setCallbacks(stageData.callbacks);
		this._applyDataSubscriptions(stageData.subscriptions);
	}

	protected onAddScreens(...keyScreens: [string | string[], ...string[]]): void {
		this.addScreens(...keyScreens);
	}
	protected onAddElements(...keyElements: [string | string[], ...string[]]): void {
		this.addElements(...keyElements);
	}
	protected onStartNextStage(): void {
		this.startNextStage();
	}
	protected onStartStage(key: string = this._stageQueue[this._currentStageIndex]): void {
		if (this._stages[key]) {
			this._setStage(this._stages[key]);
		} else {
			cc.warn("StageManager:>>", "stage:", "<" + key + ">", "doesn't exist");
		}
	}
	protected onRestartStage(): void {
		this.restartStage();
	}
	protected onDebug(event: { keyCode: number }): void {
		switch (event.keyCode) {
			case cc.macro.KEY.down:
				cc.log("StageManager:>>", "Debug", "Restart");
				this.restartStage();
				break;
			case cc.macro.KEY.right:
				cc.log("StageManager:>>", "Debug", "Next");
				this.startNextStage();
				break;

			case cc.macro.KEY.left:
				cc.log("StageManager:>>", "Debug", "Prev");
				this.startPrevStage();
				break;
		}
	}
	protected onSceneLaunch(): void {
		if (CC_EDITOR) return;
		this._init();
		this.startNextStage();
	}
}

saykit.stageManager = new SKStageManager();
