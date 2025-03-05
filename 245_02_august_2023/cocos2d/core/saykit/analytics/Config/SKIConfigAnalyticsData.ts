import SKIConfigAnalyticsCondition from "./SKIConfigAnalyticsCondition";

export default interface SKIConfigAnalyticsData {
	/**
	 * Добавочный параметр используется в обработчике
	 * не для прямого использования
	 */
	key: string;
	/**
	 * Отслеживаемый ивент
	 */
	trackEvent: string;

	/**
	 * Отправляемый аналитический ивент
	 * использует key даты для BASIC
	 * использует INPUT для START
	 */
	analyticEvent?: string;

	/**
	 * Отправляемые аналитические ивенты используется для PROGRESS
	 * default-значение [pass25, pass50, pass75, complete]
	 */
	analyticsEvents?: string[];

	/**
	 * Сопровождающий тег для аналитического ивента
	 * @type {object}
	 * @type {number} эквивалентно { arg }
	 * @type {string} эквивалентно { value }
	 */
	analyticTag?: {
		// используется один из представленных ниже параметров

		/**
		 * Используемые значение
		 */
		value?: string;

		/**
		 * Используемые агрумент
		 * @type {string} название аргумента
		 * @type {number} индекс аргумента
		 */
		arg?: string | number;

		/**
		 * Ключ значения из словаря
		 */
		dictionaryKey?: string;

		/**
		 * Специфическая функция получения значения
		 * Функция принимает следующие аргументы
		 * @param args - any[],
		 * @param repeat - number
		 */
		getter?: string;

		/**
		 * Используется количество повторений
		 */
		useRepeatCount?: boolean;
	};

	/**
	 * Используемый обработчик конфига
	 * проверяет key даты на существующие обработчики
	 * default-значение BASIC
	 */
	handler?: string;

	/**
	 * Проверка на единственное использование
	 * default-значение true для BASIC, START
	 * default-значение false для PROGRESS
	 */
	isOnce?: boolean;
	/**
	 * Проверка на множественное использование использование
	 * default-значение false для BASIC, START
	 * default-значение true для PROGRESS
	 */
	isMultiple?: boolean;

	/**
	 * Название аргументов
	 */
	args?: string[];

	/**
	 * Проверяемое условие параметров для START
	 */
	values: string[];
	/**
	 * Используемые условия
	 * @type {string} эквивалентно { value: {value } }
	 * @type {string} эквивалентно { value: {value } }
	 * одно условие можно прописать прямо в дате
	 */
	conditions: SKIConfigAnalyticsCondition[];

	/**
	 * Настройки для подсчета повторений,
	 * Так же сожержит в себе условие, по дефолту
	 * {useRepeat: true, minmax: [-Infinity, Infinity]}
	 * @type {object}
	 * @type {boolean} эквивалентно { addOnCondition }
	 * @type {string} эквивалентно { dictionary }
	 */
	repeat?: {
		/**
		 * Проверка на добавление после прохождения условий
		 * default-значение true для BASIC, START, PROGRESS
		 */
		addOnCondition?: boolean;

		/**
		 * Ключ сохранения значние в словарь
		 */
		dictionaryKey?: string;

		/**
		 * Проверка условия
		 * Проверочное значение всегда useRepeat = tue
		 */
		condition?: SKIConfigAnalyticsCondition;
	};
}
