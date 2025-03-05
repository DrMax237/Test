import SKIConfigAnalyticsCondition from "../../Config/SKIConfigAnalyticsCondition";
import SKIConfigAnalyticsData from "../../Config/SKIConfigAnalyticsData";
import SKIProjectAnalyticsCondition from "../../Project/SKIProjectAnalyticsCondition";

export default function SKCheckConditionAnalyticsHelper(
	configCondition: SKIConfigAnalyticsCondition,
	configData: SKIConfigAnalyticsData,

	out: { check(args: any[], condition: SKIProjectAnalyticsCondition, repeat: number): boolean }
): { check(args: any[], condition: SKIProjectAnalyticsCondition, repeat: number): boolean } {
	let func = null;

	let check = null;
	let value = null;
	let interpol = null;

	switch (true) {
		case configCondition instanceof Object && typeof configCondition.check === "string":
			check = configCondition.check;
			break;

		case configCondition instanceof Object && configCondition.interpol instanceof Object:
			interpol = configCondition.interpol;
			break;

		case configCondition instanceof Object && typeof configCondition.interpol === "number":
			interpol = {
				value: configCondition.interpol,
				min: configCondition.min,
				max: configCondition.max,
				minmax: configCondition.minmax,
			};
			break;

		case configCondition instanceof Object && configCondition.value instanceof Object:
			value = configCondition.value;
			break;

		case configCondition instanceof Object && typeof configCondition.value === "number":
		case configCondition instanceof Object && typeof configCondition.value === "boolean":
		case configCondition instanceof Object && typeof configCondition.value === "string":
			value = { value: configCondition.value };
			break;

		case configCondition instanceof Object && configCondition.minmax instanceof Array:
			value = {
				minmax: configCondition.minmax,
			};
			break;

		case configCondition instanceof Object && (typeof configCondition.min === "number" || typeof configCondition.max === "number"):
			value = {
				min: configCondition.min,
				max: configCondition.max,
			};
			break;

		case typeof configCondition === "number":
		case typeof configCondition === "boolean":
		case typeof configCondition === "string":
			value = { value: configCondition };
			break;

		default:
			break;
	}

	switch (true) {
		case typeof check === "string": {
			const proto = new Function("args", "condition", "repeat", configCondition.check);
			func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
				return proto.call(this, args, condition, repeat);
			};
			break;
		}

		case value instanceof Object: {
			let minmaxValue = undefined;
			let checkValue = undefined;
			switch (true) {
				case value.minmax instanceof Array:
					minmaxValue = [
						typeof value.minmax[0] === "number" ? value.minmax[0] : -Infinity,
						typeof value.minmax[1] === "number" ? value.minmax[1] : Infinity,
					];
					break;

				case typeof value.min === "number" || typeof value.max === "number":
					minmaxValue = [
						typeof value.min === "number" ? value.min : -Infinity,
						typeof value.max === "number" ? value.max : Infinity,
					];
					break;

				default:
					checkValue = value.value;
					break;
			}

			if (minmaxValue instanceof Array) {
				func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
					const test = condition.get(args, condition, repeat);
					return minmaxValue[0] <= test && test <= minmaxValue[1];
				};
			} else {
				func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
					const test = condition.get(args, condition, repeat);
					return test === checkValue;
				};
			}
			break;
		}

		case interpol instanceof Object: {
			const checkInterpol = interpol.value;
			let minmaxInterpol = undefined;

			switch (true) {
				case interpol.minmax instanceof Array:
					minmaxInterpol = [
						typeof interpol.minmax[0] === "number" ? interpol.minmax[0] : 0,
						typeof interpol.minmax[1] === "number" ? interpol.minmax[1] : 1,
					];
					break;

				case typeof interpol.min === "number" || typeof interpol.max === "number":
					minmaxInterpol = [
						typeof interpol.min === "number" ? interpol.min : 0,
						typeof interpol.max === "number" ? interpol.max : 1,
					];
					break;

				default:
					minmaxInterpol = [0, 1];
					break;
			}

			func = (args: any[], condition: SKIProjectAnalyticsCondition, repeat: number) => {
				const testValue = condition.get(args, condition, repeat);
				const testInterpol = (testValue - minmaxInterpol[0]) / (minmaxInterpol[1] - minmaxInterpol[0]);

				return checkInterpol <= testInterpol;
			};

			break;
		}

		default:
			return null;
	}

	out.check = func;
	return out;
}
