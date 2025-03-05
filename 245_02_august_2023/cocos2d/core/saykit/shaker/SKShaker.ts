import { SKOscillator, SKOscillatorMinMax } from "./SKOscillators";
import { SKShakerConfig } from "./SKShakerConfig";
import { SKFunctionValueType, SKPropertyType } from "./SKShakerEnums";

const { ccclass, property, menu, executeInEditMode } = cc._decorator;

saykit.Event.SHAKER_PLAY = "SHAKER_PLAY";
saykit.Event.SHAKER_STOP = "SHAKER_STOP";

export interface SKIShakerParams {
	key?: string;
	target?: any;
	power?: number;

	onStart?: { (shaker: SKShaker): void } | null;
	onUpdate?: { (shaker: SKShaker): void } | null;
	onComplete?: { (shaker: SKShaker): void } | null;

	out?: SKShaker;
}

@ccclass("saykit.Shaker")
@menu("SayKit/Shaker")
@executeInEditMode
export default class SKShaker extends cc.Component {
	@property(cc.String)
	get key(): string {
		return this._key === "" ? this.node.name : this._key;
	}
	set key(value: string) {
		this._key = value;
	}
	@property(cc.String) private _key: string = "";

	@property(cc.String) DEBUG_KEY: string = "s";
	@property({ type: cc.String, visible: false })
	get DEBUG_CODE(): number {
		return cc.macro.KEY[this.DEBUG_KEY[0].toLowerCase()];
	}
	@property(cc.Boolean)
	get PREVIEW(): boolean {
		return this._PREVIEW;
	}
	set PREVIEW(value: boolean) {
		if (!CC_EDITOR || value === this._PREVIEW) return;

		this._PREVIEW = value;

		this._togglePreview(value);
	}

	@property(cc.Boolean) isFromJson: boolean = false;
	@property({
		type: cc.JsonAsset,
		visible() {
			return this.isFromJson;
		},
	})
	json: cc.JsonAsset = null;

	@property({
		type: cc.Boolean,
		visible() {
			return this.isFromJson;
		},
	})
	get SYNC(): boolean {
		return false;
	}
	set SYNC(value: boolean) {
		if (!CC_EDITOR) return;

		value && this._importFromJson();
	}
	@property(cc.Boolean)
	get EXPORT(): boolean {
		return false;
	}
	set EXPORT(value: boolean) {
		if (!CC_EDITOR) return;

		value && this._exportToJson();
	}

	@property({
		type: cc.Float,
		visible() {
			return !this.isFromJson;
		},
	})
	duration: number = -1;
	@property({
		type: cc.Boolean,
		visible() {
			return !this.isFromJson;
		},
	})
	isSensitiveToTimeScale: boolean = true;
	@property({
		type: cc.Boolean,
		visible() {
			return !this.isFromJson;
		},
	})
	isPlayOnStart: boolean = false;

	@property({
		type: [SKShakerConfig],
		visible() {
			return !this.isFromJson;
		},
	})
	shakerConfigs: SKShakerConfig[] = [];

	private _isShaking: boolean = false;
	private _time: number = 0;
	private _timeScale: number = 1;
	private _velocityPower: number = 1;
	private _onStart: { (shaker: SKShaker): void } | null = null;
	private _onUpdate: { (shaker: SKShaker): void } | null = null;
	private _onComplete: { (shaker: SKShaker): void } | null = null;
	private _shakingTarget: any = null;
	private _PREVIEW: boolean = false;

	protected onEnable(): void {
		this._subscribeToEvents(true);
	}
	protected onDisable(): void {
		this._subscribeToEvents(false);
	}
	protected start(): void {
		if (CC_EDITOR) return;

		this.isPlayOnStart && this.play();
	}
	protected update(dt: number): void {
		if (CC_EDITOR && !this.PREVIEW) return;

		this._refreshShake(dt * this._timeScale);
	}

	public play(params: SKIShakerParams = {}): void {
		this._stopShake();

		this._shakingTarget = params.target || this.node;
		this._velocityPower = typeof params.power === "number" ? params.power : 1;
		if (params.onStart !== undefined) this._onStart = params.onStart;
		if (params.onUpdate !== undefined) this._onUpdate = params.onUpdate;
		if (params.onComplete !== undefined) this._onComplete = params.onComplete;

		this._startShake();

		params.out = this;
	}
	public stop(): void {
		this._stopShake();
	}
	public copy(other: SKShaker): void {
		this.shakerConfigs = [];

		for (let config of other.shakerConfigs) {
			this.shakerConfigs.push(config.clone());
		}
	}

	private _subscribeToEvents(isOn: boolean): void {
		const func = isOn ? "on" : "off";

		this.node[func](saykit.Event.SHAKER_PLAY, this.onShakerPlay, this);
		cc.systemEvent[func](saykit.Event.SHAKER_PLAY, this.onShakerPlayWithKey, this);

		this.node[func](saykit.Event.SHAKER_STOP, this.onShakerStop, this);
		cc.systemEvent[func](saykit.Event.SHAKER_STOP, this.onShakerStopWithKey, this);

		this.isSensitiveToTimeScale && cc.systemEvent[func](saykit.Event.TIME_SCALE_CHANGED, this.onTimeScaleChanged, this);
		this.DEBUG_KEY && cc.systemEvent[func](cc.SystemEvent.EventType.KEY_DOWN, this.onDebug, this);
	}
	private _togglePreview(isOn: boolean): void {
		if (!CC_EDITOR) return;

		if (isOn) this.play();
		else this.stop();
	}
	private _startShake(): void {
		this._isShaking = true;
		this._time = 0;

		for (let config of this.shakerConfigs) {
			if (config.isCustomProperty) config.startValue = this._shakingTarget[config.targetProperty];
			else {
				let light: any;

				switch (config.basicProperty) {
					case SKPropertyType.EulerAngleX:
						config.startValue = this._shakingTarget.eulerAngles.x;
						break;
					case SKPropertyType.EulerAngleY:
						config.startValue = this._shakingTarget.eulerAngles.y;
						break;
					case SKPropertyType.EulerAngleZ:
						config.startValue = this._shakingTarget.eulerAngles.z;
						break;
					case SKPropertyType.LightIntensity:
						light = this._shakingTarget.getComponent(cc.Light);
						light && (config.startValue = light.intensity);
						break;
					case SKPropertyType.LightRange:
						light = this._shakingTarget.getComponent(cc.Light);
						light && (config.startValue = light.range);
						break;
					default:
						const property = SKPropertyType[config.basicProperty];
						const realProperty = property[0].toLowerCase() + property.slice(1);
						config.startValue = this._shakingTarget[realProperty];
						break;
				}
			}

			if (config.isRandomMinMax) {
				for (let oscillator of config.oscillatorsMinMax) {
					oscillator.velocity = this._getRandomMinMaxValue(oscillator.velocityMinMax.x, oscillator.velocityMinMax.y);
					oscillator.damping = this._getRandomMinMaxValue(oscillator.dampingMinMax.x, oscillator.dampingMinMax.y);
					oscillator.mass = this._getRandomMinMaxValue(oscillator.massMinMax.x, oscillator.massMinMax.y);
					oscillator.stiffness = this._getRandomMinMaxValue(oscillator.stiffnessMinMax.x, oscillator.stiffnessMinMax.y);
					oscillator.startOffset = this._getRandomMinMaxValue(oscillator.startOffsetMinMax.x, oscillator.startOffsetMinMax.y);
					oscillator.offset = this._getRandomMinMaxValue(oscillator.offsetMinMax.x, oscillator.offsetMinMax.y);
				}
			}
			for (let oscillator of config.isRandomMinMax ? config.oscillatorsMinMax : config.oscillators) {
				this._calculateFunctionValues(oscillator);
			}
		}

		if (this._onStart instanceof Function) this._onStart(this);
	}
	private _stopShake(): void {
		this._isShaking = false;

		for (let config of this.shakerConfigs) {
			if (config.startValue !== null) {
				this._setTargetValue(config, 0);
				config.startValue = null;
			}
		}
	}
	private _refreshShake(dt: number): void {
		if (!this._isShaking) return;

		this._time += dt;

		if (this.duration > 0 && this._time > this.duration) {
			this._stopShake();

			if (this._onComplete instanceof Function) this._onComplete(this);
			return;
		}

		for (let config of this.shakerConfigs) {
			let f = 0;

			for (let oscillator of config.isRandomMinMax ? config.oscillatorsMinMax : config.oscillators) {
				f += this._getFunctionResult(this._time, oscillator);
			}

			this._setTargetValue(config, f);
		}

		if (this._onUpdate instanceof Function) this._onUpdate(this);
	}
	private _setTargetValue(config: SKShakerConfig, f: number): void {
		if (!this._shakingTarget) return;
		if (!config.startValue) config.startValue = 0;

		if (config.functionType === SKFunctionValueType.Positive) f = Math.abs(f);
		else if (config.functionType === SKFunctionValueType.Negative) f = -Math.abs(f);

		let targetValue = config.startValue + f;

		if (config.needValueLimits) targetValue = cc.misc.clampf(targetValue, config.valueLimits.x, config.valueLimits.y);

		if (config.isCustomProperty) {
			this._shakingTarget[config.targetProperty] = targetValue;
		} else {
			let light: any;

			switch (config.basicProperty) {
				case SKPropertyType.EulerAngleX:
					this._shakingTarget.setRotation(
						cc.quat().fromEuler(cc.v3(targetValue, this._shakingTarget.eulerAngles.y, this._shakingTarget.eulerAngles.z))
					);
					break;
				case SKPropertyType.EulerAngleY:
					this._shakingTarget.setRotation(
						cc.quat().fromEuler(cc.v3(this._shakingTarget.eulerAngles.x, targetValue, this._shakingTarget.eulerAngles.z))
					);
					break;
				case SKPropertyType.EulerAngleZ:
					this._shakingTarget.setRotation(
						cc.quat().fromEuler(cc.v3(this._shakingTarget.eulerAngles.x, this._shakingTarget.eulerAngles.y, targetValue))
					);
					break;
				case SKPropertyType.LightIntensity:
					light = this._shakingTarget.getComponent(cc.Light);
					light && (light.intensity = targetValue);
					break;
				case SKPropertyType.LightRange:
					light = this._shakingTarget.getComponent(cc.Light);
					light && (light.range = targetValue);
					break;
				default:
					const property = SKPropertyType[config.basicProperty];
					const realProperty = property[0].toLowerCase() + property.slice(1);
					this._shakingTarget[realProperty] = targetValue;
					break;
			}
		}
	}
	private _getRandomMinMaxValue(min: number, max: number): number {
		return Math.random() * (max - min) + min;
	}
	private _calculateFunctionValues(oscillator: SKOscillator | SKOscillatorMinMax): void {
		const dr = oscillator.damping / (2 * Math.sqrt(oscillator.stiffness * oscillator.mass));
		const w = Math.sqrt(oscillator.stiffness / oscillator.mass);
		const p = w * Math.sqrt(1 - dr * dr);
		const dx = (w * oscillator.damping) / (2 * Math.sqrt(oscillator.stiffness * oscillator.mass));
		const dv = oscillator.offset - oscillator.startOffset;

		oscillator.dr = dr;
		oscillator.w = w;
		oscillator.p = p;
		oscillator.dx = dx;
		oscillator.dv = dv;
	}
	private _getFunctionResult(t: number, oscillator: SKOscillator | SKOscillatorMinMax): number {
		const f =
			oscillator.offset -
			Math.pow(Math.E, -oscillator.dx * t) *
				(((oscillator.dx * oscillator.dv + oscillator.velocity * this._velocityPower) * Math.sin(oscillator.p * t)) / oscillator.p +
					oscillator.dv * Math.cos(oscillator.p * t));

		return f;
	}
	private _exportToJson(): void {
		const shakerConfigsForJson: any[] = [];

		for (let shakerConfig of this.shakerConfigs) {
			shakerConfigsForJson.push(shakerConfig.exportToJson(false));
		}

		const json = {
			duration: this.duration,
			isSensitiveToTimeScale: this.isSensitiveToTimeScale,
			isPlayOnStart: this.isPlayOnStart,
			shakerConfigs: shakerConfigsForJson,
		};

		cc.log(JSON.stringify(json));
	}
	private _importFromJson(jsonAsset: cc.JsonAsset = this.json): void {
		const json = jsonAsset?.json;

		if (!json) return;

		this.duration = json.duration ?? this.duration;
		this.isSensitiveToTimeScale = json.isSensitiveToTimeScale ?? this.isSensitiveToTimeScale;
		this.isPlayOnStart = json.isPlayOnStart ?? this.isPlayOnStart;

		if (json.shakerConfigs instanceof Array) {
			this.shakerConfigs = [];

			for (let shakerConfigJson of json.shakerConfigs) {
				const shakerConfig = new SKShakerConfig();
				shakerConfig.initWithJson(shakerConfigJson);

				this.shakerConfigs.push(shakerConfig);
			}
		}

		cc.log("Shaker is synced with json");
	}

	protected onShakerPlay(params: SKIShakerParams): void {
		this.play(params);
	}
	protected onShakerStop(): void {
		this._stopShake();
	}
	protected onShakerPlayWithKey(params: SKIShakerParams): void {
		if (params.key !== this.key) return;

		this.play(params);
	}
	protected onShakerStopWithKey(params: SKIShakerParams): void {
		if (params.key !== this.key) return;

		this._stopShake();
	}
	protected onTimeScaleChanged(timeScale: number): void {
		this._timeScale = timeScale;
	}
	protected onDebug(event: { keyCode: number }): void {
		if (this.DEBUG_CODE === event.keyCode) this.play();
	}
}

saykit.Shaker = SKShaker;
