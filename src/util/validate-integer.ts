import createHttpError from "http-errors";

export const validateInteger = (value: string) => {
	const asNumber = Number.parseInt(value);
	if (Number.isInteger(asNumber)) return asNumber;
	throw createHttpError(400, `"${value} is not a valid integer!`);
};
