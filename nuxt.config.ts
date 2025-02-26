import { promises as fs } from 'fs';
import path from 'path';
import { theme as defaultTheme, borderRadiusMap } from './theme';

// Định nghĩa kiểu dữ liệu từ Directus
interface DirectusData {
  theme?: {
    primary?: string;
    gray?: string;
    borderRadius?: string;
    googleFonts?: Record<string, boolean | number[]>;
    fonts?: {
      display?: string;
      sans?: string;
      code?: string;
      signature?: string;
      families?: Record<string, boolean | number[]>;
    };
  };
}

export default defineNuxtConfig(async () => {
  const directusUrl = process.env.DIRECTUS_URL || 'http://localhost:8055';
  let directusData: DirectusData = {}; // Khai báo biến có kiểu rõ ràng

  try {
    const response = await fetch(`${directusUrl}/items/globals`);
    const json = await response.json();
    directusData = json.data || {};
    console.log("🔥 Directus Data fetched:", directusData);
  } catch (error) {
    console.error("❌ Failed to fetch Directus Data:", error);
  }

  // **Fix lỗi: Đảm bảo dữ liệu theme từ Directus hợp lệ**
  const mergedTheme = {
    primary: directusData.theme?.primary || defaultTheme.primary,
    gray: directusData.theme?.gray || defaultTheme.gray,
    borderRadius: directusData.theme?.borderRadius || defaultTheme.borderRadius || 'lg', // Fix lỗi undefined
    googleFonts: directusData.theme?.googleFonts || defaultTheme.googleFonts,
    fonts: {
      display: directusData.theme?.fonts?.display || defaultTheme.fonts.display,
      sans: directusData.theme?.fonts?.sans || defaultTheme.fonts.sans,
      code: directusData.theme?.fonts?.code || defaultTheme.fonts.code,
      signature: directusData.theme?.fonts?.signature || defaultTheme.fonts.signature,
      families: directusData.theme?.fonts?.families || defaultTheme.fonts.families || { Inter: true }, // Fix lỗi undefined
    },
  };

  // **Ghi đè file theme.ts nhưng vẫn giữ nguyên borderRadiusMap**
  const themeContent = `export const theme = ${JSON.stringify(mergedTheme, null, 2)};
  
export const borderRadiusMap = ${JSON.stringify(borderRadiusMap, null, 2)};
`;

  const themePath = path.resolve('./theme.ts');
  await fs.writeFile(themePath, themeContent, 'utf-8');
  console.log('✅ theme.ts updated with Directus data (including borderRadiusMap)');

  return {
    // **Cấu hình chung của Nuxt**
    routeRules: {},
    
    extends: [
      './layers/proposals', 
      './layers/portal', 
    ],

    components: [
      { path: '~/components/base', pathPrefix: false },
      '~/components',
    ],

    css: ['~/assets/css/tailwind.css', '~/assets/css/main.css'],

    modules: [
      '@nuxt/image',
      '@nuxt/ui',
      '@nuxtjs/color-mode',
      '@nuxtjs/google-fonts',
      '@nuxtjs/seo',
      '@formkit/auto-animate/nuxt',
      '@vueuse/motion/nuxt',
      '@vueuse/nuxt',
      '@nuxt/icon',
    ],

    experimental: {
      componentIslands: true,
      asyncContext: true, 
    },

    runtimeConfig: {
      public: {
        siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        globals: directusData, 
      },
    },

    // **Cấu hình Directus**
    directus: {
      rest: {
        baseUrl: process.env.DIRECTUS_URL || 'http://localhost:8055',
        nuxtBaseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      },
      auth: {
        enabled: true,
        enableGlobalAuthMiddleware: false,
        userFields: ['*', { contacts: ['*'] }],
        redirect: {
          login: '/auth/signin',
          logout: '/',
          home: '/portal',
          resetPassword: '/auth/reset-password',
          callback: '/auth/callback',
        },
      },
    },

    // **Các config khác**
    devtools: { enabled: true },

    colorMode: { classSuffix: '' },

    image: {
      provider: 'directus',
      directus: {
        baseURL: `${process.env.DIRECTUS_URL}/assets/`,
      },
    },

    googleFonts: {
      families: mergedTheme.googleFonts,
      display: 'swap',
      download: true,
    },

    site: {
      url: process.env.SITE_URL || 'http://localhost:3000',
      name: 'AgencyOS',
    },

    ogImage: {
      defaults: {
        component: 'OgImageTemplate',
        width: 1200,
        height: 630,
      },
    },

    sitemap: {
      sitemaps: {
        pages: { exclude: ['/posts/**', '/help/**'] },
        posts: { include: ['/posts/**'] },
        help: { include: ['/help/**'] },
      },
    },

    postcss: {
      plugins: {
        'postcss-import': {},
        'tailwindcss/nesting': {},
        tailwindcss: {},
        autoprefixer: {},
      },
    },

    build: {
      transpile: ['v-perfect-signature'],
    },

    compatibilityDate: '2024-07-28',
  };
});
