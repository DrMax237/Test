class SKTransitionAnimatorState extends saykit.AnimatorState {
	init({
		maskNode = null,
		isMaskValues = false,

		key = "None",
		data = { key },
		nextStateData = data,
		funcCreateState = saykit.BasicAnimatorState,
		state = null,

		overlapToNextState = true,
		duration = 0,

		isReverse = false,
		speed = 1,
		direction = isReverse ? -1 : 1,

		startTime = 0,
		endTime = duration,
		time = isReverse ? endTime : startTime,

		update = null,
		callback = null,
		updateCallback = update,
		finishCallback = callback,

		isAutoStartProcess = false,
		isAutoStartNextState = true,
	} = {}) {
		const animation = this.animator.animation || null;

		this.active = true;

		this.maskNode = maskNode || (animation && animation.node) || null;

		this.origin = this._defineTransformData([], this.maskNode, isMaskValues);
		this.state = state || new funcCreateState(this.animator, nextStateData);
		this.state.process(0);
		this.target = this._defineTransformData([], this.maskNode, isMaskValues);
		this._fixDataEulerAngles(this);

		this.isAutoStartNextState = isAutoStartNextState;
		this.time = time;
		this.duration = duration;

		this.startTime = startTime;
		this.endTime = endTime;
		this.direction = direction;
		this.speed = speed;

		this.overlapToNextState = overlapToNextState;
		this.updateCallback = updateCallback;
		this.finishCallback = finishCallback;

		isAutoStartProcess && this._processTransition(0);
	}

	_defineTransformData(transformData, node, isGetNodeValues = true) {
		if (node instanceof cc.Node) {
			isGetNodeValues &&
				transformData.push({
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
	_fixDataEulerAngles(data) {
		const origin = data.origin;
		const target = data.target;

		for (let i in origin) {
			const o = origin[i];
			const t = target[i];

			const deltaEulerAngles = o.eulerAngles.sub(t.eulerAngles);
			if (Math.abs(deltaEulerAngles.x) > 180) {
				o.eulerAngles.x -= Math.sign(deltaEulerAngles.x) * 360;
			}
			if (Math.abs(deltaEulerAngles.y) > 180) {
				o.eulerAngles.y -= Math.sign(deltaEulerAngles.y) * 360;
			}
			if (Math.abs(deltaEulerAngles.z) > 180) {
				o.eulerAngles.z -= Math.sign(deltaEulerAngles.z) * 360;
			}
		}
	}

	process(time) {
		this._processTransition(time);
	}

	_processTransition(dt) {
		if (!this.active) return;

		const direction = this.direction;
		const bound = direction > 0 ? this.endTime : this.startTime;

		const realTime = this.time + direction * this.speed * dt;
		const clampedTime = Math[direction > 0 ? "min" : "max"](realTime, bound);
		const overlapTime = clampedTime - realTime;

		this.time = clampedTime;

		const interpol = Math.min(1, this.time / this.duration);

		for (let i in this.origin) {
			const origin = this.origin[i];
			const target = this.target[i];
			const targetNode = origin.target;

			targetNode.setPosition(cc.Vec3.lerp(new cc.Vec3(), origin.position, target.position, interpol));
			targetNode.setScale(cc.Vec3.lerp(new cc.Vec3(), origin.scale, target.scale, interpol));
			targetNode.setRotation(new cc.Quat().fromEuler(cc.Vec3.lerp(new cc.Vec3(), origin.eulerAngles, target.eulerAngles, interpol)));
		}

		this.updateCallback instanceof Function && this.updateCallback(dt, this);
		if (clampedTime === bound) {
			this.onTransitionEnd();

			this.overlapToNextState && this.state && this.state.process((overlapTime * direction) / this.speed);
		}
	}

	onTransitionEnd() {
		this.active = false;

		this.isAutoStartNextState && this.animator.play(this.state);
		this.finishCallback instanceof Function && this.finishCallback();
	}

	onRefreshAnimation(animator, animation) {
		this.state && this.state.onRefreshAnimation && this.state.onRefreshAnimation(animator, animation);
	}
}

saykit.TransitionAnimatorState = module.exports = SKTransitionAnimatorState;
