export enum AxisConstraint {
	None = 0,
	X = 2,
	Y = 4,
	Z = 8,
	W = 16,
}

cc.Enum(AxisConstraint);
saykit.AxisConstraint = AxisConstraint;
