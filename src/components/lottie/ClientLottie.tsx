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
			if (mounted) {
				setLottie(() => module.default);
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
