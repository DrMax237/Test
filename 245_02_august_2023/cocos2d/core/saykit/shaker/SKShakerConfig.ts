import { SKFunctionValueType, SKPropertyType } from "./SKShakerEnums";
import { SKOscillator, SKOscillatorMinMax } from "./SKOscillators";

const { ccclass, property } = cc._decorator;

@ccclass("SKShakerConfig")
export class SKShakerConfig {
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

		value && this.importFromJson();
	}
	@property(cc.Boolean)
	get EXPORT(): boolean {
		return false;
	}
	set EXPORT(value: boolean) {
		if (!CC_EDITOR) return;

		value && this.exportToJson();
	}

	@property({
		type: cc.Boolean,
		visible() {
			return !this.isFromJson;
		},
	})
	isCustomProperty: boolean = false;
	@property({
		visible() {
			return this.isCustomProperty && !this.isFromJson;
		},
	})
	targetProperty: string = "x";
	@property({
		type: SKPropertyType,
		visible() {
			return !this.isCustomProperty && !this.isFromJson;
		},
	})
	basicProperty: SKPropertyType = SKPropertyType.EulerAngleZ;

	@property({
		type: cc.Boolean,
		visible() {
			return !this.isFromJson;
		},
	})
	needValueLimits: boolean = false;
	@property({
		type: cc.Vec2,
		visible() {
			return !this.isFromJson && this.needValueLimits;
		},
	})
	valueLimits = cc.v2(-1000000, 1000000);
	@property({
		type: SKFunctionValueType,
		visible() {
			return !this.isFromJson;
		},
	})
	functionType: SKFunctionValueType = SKFunctionValueType.All;

	@property({
		type: cc.Boolean,
		visible() {
			return !this.isFromJson;
		},
	})
	isRandomMinMax: boolean = false;
	@property({
		type: [SKOscillator],
		visible() {
			return !this.isRandomMinMax && !this.isFromJson;
		},
	})
	oscillators: SKOscillator[] = [];
	@property({
		type: [SKOscillatorMinMax],
		visible() {
			return this.isRandomMinMax && !this.isFromJson;
		},
	})
	oscillatorsMinMax: SKOscillatorMinMax[] = [];

	public startValue: number | null = null;

	public clone(): SKShakerConfig {
		const config = new SKShakerConfig();

		config.isCustomProperty = this.isCustomProperty;
		config.targetProperty = this.targetProperty;
		config.basicProperty = this.basicProperty;
		config.functionType = this.functionType;
		config.isRandomMinMax = this.isRandomMinMax;

		for (let oscillator of this.oscillators) {
			config.oscillators.push(oscillator.clone());
		}
		for (let oscillator of this.oscillatorsMinMax) {
			config.oscillatorsMinMax.push(oscillator.clone());
		}

		return config;
	}
	public initWithJson(configJson: SKShakerConfig): void {
		this.isCustomProperty = configJson.isCustomProperty ?? this.isCustomProperty;
		this.targetProperty = configJson.targetProperty ?? this.targetProperty;
		this.basicProperty = configJson.basicProperty ?? this.basicProperty;
		this.functionType = configJson.functionType ?? this.functionType;
		this.needValueLimits = configJson.needValueLimits ?? this.needValueLimits;
		this.valueLimits = configJson.valueLimits ?? this.valueLimits;
		this.isRandomMinMax = configJson.isRandomMinMax ?? this.isRandomMinMax;

		this.oscillators = [];
		this.oscillatorsMinMax = [];

		if (configJson.oscillators instanceof Array) {
			for (let oscillatorJson of configJson.oscillators) {
				const oscillator = new SKOscillator();
				oscillator.initWithJson(oscillatorJson);
				this.oscillators.push(oscillator);
			}
		}
		if (configJson.oscillatorsMinMax instanceof Array) {
			for (let oscillatorJson of configJson.oscillatorsMinMax) {
				const oscillator = new SKOscillatorMinMax();
				oscillator.initWithJson(oscillatorJson);
				this.oscillatorsMinMax.push(oscillator);
			}
		}
	}
	public exportToJson(isLog: boolean = true): Object {
		const json = {
			isCustomProperty: this.isCustomProperty,
			targetProperty: this.targetProperty,
			basicProperty: this.basicProperty,
			needValueLimits: this.needValueLimits,
			valueLimits: this.valueLimits,
			functionType: this.functionType,
			isRandomMinMax: this.isRandomMinMax,
			oscillators: this.oscillators,
			oscillatorsMinMax: this.oscillatorsMinMax,
		};
		isLog && cc.log(JSON.stringify(json));

		return json;
	}
	public importFromJson(jsonAsset: cc.JsonAsset = this.json): void {
		const json = jsonAsset?.json;

		if (!json) return;

		this.initWithJson(json);

		cc.log("Config is synced with json");
	}
}
