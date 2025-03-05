export default interface SKIConfigAnalyticsCondition {
	//#region Получение проверяемого значения
	// используется один из ниже перечисленных вариантов
	// по default используется arg = 0

	/**
	 * Используемые агрумент
	 * @type {string} название аргумента
	 * @type {number} индекс аргумента
	 */
	arg?: number | string;

	/**
	 * Ключ значения из словаря
	 */
	dictionaryKey?: string;

	/**
	 * Специфическая функция получения значения
	 * Функция принимает следующие аргументы
	 * @param args - any[],
	 * @param condition - object,
	 * @param repeat - number
	 */
	getter?: string;

	/**
	 * Используется количество повторений
	 */
	useRepeatCount?: boolean;
	//#endregion

	//#region Проверка условия
	// используется один из трех вариантов check, value или interpol

	/**
	 * Тело функции проверки условия
	 * Функция принимает следующие аргументы
	 * @param args - any[],
	 * @param condition - object,
	 * @param repeat - number
	 */
	check?: string;

	/**
	 * Сравнительное значение
	 * @type { value: any} проверяемое знанение
	 * @type { minmax: [number, number]} проверяемая область
	 * @type { min: number = -Infinity, max: number = Infinity} проверяемая область
	 * @type { string } проверяемое знанение
	 * @type { number } проверяемое знанение,
	 * Эквивaлентно interpol = { value } для PROGRESS
	 */
	value?: {
		value?: any;
		min?: number;
		max?: number;
		minmax?: [number, number];
	};

	/**
	 * Сравнительный интерпол
	 * @type { value: number, minmax: [number, number] = [0, 1]}
	 * @type { value: number, min: number = 0, max: number = 1}
	 * @type { number} { value, min = 0, max = 1}
	 */
	interpol?: {
		value: number;
		min?: number;
		max?: number;
		minmax?: [number, number];
	};

	/**
	 * Сравнительное значение - вхождение в область
	 * Эквивaлентно value = { min } для BASIC
	 * Эквивaлентно interpol = { min } для PROGRESS
	 */
	min?: number;
	/**
	 * Сравнительное значение - вхождение в область
	 * Эквивaлентно value = { max } для BASIC
	 * Эквивaлентно interpol = { max } для PROGRESS
	 */
	max?: number;
	/**
	 * Сравнительное значение - вхождение в область
	 * Эквивaлентно value = { minmax } для Basic
	 * Эквивaлентно interpol = { minmax } для Progress
	 */
	minmax?: [number, number];
	//#endregion
}
