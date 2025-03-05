import SKIConfigAnalyticsData from "../Config/SKIConfigAnalyticsData";
import SKCheckConditionAnalyticsHelper from "../Helper/Condition/SKCheckConditionAnalyticsHelper";
import SKGetConditionAnalyticsHelper from "../Helper/Condition/SKGetConditionAnalyticsHelper";
import SKRepeatAnalyticsHelper from "../Helper/SKRepeatAnalyticsHelper";
import SKTagAnalyticsHelper from "../Helper/SKTagAnalyticsHelper";
import SKIProjectAnalyticsData from "../Project/SKIProjectAnalyticsData";

export default function SKProgressAnalyticsHandler(config: SKIConfigAnalyticsData): SKIProjectAnalyticsData[] {
	const useSingleton = true;

	const gameEvent = config.trackEvent;
	const analyticEvents = config.analyticsEvents instanceof Array ? config.analyticsEvents : ["pass25", "pass50", "pass75", "complete"];

	const datas = [];

	for (let i = 0; i < analyticEvents.length; i++) {
		const analyticEvent = analyticEvents[i];
		const tag = SKTagAnalyticsHelper(config);
		const repeat = SKRepeatAnalyticsHelper(config);

		const conditions = [];
		const progressCondition = {
			interpol: (i + 1) / analyticEvents.length,

			min: config.min,
			max: config.max,
			minmax: config.minmax,
		};
		switch (true) {
			case typeof config.arg === "number":
			case typeof config.arg === "string":
				progressCondition.arg = config.arg;
				break;
			case typeof config.get === "string":
				progressCondition.get = config.get;
				break;

			case typeof config.dictionaryKey === "string":
				progressCondition.dictionaryKey = config.dictionaryKey;
				break;

			case typeof config.useRepeatCount === "boolean":
				progressCondition.useRepeatCount = config.useRepeatCount;
				break;

			default:
				progressCondition.useRepeatCount = true;
				break;
		}

		const configConditions = [progressCondition, config.conditions, ...(config.conditions || [])];

		for (let configCondition of configConditions) {
			const condition = SKCheckConditionAnalyticsHelper(configCondition, config, {});

			if (condition) {
				SKGetConditionAnalyticsHelper(configCondition, config, condition);
				conditions.push(condition);
			}
		}

		datas.push({
			useSingleton,
			gameEvent,
			analyticEvent,

			tag,
			repeat,
			conditions,
		});
	}

	return datas;
}
