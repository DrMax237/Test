const { ccclass, property, menu } = cc._decorator;

@ccclass("saykit.PoolableObject")
@menu("SayKit/Pool/PoolableObject")
export default class SKPoolableObject extends cc.Component {
	@property(cc.Boolean) private isCustomKey: boolean = false;
	@property({
		type: cc.String,
		visible() {
			return this.isCustomKey;
		},
	})
	private configKey: string = "Default";

	public activateCallback: () => void = null;
	public deactivateCallback: () => void = null;

	private _pool: saykit.Pool = null;
	private _inPool: boolean = false;
	private _nodeData: saykit.PropertyResetting = null;

	protected onLoad(): void {
		if (this._pool === null) {
			this._pool = saykit.poolManager.getPool(this.node);
		}

		this._nodeData = new saykit.PropertyResetting(this.node);
	}

	protected onDestroy(): void {
		if (this._pool) {
			this._pool.removeFromStack(this);
		}
	}

	private _isNodeExist(): boolean {
		if (this.node === null) {
			cc.warn("PoolableObject Node was destroyed");
			return false;
		}

		return true;
	}

	public get pool(): saykit.Pool {
		return this._pool;
	}

	public get key(): string {
		return this.isCustomKey ? this.configKey : null;
	}

	public init(pool: saykit.Pool): void {
		this._pool = pool;
		this.deactivate();
	}

	public activate(): void {
		if (!this._isNodeExist()) return;

		this._inPool = false;

		if (this._nodeData) {
			this._nodeData.reset();
		}

		if (typeof this.activateCallback === "function") {
			this.activateCallback();
		}
	}

	public deactivate(): void {
		if (!this._isNodeExist()) return;

		this._inPool = true;

		this.placeToPoolNode();
		this.node.active = false;

		if (typeof this.deactivateCallback === "function") {
			this.deactivateCallback();
		}
	}

	public placeToPoolNode(): void {
		if (!this._isNodeExist()) return;
		this.node.setParent(saykit.poolManager.poolNode || cc.director.getScene());
	}

	public returnToPool(): void {
		if (!this._isNodeExist()) return;

		if (this._pool === null) {
			this._pool = saykit.poolManager.getPool(this.node);
		}

		if (this._pool !== null && !this._inPool) {
			this._pool.push(this);
		}
	}
}

saykit.PoolableObject = SKPoolableObject;
