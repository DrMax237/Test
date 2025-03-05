const { ccclass } = cc._decorator;

@ccclass("saykit.Vector3Plugin")
export default class SKVector3Plugin extends saykit.ABSTweenPlugin<any, any, saykit.VectorOptions> {
	public setFrom(
		t: saykit.TweenerCore<any, any, saykit.VectorOptions>,
		isRelative: boolean,
		fromValue?: any,
		setImmediately: boolean = true
	): void {
		if (fromValue) {
			if (isRelative) {
				let currVal: any = t.getter();
				t.endValue.addSelf(currVal);
				fromValue.addSelf(currVal);
			}
			t.startValue = fromValue;
			if (setImmediately) {
				let to: any;
				switch (t.plugOptions.axisConstraint) {
					case saykit.AxisConstraint.X:
						to = t.getter();
						to.x = fromValue.x;
						break;
					case saykit.AxisConstraint.Y:
						to = t.getter();
						to.y = fromValue.y;
						break;
					case saykit.AxisConstraint.Z:
						to = t.getter();
						to.z = fromValue.z;
						break;
					default:
						to = fromValue;
						break;
				}
				if (t.plugOptions.snapping) {
					to.x = Math.round(to.x);
					to.y = Math.round(to.y);
					to.z = Math.round(to.z);
				}
				t.setter(to);
			}
		} else {
			let prevEndVal = t.endValue;
			t.endValue = t.getter();
			t.startValue = isRelative ? t.endValue.add(prevEndVal) : prevEndVal;
			let to = t.endValue;
			switch (t.plugOptions.axisConstraint) {
				case saykit.AxisConstraint.X:
					to.x = t.startValue.x;
					break;
				case saykit.AxisConstraint.Y:
					to.y = t.startValue.y;
					break;
				case saykit.AxisConstraint.Z:
					to.z = t.startValue.z;
					break;
				default:
					to = t.startValue;
					break;
			}
			if (t.plugOptions.snapping) {
				to.x = Math.round(to.x);
				to.y = Math.round(to.y);
				to.z = Math.round(to.z);
			}
			t.setter(to);
		}
	}
	public convertToStartValue(t: saykit.TweenerCore<any, any, saykit.VectorOptions>, value: any): any {
		return value;
	}
	public setRelativeEndValue(t: saykit.TweenerCore<any, any, saykit.VectorOptions>): void {
		t.endValue.addSelf(t.startValue);
	}
	public setChangeValue(t: saykit.TweenerCore<any, any, saykit.VectorOptions>): void {
		switch (t.plugOptions.axisConstraint) {
			case saykit.AxisConstraint.X:
				t.changeValue = new cc.Vec3(t.endValue.x - t.startValue.x, 0, 0);
				break;
			case saykit.AxisConstraint.Y:
				t.changeValue = new cc.Vec3(0, t.endValue.y - t.startValue.y, 0);
				break;
			case saykit.AxisConstraint.Z:
				t.changeValue = new cc.Vec3(0, 0, t.endValue.z - t.startValue.z);
				break;
			default:
				t.changeValue = t.endValue.sub(t.startValue);
				break;
		}
	}
	public getSpeedBasedDuration(options: saykit.VectorOptions, unitsXSecond: number, changeValue: any): number {
		return changeValue.mag() / unitsXSecond;
	}
	public evaluateAndApply(
		options: saykit.VectorOptions,
		t: saykit.Tween,
		isRelative: boolean,
		getter: () => any,
		setter: (value: any) => void,
		elapsed: number,
		startValue: any,
		changeValue: any,
		duration: number
	): void {
		if (t.loopType == saykit.LoopType.Incremental)
			startValue.addSelf(changeValue.mul(t.isComplete ? t.completedLoops - 1 : t.completedLoops));
		if (t.isSequenced && t.sequenceParent.loopType == saykit.LoopType.Incremental) {
			startValue.addSelf(
				changeValue.mul(
					(t.loopType == saykit.LoopType.Incremental ? t.loops : 1) *
						(t.sequenceParent.isComplete ? t.sequenceParent.completedLoops - 1 : t.sequenceParent.completedLoops)
				)
			);
		}

		let easeVal = t.easeType(elapsed / duration);
		switch (options.axisConstraint) {
			case saykit.AxisConstraint.X:
				let resX: any = getter();
				resX.x = startValue.x + changeValue.x * easeVal;
				if (options.snapping) resX.x = Math.round(resX.x);
				setter(resX);
				break;
			case saykit.AxisConstraint.Y:
				let resY: any = getter();
				resY.y = startValue.y + changeValue.y * easeVal;
				if (options.snapping) resY.y = Math.round(resY.y);
				setter(resY);
				break;
			case saykit.AxisConstraint.Z:
				let resZ: any = getter();
				resZ.z = startValue.z + changeValue.z * easeVal;
				if (options.snapping) resZ.z = Math.round(resZ.z);
				setter(resZ);
				break;
			default:
				let res: any = getter();
				res.x = startValue.x + changeValue.x * easeVal;
				res.y = startValue.y + changeValue.y * easeVal;
				res.z = startValue.z + changeValue.z * easeVal;
				if (options.snapping) {
					res.x = Math.round(res.x);
					res.y = Math.round(res.y);
					res.z = Math.round(res.z);
				}
				setter(res);
				break;
		}
	}
	public reset(t: saykit.TweenerCore<any, any, saykit.VectorOptions>): void {}
}

saykit.Vector3Plugin = SKVector3Plugin;
