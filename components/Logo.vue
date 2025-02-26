<script setup lang="ts">
import { computed } from 'vue';
import { useAppConfig } from '#app';

const appConfig = useAppConfig();

// 🛠 Nhận prop để điều chỉnh logo (dark/light)
const props = defineProps({
  mode: {
    type: String,
    default: 'auto', // 'auto' = tự động theo theme, 'dark' = luôn dùng logo dark
  },
});

const logoDark = computed(() => appConfig.globals?.logo_on_dark_bg || '/logos/agencyos-dark.png');
const logoLight = computed(() => appConfig.globals?.logo_on_light_bg || '/logos/agencyos.png');
</script>

<template>
  <!-- Luôn hiển thị logo dark nếu mode="dark" -->
  <NuxtImg v-if="props.mode === 'dark'" :src="logoDark" alt="Logo Dark" class="h-8" />

  <!-- Nếu không có mode, hiển thị logo theo dark/light mode -->
  <template v-else>
    <NuxtImg v-if="logoLight" :src="logoLight" alt="Logo Light" class="h-8 dark:hidden" />
    <NuxtImg v-if="logoDark" :src="logoDark" alt="Logo Dark" class="h-8 hidden dark:block" />
  </template>
</template>
