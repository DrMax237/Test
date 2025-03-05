import SKIConfigAnalyticsData from "../Config/SKIConfigAnalyticsData";

export default function SKTagAnalyticsHelper(config: SKIConfigAnalyticsData): (args: any[], repeat: number) => string {
	let tag = (args: any[], repeat: number): string => {
		return "";
	};

	switch (true) {
		case typeof config.analyticTag === "number":
			tag = (args: any[], repeat: number): string => {
				return args[config.analyticTag as number];
			};
			break;
		case typeof config.analyticTag === "string":
			tag = (args: any[], repeat: number): string => {
				return config.analyticTag as string;
			};
			break;

		case typeof config.analyticTag === "boolean" && config.analyticTag:
			tag = (args: any[], repeat: number): string => {
				return `${repeat}`;
			};
			break;

		case config.analyticTag instanceof Object && typeof config.analyticTag.value === "string":
			tag = (args: any[], repeat: number): string => {
				return config.analyticTag.value;
			};
			break;

		case config.analyticTag instanceof Object && typeof config.analyticTag.arg === "string": {
			const index = config.args.indexOf(config.analyticTag.arg as string);
			tag = (args: any[], repeat: number): string => {
				return args[index];
			};
			break;
		}

		case config.analyticTag instanceof Object && typeof config.analyticTag.arg === "number":
			tag = (args: any[], repeat: number): string => {
				return args[config.analyticTag.arg];
			};
			break;

		case config.analyticTag instanceof Object && typeof config.analyticTag.dictionaryKey === "string":
			tag = (args: any[], repeat: number): string => {
				return saykit.dictionary.get(config.analyticTag.dictionaryKey);
			};
			break;

		case config.analyticTag instanceof Object && typeof config.analyticTag.getter === "string": {
			const proto = new Function("args", "repeat", config.analyticTag.getter);
			tag = (args: any[], repeat: number): string => {
				return proto.call(this, args, repeat);
			};
			break;
		}

		case config.analyticTag instanceof Object &&
			typeof config.analyticTag.useRepeatCount === "boolean" &&
			config.analyticTag.useRepeatCount:
			tag = (args: any[], repeat: number): string => {
				return `${repeat}`;
			};
			break;
	}

	return tag;
}
