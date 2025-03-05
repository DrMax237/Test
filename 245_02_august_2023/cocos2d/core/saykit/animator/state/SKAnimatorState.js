class SKAnimatorState {
	constructor(animator, stateData) {
		this.isAutoUpdate = true;

		this.animator = animator;

		this.init(stateData);
	}

	init() {}

	process(time) {}
	onRefreshAnimation(animator, animation) {}
}

saykit.AnimatorState = module.exports = SKAnimatorState;
