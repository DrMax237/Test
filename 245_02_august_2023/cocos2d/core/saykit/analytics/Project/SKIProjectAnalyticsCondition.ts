export default interface SKIProjectAnalyticsCondition {
	get(args: any[], condition: SKIProjectAnalyticsCondition, repeat: number): any;
	check(args: any[], condition: SKIProjectAnalyticsCondition, repeat: number): any;
}
