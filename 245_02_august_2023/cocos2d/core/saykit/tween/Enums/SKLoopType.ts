export enum LoopType {
	// Each loop cycle restarts from the beginning
	Restart = 0,
	// The tween moves forward and backwards at alternate cycles
	Yoyo = 1,
	// Continuously increments the tween at the end of each loop cycle (A to B, B to B+(A-B), and so on), thus always moving "onward".
	// In case of String tweens works only if the tween is set as relative
	Incremental = 2,
}

cc.Enum(LoopType);
saykit.LoopType = LoopType;
