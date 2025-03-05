const { ccclass, property, menu } = cc._decorator;

export enum SKSoundActions {
	Play = 0,
	Loop = 1,
	Pause = 2,
	Stop = 3,
}
cc.Enum(SKSoundActions);

@ccclass("saykit.SoundConfig")
@menu("SayKit/Sound/SoundConfig")
export default class SKSoundConfig extends cc.Component {
	@property(cc.String) key = "";
	@property({ type: SKSoundActions }) action: SKSoundActions = SKSoundActions.Play;

	@property({
		visible() {
			const isVisible = this.action === SKSoundActions.Play;
			if (!isVisible) this.isTheOnlySound = false;
			return isVisible;
		},
	})
	isTheOnlySound = false;

	@property({
		visible() {
			const isVisible = this.action === SKSoundActions.Play || this.action === SKSoundActions.Loop;
			if (!isVisible) this.isVolumeChange = false;
			return isVisible;
		},
	})
	isVolumeChange = false;
	@property({
		visible() {
			return this.isVolumeChange;
		},
	})
	isVolumeRandom = false;
	@property({
		type: cc.Float,
		visible() {
			return this.isVolumeChange && !this.isVolumeRandom;
		},
	})
	volume = 0.5;
	@property({
		visible() {
			return this.isVolumeChange && this.isVolumeRandom;
		},
	})
	volumeMinMax = cc.v2(0, 1);

	protected onLoad(): void {
		cc.systemEvent.emit(saykit.GameEvent.ADD_ITEM, "sound_config_" + this.key, this);
	}
}

saykit.SoundConfig = SKSoundConfig;
