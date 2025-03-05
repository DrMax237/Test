const Easing = cc.Enum({
	Constant : 0,
	Linear : 1,
	Fade : 4,
	Smooth : 5,

	BackIn: 11,
	BackInOut : 13,
	BackOut : 12,
	BackOutIn : 14,

	BounceIn : 21,
	BounceInOut : 23,
	BounceOut : 22,
	BounceOutIn : 24,

	CrcIn : 31,
	CircInOut : 33,
	CircOut : 32,
	CircOutIn : 34,

	CubicIn : 41,
	CubicInOut : 43,
	CubicOut : 42,
	CubicOutIn : 44,

	ElasticIn : 51,
	ElasticInOut : 53,
	ElasticOut : 52,

	ExpoIn : 61,
	ExpoInOut : 63,
	ExpoOut : 62,
	ExpoOutIn : 64,

	QuadIn : 71,
	QuadInOut : 73,
	QuadOut : 72,
	QuadOutIn : 74,

	QuartIn : 81,
	QuartInOut : 83,
	QuartOut : 82,
	QuartOutIn : 84,

	QuintIn : 91,
	QuintInOut : 93,
	QuintOut : 92,
	QuintOutIn : 94,

	SineIn : 101,
	SineInOut : 103,
	SineOut : 102,
	SineOutIn : 104,
});

saykit.Easing = module.exports = Easing;
