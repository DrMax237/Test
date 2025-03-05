export enum RewindCallbackMode {
	// When calling Rewind or PlayBackwards/smoothRewind, onRewind callbacks will be fired only if the tween isn't already rewinded
	FireIfPositionChanged = 0,
	// When calling Rewind, onRewind callbacks will always be fired, even if the tween is already rewinded.
	// When calling PlayBackwards/smoothRewind instead, onRewind callbacks will be fired only if the tween isn't already rewinded
	FireAlwaysWithRewind = 1,
	// When calling Rewind or PlayBackwards/smoothRewind, onRewind callbacks will always be fired, even if the tween is already rewinded
	FireAlways = 2,
}

cc.Enum(RewindCallbackMode);
saykit.RewindCallbackMode = RewindCallbackMode;
