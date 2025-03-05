const { ccclass, property } = cc._decorator;
@ccclass("SKOscillator")
export class SKOscillator {
	@property(cc.Float) velocity: number = 300;
	@property(cc.Float) damping: number = 7;
	@property(cc.Float) mass: number = 1;
	@property(cc.Float) stiffness: number = 300;
	@property(cc.Float) startOffset: number = 0;
	@property(cc.Float) offset: number = 0;

	public dr: number = 0;
	public w: number = 0;
	public p: number = 0;
	public dx: number = 0;
	public dv: number = 0;

	public clone(): SKOscillator {
		const oscillator = new SKOscillator();

		oscillator.velocity = this.velocity;
		oscillator.damping = this.damping;
		oscillator.mass = this.mass;
		oscillator.stiffness = this.stiffness;
		oscillator.startOffset = this.startOffset;
		oscillator.offset = this.offset;

		return oscillator;
	}
	public initWithJson(oscillatorJson: SKOscillator): void {
		this.velocity = oscillatorJson.velocity ?? this.velocity;
		this.damping = oscillatorJson.damping ?? this.damping;
		this.mass = oscillatorJson.mass ?? this.mass;
		this.stiffness = oscillatorJson.stiffness ?? this.stiffness;
		this.startOffset = oscillatorJson.startOffset ?? this.startOffset;
		this.offset = oscillatorJson.offset ?? this.offset;
	}
}

@ccclass("SKOscillatorMinMax")
export class SKOscillatorMinMax {
	@property(cc.Vec2) velocityMinMax: any = cc.v2(200, 300);
	@property(cc.Vec2) dampingMinMax: any = cc.v2(3, 7);
	@property(cc.Vec2) massMinMax: any = cc.v2(1, 5);
	@property(cc.Vec2) stiffnessMinMax: any = cc.v2(200, 300);
	@property(cc.Vec2) startOffsetMinMax: any = cc.v2(0, 0);
	@property(cc.Vec2) offsetMinMax: any = cc.v2(0, 0);

	public velocity: number = 300;
	public damping: number = 7;
	public mass: number = 1;
	public stiffness: number = 300;
	public startOffset: number = 0;
	public offset: number = 0;
	public dr: number = 0;
	public w: number = 0;
	public p: number = 0;
	public dx: number = 0;
	public dv: number = 0;

	public clone(): SKOscillatorMinMax {
		const oscillator = new SKOscillatorMinMax();

		oscillator.velocityMinMax = this.velocityMinMax.clone();
		oscillator.dampingMinMax = this.dampingMinMax.clone();
		oscillator.massMinMax = this.massMinMax.clone();
		oscillator.stiffnessMinMax = this.stiffnessMinMax.clone();
		oscillator.startOffsetMinMax = this.startOffsetMinMax.clone();
		oscillator.offsetMinMax = this.offsetMinMax.clone();

		oscillator.velocity = this.velocity;
		oscillator.damping = this.damping;
		oscillator.mass = this.mass;
		oscillator.stiffness = this.stiffness;
		oscillator.startOffset = this.startOffset;
		oscillator.offset = this.offset;

		return oscillator;
	}
	public initWithJson(oscillatorJson: SKOscillatorMinMax): void {
		oscillatorJson.velocityMinMax && (this.velocityMinMax = cc.v2(oscillatorJson.velocityMinMax.x, oscillatorJson.velocityMinMax.y));
		oscillatorJson.dampingMinMax && (this.dampingMinMax = cc.v2(oscillatorJson.dampingMinMax.x, oscillatorJson.dampingMinMax.y));
		oscillatorJson.massMinMax && (this.massMinMax = cc.v2(oscillatorJson.massMinMax.x, oscillatorJson.massMinMax.y));
		oscillatorJson.stiffnessMinMax &&
			(this.stiffnessMinMax = cc.v2(oscillatorJson.stiffnessMinMax.x, oscillatorJson.stiffnessMinMax.y));
		oscillatorJson.startOffsetMinMax &&
			(this.startOffsetMinMax = cc.v2(oscillatorJson.startOffsetMinMax.x, oscillatorJson.startOffsetMinMax.y));
		oscillatorJson.offsetMinMax && (this.offsetMinMax = cc.v2(oscillatorJson.offsetMinMax.x, oscillatorJson.offsetMinMax.y));
	}
}
