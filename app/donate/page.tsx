import { Metadata } from "next"
import DonateSection from "./donate"
import Navbar from "../(landing)/Navbar"

export const metadata: Metadata = {
  title: "Donate - Yaniyaa",
  description: "สนับสนุน Yaniyaa เพื่อให้เราคงคอนเซปต์ Luxury Minimalist ไว้ได้โดยไม่ต้องมีโฆษณากวนใจ",
  openGraph: {
    title: "Donate - Yaniyaa",
    description: "สนับสนุน Yaniyaa เพื่อให้เราคงคอนเซปต์ Luxury Minimalist ไว้ได้โดยไม่ต้องมีโฆษณากวนใจ",
    siteName: "Yaniyaa",
    images: [
      {
        url: "https://yaniyaa.com/og-image-donate.png",
        width: 1200,
        height: 630,
        alt: "Donate to Yaniyaa"
      }
    ],
    locale: "th_TH",
    type: "website"
  }
}

export default function page() {
  return (
    <> 
    <DonateSection />
    <Navbar />
    </>
  )
}
