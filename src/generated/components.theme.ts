// GENERATED FILE — do not edit by hand.
// Run `npm run generate:tokens` to refresh after changing theme or component CSS.

export type GslColorValue =
  | `#${string}`
  | `rgb(${string})`
  | `rgba(${string})`
  | `hsl(${string})`
  | `hsla(${string})`
  | `oklch(${string})`
  | `var(--${string})`;

export type GslLengthValue =
  | `${number}px`
  | `${number}rem`
  | `${number}em`
  | `${number}%`
  | "0"
  | `var(--${string})`;

export type GslZIndexValue = number;

export type GslOpacityValue = number | `${number}%`;

export type GslShadowValue = string;

export type GslStringValue = string;

// Keys are camelCase (e.g. "primary", "radiusBase") — GSL_GLOBAL_TOKEN_VARS
// maps each back to its real CSS custom property (e.g. "--gsl-primary").
export interface GslGlobalTokens {
  bg?: GslColorValue;
  border?: GslColorValue;
  borderStrong?: GslColorValue;
  borderSubtle?: GslColorValue;
  error?: GslColorValue;
  errorBg?: GslColorValue;
  errorText?: GslColorValue;
  focus?: GslColorValue;
  font?: GslStringValue;
  fontBody?: GslStringValue;
  fontHeader?: GslStringValue;
  hover?: GslColorValue;
  onPrimary?: GslColorValue;
  overlay?: GslColorValue;
  pageBg?: GslColorValue;
  primary?: GslColorValue;
  primaryLight?: GslColorValue;
  radius2xl?: GslLengthValue;
  radiusBase?: GslLengthValue;
  radiusXl?: GslLengthValue;
  secondary?: GslStringValue;
  shadowLg?: GslShadowValue;
  shadowMd?: GslShadowValue;
  shadowSm?: GslShadowValue;
  shimmerHighlight?: GslColorValue;
  success?: GslColorValue;
  surfaceCard?: GslColorValue;
  surfaceDark?: GslColorValue;
  surfacePanel?: GslColorValue;
  surfaceSubtle?: GslColorValue;
  text?: GslColorValue;
  textMuted?: GslColorValue;
  textSecondary?: GslColorValue;
  warning?: GslColorValue;
  zAlert?: GslZIndexValue;
  zAlertContent?: GslZIndexValue;
  zDropdown?: GslZIndexValue;
  zHeader?: GslZIndexValue;
  zModal?: GslZIndexValue;
  zOverlay?: GslZIndexValue;
  zPopover?: GslZIndexValue;
  zSelect?: GslZIndexValue;
}

export interface GslAppHeaderTokens {
  bg?: GslColorValue;
  color?: GslColorValue;
  font?: GslStringValue;
}

export interface GslAppLayoutTokens {
  bodyGap?: GslLengthValue;
  font?: GslStringValue;
  gap?: GslLengthValue;
}

export interface GslAppSwitcherTokens {
  font?: GslStringValue;
}

export interface GslAvatarTokens {
  font?: GslStringValue;
}

export interface GslBadgeTokens {
  font?: GslStringValue;
}

export interface GslBreadcrumbTokens {
  font?: GslStringValue;
}

export interface GslButtonTokens {
  font?: GslStringValue;
}

export interface GslCardTokens {
  font?: GslStringValue;
  padding?: GslLengthValue;
  titleFont?: GslStringValue;
}

export interface GslCheckboxTokens {
  font?: GslStringValue;
}

export interface GslCommandTokens {
  dialogFont?: GslStringValue;
  font?: GslStringValue;
}

export interface GslCountrySelectorTokens {
  font?: GslStringValue;
}

export interface GslDateRangeSelectorTokens {
  font?: GslStringValue;
}

export interface GslDateSelectorTokens {
  calendarFont?: GslStringValue;
  font?: GslStringValue;
}

export interface GslDialogTokens {
  font?: GslStringValue;
}

export interface GslDropdownTokens {
  font?: GslStringValue;
}

export interface GslFieldTokens {
  font?: GslStringValue;
}

export interface GslInputTokens {
  font?: GslStringValue;
}

export interface GslMetricCardTokens {
  descriptionSize?: GslLengthValue;
  font?: GslStringValue;
  radius?: GslLengthValue;
  shadow?: GslShadowValue;
  valueColor?: GslColorValue;
  valueFont?: GslStringValue;
  valueSize?: GslLengthValue;
}

export interface GslModalTokens {
  confirmFont?: GslStringValue;
  font?: GslStringValue;
  gutter?: GslStringValue;
  maxWidth2xl?: GslLengthValue;
  maxWidthLg?: GslLengthValue;
  maxWidthMd?: GslLengthValue;
  maxWidthSm?: GslLengthValue;
  maxWidthXl?: GslLengthValue;
}

export interface GslNetworkOperatorTokens {
  font?: GslStringValue;
}

export interface GslPhoneNumberInputTokens {
  dropdownFont?: GslStringValue;
  font?: GslStringValue;
}

export interface GslPopoverTokens {
  font?: GslStringValue;
}

export interface GslProgressBarTokens {
  font?: GslStringValue;
}

export interface GslRadioGroupTokens {
  font?: GslStringValue;
}

export interface GslRoleSelectTokens {
  font?: GslStringValue;
}

export interface GslSheetTokens {
  font?: GslStringValue;
}

export interface GslSidebarTokens {
  badgeBg?: GslColorValue;
  badgeColor?: GslColorValue;
  font?: GslStringValue;
  maskBottom?: GslStringValue;
  maskSize?: GslLengthValue;
  maskTop?: GslStringValue;
}

export interface GslStepperTokens {
  accent?: GslColorValue;
  connectorMin?: GslStringValue;
  current?: GslColorValue;
  font?: GslStringValue;
  gap?: GslLengthValue;
  markerBorder?: GslColorValue;
  markerSize?: GslLengthValue;
  track?: GslColorValue;
  transition?: GslStringValue;
}

export interface GslTableTokens {
  actionsFont?: GslStringValue;
  filterFont?: GslStringValue;
  font?: GslStringValue;
}

export interface GslTabsTokens {
  font?: GslStringValue;
  pillGap?: GslLengthValue;
}

export interface GslTextareaTokens {
  font?: GslStringValue;
}

export interface GslTimelineTokens {
  drawDuration?: GslStringValue;
  font?: GslStringValue;
  index?: GslStringValue;
  popDuration?: GslStringValue;
  staggerStep?: GslStringValue;
}

export interface GslToastTokens {
  font?: GslStringValue;
}

export interface GslTooltipTokens {
  font?: GslStringValue;
}

export interface GslUploadFieldTokens {
  font?: GslStringValue;
}

export interface GslComponentTokenMap {
  AppHeader: GslAppHeaderTokens;
  AppLayout: GslAppLayoutTokens;
  AppSwitcher: GslAppSwitcherTokens;
  Avatar: GslAvatarTokens;
  Badge: GslBadgeTokens;
  Breadcrumb: GslBreadcrumbTokens;
  Button: GslButtonTokens;
  Card: GslCardTokens;
  Checkbox: GslCheckboxTokens;
  Command: GslCommandTokens;
  CountrySelector: GslCountrySelectorTokens;
  DateRangeSelector: GslDateRangeSelectorTokens;
  DateSelector: GslDateSelectorTokens;
  Dialog: GslDialogTokens;
  Dropdown: GslDropdownTokens;
  Field: GslFieldTokens;
  Input: GslInputTokens;
  MetricCard: GslMetricCardTokens;
  Modal: GslModalTokens;
  NetworkOperator: GslNetworkOperatorTokens;
  PhoneNumberInput: GslPhoneNumberInputTokens;
  Popover: GslPopoverTokens;
  ProgressBar: GslProgressBarTokens;
  RadioGroup: GslRadioGroupTokens;
  RoleSelect: GslRoleSelectTokens;
  Sheet: GslSheetTokens;
  Sidebar: GslSidebarTokens;
  Stepper: GslStepperTokens;
  Table: GslTableTokens;
  Tabs: GslTabsTokens;
  Textarea: GslTextareaTokens;
  Timeline: GslTimelineTokens;
  Toast: GslToastTokens;
  Tooltip: GslTooltipTokens;
  UploadField: GslUploadFieldTokens;
}

export const GSL_COMPONENT_SELECTORS: Record<keyof GslComponentTokenMap, string> = {
  AppHeader: ".gsl-app-header",
  AppLayout: ".gsl-app-layout",
  AppSwitcher: ".gsl-app-switcher",
  Avatar: ".gsl-avatar",
  Badge: ".gsl-badge",
  Breadcrumb: ".gsl-breadcrumb",
  Button: ".gsl-button",
  Card: ".gsl-card",
  Checkbox: ".gsl-checkbox",
  Command: ".gsl-command",
  CountrySelector: ".gsl-country-selector",
  DateRangeSelector: ".gsl-date-range-selector",
  DateSelector: ".gsl-date-selector",
  Dialog: ".gsl-dialog",
  Dropdown: ".gsl-dropdown",
  Field: ".gsl-field",
  Input: ".gsl-input",
  MetricCard: ".gsl-metric-card",
  Modal: ".gsl-modal",
  NetworkOperator: ".gsl-network-operator",
  PhoneNumberInput: ".gsl-phone-number-input",
  Popover: ".gsl-popover",
  ProgressBar: ".gsl-progress-bar",
  RadioGroup: ".gsl-radio-group",
  RoleSelect: ".gsl-role-select",
  Sheet: ".gsl-sheet",
  Sidebar: ".gsl-sidebar",
  Stepper: ".gsl-stepper",
  Table: ".gsl-table",
  Tabs: ".gsl-tabs",
  Textarea: ".gsl-textarea",
  Timeline: ".gsl-timeline",
  Toast: ".gsl-toast",
  Tooltip: ".gsl-tooltip",
  UploadField: ".gsl-upload-field",
};

export const GSL_GLOBAL_TOKEN_VARS: Record<keyof GslGlobalTokens, string> = {
  bg: "--gsl-bg",
  border: "--gsl-border",
  borderStrong: "--gsl-border-strong",
  borderSubtle: "--gsl-border-subtle",
  error: "--gsl-error",
  errorBg: "--gsl-error-bg",
  errorText: "--gsl-error-text",
  focus: "--gsl-focus",
  font: "--gsl-font",
  fontBody: "--gsl-font-body",
  fontHeader: "--gsl-font-header",
  hover: "--gsl-hover",
  onPrimary: "--gsl-on-primary",
  overlay: "--gsl-overlay",
  pageBg: "--gsl-page-bg",
  primary: "--gsl-primary",
  primaryLight: "--gsl-primary-light",
  radius2xl: "--gsl-radius-2xl",
  radiusBase: "--gsl-radius-base",
  radiusXl: "--gsl-radius-xl",
  secondary: "--gsl-secondary",
  shadowLg: "--gsl-shadow-lg",
  shadowMd: "--gsl-shadow-md",
  shadowSm: "--gsl-shadow-sm",
  shimmerHighlight: "--gsl-shimmer-highlight",
  success: "--gsl-success",
  surfaceCard: "--gsl-surface-card",
  surfaceDark: "--gsl-surface-dark",
  surfacePanel: "--gsl-surface-panel",
  surfaceSubtle: "--gsl-surface-subtle",
  text: "--gsl-text",
  textMuted: "--gsl-text-muted",
  textSecondary: "--gsl-text-secondary",
  warning: "--gsl-warning",
  zAlert: "--gsl-z-alert",
  zAlertContent: "--gsl-z-alert-content",
  zDropdown: "--gsl-z-dropdown",
  zHeader: "--gsl-z-header",
  zModal: "--gsl-z-modal",
  zOverlay: "--gsl-z-overlay",
  zPopover: "--gsl-z-popover",
  zSelect: "--gsl-z-select",
};

export const GSL_COMPONENT_TOKEN_VARS: {
  [K in keyof GslComponentTokenMap]: Record<keyof GslComponentTokenMap[K], string>;
} = {
  AppHeader: {
    bg: "--gsl-app-header-bg",
    color: "--gsl-app-header-color",
    font: "--gsl-app-header-font",
  },
  AppLayout: {
    bodyGap: "--gsl-app-layout-body-gap",
    font: "--gsl-app-layout-font",
    gap: "--gsl-app-layout-gap",
  },
  AppSwitcher: {
    font: "--gsl-app-switcher-font",
  },
  Avatar: {
    font: "--gsl-avatar-font",
  },
  Badge: {
    font: "--gsl-badge-font",
  },
  Breadcrumb: {
    font: "--gsl-breadcrumb-font",
  },
  Button: {
    font: "--gsl-button-font",
  },
  Card: {
    font: "--gsl-card-font",
    padding: "--gsl-card-padding",
    titleFont: "--gsl-card-title-font",
  },
  Checkbox: {
    font: "--gsl-checkbox-font",
  },
  Command: {
    dialogFont: "--gsl-command-dialog-font",
    font: "--gsl-command-font",
  },
  CountrySelector: {
    font: "--gsl-country-selector-font",
  },
  DateRangeSelector: {
    font: "--gsl-date-range-selector-font",
  },
  DateSelector: {
    calendarFont: "--gsl-date-selector-calendar-font",
    font: "--gsl-date-selector-font",
  },
  Dialog: {
    font: "--gsl-dialog-font",
  },
  Dropdown: {
    font: "--gsl-dropdown-font",
  },
  Field: {
    font: "--gsl-field-font",
  },
  Input: {
    font: "--gsl-input-font",
  },
  MetricCard: {
    descriptionSize: "--gsl-metric-card-description-size",
    font: "--gsl-metric-card-font",
    radius: "--gsl-metric-card-radius",
    shadow: "--gsl-metric-card-shadow",
    valueColor: "--gsl-metric-card-value-color",
    valueFont: "--gsl-metric-card-value-font",
    valueSize: "--gsl-metric-card-value-size",
  },
  Modal: {
    confirmFont: "--gsl-modal-confirm-font",
    font: "--gsl-modal-font",
    gutter: "--gsl-modal-gutter",
    maxWidth2xl: "--gsl-modal-max-width-2xl",
    maxWidthLg: "--gsl-modal-max-width-lg",
    maxWidthMd: "--gsl-modal-max-width-md",
    maxWidthSm: "--gsl-modal-max-width-sm",
    maxWidthXl: "--gsl-modal-max-width-xl",
  },
  NetworkOperator: {
    font: "--gsl-network-operator-font",
  },
  PhoneNumberInput: {
    dropdownFont: "--gsl-phone-number-input-dropdown-font",
    font: "--gsl-phone-number-input-font",
  },
  Popover: {
    font: "--gsl-popover-font",
  },
  ProgressBar: {
    font: "--gsl-progress-bar-font",
  },
  RadioGroup: {
    font: "--gsl-radio-group-font",
  },
  RoleSelect: {
    font: "--gsl-role-select-font",
  },
  Sheet: {
    font: "--gsl-sheet-font",
  },
  Sidebar: {
    badgeBg: "--gsl-sidebar-badge-bg",
    badgeColor: "--gsl-sidebar-badge-color",
    font: "--gsl-sidebar-font",
    maskBottom: "--gsl-sidebar-mask-bottom",
    maskSize: "--gsl-sidebar-mask-size",
    maskTop: "--gsl-sidebar-mask-top",
  },
  Stepper: {
    accent: "--gsl-stepper-accent",
    connectorMin: "--gsl-stepper-connector-min",
    current: "--gsl-stepper-current",
    font: "--gsl-stepper-font",
    gap: "--gsl-stepper-gap",
    markerBorder: "--gsl-stepper-marker-border",
    markerSize: "--gsl-stepper-marker-size",
    track: "--gsl-stepper-track",
    transition: "--gsl-stepper-transition",
  },
  Table: {
    actionsFont: "--gsl-table-actions-font",
    filterFont: "--gsl-table-filter-font",
    font: "--gsl-table-font",
  },
  Tabs: {
    font: "--gsl-tabs-font",
    pillGap: "--gsl-tabs-pill-gap",
  },
  Textarea: {
    font: "--gsl-textarea-font",
  },
  Timeline: {
    drawDuration: "--gsl-timeline-draw-duration",
    font: "--gsl-timeline-font",
    index: "--gsl-timeline-index",
    popDuration: "--gsl-timeline-pop-duration",
    staggerStep: "--gsl-timeline-stagger-step",
  },
  Toast: {
    font: "--gsl-toast-font",
  },
  Tooltip: {
    font: "--gsl-tooltip-font",
  },
  UploadField: {
    font: "--gsl-upload-field-font",
  },
};
