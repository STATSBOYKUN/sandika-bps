import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	allowedDevOrigins: ["http://192.168.0.148:3001", "http://192.168.0.148"],
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "img.daisyui.com",
			},
		],
	},
};

export default nextConfig;
