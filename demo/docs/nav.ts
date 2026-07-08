export interface DocNavItem {
	slug: string;
	title: string;
}

export interface DocNavSection {
	title: string;
	items: DocNavItem[];
}

export const docNavSections: DocNavSection[] = [
	{
		title: "Guide",
		items: [
			{ slug: "getting-started", title: "Getting started" },
			{ slug: "hooks", title: "Hooks" },
			{ slug: "theme", title: "Theme" },
			{ slug: "router-adapter", title: "RouterAdapter" },
			{ slug: "changelog", title: "Changelog" },
		],
	},
	{
		title: "Components",
		items: [
			{ slug: "app-header", title: "AppHeader" },
			{ slug: "app-layout", title: "AppLayout" },
			{ slug: "app-switcher", title: "AppSwitcher" },
			{ slug: "badge", title: "Badge" },
			{ slug: "breadcrumb", title: "Breadcrumb" },
			{ slug: "bulk-import-modal", title: "BulkImportModal" },
			{ slug: "button", title: "Button" },
			{ slug: "card", title: "Card" },
			{ slug: "checkbox", title: "Checkbox" },
			{ slug: "command", title: "Command" },
			{ slug: "country-selector", title: "CountrySelector" },
			{ slug: "date-selector", title: "DateSelector" },
			{ slug: "date-range-selector", title: "DateRangeSelector" },
			{ slug: "dialog", title: "Dialog" },
			{ slug: "draggable", title: "Draggable" },
			{ slug: "dropdown", title: "Dropdown" },
			{ slug: "form", title: "Form" },
			{ slug: "form-field", title: "FormField" },
			{ slug: "metric-card", title: "MetricCard" },
			{ slug: "modal", title: "Modal" },
			{ slug: "network-operator", title: "NetworkOperator" },
			{ slug: "otp-input", title: "OtpInput" },
			{ slug: "phone-number-input", title: "PhoneNumberInput" },
			{ slug: "popover", title: "Popover" },
			{ slug: "progress-bar", title: "ProgressBar" },
			{ slug: "radio-group", title: "RadioGroup" },
			{ slug: "sheet", title: "Sheet" },
			{ slug: "sidebar", title: "Sidebar" },
		{ slug: "sortable", title: "Sortable" },
		{ slug: "stepper", title: "Stepper" },
		{ slug: "table", title: "Table" },
			{ slug: "tabs", title: "Tabs" },
			{ slug: "timeline", title: "Timeline" },
			{ slug: "toast", title: "Toast" },
			{ slug: "tooltip", title: "Tooltip" },
			{ slug: "upload-field", title: "UploadField" },
		],
	},
];
