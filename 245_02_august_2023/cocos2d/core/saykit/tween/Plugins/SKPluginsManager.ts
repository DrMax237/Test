const { ccclass } = cc._decorator;

@ccclass("saykit.PluginsManager")
export default class SKPluginsManager {
	private static _floatPlugin: saykit.FloatPlugin;
	private static _vector3Plugin: saykit.Vector3Plugin;
	private static _arrayPlugin: saykit.ArrayPlugin;

	public static setDefaultPlugin<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		t: saykit.TweenerCore<T1, T2, TPlugOptions>,
		endValue: T2
	): void {
		let plugin = null;
		let options = null;

		switch (true) {
			case typeof endValue === "number":
				if (SKPluginsManager._floatPlugin == null) SKPluginsManager._floatPlugin = new saykit.FloatPlugin();
				plugin = SKPluginsManager._floatPlugin;
				options = new saykit.FloatOptions();
				break;

			case endValue instanceof cc.Vec3:
				if (SKPluginsManager._vector3Plugin == null) SKPluginsManager._vector3Plugin = new saykit.Vector3Plugin();
				plugin = SKPluginsManager._vector3Plugin;
				options = new saykit.VectorOptions();
				break;

			case endValue instanceof Array:
				if (SKPluginsManager._arrayPlugin == null) SKPluginsManager._arrayPlugin = new saykit.ArrayPlugin();
				plugin = SKPluginsManager._arrayPlugin;
				options = new saykit.FloatOptions();
				// t.startValue = [];
				// t.changeValue = [];
				break;
		}

		if (plugin != null) t.tweenPlugin = plugin as saykit.ABSTweenPlugin<T1, T2, TPlugOptions>;
		if (options != null) t.plugOptions = options;
	}

	public static purgeAll(): void {
		this._floatPlugin = null;
		this._vector3Plugin = null;
		this._arrayPlugin = null;
	}
}

saykit.PluginsManager = SKPluginsManager;
