import { createDirectus, rest, authentication, staticToken } from '@directus/sdk';
import type { Schema } from '~/types/schema';

import { defineNuxtPlugin, useRuntimeConfig, useRoute, refreshNuxtData } from '#imports';

export default defineNuxtPlugin((nuxtApp) => {
	const route = useRoute();
	const config = useRuntimeConfig();
	const directusURL = config.public.directus.rest.baseUrl as string;

	// Create a custom fetch function that adds headers to bypass Cloudflare bot protection
	const customFetch = async (url: string | URL | Request, init?: RequestInit) => {
		const headers = new Headers(init?.headers);
		
		// Add browser-like headers to bypass Cloudflare bot protection
		headers.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
		headers.set('Accept', 'application/json');
		headers.set('Accept-Language', 'en-US,en;q=0.9');
		
		// Use $fetch for client-side, custom fetch for server-side
		if (process.client) {
			return $fetch(url.toString(), {
				...init,
				headers: Object.fromEntries(headers),
			} as any);
		}
		
		// Server-side: use native fetch with custom headers
		return fetch(url, {
			...init,
			headers,
		});
	};

	// Build Directus client with static token for server-side requests
	let directus = createDirectus<Schema>(directusURL, { globals: { fetch: customFetch } })
		.with(authentication('cookie', { credentials: 'include' }))
		.with(rest({ credentials: 'include' }));
	
	// Add static token if available (for server-side requests to bypass Cloudflare)
	// This is safe because process.env is only available server-side
	if (process.server) {
		const staticTokenValue = process.env.DIRECTUS_STATIC_TOKEN || process.env.DIRECTUS_SERVER_TOKEN;
		if (staticTokenValue) {
			directus = directus.with(staticToken(staticTokenValue));
		}
	}

	// ** Live Preview Bits **
	// Check if we are in preview mode
	const preview = route.query.preview && route.query.preview === 'true';
	const token = route.query.token as string | undefined;

	// If we are in preview mode, we need to use the token from the query string
	if (preview && token) {
		directus.setToken(token);

		nuxtApp.hook('page:finish', () => {
			refreshNuxtData();
		});
	}

	return {
		provide: {
			directus,
		},
	};
});
