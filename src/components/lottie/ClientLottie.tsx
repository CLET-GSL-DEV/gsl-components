import {
	useEffect,
	useState,
	type ComponentProps,
	type ComponentType,
} from "react";
import type LottieModule from "lottie-react";

type ClientLottieProps = ComponentProps<typeof LottieModule>;

export function ClientLottie(props: ClientLottieProps) {
	const [Lottie, setLottie] = useState<ComponentType<ClientLottieProps> | null>(
		null,
	);

	useEffect(() => {
		let mounted = true;

		void import("lottie-react").then((module) => {
			if (!mounted) {
				return;
			}
			// lottie-react's ESM build exposes the player as a named export;
			// its `default` is a namespace object, not a component.
			const candidates = module as unknown as {
				LottiePlayer?: ComponentType<ClientLottieProps>;
				default?: ComponentType<ClientLottieProps>;
			};
			const Player = candidates.LottiePlayer ?? candidates.default;
			if (typeof Player === "function") {
				setLottie(() => Player);
			}
		});

		return () => {
			mounted = false;
		};
	}, []);

	if (!Lottie) {
		return null;
	}

	return <Lottie {...props} />;
}
