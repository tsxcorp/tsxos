import { theme as defaultTheme } from '~/theme';
import fs from 'fs';
import path from 'path';

// ✅ Lấy thư mục root của project thay vì `__dirname`
const rootDir = process.cwd();

// ✅ Đọc nội dung của `app.config.d.ts`
const configPath = path.resolve(rootDir, 'app.config.d.ts');
let inlineConfig = {};

if (fs.existsSync(configPath)) {
	try {
		const fileContent = fs.readFileSync(configPath, 'utf-8');

		// ✅ Trích xuất JSON từ `declare const inlineConfig = {...}`
		const match = fileContent.match(/declare const inlineConfig = (\{[\s\S]*?\});/);
		if (match) {
			inlineConfig = eval(`(${match[1]})`);
		}
	} catch (error) {
		console.error("❌ Lỗi khi đọc app.config.d.ts:", error);
	}
}

// ✅ Merge `theme` từ Directus nếu có, fallback về `~/theme`
const mergedTheme = {
	...defaultTheme, // Dùng theme mặc định trước
	...(inlineConfig?.globals?.theme || {}), // Ghi đè theme từ Directus nếu có
};

console.log("🎨 Theme đã merge:", mergedTheme);

// ✅ Merge `app.config.d.ts` vào `app.config.ts`
export default defineAppConfig({
	theme: mergedTheme,
	...inlineConfig, // ✅ Merge toàn bộ cấu hình từ `app.config.d.ts`
	ui: {
		strategy: 'override',
		primary: mergedTheme.primary,
		gray: mergedTheme.gray,
		notifications: {
			position: 'top-0 right-0 bottom-auto left-auto',
		},
		card: {
			base: 'transition duration-200',
			shadow: 'shadow-none',
			body: {
				base: 'h-full flex flex-col',
			},
			rounded: `rounded-card`,
		},
		button: {
			font: 'font-bold',
			rounded: 'rounded-button',
			default: {
				loadingIcon: 'material-symbols:sync-rounded',
			},
		},
		badge: {
			rounded: 'rounded-button',
		},
		input: {
			default: {
				loadingIcon: 'material-symbols:sync-rounded',
			},
			rounded: `rounded-${mergedTheme.borderRadius}`,
		},
		select: {
			rounded: 'rounded-input',
			default: {
				loadingIcon: 'material-symbols:sync-rounded',
				trailingIcon: 'material-symbols:expand-more-rounded',
			},
		},
		textarea: {
			rounded: 'rounded-input',
		},
		selectMenu: {
			rounded: 'rounded-input',
			default: {
				selectedIcon: 'material-symbols:fitbit-check-small-rounded',
			},
		},
		notification: {
			default: {
				closeButton: {
					icon: 'i-octicon-x-24',
				},
			},
		},
		commandPalette: {
			default: {
				icon: 'material-symbols:search-rounded',
				loadingIcon: 'material-symbols:sync-rounded',
				selectedIcon: 'material-symbols:fitbit-check-small-rounded',
				emptyState: {
					icon: 'material-symbols:search-rounded',
				},
			},
		},
		table: {
			default: {
				sortAscIcon: 'octicon:sort-asc-24',
				sortDescIcon: 'octicon:sort-desc-24',
				loadingState: {
					icon: 'material-symbols:sync-rounded',
				},
				emptyState: {
					icon: 'material-symbols:database-outline',
				},
			},
		},
		avatar: {
			default: {},
			rounded: 'rounded-button',
		},
		breadcrumb: {
			default: {
				divider: 'material-symbols:chevron-right',
			},
		},
		pagination: {
			rounded: 'first:rounded-l-button last:rounded-r-button',
			default: {
				prevButton: {
					icon: 'material-symbols:arrow-back-rounded',
				},
				nextButton: {
					icon: 'material-symbols:arrow-forward-rounded',
				},
			},
		},
	},
});