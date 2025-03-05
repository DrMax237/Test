import SKIConfigAnalyticsData from "../Config/SKIConfigAnalyticsData";
import SKIProjectAnalyticsCondition from "../Project/SKIProjectAnalyticsCondition";
import SKCheckConditionAnalyticsHelper from "./Condition/SKCheckConditionAnalyticsHelper";
import SKGetConditionAnalyticsHelper from "./Condition/SKGetConditionAnalyticsHelper";

export default function SKRepeatAnalyticsHelper(config: SKIConfigAnalyticsData): {
	value: number;
	pre: () => void;
	post: () => void;

	condition: SKIProjectAnalyticsCondition;
} {
	let addOnCondition = true;
	let dictionaryKey = "";
	let configCondition =
		config.repeat instanceof Object && config.repeat.condition instanceof Object ? config.repeat.condition : config.repeat;

	switch (true) {
		case config.repeat instanceof Object && typeof config.repeat.addOnCondition === "boolean":
			addOnCondition = config.repeat.addOnCondition;
			break;
		case typeof config.repeat === "boolean":
			addOnCondition = config.repeat;
			break;
	}

	switch (true) {
		case typeof config.repeat === "string":
			dictionaryKey = config.repeat;
			break;

		case config.repeat instanceof Object && typeof config.repeat.dictionaryKey === "string":
			dictionaryKey = config.repeat.dictionaryKey;
			break;
	}

	const repeat = {
		value: 0,
		pre(): void {},
		post(): void {},

		condition: {},
	};

	switch (true) {
		case dictionaryKey === "":
			repeat[addOnCondition ? "pre" : "post"] = () => {
				repeat.value += 1;
			};
			break;

		default:
			saykit.dictionary.add(dictionaryKey, repeat.value);
			repeat[addOnCondition ? "pre" : "post"] = () => {
				saykit.dictionary.set(dictionaryKey, { add: 1 });
				repeat.value = saykit.dictionary.get(dictionaryKey);
			};
			break;
	}

	if (SKCheckConditionAnalyticsHelper(configCondition || {}, config, repeat.condition)) {
	} else SKCheckConditionAnalyticsHelper({ minmax: [] }, config, repeat.condition);
	SKGetConditionAnalyticsHelper({ useRepeatCount: true }, config, repeat.condition);

	return repeat;
}
