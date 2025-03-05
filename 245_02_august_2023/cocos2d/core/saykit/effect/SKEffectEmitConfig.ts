import { Vec3 } from "../../value-types";

const { ccclass, property } = cc._decorator;

enum NumberMode {
	Constant = 0,
	MinMax = 1,
}
cc.Enum(NumberMode);

enum EmitMode {
	Default = 0,
	Interval = 1,
	Duration = 2,
	Bursts = 3,
}
cc.Enum(EmitMode);

enum AreaMode {
	Point = 0,
	Box = 1,
	Sphere = 2,
}
cc.Enum(AreaMode);

enum RotationMode {
	Angle = 0,
	Vec3 = 1,
}
cc.Enum(RotationMode);

enum ScaleMode {
	Number = 0,
	Vec3 = 1,
}
cc.Enum(ScaleMode);

enum SpaceMode {
	Local = 0,
	World = 1,
}
cc.Enum(SpaceMode);

export interface IEmitSequenceItem {
	delay: number;

	rotation?: any; //number | cc.Vec3
	scale?: any; //cc.Vec3 | number
	position?: any; //cc.Vec3

	worldRotation?: any; //number | cc.Vec3
	worldScale?: any; //cc.Vec3 | number
	worldPosition?: any; //cc.Vec3
}

@ccclass("Box")
class Box {
	@property(cc.Vec3) size: any = cc.v3();
	@property(cc.Vec3) center: any = cc.v3();

	public getRandomPoint(): any {
		const halfSize = this.size.mul(0.5);

		return this.center.add(
			cc.v3((Math.random() - 0.5) * halfSize.x, (Math.random() - 0.5) * halfSize.y, (Math.random() - 0.5) * halfSize.z)
		);
	}
}

@ccclass("Sphere")
class Sphere {
	@property(cc.Float) radius: number = 0;
	@property(cc.Vec3) center: any = cc.v3();

	public getRandomPoint(): any {
		const u = Math.random();
		const v = Math.random();
		const theta = 2 * Math.PI * u;
		const phi = Math.acos(2 * v - 1);
		const r = Math.random() * this.radius;

		return cc.v3(
			this.center.x + r * Math.sin(phi) * Math.cos(theta),
			this.center.y + r * Math.sin(phi) * Math.sin(theta),
			this.center.z + r * Math.cos(phi)
		);
	}
}

@ccclass("ExtendedNumber")
class ExtendedNumber {
	@property({ type: NumberMode }) mode: NumberMode = NumberMode.Constant;
	@property({
		type: cc.Float,
		visible() {
			return this.mode === NumberMode.Constant;
		},
	})
	value: number = 0;
	@property({
		type: cc.Float,
		visible() {
			return this.mode === NumberMode.MinMax;
		},
	})
	minValue: number = 0;
	@property({
		type: cc.Float,
		visible() {
			return this.mode === NumberMode.MinMax;
		},
	})
	maxValue: number = 0;

	ctor(value: number = 0) {
		this.value = value;
		this.minValue = value;
		this.maxValue = value;
	}

	static create(value: number): ExtendedNumber {
		const out = new ExtendedNumber();
		out.value = value;
		out.minValue = value;
		out.maxValue = value;

		return out;
	}

	public getValue(): number {
		switch (this.mode) {
			case NumberMode.Constant:
				return this.value;
			case NumberMode.MinMax:
				return (cc as any).math.randomRange(this.minValue, this.maxValue);
		}
	}
}

@ccclass("ExtendedVector")
class ExtendedVector {
	@property({ type: NumberMode }) mode: NumberMode = NumberMode.Constant;
	@property({
		visible() {
			return this.mode === NumberMode.Constant;
		},
	})
	value: any = cc.v3();
	@property({
		visible() {
			return this.mode === NumberMode.MinMax;
		},
	})
	minValue: any = cc.v3();
	@property({
		visible() {
			return this.mode === NumberMode.MinMax;
		},
	})
	maxValue: any = cc.v3();

	ctor(value: any = cc.Vec3.ZERO) {
		this.value = value.clone();
		this.minValue = value.clone();
		this.maxValue = value.clone();
	}

	static create(value: Vec3): ExtendedVector {
		const out = new ExtendedVector();
		out.value = value;
		out.minValue = value;
		out.maxValue = value;

		return out;
	}

	public getValue(): any {
		switch (this.mode) {
			case NumberMode.Constant:
				return this.value;
			case NumberMode.MinMax:
				return cc.v3(
					(cc as any).math.randomRange(this.minValue.x, this.maxValue.x),
					(cc as any).math.randomRange(this.minValue.y, this.maxValue.y),
					(cc as any).math.randomRange(this.minValue.z, this.maxValue.z)
				);
		}
	}
}

@ccclass("Burst")
class Burst {
	@property(cc.Float) time: number = 0;
	@property(ExtendedNumber) count: ExtendedNumber = new ExtendedNumber();
}

@ccclass("saykit.EffectEmitConfig")
export class SKEffectEmitConfig {
	@property(cc.String) key: string = "default";
	@property({ type: EmitMode }) emitMode: EmitMode = EmitMode.Default;
	@property(ExtendedNumber) delay: ExtendedNumber = new ExtendedNumber();
	@property({
		type: cc.Float,
		visible() {
			return this.emitMode === EmitMode.Interval;
		},
	})
	interval: number = 0;
	@property({
		type: cc.Float,
		visible() {
			return this.emitMode === EmitMode.Duration;
		},
	})
	duration: number = 0;
	@property({
		type: ExtendedNumber,
		visible() {
			return this.emitMode === EmitMode.Duration || this.emitMode === EmitMode.Interval || this.emitMode === EmitMode.Default;
		},
	})
	count: ExtendedNumber = new ExtendedNumber();
	@property({
		type: [Burst],
		visible() {
			return this.emitMode === EmitMode.Bursts;
		},
	})
	bursts: Burst[] = [];

	@property({ type: SpaceMode }) spaceMode: SpaceMode = SpaceMode.Local;
	@property({ type: AreaMode }) areaMode: AreaMode = AreaMode.Point;
	@property({
		type: Box,
		visible() {
			return this.areaMode === AreaMode.Box;
		},
	})
	box: Box = new Box();
	@property({
		type: Sphere,
		visible() {
			return this.areaMode === AreaMode.Sphere;
		},
	})
	sphere: Sphere = new Sphere();

	@property({ type: RotationMode }) rotationMode: RotationMode = RotationMode.Angle;
	@property({
		type: ExtendedNumber,
		visible() {
			return this.rotationMode === RotationMode.Angle;
		},
	})
	angle: ExtendedNumber = new ExtendedNumber();
	@property({
		type: ExtendedVector,
		visible() {
			return this.rotationMode === RotationMode.Vec3;
		},
	})
	rotation: ExtendedVector = new ExtendedVector();

	@property({ type: ScaleMode }) scaleMode: ScaleMode = ScaleMode.Number;
	@property({
		type: ExtendedNumber,
		displayName: "scale",
		visible() {
			return this.scaleMode === ScaleMode.Number;
		},
	})
	scaleNum: ExtendedNumber = ExtendedNumber.create(1);
	@property({
		type: ExtendedVector,
		displayName: "scale",
		visible() {
			return this.scaleMode === ScaleMode.Vec3;
		},
	})
	scaleVec: ExtendedVector = ExtendedVector.create(Vec3.ONE);

	public generateEmitSequence(): IEmitSequenceItem[] {
		let sequence: IEmitSequenceItem[] = [];

		switch (this.emitMode) {
			case EmitMode.Default:
				{
					const count = this.count.getValue();

					sequence = this._createDefaultSequence(count, 0, 0, true);
				}
				break;
			case EmitMode.Duration:
				{
					const count = this.count.getValue();
					const delay = this.delay.getValue();
					const interval = count > 1 ? this.duration / (count - 1) : 0;

					sequence = this._createDefaultSequence(count, delay, interval);
				}
				break;
			case EmitMode.Interval:
				{
					const count = this.count.getValue();
					const delay = this.delay.getValue();

					sequence = this._createDefaultSequence(count, delay, this.interval);
				}
				break;
			case EmitMode.Bursts:
				{
					const delay = this.delay.getValue();
					sequence = this._createBurstsSequence(delay);
				}
				break;
		}

		return sequence;
	}

	private _createDefaultSequence(
		count: number,
		delay: number = 0,
		interval: number = 0,
		addRandomDelay: boolean = false
	): IEmitSequenceItem[] {
		const sequence: IEmitSequenceItem[] = [];

		for (let i = 0; i < count; i++) {
			const time = interval * i;
			const item = this._createEmitSequenceItem(delay + time + (addRandomDelay ? this.delay.getValue() : 0));

			sequence.push(item);
		}

		return sequence;
	}
	private _createBurstsSequence(delay: number = 0): IEmitSequenceItem[] {
		const sequence: IEmitSequenceItem[] = [];

		for (let burst of this.bursts) {
			const count = burst.count.getValue();

			for (let i = 0; i < count; i++) {
				const item = this._createEmitSequenceItem(delay + burst.time);

				sequence.push(item);
			}
		}

		return sequence;
	}
	private _createEmitSequenceItem(delay: number): IEmitSequenceItem {
		const item: IEmitSequenceItem = {
			delay: delay,
		};

		switch (this.spaceMode) {
			case SpaceMode.Local:
				item.scale = this._getScale();
				item.rotation = this._getRotation();
				item.position = this._getPosition();
				break;
			case SpaceMode.World:
				item.worldScale = this._getScale();
				item.worldRotation = this._getRotation();
				item.worldPosition = this._getPosition();
				break;
		}

		return item;
	}
	private _getScale(): any {
		switch (this.scaleMode) {
			case ScaleMode.Number:
				return this.scaleNum.getValue();
			case ScaleMode.Vec3:
				return this.scaleVec.getValue();
		}
	}
	private _getRotation(): any {
		switch (this.rotationMode) {
			case RotationMode.Angle:
				return this.angle.getValue();
			case RotationMode.Vec3:
				return this.rotation.getValue();
		}
	}
	private _getPosition(): Vec3 {
		switch (this.areaMode) {
			case AreaMode.Point:
				return cc.v3();
			case AreaMode.Box:
				return this.box.getRandomPoint();
			case AreaMode.Sphere:
				return this.sphere.getRandomPoint();
		}
	}
}

saykit.EffectEmitConfig = SKEffectEmitConfig;
