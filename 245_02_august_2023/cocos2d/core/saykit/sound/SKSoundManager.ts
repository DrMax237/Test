import SKSoundConfig, { SKSoundActions } from "./SKSoundConfig";

saykit.GameEvent.SOUND_PLAY = "SOUND_PLAY";

class SKClipID {
	public clipName: string;
	public id: number;
	public volume: number;

	constructor(clipName: string, id: number, volume: number) {
		this.clipName = clipName;
		this.id = id;
		this.volume = volume;
	}
}

export default class SKSoundManager {
	private _clip = null;
	private _config: SKSoundConfig = null;
	private _playingClipIDs = [];

	constructor() {
		cc.systemEvent.on(saykit.GameEvent.SOUND_PLAY, this.onSoundPlay, this);
	}

	private _play(): void {
		if (!this._clip || !this._config) return;

		let id;
		let clipName = this._clip.name;
		let volume = this._getVolume();

		switch (this._config.action) {
			case SKSoundActions.Loop:
				id = this._getPlayingId(clipName);

				if (id >= 0) id = cc.audioEngine.resume(id);
				else {
					id = cc.audioEngine.play(this._clip, true, volume);
					this._playingClipIDs.push(new SKClipID(clipName, id, volume));
				}
				break;

			case SKSoundActions.Play:
				if (this._config.isTheOnlySound) this._setVolumeForAll(true);
				id = cc.audioEngine.play(this._clip, false, volume);

				cc.audioEngine.setFinishCallback(id, () => {
					this._getPlayingId(clipName, true);
					if (this._config.isTheOnlySound && cc.audioEngine.getVolume(id) !== 0) this._setVolumeForAll(false);
				});

				this._playingClipIDs.push(new SKClipID(clipName, id, volume));
				break;

			case SKSoundActions.Pause:
				id = this._getPlayingId(clipName);
				cc.audioEngine.pause(id);
				break;

			case SKSoundActions.Stop:
				id = this._getPlayingId(clipName, true);
				cc.audioEngine.stop(id);
				break;
		}
	}
	private _getRandomValue(minMax: cc.Vec2): number {
		return Math.random() * (minMax.y - minMax.x) + minMax.x;
	}
	private _getVolume(): number {
		let volume = 1;

		if (this._config.isVolumeChange) {
			volume = this._config.isVolumeRandom ? this._getRandomValue(this._config.volumeMinMax) : this._config.volume;
		}

		return volume;
	}
	private _getPlayingId(clipName: any, isRemove = false): number {
		let id = -1,
			index = -1;

		for (let i = 0; i < this._playingClipIDs.length; i++) {
			const clipID = this._playingClipIDs[i];

			if (clipID.clipName === clipName) {
				id = clipID.id;
				index = i;
				break;
			}
		}

		if (isRemove && index >= 0) this._playingClipIDs.splice(index, 1);

		return id;
	}
	private _setVolumeForAll(isZero = false): void {
		for (let clipID of this._playingClipIDs) {
			cc.audioEngine.setVolume(clipID.id, isZero ? 0 : clipID.volume);
		}
	}

	private onSoundPlay(clipKey: string, configKey: string): void {
		cc.systemEvent.emit(saykit.GameEvent.GET_ITEM_VALUE, "sound_clip_" + clipKey, (value) => {
			this._clip = value;
		});
		cc.systemEvent.emit(saykit.GameEvent.GET_ITEM_VALUE, "sound_config_" + configKey, (value) => {
			this._config = value;
			this._play();
		});
	}
}

saykit.soundManager = new SKSoundManager();
