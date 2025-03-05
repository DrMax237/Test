import SKEffectHolder from "./SKEffectHolder";
import SKEffectEmitter from "./SKEffectEmitter";
import SKEmitter2D from "./SKEmitter2D";
import SKEmitter3D from "./SKEmitter3D";
import SKEmitterAnimated from "./SKEmitterAnimated";
import { SKEffectEmitConfig, IEmitSequenceItem } from "./SKEffectEmitConfig";

import { IEffectSpawnParams } from "./SKEffectManager";

const { ccclass, property, executeInEditMode, menu } = cc._decorator;

@ccclass("saykit.Effect")
@executeInEditMode
@menu("SayKit/Effect/Effect")
export default class SKEffect extends cc.Component {
	@property(cc.String)
	get key(): string {
		return this._key === "" ? this.node.name : this._key;
	}
	set key(value: string) {
		this._key = value;
	}

	@property(cc.String) DEBUG_KEY: string = "1";
	@property(cc.String)
	get DEBUG_CODE(): number {
		return cc.macro.KEY[this.DEBUG_KEY[0].toLowerCase()];
	}

	@property(cc.Boolean) isForceDestroy: boolean = false;
	@property({
		type: cc.Float,
		visible() {
			return this.isForceDestroy;
		},
	})
	destroyTime: number = 0;

	@property({
		type: [SKEffectEmitConfig],
		visible: false,
	})
	spawnConfigs: SKEffectEmitConfig[] = [];

	@property({
		type: [SKEffectEmitter],
		visible: false,
	})
	emitters: SKEffectEmitter[] = [];

	@property(cc.String) private _key: string = "";
	@property() private _systems: any[] = [];

	private _isPlaying: boolean = false;

	private _onStart: { (effect: SKEffect): void } | null = null;
	private _onUpdate: { (effect: SKEffect): void } | null = null;
	private _onComplete: { (effect: SKEffect): void } | null = null;
	private _onSpawn: { (effect: SKEffect): void } | null = null;

	protected onLoad(): void {
		if (CC_EDITOR) return;

		this._init();

		for (let emitter of this.emitters) {
			emitter && emitter.onLoad();
		}
	}
	protected update(dt: number): void {
		if (!this._isPlaying) return;

		for (let emitter of this.emitters) {
			emitter && emitter.update(dt);
		}

		this._onUpdate && this._onUpdate(this);
	}

	public init(): void {
		this._init();
	}
	public spawn(params: IEffectSpawnParams, emitParams?: IEmitSequenceItem): void {
		if (!params) return;

		if (emitParams) {
			this._mergeParams(params, emitParams);
		}

		this._onSpawn = params.onSpawn;
		this._onStart = params.onStart;
		this._onUpdate = params.onUpdate;
		this._onComplete = params.onComplete;

		this._setParent(params.holder);

		if (params.worldRotation) this._setWorldRotation(params.worldRotation);
		else if (params.rotation) this._setRotation(params.rotation);

		if (params.worldScale) this._setWorldScale(params.worldScale);
		else if (params.scale) this._setScale(params.scale);

		if (params.worldPosition) this._setWorldPosition(params.worldPosition);
		else if (params.position) this._setPosition(params.position);

		this._schedulePlay(params.delay);
		!params.endless && this._scheduleRemove(params.duration, params.delay);

		this._onSpawn && this._onSpawn(this);
	}
	public play(): void {
		this._play();
	}
	public stop(): void {
		this._stop();
	}
	public clear(): void {
		this._clear();
	}
	public reset(): void {
		this._reset();
	}
	public remove(): void {
		this._remove();
	}
	public setParent(holder: any): void {
		this._setParent(holder);
	}
	public setPosition(position: any): void {
		this._setPosition(position);
	}
	public setWorldPosition(worldPosition: any): void {
		this._setWorldPosition(worldPosition);
	}
	public setRotation(rotation: any): void {
		this._setRotation(rotation);
	}
	public setWorldRotation(worldRotation: any): void {
		this._setWorldRotation(worldRotation);
	}
	public setScale(scale: any): void {
		this._setScale(scale);
	}
	public setWorldScale(worldScale: any): void {
		this._setWorldScale(worldScale);
	}

	private _init(): void {
		this._getSystems();
		this._initSystems();
		this._removeEmptyEmitters();
		this._createEmitters();
	}
	private _getSystems(): void {
		const animations = cc.Animation ? this.node.getComponentsInChildren(cc.Animation) : [];
		const systems2d = cc.ParticleSystem ? this.node.getComponentsInChildren(cc.ParticleSystem) : [];
		const systems3d = cc.ParticleSystem3D ? this.node.getComponentsInChildren(cc.ParticleSystem3D) : [];

		this._systems = [];
		this._systems.push(...animations, ...systems2d, ...systems3d);
	}
	private _initSystems(): void {
		for (let system of this._systems) {
			if (cc.ParticleSystem3D && system instanceof cc.ParticleSystem3D) system.playOnAwake = false;
			else if (cc.ParticleSystem && system instanceof cc.ParticleSystem) system.playOnLoad = false;
			else if (cc.Animation && system instanceof cc.Animation) system.playOnLoad = false;
		}
	}
	private _removeEmptyEmitters(): void {
		let removed = [];

		for (let emitter of this.emitters) {
			if (!emitter || !emitter.system || !emitter.system.isValid) removed.push(emitter);
		}

		for (let item of removed) {
			const index = this.emitters.indexOf(item);
			this.emitters.splice(index, 1);
		}
	}
	private _createEmitters(): void {
		for (let system of this._systems) {
			if (!system) continue;

			let emitter: SKEffectEmitter = this._findEmitter(system);

			if (emitter) continue;

			if (cc.ParticleSystem3D && system instanceof cc.ParticleSystem3D) emitter = new SKEmitter3D();
			else if (cc.ParticleSystem && system instanceof cc.ParticleSystem) emitter = new SKEmitter2D();
			else if (cc.Animation && system instanceof cc.Animation) emitter = new SKEmitterAnimated();

			if (!emitter) continue;

			emitter.init(system, this);

			this.emitters.push(emitter);
		}
	}
	private _findEmitter(system: any): SKEffectEmitter | null {
		for (let emitter of this.emitters) {
			if (emitter && emitter.system === system) return emitter;
		}

		return null;
	}
	private _clear(): void {
		for (let emitter of this.emitters) {
			emitter && emitter.clear();
		}

		this.emitters = [];
		this._systems = [];
	}
	private _play(): void {
		this._isPlaying = true;

		for (let emitter of this.emitters) {
			emitter && emitter.play();
		}

		this._onStart && this._onStart(this);
	}
	private _stop(): void {
		this._isPlaying = false;

		for (let emitter of this.emitters) {
			emitter && emitter.stop();
		}

		this._onComplete && this._onComplete(this);
	}
	private _reset(): void {
		this._stop();
		this.unscheduleAllCallbacks();
		this._onSpawn = null;
		this._onStart = null;
		this._onUpdate = null;
		this._onComplete = null;

		for (let emitter of this.emitters) {
			emitter && emitter.reset();
		}
	}
	private _remove(): void {
		this._reset();

		const poolableObject = this.node.getComponent(saykit.PoolableObject);
		if (poolableObject) poolableObject.returnToPool();
	}
	private _calculateDeathScheduleTime(): number {
		let maxLifeTime = 0;

		for (let emitter of this.emitters) {
			if (emitter) maxLifeTime = Math.max(emitter.lifeTime, maxLifeTime);
		}

		return maxLifeTime;
	}
	private _schedulePlay(delay: number = 0): void {
		this.scheduleOnce(() => {
			this._play();
		}, delay);
	}
	private _scheduleRemove(duration: number = this._calculateDeathScheduleTime(), delay: number = 0): void {
		const time = this.isForceDestroy ? this.destroyTime : duration;

		this.scheduleOnce(() => {
			this._stop();
			this._remove();
		}, time + delay);
	}
	private _setParent(holder: any): void {
		if (typeof holder === "string") {
			cc.systemEvent.emit(saykit.GameEvent.EFFECT_HOLDER_ADD, holder, this);

			//check if succesful
			const parent = this.node.parent;
			const effectHolder = parent ? parent.getComponent(SKEffectHolder) : null;
			const key = effectHolder ? effectHolder.key : null;

			if (key && key === holder) return;
		} else if (holder instanceof cc.Node) {
			this.node.setParent(holder);
			return;
		}

		this.node.setParent(cc.director.getScene());
	}
	private _setPosition(position: any): void {
		this.node.setPosition(position);
	}
	private _setWorldPosition(worldPosition: any): void {
		if (worldPosition instanceof cc.Vec2) this.node.setWorldPosition(cc.v3(worldPosition));
		else this.node.setWorldPosition(worldPosition);
	}
	private _setRotation(rotation: any): void {
		const is3D = this.node.is3DNode;
		const isQuat = rotation instanceof cc.Quat;
		const isNum = typeof rotation === "number";
		const isVec3 = rotation instanceof cc.Vec3;

		if (!isQuat && !isNum && !isVec3) return;

		if (is3D) {
			if (isNum) this.node.setRotation(cc.quat().fromEuler(cc.v3(0, 0, rotation)));
			else if (isVec3) this.node.setRotation(cc.quat().fromEuler(rotation));
			else if (isQuat) this.node.setRotation(rotation);
		} else {
			if (isNum) this.node.angle = rotation;
			else if (isVec3) this.node.angle = rotation.z;
			else if (isQuat) this.node.angle = rotation.toEuler(cc.v3()).z;
		}
	}
	private _setWorldRotation(worldRotation: any): void {
		const is3D = this.node.is3DNode;
		const isQuat = worldRotation instanceof cc.Quat;
		const isNum = typeof worldRotation === "number";
		const isVec3 = worldRotation instanceof cc.Vec3;

		if (!isQuat && !isNum && !isVec3) return;

		if (is3D) {
			if (isNum) this.node.setRotation(cc.quat().fromEuler(cc.v3(0, 0, worldRotation)));
			else if (isVec3) this.node.setRotation(cc.quat().fromEuler(worldRotation));
			else if (isQuat) this.node.setRotation(worldRotation);
		} else {
			let parent = this.node.parent;
			let parentAngle = 0;

			while (parent instanceof cc.Node) {
				parentAngle += parent.angle;
				parent = parent.parent;
			}

			if (isNum) this.node.angle = worldRotation - parentAngle;
			else if (isVec3) this.node.angle = worldRotation.z - parentAngle;
			else if (isQuat) this.node.angle = worldRotation.toEuler(cc.v3()).z - parentAngle;
		}
	}
	private _setScale(scale: any): void {
		const isVec = scale instanceof cc.Vec2 || scale instanceof cc.Vec3;
		const isNum = typeof scale === "number";

		if (!isVec && !isNum) return;

		if (isVec) this.node.setScale(scale);
		else if (isNum) this.node.setScale(cc.v3(scale, scale, scale));
	}
	private _setWorldScale(worldScale: any): void {
		const isVec2 = worldScale instanceof cc.Vec2;
		const isVec3 = worldScale instanceof cc.Vec3;
		const isNum = typeof worldScale === "number";

		if (!isVec2 && !isVec3 && !isNum) return;

		if (isVec2) this.node.setWorldScale(cc.v3(worldScale));
		else if (isVec3) this.node.setWorldScale(worldScale);
		else if (isNum) this.node.setWorldScale(cc.v3(worldScale, worldScale, worldScale));
	}
	private _mergeParams(params: IEffectSpawnParams, emitParams: IEmitSequenceItem): void {
		this._mergeDelayParams(params, emitParams);
		this._mergeRotationParams(params, emitParams);
		this._mergeScaleParams(params, emitParams);
		this._mergePositionParams(params, emitParams);
	}
	private _mergeDelayParams(params: IEffectSpawnParams, emitParams: IEmitSequenceItem): void {
		params.delay = (params.delay || 0) + emitParams.delay;
	}
	private _mergeRotationParams(params: IEffectSpawnParams, emitParams: IEmitSequenceItem): void {
		const r1 = params.rotation; //Quat | Vec3 | number | undefined
		const r2 = emitParams.rotation; //Vec3 | number | undefined

		if (r1 === undefined && r2 !== undefined) params.rotation = r2;
		else if (r1 instanceof cc.Quat && r2 instanceof cc.Vec3) {
			const rotation = cc.quat();
			cc.Quat.multiply(rotation, r1, cc.quat().fromEuler(r2));

			params.rotation = rotation;
		} else if (r1 instanceof cc.Vec3 && r2 instanceof cc.Vec3) params.rotation = r1.add(r2);
		else if (typeof r1 === "number" && typeof r2 === "number") params.rotation = r1 + r2;

		const wr1 = params.worldRotation; //Quat | Vec3 | number | undefined
		const wr2 = emitParams.worldRotation; //Vec3 | number | undefined

		if (wr1 === undefined && wr2 !== undefined) params.worldRotation = wr2;
		else if (wr1 instanceof cc.Quat && wr2 instanceof cc.Vec3) {
			const worldRotation = cc.quat();
			cc.Quat.multiply(worldRotation, wr1, cc.quat().fromEuler(wr2));

			params.worldRotation = worldRotation;
		} else if (wr1 instanceof cc.Vec3 && wr2 instanceof cc.Vec3) params.worldRotation = wr1.add(wr2);
		else if (typeof wr1 === "number" && typeof wr2 === "number") params.worldRotation = wr1 + wr2;
	}
	private _mergeScaleParams(params: IEffectSpawnParams, emitParams: IEmitSequenceItem): void {
		const s1 = params.scale; //cc.Vec3 | cc.Vec2 | number
		const s2 = emitParams.scale; //cc.Vec3| number

		if (s1 === undefined && s2 !== undefined) params.scale = s2;
		else if ((s1 instanceof cc.Vec3 || s1 instanceof cc.Vec2) && typeof s2 === "number") params.scale = s1.mul(s2);
		else if (typeof s1 === "number" && typeof s2 === "number") params.scale = s1 * s2;
		else if (s1 instanceof cc.Vec3 && s2 instanceof cc.Vec3) params.scale = cc.v3(s1.x * s2.x, s1.y * s2.y, s1.z * s2.z);
		else if (s1 instanceof cc.Vec2 && s2 instanceof cc.Vec3) params.scale = cc.v3(s1.x * s2.x, s1.y * s2.y, s2.z);
		else if (typeof s1 === "number" && s2 instanceof cc.Vec3) params.scale = s2.mul(s1);

		const ws1 = params.worldScale; //cc.Vec3 | cc.Vec2 | number
		const ws2 = emitParams.worldScale; //cc.Vec3| number

		if (ws1 === undefined && ws2 !== undefined) params.worldScale = ws2;
		else if ((ws1 instanceof cc.Vec3 || ws1 instanceof cc.Vec2) && typeof ws2 === "number") params.worldScale = ws1.mul(ws2);
		else if (typeof ws1 === "number" && typeof ws2 === "number") params.worldScale = ws1 * ws2;
		else if (ws1 instanceof cc.Vec3 && ws2 instanceof cc.Vec3) params.worldScale = cc.v3(ws1.x * ws2.x, ws1.y * ws2.y, ws1.z * ws2.z);
		else if (ws1 instanceof cc.Vec2 && ws2 instanceof cc.Vec3) params.worldScale = cc.v3(ws1.x * ws2.x, ws1.y * ws2.y, ws2.z);
		else if (typeof ws1 === "number" && ws2 instanceof cc.Vec3) params.worldScale = ws2.mul(ws1);
	}
	private _mergePositionParams(params: IEffectSpawnParams, emitParams: IEmitSequenceItem): void {
		const p1 = params.position; //cc.Vec3 | cc.Vec2
		const p2 = emitParams.position; //cc.Vec3 | cc.Vec2

		if (p1 === undefined && p2 !== undefined) params.position = p2;
		else if (p1 instanceof cc.Vec2 && p2 instanceof cc.Vec3) params.position = cc.v3(p1.x + p2.x, p1.y + p2.y, p2.z);
		else if (p1 instanceof cc.Vec3 && p2 instanceof cc.Vec2) params.position = cc.v3(p1.x + p2.x, p1.y + p2.y, p1.z);
		else if (p1 instanceof cc.Vec3 && p2 instanceof cc.Vec3) params.position = cc.v3(p1.x + p2.x, p1.y + p2.y, p1.z + p2.z);
		else if (p1 instanceof cc.Vec2 && p2 instanceof cc.Vec2) params.position = cc.v2(p1.x + p2.x, p1.y + p2.y);

		const wp1 = params.worldPosition; //cc.Vec3 | cc.Vec2
		const wp2 = emitParams.worldPosition; //cc.Vec3 | cc.Vec2

		if (wp1 === undefined && wp2 !== undefined) params.worldPosition = wp2;
		else if (wp1 instanceof cc.Vec2 && wp2 instanceof cc.Vec3) params.worldPosition = cc.v3(wp1.x + wp2.x, wp1.y + wp2.y, wp2.z);
		else if (wp1 instanceof cc.Vec3 && wp2 instanceof cc.Vec2) params.worldPosition = cc.v3(wp1.x + wp2.x, wp1.y + wp2.y, wp1.z);
		else if (wp1 instanceof cc.Vec3 && wp2 instanceof cc.Vec3)
			params.worldPosition = cc.v3(wp1.x + wp2.x, wp1.y + wp2.y, wp1.z + wp2.z);
		else if (wp1 instanceof cc.Vec2 && wp2 instanceof cc.Vec2) params.worldPosition = cc.v2(wp1.x + wp2.x, wp1.y + wp2.y);
	}
}

saykit.Effect = SKEffect;
