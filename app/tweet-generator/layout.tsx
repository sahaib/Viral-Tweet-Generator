import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tweet Generator",
};

export default function TweetGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
} 