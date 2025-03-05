export enum SKPropertyType {
	X = 0,
	Y = 1,
	Z = 2,
	Scale = 3,
	ScaleX = 4,
	ScaleY = 5,
	ScaleZ = 6,
	EulerAngleX = 7,
	EulerAngleY = 8,
	EulerAngleZ = 9,
	Width = 10,
	Height = 11,
	AnchorX = 12,
	AnchorY = 13,
	Opacity = 14,
	LightIntensity = 15,
	LightRange = 16,
}
cc.Enum(SKPropertyType);

export enum SKFunctionValueType {
	All = 0,
	Positive = 1,
	Negative = 2,
}
cc.Enum(SKFunctionValueType);
