import SKIProjectAnalyticsCondition from "./SKIProjectAnalyticsCondition";

export default interface SKIProjectAnalyticsData {
	useSingleton: boolean;

	gameEvent: string;
	analyticEvent: string;
	tag: (args: any[], repeat: number) => string;

	repeat: {
		value: number;
		pre(): void;
		post(): void;

		condition: SKIProjectAnalyticsCondition;
	};

	conditions: SKIProjectAnalyticsCondition[];
}
