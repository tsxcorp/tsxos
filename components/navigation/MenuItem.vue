<script setup lang="ts">
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/vue';
import { useRoute, useI18n } from '#imports';
import type { RouteLocationRaw } from '#vue-router';
import type { NavigationItem } from '~~/types';

const route = useRoute();
const { locale } = useI18n();

// Định nghĩa props
const props = defineProps<{
  item: NavigationItem;
}>();

// Ref để đóng popover
const popover: Ref<any> = ref(null);

// Đóng menu khi route thay đổi
watch(
  () => route.path,
  () => {
    return popover.value?.();
  },
);

// ✅ Dịch title dựa trên ngôn ngữ
const translatedTitle = computed(() => {
  // Giả sử item có translations (từ Directus)
  const translations = props.item.translations || [];
  const translation = translations.find(t => t.languages_code === (locale.value === "vi" ? "vi-VN" : "en-US"));
  return translation?.title || props.item.title;
});

// ✅ Điều chỉnh URL dựa trên ngôn ngữ
const translatedUrl = computed(() => {
  let url = getNavItemUrl(props.item) as string;
  if (locale.value === "vi" && !url.startsWith('/vi')) {
    url = `/vi${url}`; // Thêm /vi vào đầu nếu là tiếng Việt
  }
  return url;
});
</script>

<template>
  <NuxtLink
    v-if="!item.has_children"
    :href="translatedUrl as RouteLocationRaw"
    class="menu-link"
    exact-active-class="bg-gray-700"
    :target="item.open_in_new_tab ? '_blank' : '_self'"
  >
    {{ translatedTitle }}
  </NuxtLink>

  <Popover v-else v-slot="{ close }" class="relative" as="div">
    <PopoverButton
      :ref="
        () => {
          popover = close;
        }
      "
      class="menu-link"
    >
      {{ translatedTitle }}
      <Icon name="heroicons:chevron-down" class="flex-none w-5 ml-1 text-gray-400" aria-hidden="true" />
    </PopoverButton>

    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="translate-y-1 opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-1 opacity-0"
    >
      <PopoverPanel
        class="absolute z-10 w-screen max-w-md mt-4 overflow-hidden bg-gray-800 shadow-lg rounded-panel top-full"
      >
        <div class="p-4">
          <NuxtLink
            v-for="childItem in item.children as NavigationItem[]"
            :key="childItem.id"
            :href="getNavItemUrl(childItem) as RouteLocationRaw"
            class="relative flex p-4 leading-6 transition duration-150 rounded-panel group gap-x-6 hover:bg-gray-900"
          >
            <div
              class="flex items-center justify-center flex-none p-2 mt-1 border rounded-button h-11 w-11 border-primary"
            >
              <Icon
                v-if="childItem.icon"
                :name="convertIconName(childItem.icon) as string"
                class="w-10 h-10 text-primary"
              />
            </div>
            <div class="">
              <p class="block font-medium text-white font-display">
                {{ childItem.translations?.find(t => t.languages_code === (locale.value === "vi" ? "vi-VN" : "en-US"))?.title || childItem.title }}
              </p>
              <p v-if="childItem.label" class="mt-1 text-sm leading-tight text-gray-400">
                {{ childItem.label }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </PopoverPanel>
    </transition>
  </Popover>
</template>

<style lang="postcss">
.menu-link {
  @apply text-white hover:bg-gray-700 transition duration-150 font-medium hover:text-white py-2 px-3 inline-flex items-center font-display outline-none rounded-button;
}
</style>