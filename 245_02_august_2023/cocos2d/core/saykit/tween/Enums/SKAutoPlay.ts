export enum AutoPlay {
	// No tween is automatically played
	None = 0,
	// Only Sequences are automatically played
	AutoPlaySequences = 1,
	// Only Tweeners are automatically played
	AutoPlayTweeners = 2,
	// All tweens are automatically played
	All = 3,
}

cc.Enum(AutoPlay);
saykit.AutoPlay = AutoPlay;
