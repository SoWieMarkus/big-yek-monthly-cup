const displayMonth = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export const getDisplayNameOfMonth = (month: number) => {
	return displayMonth[month - 1];
};

export const getCupDisplayName = (year: number, month: number) => {
	return `BYMC ${year}-${getDisplayNameOfMonth(month)}`;
};
