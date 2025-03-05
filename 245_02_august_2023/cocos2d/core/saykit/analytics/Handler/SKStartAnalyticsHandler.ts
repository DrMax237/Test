import SKIConfigAnalyticsData from "../Config/SKIConfigAnalyticsData";
import SKCheckConditionAnalyticsHelper from "../Helper/Condition/SKCheckConditionAnalyticsHelper";
import SKGetConditionAnalyticsHelper from "../Helper/Condition/SKGetConditionAnalyticsHelper";
import SKRepeatAnalyticsHelper from "../Helper/SKRepeatAnalyticsHelper";
import SKTagAnalyticsHelper from "../Helper/SKTagAnalyticsHelper";
import SKIProjectAnalyticsData from "../Project/SKIProjectAnalyticsData";

export default function SKStartAnalyticsHandler(config: SKIConfigAnalyticsData): SKIProjectAnalyticsData[] {
	const useSingleton = true;

	const gameEvent = "INPUT";
	const analyticEvent = "start";

	const tag = SKTagAnalyticsHelper(config);
	const repeat = SKRepeatAnalyticsHelper(config);

	const conditions = [];
	const configConditions = [];
	switch (true) {
		case typeof config.value === "string":
			configConditions.push({
				check: `const values =  '${config.values}'.split(','); const index = values.indexOf(args[1]); const result = index !== -1; return result;`,
			});
			break;
		case config.values instanceof Array:
			configConditions.push({
				check: `const values =  '${config.values}'.split(','); const index = values.indexOf(args[1]); const result = index !== -1; return result;`,
			});
			break;
	}
	configConditions.push(...(config.conditions || []));
	for (let configCondition of configConditions) {
		const condition = {};
		SKCheckConditionAnalyticsHelper(configCondition, config, condition);

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
