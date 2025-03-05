const { ccclass, property } = cc._decorator;

const __isSpineExists = window.sp instanceof Object;
const __skeletonComponent = { type: __isSpineExists ? sp.Skeleton : cc.Asset, visible: __isSpineExists };

@ccclass
class ResultSpineStar extends cc.Component {
	@property(__skeletonComponent) back = null;
	@property(__skeletonComponent) main = null;

	@property(cc.Boolean) _active: boolean = false;
	get active() {
		return this._active;
	}
	set active(value) {
		this._active = value;

		if (value) {
			this.back instanceof sp.Skeleton && this.back.setAnimation(0, "appear", false);
			this.main instanceof sp.Skeleton && this.main.setAnimation(0, "appear", false);
		} else {
			this.main instanceof sp.Skeleton && this.main.setAnimation(0, "empty", false);

			if (this.back instanceof sp.Skeleton) {
				this.back.clearTrack(0);
				this.back.setSlotsToSetupPose();
			}
		}
	}

	toggle(active) {
		this.active = active;
	}
}
