export enum FilterType {
	All = 0,
	Id = 1, // Check for id
	AllExceptIds = 2, // Excludes given ids
}

cc.Enum(FilterType);
saykit.FilterType = FilterType;
