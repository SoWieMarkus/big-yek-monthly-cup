export const validateInteger = (value: string) => {
	const asNumber = Number.parseInt(value);
	if (Number.isInteger(asNumber)) return asNumber;
	throw new Error(`"${value} is not a valid integer!`);
};
