import CCComponent from "../../components/CCComponent";
import { Vec3, Vec2 } from "../../value-types";

const { ccclass, property, menu } = cc._decorator;

//#region classes-helpers

@ccclass("HelperPhysics2D")
class HelperPhysics2D {
	@property(cc.Boolean) isAccumulatorEnabled: boolean = true;
	@property(cc.Vec2) gravity: Vec2 = new cc.Vec2(0, -980);
	@property(cc.Boolean) isDebugPhysics: boolean = false;
}

@ccclass("Helper2DCollider")
class Helper2DCollider {
	@property(cc.Boolean) isColliderDebug: boolean = false;
}

@ccclass("HelperPhysics3D")
class HelperPhysics3D {
	@property(cc.Boolean) useFixedTime: boolean = false;
	@property(cc.Boolean) allowSleep: boolean = true;
	@property(cc.Float) maxSubStep: number = 2;
	@property(cc.Float) deltaTime: number = 60;
	@property(cc.Vec3) gravity: Vec3 = new cc.Vec3(0, -10, 0);
}

//#endregion

@ccclass("saykit.SKPhysicsManager")
@menu("SayKit/PhysicsManager")
export default class SKPhysicsManager extends CCComponent {
	//#region editors fields and properties
	@property(cc.Boolean) isUseDictionary: boolean = false;
	@property({
		type: cc.String,
		visible() {
			return this.isUseDictionary;
		},
	})
	get keyDictionary() {
		return this.node.name;
	}

	@property(cc.Boolean) isPhysics2DEnabled: boolean = false;
	@property(cc.Boolean) isColliderEnabled = false;
	@property(cc.Boolean) isPhysics3DEnabled: boolean = false;

	@property({
		visible: function () {
			return this.isPhysics2DEnabled;
		},
	})
	physics2DSettings: HelperPhysics2D = new HelperPhysics2D();

	@property({
		visible: function () {
			return this.isColliderEnabled;
		},
	})
	colliderSettings: Helper2DCollider = new Helper2DCollider();

	@property({
		visible: function () {
			return this.isPhysics3DEnabled;
		},
	})
	physics3DSettings: HelperPhysics3D = new HelperPhysics3D();

	//#endregion

	//#region private fields and properties

	public physicsManager = cc.director.getPhysicsManager();
	public colliderManager = cc.director.getCollisionManager();
	public physicsManager3D = cc.director.getPhysics3DManager();

	//#endregion

	//#region life-cycle callbacks

	protected __preload(): void {
		if (this.isUseDictionary) {
			saykit.dictionary.add(this.node.name, this);
		}
	}

	protected onLoad(): void {
		this.isPhysics3DEnabled && this.initCannon3D();
		this.isPhysics2DEnabled && this.initBox2D();
		this.isColliderEnabled && this.initColliderBox2D();
	}

	public initCannon3D(): void {
		if (this.physicsManager3D) {
			this.physicsManager3D.enabled = this.isPhysics3DEnabled;
			this.physicsManager3D.maxSubStep = this.physics3DSettings.maxSubStep;
			this.physicsManager3D.gravity = this.physics3DSettings.gravity;
			this.physicsManager3D.useFixedTime = this.physics3DSettings.useFixedTime;
			this.physicsManager3D.deltaTime = 1 / this.physics3DSettings.deltaTime;
		}
	}

	public initBox2D(): void {
		if (this.physicsManager) {
			this.physicsManager.enabled = this.isPhysics2DEnabled;
			this.physicsManager.gravity = this.physics2DSettings.gravity;
			this.physicsManager.enabledAccumulator = this.physics2DSettings.isAccumulatorEnabled;

			if (this.physics2DSettings.isDebugPhysics && CC_DEBUG) {
				this.physicsManager.debugDrawFlags =
					cc.PhysicsManager.DrawBits.e_aabbBit | cc.PhysicsManager.DrawBits.e_jointBit | cc.PhysicsManager.DrawBits.e_shapeBit;
			}
		}
	}

	public initColliderBox2D(): void {
		if (this.colliderManager) {
			this.colliderManager.enabled = this.isColliderEnabled;

			if (this.colliderSettings.isColliderDebug && CC_DEBUG) {
				this.colliderManager.enabledDebugDraw = true;
			}
		}
	}

	//#endregion
}

saykit.PhysicsManager = SKPhysicsManager;
