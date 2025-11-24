<script setup lang="ts">
import { useI18n } from '#i18n';

export interface HorizontalNavigationProps {
  items: Array<{
    name: string;
    href: string;
    translations?: Array<{ languages_code: string; name: string }>;
  }>;
}

const props = defineProps<HorizontalNavigationProps>();
const { locale } = useI18n();

// ✅ Dịch name và href dựa trên ngôn ngữ
const translatedItems = computed(() => {
  return props.items.map(item => {
    const translation = item.translations?.find(t => t.languages_code === (locale.value === "vi" ? "vi-VN" : "en-US"));
    let href = item.href;
    if (locale.value === "vi" && !href.startsWith('/vi')) {
      href = `/vi${href}`; // Thêm /vi vào đầu nếu là tiếng Việt
    }
    return {
      name: translation?.name || item.name,
      href,
    };
  });
});
</script>

<template>
  <div class="inline-flex">
    <nav class="flex gap-4">
      <NuxtLink
        v-for="tab in translatedItems"
        :key="tab.name"
        :href="tab.href"
        exact-active-class="text-primary-700 bg-primary-100 dark:bg-primary-900 dark:text-white"
        class="px-3 py-2 text-sm font-medium text-gray-500 transition duration-300 rounded-button hover:text-gray-700 dark:hover:text-gray-300 dark:text-gray-400"
      >
        {{ tab.name }}
      </NuxtLink>
    </nav>
  </div>
</template>