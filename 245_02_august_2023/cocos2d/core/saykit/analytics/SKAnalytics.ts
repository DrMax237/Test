import SKPreAnalyticsHandler from "./Handler/SKPreAnalyticsHandler";
import SKIProjectAnalyticsData from "./Project/SKIProjectAnalyticsData";

class SKAnalytics {
	private events: SKIProjectAnalyticsData[] = [];

	constructor() {
		this._subscribeToLaunch();
	}

	private _subscribeToLaunch(): void {
		if (cc.director) cc.director.on(cc.Director.EVENT_AFTER_SCENE_LAUNCH, this.onSceneLaunch, this);
	}

	private _applyEvents(): void {
		if (CC_EDITOR) return;

		if (spVars["analytics"] === undefined) {
			this.events = [];
			cc.warn('SKAnalytics:>> Not found "analytics" property in Config.json.js', "Example: ", "{ Tap: 'TAP_COMPLETE' }");
			return;
		}

		const config = spVars["analytics"].value;
		const data = config instanceof Object ? config : JSON.parse(config as string);

		this.events = [];
		for (let key in data) {
			const temp = data[key];
			temp.key = key;
			const events = SKPreAnalyticsHandler(temp);
			this.events.push(...events);
		}
	}
	private _subscribeToEvents(): void {
		for (let index in this.events) {
			const data = this.events[index];

			const callback = (...args: any[]) => {
				data.repeat.pre();

				for (const condition of data.conditions) {
					const result = condition.check(args, condition, data.repeat.value);

					if (!result) return;
				}

				data.repeat.post();
				if (!data.repeat.condition.check(args, data.repeat.condition, data.repeat.value)) return;

				const event = data.analyticEvent;
				const tag = data.tag(args, data.repeat.value);
				window.spTrackEvent instanceof Function && window.spTrackEvent(event, tag);
				cc.log("ANALYTICS", event, tag);

				if (data.useSingleton) subscribe(false);
			};

			const subscribe = (enable: boolean) => {
				const func = enable ? "on" : "off";
				cc.systemEvent[func](data.gameEvent, callback, this);
			};
			subscribe(true);
		}
	}

	protected onSceneLaunch(): void {
		this._applyEvents();
		this._subscribeToEvents();
	}
}

export default saykit.analytics = new SKAnalytics();
