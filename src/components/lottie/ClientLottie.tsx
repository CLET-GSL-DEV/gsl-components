import { useEffect, useRef, type CSSProperties } from "react";
import type { AnimationItem } from "lottie-web";

export interface ClientLottieProps {
	/** Parsed Lottie JSON. */
	animationData: object;
	loop?: boolean | number;
	autoplay?: boolean;
	className?: string;
	style?: CSSProperties;
}

export function ClientLottie({
	animationData,
	loop,
	autoplay,
	className,
	style,
}: ClientLottieProps) {
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		let cancelled = false;
		let animation: AnimationItem | undefined;

		// Loaded on the client only: lottie-web touches canvas at import time.
		// The light build has no expression engine, so it never calls eval and
		// passes a CSP without 'unsafe-eval'.
		void import("lottie-web/build/player/lottie_light").then((module) => {
			const container = containerRef.current;
			if (cancelled || !container) return;
			animation = module.default.loadAnimation({
				container,
				renderer: "svg",
				loop: loop ?? true,
				autoplay: autoplay ?? true,
				animationData,
			});
		});

		return () => {
			cancelled = true;
			animation?.destroy();
		};
	}, [animationData, loop, autoplay]);

	return <div ref={containerRef} className={className} style={style} aria-hidden />;
}
