import {
	useEffect,
	useState,
	type CSSProperties,
} from "react";
import type { Lottie as LottieComponent } from "lottie-react";

export interface ClientLottieProps {
	/** Parsed Lottie JSON. Passed to lottie-react 3 as `src`. */
	animationData: object;
	loop?: boolean | number;
	autoplay?: boolean;
	className?: string;
	style?: CSSProperties;
}

export function ClientLottie({ animationData, ...rest }: ClientLottieProps) {
	const [Lottie, setLottie] = useState<typeof LottieComponent | null>(null);

	useEffect(() => {
		let mounted = true;

		// Loaded on the client only: lottie-web touches canvas at import time.
		void import("lottie-react").then((module) => {
			if (mounted) {
				setLottie(() => module.Lottie);
			}
		});

		return () => {
			mounted = false;
		};
	}, []);

	if (!Lottie) {
		return null;
	}

	return <Lottie src={animationData} {...rest} />;
}
