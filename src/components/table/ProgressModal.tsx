import { forwardRef, useCallback, type HTMLAttributes } from "react";
import { cn } from "../../utils/cn";
import { Modal, ModalPortal, ModalOverlay, ModalContent } from "../modal/Modal";
import { ClientLottie } from "../lottie/ClientLottie";
import { ProgressBar } from "../progress-bar/ProgressBar";
import animationData from "./file_processing.json";
import "./styles/progress-modal.css";

interface ProgressModalClassNames {
	root?: string;
}

interface ProgressModalProps extends HTMLAttributes<HTMLDivElement> {
	open: boolean;
	progress?: number;
	classNames?: ProgressModalClassNames;
}

export const ProgressModal = forwardRef<HTMLDivElement, ProgressModalProps>(
	function ProgressModal(
		{ open, progress = 0, className, classNames, ...props },
		ref,
	) {
		const prevent = useCallback((e: Event) => e.preventDefault(), []);

		return (
			<Modal open={open} onOpenChange={() => {}}>
				<ModalPortal>
					<ModalOverlay />
					<ModalContent
						ref={ref}
						size="sm"
						showCloseButton={false}
						preventClose
						onInteractOutside={prevent}
						onEscapeKeyDown={prevent}
						className={cn(
							"clet-progress-modal gsl-progress-modal",
							classNames?.root,
							className,
						)}
						aria-label="Processing your document"
						{...props}
					>
						<ClientLottie
							animationData={animationData}
							loop
							autoplay
							style={{ width: 160, height: 160 }}
						/>
						<div className="clet-progress-modal__progress gsl-progress-modal__progress">
							<ProgressBar value={progress} size="md" />
						</div>
					</ModalContent>
				</ModalPortal>
			</Modal>
		);
	},
);
