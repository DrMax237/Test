import SKIConfigAnalyticsCondition from "../../Config/SKIConfigAnalyticsCondition";
import SKIConfigAnalyticsData from "../../Config/SKIConfigAnalyticsData";
import SKIProjectAnalyticsCondition from "../../Project/SKIProjectAnalyticsCondition";

export default function SKGetConditionAnalyticsHelper(
	configCondition: SKIConfigAnalyticsCondition,
	configData: SKIConfigAnalyticsData,

	out: { get(args: any[], condition: SKIProjectAnalyticsCondition, repeat: number): any }
): { get(args: any[], condition: SKIProjectAnalyticsCondition, repeat: number): any } {
	let func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
		return args[0];
	};

	switch (true) {
		case configCondition instanceof Object && typeof configCondition.arg === "string": {
			const configArgs = (configData.args as string[]) || [];
			const index = configArgs.indexOf(configCondition.arg as string);

			if (index === -1) {
				cc.log("Analytics config", "arg string is not found", configCondition.arg, configData.args);
			} else {
				func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
					return args[index];
				};
			}

			break;
		}

		case configCondition instanceof Object && typeof configCondition.arg === "number":
			func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
				return args[configCondition.arg];
			};
			break;

		case configCondition instanceof Object && typeof configCondition.dictionaryKey === "string":
			func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
				return saykit.dictionary.get(configCondition.dictionaryKey);
			};
			break;

		case configCondition instanceof Object && typeof configCondition.useRepeatCount === "boolean" && configCondition.useRepeatCount:
			func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
				return repeat;
			};
			break;

		case configCondition instanceof Object && typeof configCondition.getter === "string": {
			const proto = new Function("args", "condition", "repeat", configCondition.getter);
			func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
				return proto.call(this, args, condition, repeat);
			};
			break;
		}
	}

	out.get = func;

	return out;
}
