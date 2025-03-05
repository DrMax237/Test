class SKBasicAnimatorState extends saykit.AnimatorState {
	init({
		maskNode = (this.animator.animation && this.animator.animation.node) || null,

		key = "None",
		mode = "loop",
		isReverse = false,

		speed = 1,
		direction = isReverse ? -1 : 1,

		startTime = 0,
		endTime = undefined,
		time = undefined,

		update = null,
		callback = null,

		updateCallback = update,
		finishCallback = callback,

		isAutoStartProcess = false,
	} = {}) {
		this.active = true;
		this.maskNode = maskNode || null;

		this.key = key;
		this.clip = this.animator.getClip(this.key);

		if (!this.clip) {
			cc.error("SKAnimator: No clip found with name:", '"' + this.key + '"');
			return;
		}

		this.isReverse = isReverse;
		this.mode = mode;

		this.startTime = startTime;
		this.endTime = endTime !== undefined ? endTime : this.clip.duration;
		this.direction = direction;
		this.speed = speed;

		this.updateCallback = updateCallback;
		this.finishCallback = finishCallback;

		const animation = this.animator.animation || null;
		const currentTime = time !== undefined ? time : isReverse ? this.endTime : this.startTime;
		this.state = this.createAnimationState(key, currentTime, this.clip, animation);

		isAutoStartProcess && this._processAnimationState(0);
	}

	set time(value) {
		if (this.state) {
			this.state.time = value;

			if (this.animator.animation.node !== this.maskNode) {
				const origin = this._defineTransformData({}, this.animator.animation.node, true);
				this.state._process();
				const mask = this._defineTransformData({}, this.maskNode, true);

				for (let i in origin) {
					if (mask[i] === undefined) {
						const data = origin[i];
						const node = data.target;

						node.setPosition(data.position);
						node.setScale(data.scale);
						node.setRotation(new cc.Quat().fromEuler(data.eulerAngles));
					}
				}
			} else {
				this.state._process();
			}
		}
	}
	get time() {
		return this.state && this.state.time;
	}

	addAnimationClip(key, clip, animation) {
		clip instanceof cc.AnimationClip && animation instanceof cc.Animation && animation.addClip(clip, key);
	}
	createAnimationState(key, time, clip, animation) {
		if (!(animation instanceof cc.Animation)) return null;

		this.addAnimationClip(key, clip, animation);

		const state = animation.play(this.key, time);
		animation.stop();

		return state;
	}

	process(time) {
		this._processAnimationState(time);
	}

	_processAnimationState(dt) {
		if (!this.active) return;
		if (!(this.state instanceof cc.AnimationState)) return;

		const direction = this.direction;
		const bound = direction > 0 ? this.endTime : this.startTime;

		const realTime = this.state.time + direction * this.speed * dt * this.clip.speed;
		const clampedTime = Math[direction > 0 ? "min" : "max"](realTime, bound);
		const overlapTime = clampedTime - realTime;

		this.time = clampedTime;

		this.updateCallback instanceof Function && this.updateCallback(dt, this);

		if (clampedTime === bound) {
			this.onAnimationStateEnd();
			this._processAnimationState((overlapTime * direction) / (this.speed * this.clip.speed));
		}
	}
	_defineTransformData(transformData, node, isGetNodeValues = true) {
		if (node instanceof cc.Node) {
			isGetNodeValues &&
				(transformData[node.uuid] = {
					target: node,
					position: node.getPosition(),
					scale: node.getScale(),
					eulerAngles: node.eulerAngles.clone(),
				});

			for (let i in node.children) {
				this._defineTransformData(transformData, node.children[i]);
			}
		}

		return transformData;
	}

	onAnimationStateEnd() {
		switch (this.mode) {
			case "loop":
				this.time = this.isReverse ? this.endTime : this.startTime;
				break;
			case "ping-pong":
				this.direction *= -1;
				break;
			default:
				this.active = false;
				break;
		}

		this.finishCallback instanceof Function && this.finishCallback(this);
	}

	onRefreshAnimation(animator, animation = null) {
		if (!animation) return;
		if (this.animator !== animator) return;

		this.state = this.createAnimationState(this.key, this.time, this.clip, animation);
		this._processAnimationState(0);
	}
}

saykit.BasicAnimatorState = module.exports = SKBasicAnimatorState;
