export enum UpdateMode {
	Update = 0,
	// Treats update as a full goto, thus not calling eventual onStepCompleteCallback callbacks
	Goto = 1,
	// Ignores onUpdate callback (used when applying some ChangeValue during an onUpdate call)
	IgnoreOnUpdate = 2,
	// Set by tween.Complete extension, if OnComplete is fired manually during an updateLoop,
	// so it  will not be fired twice (since it will already be fired by the update loop)
	IgnoreOnComplete = 3,
}

cc.Enum(UpdateMode);
saykit.UpdateMode = UpdateMode;
