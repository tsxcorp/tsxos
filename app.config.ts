import { theme as defaultTheme } from '~/theme';
import fs from 'fs';
import path from 'path';
import process from 'process';

// ✅ URL Directus API (Thay bằng URL thực tế của bạn)
const DIRECTUS_API_URL = "https://app.tsx.vn/items/globals";

// ✅ Hàm gọi API Directus để lấy `globals`
async function fetchDirectusGlobals() {
	try {
		const response = await fetch(DIRECTUS_API_URL);
		const data = await response.json();
		return data?.data || {}; // Trả về `globals` từ Directus
	} catch (error) {
		console.error("❌ Lỗi khi lấy dữ liệu từ Directus:", error);
		return {}; // Nếu lỗi, trả về object rỗng
	}
}

// ✅ Xử lý merge dữ liệu
async function generateAppConfig() {
	console.log("🚀 Đang lấy dữ liệu `globals` từ Directus...");

	// Fetch globals từ Directus
	const directusGlobals = await fetchDirectusGlobals();

	// ✅ Merge `theme` từ Directus nếu có, fallback về `~/theme`
	const mergedTheme = {
		primary: directusGlobals?.theme?.primary || defaultTheme.primary,
		gray: directusGlobals?.theme?.gray || defaultTheme.gray,
		borderRadius: directusGlobals?.theme?.borderRadius || defaultTheme.borderRadius,
	};
	

	// ✅ Merge `globals` vào app.config.ts
	const config = {
		...directusGlobals, // ✅ Toàn bộ `globals` từ Directus
		theme: mergedTheme, // ✅ Ghi đè theme từ Directus
		ui: {
			strategy: "merge",
			primary: mergedTheme.primary,
			gray: mergedTheme.gray,
		},
	};

	console.log("🎨 Theme sau khi merge:", mergedTheme);
	console.log("🌍 Global config sau khi merge:", config);

	return config;
}
console.log("🚀 Config Loaded in Nuxt:", defineAppConfig);

// ✅ Xuất ra `defineAppConfig` khi Nuxt build
export default (async () => defineAppConfig(await generateAppConfig()))();
