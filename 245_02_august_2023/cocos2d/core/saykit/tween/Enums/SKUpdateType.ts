export enum UpdateType {
	// Updates every frame during Update calls
	Normal = 0,
	// Updates every frame during LateUpdate calls
	Late = 1,
	// Updates using manual update calls
	Manual = 2,
}

cc.Enum(UpdateType);
saykit.UpdateType = UpdateType;
