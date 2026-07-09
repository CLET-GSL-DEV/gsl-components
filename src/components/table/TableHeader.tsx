import {
	forwardRef,
	useRef,
	useCallback,
	useMemo,
	useState,
	useEffect,
	type ReactNode,
	type ChangeEvent,
} from "react";
import * as Popover from "@radix-ui/react-popover";
import { Search, FilterIcon, XCircle } from "lucide-react";
import { getRouterAdapter } from "../../hooks/../adapters/registry";
import { useDebounce } from "../../hooks/useDebounce";
import type {
	TableSearchProps,
	TableFilterProps,
	TableActionsProps,
	TableHeaderProps,
} from "../../types/table";
import { cn } from "../../utils/cn";
import "./styles/table.css";
import { useTableContext } from "./TableContext";
import { Button } from "../button";

/* ── Helpers ── */

const FILTER_PREFIX = "f_";

function paramKey(prefix: string | undefined, key: string): string {
	return prefix ? `${prefix}.${key}` : key;
}

/* ── Actions ── */

export const TableActions = forwardRef<HTMLDivElement, TableActionsProps>(
	function TableActions({ classNames, className, children, ...props }, ref) {
		return (
			<div
				ref={ref}
				className={cn("gsl-table__actions", classNames?.root, className)}
				{...props}
			>
				{children}
			</div>
		);
	},
);

/* ── Header ── */

export const TableHeader = forwardRef<HTMLDivElement, TableHeaderProps>(
	function TableHeader({ className, classNames, children, ...props }, ref) {
	return (
		<div
			ref={ref}
			className={cn("gsl-table__header-bar", classNames?.root, className)}
			{...props}
		>
			{children}
		</div>
	);
});

/* ── Search ── */

export const TableSearch = forwardRef<HTMLInputElement, TableSearchProps>(
	function TableSearch(
		{
   placeholder = "Search...",
   debounceMs = 300,
   onSearch,
   onChange,
   className,
   classNames,
   ...props
 },
		ref,
	) {
		const { paramPrefix } = useTableContext();
		const searchKey = paramKey(paramPrefix, "search");
		const pageKey = paramKey(paramPrefix, "page");

		const { searchParams, setSearchParams } = getRouterAdapter();
		const urlSearch = searchParams.get(searchKey) ?? "";

		const [value, setValue] = useState(urlSearch);
		const debouncedValue = useDebounce(value, debounceMs);

		// Sync URL → input when URL changes externally (e.g. back/forward, external reset)
		useEffect(() => {
			setValue(urlSearch);
		}, [urlSearch]);

		// Write to URL on debounced change
		useEffect(() => {
			if (debouncedValue === urlSearch) return;
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					if (debouncedValue) {
						next.set(searchKey, debouncedValue);
					} else {
						next.delete(searchKey);
					}
					next.set(pageKey, "1");
					return next;
				},
				{ replace: true },
			);
			onSearch?.(debouncedValue);
		}, [
			debouncedValue,
			urlSearch,
			setSearchParams,
			searchKey,
			pageKey,
			onSearch,
		]);

		const handleChange = useCallback(
			(e: ChangeEvent<HTMLInputElement>) => {
				setValue(e.target.value);
				onChange?.(e);
			},
			[onChange],
		);

		const clear = useCallback(() => {
			setValue("");
			onChange?.({
				target: { value: "" },
			} as ChangeEvent<HTMLInputElement>);
		}, [onChange]);

		return (
			<div className={cn("gsl-table__search", classNames?.root, className)}>
				<Search
					size={16}
					strokeWidth={1.5}
					className={cn("gsl-table__search-icon", classNames?.icon)}
					aria-hidden
				/>
				<input
					ref={ref}
					type="text"
					className={cn("gsl-table__search-input", classNames?.input)}
					placeholder={placeholder}
					value={value}
					onChange={handleChange}
					{...props}
				/>
				{value && (
					<div
						className={cn("gsl-table__search-clear", classNames?.clear)}
						onClick={clear}
						aria-label="Clear search"
					>
						<XCircle size={16} strokeWidth={1.5} aria-hidden />
					</div>
				)}
			</div>
		);
	},
);

/* ── Filter ── */

export const TableFilter = forwardRef<HTMLDivElement, TableFilterProps>(
	function TableFilter(
		{ children, onApply, onReset, applyLabel = "Apply Filter", classNames, className },
		ref,
	) {
		const { paramPrefix } = useTableContext();
		const [open, setOpen] = useState(false);
		const formRef = useRef<HTMLFormElement>(null);
		const { searchParams, setSearchParams } = getRouterAdapter();

		const filterPrefix = paramKey(paramPrefix, FILTER_PREFIX);

		const activeCount = useMemo(() => {
			let count = 0;
			for (const key of searchParams.keys()) {
				if (key.startsWith(filterPrefix)) count++;
			}
			return count || undefined;
		}, [searchParams, filterPrefix]);

		const handleApply = useCallback(() => {
			const form = formRef.current;
			if (form) {
				const data = new FormData(form);
				setSearchParams(
					(prev) => {
						const next = new URLSearchParams(prev);
						// Remove existing filter params
						for (const key of [...next.keys()]) {
							if (key.startsWith(filterPrefix)) {
								next.delete(key);
							}
						}
						// Set new filter values
						for (const [key, value] of data.entries()) {
							if (value && typeof value === "string" && value !== "") {
								next.set(`${filterPrefix}${key}`, value);
							}
						}
						// Reset to first page
						next.set(paramKey(paramPrefix, "page"), "1");
						return next;
					},
					{ replace: true },
				);
			}
			onApply?.();
			setOpen(false);
		}, [setSearchParams, filterPrefix, paramPrefix, onApply]);

		const handleReset = useCallback(() => {
			setSearchParams(
				(prev) => {
					const next = new URLSearchParams(prev);
					for (const key of [...next.keys()]) {
						if (key.startsWith(filterPrefix)) {
							next.delete(key);
						}
					}
					return next;
				},
				{ replace: true },
			);
			// Reset form fields
			formRef.current?.reset();
			onReset?.();
			setOpen(false);
		}, [setSearchParams, filterPrefix, onReset]);

		return (
			<div
				ref={ref}
				className={cn("gsl-table__filter", classNames?.root, className)}
			>
				<Popover.Root open={open} onOpenChange={setOpen}>
					<Popover.Trigger asChild>
						<Button
							className={cn("gsl-table__filter-trigger", classNames?.trigger)}
							aria-label="Filter"
						>
							<FilterIcon size={14} strokeWidth={1.5} aria-hidden />
							Filters
							{activeCount != null && activeCount > 0 && (
								<span className={cn("gsl-table__filter-badge", classNames?.badge)}>
									{activeCount}
								</span>
							)}
						</Button>
					</Popover.Trigger>

					<Popover.Portal>
						<Popover.Content
							className={cn("gsl-table__filter-content", classNames?.content)}
							side="bottom"
							align="end"
							sideOffset={6}
						>
							<div className={cn("gsl-table__filter-header", classNames?.header)}>
								<div>Filters</div>
								<button
									type="button"
									className={cn("gsl-table__filter-btn--reset", classNames?.resetButton)}
									onClick={handleReset}
								>
									clear
									<XCircle size={14} strokeWidth={1.5} />
								</button>
							</div>

							{children && (
								<form
									ref={formRef}
									className={cn("gsl-table__filter-fields", classNames?.fields)}
								>
									{children}
								</form>
							)}

							<div className={cn("gsl-table__filter-actions", classNames?.actions)}>
								<button
									type="button"
									className={cn(
										"gsl-table__filter-btn gsl-table__filter-btn--apply",
										classNames?.applyButton,
									)}
									onClick={handleApply}
								>
									{applyLabel}
								</button>
							</div>
						</Popover.Content>
					</Popover.Portal>
				</Popover.Root>
			</div>
		);
	},
);
