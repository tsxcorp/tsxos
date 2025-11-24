<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';
import type { NavigationItem } from '~/types';
import { useI18n, useRoute, navigateTo } from '#imports';
import { onMounted } from 'vue';

// Lấy dữ liệu từ app config và i18n
const { globals } = useAppConfig();
const { locale, locales, setLocale } = useI18n();
const route = useRoute();

// Hàm chuyển đổi ngôn ngữ với logic redirect slug
const changeLanguage = async (lang: string) => {
  console.log(`🔎 Changing language to: ${lang}`);

  try {
    // Thiết lập locale mới
    setLocale(lang);

    // Lấy slug hiện tại từ route (nếu có)
    const currentSlug = route.params.slug as string || '';

    if (currentSlug) {
      const currentLocale = lang === 'vi' ? 'vi-VN' : 'en-US';
      console.log(`🔎 Checking slug: ${currentSlug} for locale: ${currentLocale}`);

      // Truy vấn posts_translations để lấy postId từ slug hiện tại
      const translationResponse = await useDirectus(
        readItems('posts_translations', {
          filter: {
            slug: { _eq: currentSlug },
          },
          fields: ['id', 'posts_id'],
          limit: 1,
        })
      );

      if (translationResponse && translationResponse.length > 0) {
        const postId = translationResponse[0].posts_id.id;
        const correctTranslation = await useDirectus(
          readItems('posts_translations', {
            filter: {
              posts_id: { _eq: postId },
              languages_code: { _eq: currentLocale },
            },
            fields: ['slug'],
            limit: 1,
          })
        );

        if (correctTranslation && correctTranslation.length > 0) {
          const correctSlug = correctTranslation[0].slug;
          if (correctSlug !== currentSlug) {
            const newPath = `/${lang === 'vi' ? 'vi/bai-viet' : 'posts'}/${correctSlug}`;
            console.log(`🔄 Redirecting to: ${newPath}`);
            await navigateTo(newPath, { replace: true });
          } else {
            console.log(`✅ Slug ${currentSlug} is correct for ${currentLocale}`);
          }
        } else {
          console.warn(`⚠️ No translation found for postId: ${postId} in locale: ${currentLocale}`);
        }
      } else {
        console.warn(`⚠️ No translation found for slug: ${currentSlug}`);
      }
    } else {
      console.log(`⚠️ No slug found in current route, redirecting to home`);
      await navigateTo(`/${lang === 'vi' ? 'vi' : ''}`);
    }
  } catch (error) {
    console.error('🚨 Error during language change:', error);
  }
};

// Fetch navigation data
const { data: navigation } = await useAsyncData('footerNav', () => {
  return useDirectus(
    readItem('navigation', 'footer', {
      fields: [
        {
          items: [
            'id',
            'title',
            'icon',
            'label',
            'type',
            'url',
            'has_children',
            {
              page: ['permalink', 'title'],
              children: [
                'id',
                'title',
                'icon',
                'label',
                'type',
                'url',
                {
                  page: ['permalink', 'title'],
                },
              ],
            },
          ],
        },
      ],
    })
  );
});

// Fetch newsletter form data
const { data: form } = await useAsyncData(
  'newsletterForm',
  () => {
    return useDirectus(
      readItems('forms', {
        filter: {
          key: {
            _eq: 'newsletter',
          },
        },
      })
    );
  },
  {
    transform: (data) => data[0],
    default: () => null, // Giá trị mặc định nếu fetch thất bại
  }
);

// Hàm hỗ trợ (giả định đã được định nghĩa ở nơi khác)
const getNavItemUrl = (item: NavigationItem): RouteLocationRaw => {
  // Logic để lấy URL từ item (cần điều chỉnh dựa trên dự án)
  return item.url || '/';
};
</script>

<template>
  <footer
    class="relative px-8 py-8 bg-white md:px-12 md:py-10 dark:bg-gray-900 rounded-panel"
    aria-labelledby="footer-heading"
  >
    <div class="mx-auto">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div class="w-full">
          <NuxtLink href="/">
            <Logo class="h-8 dark:text-white" />
          </NuxtLink>
          <VText v-if="globals?.tagline" text-color="light" class="mt-2">
            {{ globals.tagline }}
          </VText>
        </div>
        <div class="flex items-center justify-end space-x-4">
          <!-- Chuyển đổi ngôn ngữ -->
          <select
            class="bg-white dark:bg-gray-800 text-gray-700 dark:text-white px-3 py-2 border rounded-md"
            @change="changeLanguage($event.target.value)"
          >
            <option v-for="loc in locales" :key="loc.code" :value="loc.code" :selected="locale === loc.code">
              {{ loc.name }}
            </option>
          </select>
          <!-- Dark Mode Toggle -->
          <DarkModeToggle class="hidden text-gray-600 md:block hover:text-gray-400" />
        </div>
      </div>

      <!-- Navigation + Form -->
      <nav class="grid gap-8 mt-8 md:grid-cols-2 xl:mt-0 xl:col-span-2">
        <div class="mt-4">
          <TypographyTitle>Menu</TypographyTitle>
          <ul role="list" class="grid gap-2 mt-2 md:grid-cols-2">
            <li v-for="item in navigation?.items as NavigationItem[]" :key="item.id">
              <NuxtLink
                :to="getNavItemUrl(item) as RouteLocationRaw"
                class="font-medium text-gray-700 hover:text-gray-900 dark:text-gray-200 dark:hover:text-primary"
              >
                {{ item.title }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <div v-if="form" class="relative">
          <TypographyHeadline :content="`<p>Subscribe to our <em>newsletter</em></p>`" size="sm">
            Subscribe to our newsletter
          </TypographyHeadline>
          <UForm class="mt-4 mb-8" :form="form" />
        </div>
      </nav>
    </div>

    <!-- Bottom -->
    <div class="pt-6 mx-auto border-t dark:border-t-gray-700 max-w-7xl md:flex md:items-center md:justify-between">
      <div class="flex items-center justify-center space-x-6 md:order-last md:mb-0">
        <NuxtLink
          v-for="link in globals?.social_links"
          :key="link.url"
          :href="link.url"
          class="w-6 h-6 text-white"
          target="_blank"
        >
          <span class="sr-only">{{ link.service }}</span>
          <Icon class="w-8 h-8 text-gray-700 dark:text-white hover:opacity-75" :name="`mdi:${link.service}`" />
        </NuxtLink>
      </div>
      <div class="mt-8 md:mt-0 md:order-1">
        <span class="mt-2 text-gray-600 dark:text-gray-400">
          Copyright © 1988 - {{ new Date().getFullYear() }}
          <NuxtLink v-if="globals?.title" href="/" class="mx-2 hover:text-primary" rel="noopener noreferrer">
            {{ globals.title }}.
          </NuxtLink>
          All rights reserved.
        </span>
      </div>
    </div>
  </footer>
</template>