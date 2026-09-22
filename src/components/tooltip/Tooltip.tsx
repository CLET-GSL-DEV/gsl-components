import * as PopoverPrimitive from "@radix-ui/react-popover";
import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import type { TooltipProps } from "../../types/tooltip";
import { cn } from "../../utils/cn";
import "./styles/tooltip.css";

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
	function Tooltip(
		{ content, side = "top", classNames, className, children },
		ref,
	) {
		const [open, setOpen] = useState(false);
		const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
			undefined,
		);

		useEffect(() => () => clearTimeout(timeoutRef.current), []);

		const show = useCallback(() => {
			clearTimeout(timeoutRef.current);
			setOpen(true);
		}, []);

		const hide = useCallback(() => {
			clearTimeout(timeoutRef.current);
			timeoutRef.current = setTimeout(() => setOpen(false), 80);
		}, []);

		const handleOpenChange = useCallback((next: boolean) => {
			if (!next) {
				clearTimeout(timeoutRef.current);
				setOpen(false);
			}
		}, []);

		return (
			<div
				ref={ref}
				className={cn("clet-tooltip gsl-tooltip", classNames?.root, className)}
			>
				<PopoverPrimitive.Root open={open} onOpenChange={handleOpenChange}>
					<PopoverPrimitive.Trigger
						asChild
						onMouseEnter={show}
						onMouseLeave={hide}
						onFocus={show}
						onBlur={hide}
					>
						{children}
					</PopoverPrimitive.Trigger>
					<PopoverPrimitive.Portal>
						<PopoverPrimitive.Content
							side={side}
							sideOffset={4}
							className={cn(
								"clet-tooltip__content gsl-tooltip__content",
								`clet-tooltip__content--${side} gsl-tooltip__content--${side}`,
								open &&
									"clet-tooltip__content--open gsl-tooltip__content--open",
								classNames?.content,
							)}
							role="tooltip"
							onMouseEnter={show}
							onMouseLeave={hide}
							onOpenAutoFocus={(event) => event.preventDefault()}
							onCloseAutoFocus={(event) => event.preventDefault()}
						>
							{content}
							<PopoverPrimitive.Arrow
								className="clet-tooltip__arrow gsl-tooltip__arrow"
								width={8}
								height={4}
							/>
						</PopoverPrimitive.Content>
					</PopoverPrimitive.Portal>
				</PopoverPrimitive.Root>
			</div>
		);
	},
);
