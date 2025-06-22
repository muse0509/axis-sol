import "@/styles/globals.css";
import type { AppProps } from "next/app";
import SmoothScroller from "../components/Lenis";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SmoothScroller>
      <Component {...pageProps} />
    </SmoothScroller>
  );
}
