const DELAY_BETWEEN_REDIRECTS = 200;
const MAX_IDLE_TIME = 5000;

export class SKRedirector {
	public isCheckUnityCondition = true;

	private _stages: string[] = null;
	private _settings: Record<string, string> = null;
	private _redirectThrowTime: number = 0;
	private _lastInputTime: number = 0;
	private _wasUp: boolean = false;

	constructor() {
		this._subscribeToEvents();
	}

	/**
	!#en Redirect
	@param {String} type - Analytics type
	*/
	public redirect(type: string): void {
		if (this._checkDelayRedirect()) return;
		if (this._checkInaction()) return;
		if (type !== "game" && this._checkUnity()) return;

		this._redirect(type);
		this._redirectThrowTime = cc.director.getTotalTime();
	}

	private _subscribeToEvents(): void {
		cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLaunch, this);
	}
	private _init(): void {
		if (CC_EDITOR) return;

		this._applyStages();
		this._applySettings();
		this._subscribe();
	}
	private _applyStages(): void {
		if (spVars["redirector_stages"] === undefined) {
			cc.error(
				'Redirector:>> Not found "redirector_stages" property in Config.json.js',
				"Example: ",
				'redirector_stages: "After Tap 2"'
			);
			return;
		}

		const config = spVars["redirector_stages"].value as string;
		const string = config.replace(/ /g, "");
		this._stages = string.split(",");
	}
	private _applySettings(): void {
		if (spVars["redirector_settings"] === undefined) {
			cc.error('Redirector:>> Not found "redirector_settings" property in Config.json.js', "Example: ", "{ Tap: 'TAP_COMPLETE' }");
			return;
		}

		const config = spVars["redirector_settings"].value;
		this._settings = config instanceof Object ? config : JSON.parse(config as string);

		for (let key in this._settings) saykit.dictionary.add(`${key}_Redirector`, 0);
	}
	private _subscribe(): void {
		cc.systemEvent.on(saykit.GameEvent.REDIRECT, this.onRedirect, this);
		cc.systemEvent.on(saykit.GameEvent.INPUT, this.onInput, this);

		for (let key in this._settings) {
			const event = this._settings[key];
			const func = () => {
				const repeatCount = saykit.dictionary.set(`${key}_Redirector`, { add: 1 });

				if (this._check(key, repeatCount)) {
					cc.systemEvent.emit(saykit.GameEvent.REDIRECT, key);
				}
			};

			cc.systemEvent.on(event, func, this);
		}
	}
	private _check(key: string, repeatCount: number): boolean {
		const isConditionMet: boolean =
			this._checkBase(key) ||
			this._checkSimpleCount(key, repeatCount) ||
			this._checkAfterCount(key, repeatCount) ||
			this._checkEveryCount(key, repeatCount);

		return isConditionMet;
	}
	private _checkBase(key: string): boolean {
		return this._stages.indexOf(key) !== -1;
	}
	private _checkSimpleCount(key: string, count: number): boolean {
		return this._stages.indexOf(`${key}${count}`) !== -1;
	}
	private _checkAfterCount(key: string, count: number): boolean {
		const currentKey = `After${key}`;

		for (let stage of this._stages) {
			if (stage.indexOf(currentKey) !== -1) {
				const afterKey = stage.split(currentKey);
				const afterCount = parseInt(afterKey[1]);
				return afterCount <= count;
			}
		}
		return false;
	}
	private _checkEveryCount(key: string, count: number): boolean {
		const currentKey = `Every${key}`;

		for (let stage of this._stages) {
			if (stage.indexOf(currentKey) !== -1) {
				const everyKey = stage.split(currentKey);
				const everyCount = parseInt(everyKey[1]);

				return count !== 0 && count % everyCount === 0;
			}
		}
		return false;
	}
	private _checkDelayRedirect(): boolean {
		return cc.director.getTotalTime() < this._redirectThrowTime + DELAY_BETWEEN_REDIRECTS;
	}
	private _checkInaction(): boolean {
		const time = cc.director.getTotalTime();
		cc.log("Inaction", this._lastInputTime, time);
		return this._lastInputTime + MAX_IDLE_TIME < time;
	}
	private _checkUnity(): boolean {
		return this.isCheckUnityCondition && window.spNetwork === "unity" && !this._wasUp;
	}
	private _redirect(type: string): void {
		cc.director.pause();
		try {
			spClick(type);
		} catch (err) {
			window.open();
		}
		cc.director.resume();
	}

	protected onRedirect(type: string): void {
		this.redirect(type);
	}
	protected onInput(type): void {
		if (this.isCheckUnityCondition && type === saykit.InputType.Up) this._wasUp = true;
		this._lastInputTime = cc.director.getTotalTime();
	}
	protected onSceneLaunch(): void {
		this._init();
	}
}

saykit.redirector = new SKRedirector();
