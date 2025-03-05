import SKIConfigAnalyticsData from "../Config/SKIConfigAnalyticsData";
import SKCheckConditionAnalyticsHelper from "../Helper/Condition/SKCheckConditionAnalyticsHelper";
import SKGetConditionAnalyticsHelper from "../Helper/Condition/SKGetConditionAnalyticsHelper";
import SKRepeatAnalyticsHelper from "../Helper/SKRepeatAnalyticsHelper";
import SKTagAnalyticsHelper from "../Helper/SKTagAnalyticsHelper";
import SKIProjectAnalyticsData from "../Project/SKIProjectAnalyticsData";

export default function SKBasicAnalyticsHandler(config: SKIConfigAnalyticsData): SKIProjectAnalyticsData[] {
	let useSingleton = true;
	switch (true) {
		case typeof config.isOnce === "boolean":
			useSingleton = config.isOnce;
			break;

		case typeof config.isMultiple === "boolean":
			useSingleton = !config.isMultiple;
			break;
	}

	const gameEvent = config.trackEvent;
	const analyticEvent = typeof config.analyticEvent === "string" ? config.analyticEvent : config.key;

	const tag = SKTagAnalyticsHelper(config);
	const repeat = SKRepeatAnalyticsHelper(config);

	const conditions = [];
	const configConditions = [config, config.conditions, ...(config.conditions || [])];
	for (let configCondition of configConditions) {
		const condition = SKCheckConditionAnalyticsHelper(configCondition, config, {});

		if (condition) {
			SKGetConditionAnalyticsHelper(configCondition, config, condition);
			conditions.push(condition);
		}
	}

	return [
		{
			useSingleton,
			gameEvent,
			analyticEvent,

			tag,
			repeat,
			conditions,
		},
	];
}
