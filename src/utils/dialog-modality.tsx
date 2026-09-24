import * as DialogPrimitive from "@radix-ui/react-dialog";
import { createContext, useContext } from "react";

/**
 * Radix's Dialog does not emit aria-modal (verified against
 * @radix-ui/react-dialog 1.1.23: the attribute appears zero times in its dist).
 * Without it a screen reader keeps announcing the page behind the dialog, so
 * Dialog and Modal set it themselves.
 *
 * It must tell the truth, though: a Root rendered with modal={false} does not
 * trap focus and must NOT claim aria-modal. This context carries the Root's
 * modality down to the Content so the attribute always matches reality.
 */
const DialogModalityContext = createContext(true);

export function useDialogModality(): boolean {
	return useContext(DialogModalityContext);
}

type RootProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>;

/** A Radix Dialog.Root that also publishes its modality to descendants. */
export function createModalityAwareRoot(displayName: string) {
	function Root({ modal = true, children, ...props }: RootProps) {
		return (
			<DialogModalityContext.Provider value={modal}>
				<DialogPrimitive.Root modal={modal} {...props}>
					{children}
				</DialogPrimitive.Root>
			</DialogModalityContext.Provider>
		);
	}
	Root.displayName = displayName;
	return Root;
}

/**
 * Radix returns focus to the trigger on close. When the trigger has unmounted
 * meanwhile - a menu item that closed with its menu, a row action on a row that
 * was just filtered away - there is nothing to return to and focus lands on
 * <body>, which is the DS-02 defect: the keyboard user is dropped at the top of
 * the document.
 *
 * `returnFocusTo` names a still-mounted element to land on instead. Returns an
 * onCloseAutoFocus handler that defers to Radix whenever the target is absent.
 */
export function buildCloseAutoFocusHandler(
	returnFocusTo: React.RefObject<HTMLElement | null> | undefined,
	consumerHandler: ((event: Event) => void) | undefined,
) {
	return (event: Event) => {
		consumerHandler?.(event);
		if (event.defaultPrevented) return;
		const target = returnFocusTo?.current;
		if (!target || !target.isConnected) return;
		event.preventDefault();
		target.focus();
	};
}
