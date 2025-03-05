import SKIConfigAnalyticsData from "../Config/SKIConfigAnalyticsData";
import SKIProjectAnalyticsData from "../Project/SKIProjectAnalyticsData";
import SKBasicAnalyticsHandler from "./SKBasicAnalyticsHandler";
import SKProgressAnalyticsHandler from "./SKProgressAnalyticsHandler";
import SKStartAnalyticsHandler from "./SKStartAnalyticsHandler";

const Handlers = {
	BASIC: SKBasicAnalyticsHandler,
	START: SKStartAnalyticsHandler,
	PROGRESS: SKProgressAnalyticsHandler,
};

export default function SKPreAnalyticsHandler(config: SKIConfigAnalyticsData): SKIProjectAnalyticsData[] {
	let handler = Handlers.BASIC;

	switch (true) {
		case config.key === "PROGRESS":
		case config.handler === "PROGRESS":
			handler = Handlers.PROGRESS;
			break;

		case config.key === "START":
		case config.handler === "START":
			handler = Handlers.START;
			break;
	}

	return handler(config);
}
