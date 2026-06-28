import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./App";
import "./demo.css";

export const createRoot = ViteReactSSG({ routes });
