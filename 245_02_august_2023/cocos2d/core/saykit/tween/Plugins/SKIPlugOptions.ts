const { ccclass } = cc._decorator;

@ccclass("saykit.IPlugOptions")
export class SKIPlugOptions {
	public reset(): void {}
}

saykit.IPlugOptions = SKIPlugOptions;
