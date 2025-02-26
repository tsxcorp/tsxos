<script setup lang="ts">
import { borderRadiusMap } from '~/theme';
import { computed, watchEffect } from 'vue';

const { globals, theme } = useAppConfig();
const { fileUrl } = useFiles();

// ✅ Chuyển các ID thành URL ngay tại `app.vue`
const globalTitle = computed(() => globals?.title || 'TSX Corporation');

const processedGlobals = computed(() => {
  if (!globals) {
    return {};
  }
  const processed = {
    ...globals,
    logo_on_light_bg: globals?.logo_on_light_bg ? fileUrl(globals.logo_on_light_bg) : '/logos/agencyos.png',
    logo_on_dark_bg: globals?.logo_on_dark_bg ? fileUrl(globals.logo_on_dark_bg) : '/logos/agencyos-dark.png',
    social_links: globals?.social_links || [],
  };
  return processed;
});

const borderRadius = computed(() => borderRadiusMap[theme?.borderRadius] || {});

// ✅ Inject JSON-LD
useSchemaOrg([
	defineOrganization({
		name: globalTitle.value,
		logo: processedGlobals.value.logo_on_light_bg,
		sameAs: processedGlobals.value.social_links.map((link) => link.url),
	}),
]);

// ✅ Inject Border Radius và Font vào CSS Variables
useHead({
	style: [
		{
			id: 'border-radius',
			innerHTML: `:root {${Object.entries(borderRadius.value)
				.map(([key, value]) => `--border-radius-${key}: ${value};`)
				.join('\n')}\n${Object.entries(theme?.fonts || {})
				.map(([key, value]) => `--font-${key}: ${value};`)
				.join('\n')}`,
		},
	],
});
</script>

<template>
	<NuxtLayout>
		<NuxtLoadingIndicator
			color="repeating-linear-gradient(to right, #FFA500 0%, #FF8C00 100%)"
		/>
		<NuxtPage />
	</NuxtLayout>
</template>
