import type { Metadata } from "next"
import "./globals.css"
import { Inter } from "next/font/google"
import SiteHeader from "../components/SiteHeader"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

export const metadata: Metadata = {
	title: "Fit Width: fit a headline to its box with the width axis",
	icons: { icon: "/icon.svg", shortcut: "/icon.svg", apple: "/icon.svg" },
	description: "Fit a one-line headline to a target width with a variable font’s wdth axis, then letter-spacing or font size when the axis runs out. It reports what each step did. React + vanilla JS.",
	keywords: ["fit width", "variable font", "wdth", "letter-spacing", "display type", "headline", "typography", "TypeScript", "npm", "react"],
	openGraph: {
		title: "Fit Width: fit a headline to its box",
		description: "Fit a one-line headline to a target width with the wdth axis, then letter-spacing or font size when the axis runs out. It reports what each step did.",
		url: "https://fitwidth.com",
		siteName: "Fit Width",
		type: "website",
		images: [{ url: "https://fitwidth.com/opengraph-image.png", width: 1200, height: 630, alt: "Fit Width: fit a headline to its box." }],
	},
	twitter: {
		card: "summary_large_image",
		title: "Fit Width: fit a headline to its box",
		description: "Fit a one-line headline to a target width with the wdth axis, then letter-spacing or font size when the axis runs out. It reports what each step did.",
		images: ["https://fitwidth.com/opengraph-image.png"],
	},
	metadataBase: new URL("https://fitwidth.com"),
	alternates: { canonical: "https://fitwidth.com" },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="en" className={`h-full antialiased ${inter.variable}`}>
			<body className="min-h-full flex flex-col">
				<SiteHeader current="fitWidth" githubUrl="https://github.com/over-punch/fitWidth" />{children}</body>
		</html>
	)
}
