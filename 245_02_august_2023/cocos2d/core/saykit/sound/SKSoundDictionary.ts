const { ccclass, property, menu } = cc._decorator;

@ccclass("SKClip")
class SKClip {
	@property(cc.String) key = "";
	@property(cc.AudioClip) audioClip = null;
}

@ccclass("saykit.SoundDictionary")
@menu("SayKit/Sound/SoundDictionary")
export default class SKSoundDictionary extends cc.Component {
	@property([SKClip]) clips: SKClip[] = [];

	onLoad() {
		for (let clip of this.clips) {
			cc.systemEvent.emit(saykit.GameEvent.ADD_ITEM, "sound_clip_" + clip.key, clip.audioClip);
		}
	}
}

saykit.SoundDictionary = SKSoundDictionary;
