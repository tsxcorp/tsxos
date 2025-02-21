import { theme } from '~/theme';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ✅ Định nghĩa __dirname trong môi trường ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Đọc nội dung của app.config.d.ts
const configPath = path.resolve(__dirname, 'app.config.d.ts');
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

// ✅ Merge dữ liệu từ Directus vào app.config.ts
export default defineAppConfig({
	theme,
	...inlineConfig, // ✅ Merge từ `app.config.d.ts`
	ui: {
		strategy: 'override',
		primary: theme.primary,
		gray: theme.gray,
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
			rounded: `rounded-${theme.borderRadius}`,
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
