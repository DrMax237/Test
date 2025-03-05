const { ccclass, property, menu } = cc._decorator;

@ccclass("SKSoundDebugConfig")
class SKSoundDebugConfig {
	@property(cc.String) DEBUG_KEY: string = "";
	@property(cc.String) keyClip: string = "";
	@property(cc.String) keyConfig: string = "";

	get DEBUG_CODE(): number {
		return cc.macro.KEY[this.DEBUG_KEY[0].toLowerCase()];
	}
}

@ccclass("saykit.SoundDebug")
@menu("SayKit/Sound/SoundDebug")
export default class SKSoundDebug extends cc.Component {
	@property([SKSoundDebugConfig]) configs: SKSoundDebugConfig[] = [];

	onLoad() {
		for (let config of this.configs) {
			config.DEBUG_KEY && cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onDebug, this);
		}
	}

	private onDebug(event: { keyCode: number }): void {
		for (let config of this.configs) {
			if (config.DEBUG_CODE === event.keyCode) cc.systemEvent.emit(saykit.GameEvent.SOUND_PLAY, config.keyClip, config.keyConfig);
		}
	}
}

saykit.SoundDebug = SKSoundDebug;
