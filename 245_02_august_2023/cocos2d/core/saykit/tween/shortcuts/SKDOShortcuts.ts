const { ccclass } = cc._decorator;

@ccclass("saykit.DOShortcuts")
export default class SKDOShortcuts extends saykit.DOTween {
	public static addMove<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: any,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		let startValue;
		if (endValue instanceof Array) {
			startValue = endValue[0];
			endValue = endValue[endValue.length - 1];
		} else {
			startValue = target.position.clone();
		}

		if (!(endValue instanceof cc.Vec3)) return;

		let t = saykit.DOShortcuts.add(
			() => {
				return startValue.clone();
			},
			(value) => {
				target.setPosition(value);
			},
			endValue,
			duration
		);
		t.setOptionsVec3(saykit.AxisConstraint.None, snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	public static addMoveX<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: number | Array<T1>,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		if (endValue instanceof Array) {
			endValue[0] = cc.v3(endValue[0], 0, 0);
			endValue[endValue.length - 1] = cc.v3(endValue[endValue.length - 1], 0, 0);
		} else {
			endValue = cc.v3(endValue, 0, 0);
		}

		let t = saykit.DOShortcuts.addMove(target, endValue, duration);
		t.setOptionsVec3(saykit.AxisConstraint.X, snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	public static addMoveY<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: number,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		if (endValue instanceof Array) {
			endValue[0] = cc.v3(0, endValue[0], 0);
			endValue[endValue.length - 1] = cc.v3(0, endValue[endValue.length - 1], 0);
		} else {
			endValue = cc.v3(0, endValue, 0);
		}

		let t = saykit.DOShortcuts.addMove(target, endValue, duration);
		t.setOptionsVec3(saykit.AxisConstraint.Y, snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	public static addMoveZ<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: number,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		if (endValue instanceof Array) {
			endValue[0] = cc.v3(0, 0, endValue[0]);
			endValue[endValue.length - 1] = cc.v3(0, 0, endValue[endValue.length - 1]);
		} else {
			endValue = cc.v3(0, 0, endValue);
		}

		let t = saykit.DOShortcuts.addMove(target, endValue, duration);
		t.setOptionsVec3(saykit.AxisConstraint.Z, snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	public static addRotate<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: any,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		let startValue;
		if (endValue instanceof Array) {
			startValue = endValue[0];
			endValue = endValue[endValue.length - 1];
		} else {
			startValue = target.eulerAngles.clone();
		}

		if (!(endValue instanceof cc.Vec3)) return;

		let t = saykit.DOShortcuts.add(
			() => startValue.clone(),
			(value) => {
				target.setRotation(cc.quat().fromEuler(value));
			},
			endValue,
			duration
		);
		t.setOptionsVec3(saykit.AxisConstraint.None, snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	public static addJump(
		target: any,
		endValue: any,
		jumpPower: number,
		numJumps: number,
		duration: number,
		snapping: boolean = false
	): saykit.Sequence {
		if (!(target instanceof cc.Node)) return;
		if (!(endValue instanceof cc.Vec3)) return;
		if (numJumps < 1) numJumps = 1;
		let startPosY = 0;
		let offsetY = -1;
		let offsetYSet = false;
		let s = saykit.DOShortcuts.addSequence();
		let yTween = saykit.DOShortcuts.add(
			() => target.position.clone(),
			(x) => {
				target.setPosition(x);
			},
			new cc.Vec3(0, jumpPower, 0),
			duration / (numJumps * 2)
		)
			.setOptionsVec3(saykit.AxisConstraint.Y, snapping)
			.setEase(cc.easing.quadOut)
			.setRelative()
			.setLoops(numJumps * 2, saykit.LoopType.Yoyo)
			.onStart(() => (startPosY = target.position.y));
		s.append(
			saykit.DOShortcuts.add(
				() => target.position.clone(),
				(x) => {
					target.setPosition(x);
				},
				new cc.Vec3(endValue.x, 0, 0),
				duration
			)
				.setOptionsVec3(saykit.AxisConstraint.X, snapping)
				.setEase(cc.easing.linear)
		)
			.join(yTween)
			.setEase(saykit.DOShortcuts.defaultEaseType);
		yTween.onUpdate(() => {
			if (!offsetYSet) {
				offsetYSet = true;
				offsetY = s.isRelative ? endValue.y : endValue.y - startPosY;
			}
			let pos = target.position;
			pos.y += cc.easing.quadOut(yTween.getElapsedPercentage() / offsetY);
			target.setPosition(pos);
		});
		return s;
	}
	public static addScale<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: any,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		let startValue;
		if (endValue instanceof Array) {
			startValue = endValue[0];
			endValue = endValue[endValue.length - 1];
		} else {
			startValue = target.getScale().clone();
		}

		if (typeof startValue === "number") startValue = cc.v3(startValue, startValue, startValue);
		if (typeof endValue === "number") endValue = cc.v3(endValue, endValue, endValue);
		else if (!(endValue instanceof cc.Vec3)) return;

		let t = saykit.DOShortcuts.add(
			() => startValue.clone(),
			(value) => {
				target.setScale(value);
			},
			endValue,
			duration
		);
		t.setOptionsVec3(saykit.AxisConstraint.None, snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	public static addSize<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: any,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		let startValue;
		if (endValue instanceof Array) {
			startValue = endValue[0];
			endValue = endValue[endValue.length - 1];
		} else {
			startValue = target.getContentSize().clone();
		}

		if (typeof startValue === "number") startValue = cc.size(startValue, startValue);
		if (typeof endValue === "number") endValue = cc.size(endValue, endValue);
		else if (!(endValue instanceof cc.Size)) return;

		let t = saykit.DOShortcuts.addWithProps(
			target,
			{
				width: [startValue.width, endValue.width],
				height: [startValue.height, endValue.height],
			},
			duration
		);
		t.setOptions(snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	public static addOpacity<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: any,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		let startValue;
		if (endValue instanceof Array) {
			startValue = endValue[0];
			endValue = endValue[endValue.length - 1];
		} else {
			startValue = target.opacity;
		}

		let t = saykit.DOShortcuts.add(
			() => startValue,
			(value) => {
				target.opacity = value;
			},
			endValue,
			duration
		);
		t.setOptionsVec3(saykit.AxisConstraint.None, snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
	public static addColor<T1, T2, TPlugOptions extends saykit.IPlugOptions>(
		target: any,
		endValue: any,
		duration: number,
		snapping: boolean = false
	): saykit.TweenerCore<T1, T2, TPlugOptions> {
		if (!(target instanceof cc.Node)) return;

		let startValue;
		if (endValue instanceof Array) {
			startValue = endValue[0];
			endValue = endValue[endValue.length - 1];
		} else {
			startValue = target.color.clone();
		}

		if (!(startValue instanceof cc.Color) || !(endValue instanceof cc.Color)) return;

		let color = target.color;
		color.a = target.opacity;
		let t = saykit.DOShortcuts.addWithProps(
			color,
			{
				r: [startValue.r, endValue.r],
				g: [startValue.g, endValue.g],
				b: [startValue.b, endValue.b],
				a: [startValue.a, endValue.a],
			},
			duration
		).onUpdate(() => {
			target.color = new cc.Color(color.r, color.g, color.b);
			target.opacity = color.a;
		});
		t.setOptions(snapping);

		return t as saykit.TweenerCore<T1, T2, TPlugOptions>;
	}
}

saykit.DOShortcuts = SKDOShortcuts;
