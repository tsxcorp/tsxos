<script setup lang="ts">
import type { PostType, SEO, Team, Category } from '~/types';
import { useRoute, useI18n, navigateTo } from '#imports';

const { fileUrl } = useFiles();
const { params, path } = useRoute();
const { locale } = useI18n();

// ✅ Chuyển locale về format Directus
const currentLocale = computed(() => {
  return locale.value === "vi" ? "vi-VN" : "en-US";
});

// ✅ Debug log
console.log("🌍 Locale:", currentLocale.value);
console.log("🔗 Path:", path);
console.log("🔗 Slug:", params.slug);

// ✅ Fetch dữ liệu từ Directus
const { data: page, error } = await useAsyncData(
  `post-${params.slug}-${locale.value}`,
  async () => {
    try {
      console.log("🔎 Querying Directus for post with locale:", currentLocale.value);

      // 🎯 1. Truy vấn posts_translations
      const translationResponse = await useDirectus(
        readItems('posts_translations', {
          filter: {
            languages_code: { _eq: currentLocale.value },
            slug: { _eq: params.slug as string },
          },
          fields: ['id', 'languages_code', 'title', 'summary', 'content', 'slug', { posts_id: ['id'] }],
          limit: 1,
        })
      );
      console.log("📌 Translation Response:", JSON.stringify(translationResponse, null, 2));

      if (!translationResponse || translationResponse.length === 0) {
        // Tìm slug từ ngôn ngữ khác và redirect
        const translationsForOtherLocale = await useDirectus(
          readItems('posts_translations', {
            filter: {
              slug: { _eq: params.slug as string },
            },
            fields: ['id', 'languages_code', 'posts_id'],
            limit: 1,
          })
        );

        if (translationsForOtherLocale && translationsForOtherLocale.length > 0) {
          const postId = translationsForOtherLocale[0].posts_id.id;
          const correctTranslation = await useDirectus(
            readItems('posts_translations', {
              filter: {
                posts_id: { _eq: postId },
                languages_code: { _eq: currentLocale.value },
              },
              fields: ['slug'],
              limit: 1,
            })
          );

          if (correctTranslation && correctTranslation.length > 0 && correctTranslation[0].slug !== params.slug) {
            const newPath = `/${locale.value === 'vi' ? 'vi/bai-viet' : 'posts'}/${correctTranslation[0].slug}`;
            console.log(`🔄 Redirecting to correct slug: ${newPath}`);
            return navigateTo(newPath, { replace: true });
          }
        }

        throw createError({ statusCode: 404, statusMessage: `Post Not Found - No matching post for slug: ${params.slug}` });
      }

      const postId = translationResponse[0].posts_id.id;
      const translatedTitle = translationResponse[0].title;
      const translatedSummary = translationResponse[0].summary;
      const translatedContent = translationResponse[0].content;
      const translatedSlug = translationResponse[0].slug;

      // 🎯 2. Truy vấn posts để lấy dữ liệu chi tiết
      const postResponse = await useDirectus(
        readItems('posts', {
          filter: { id: { _eq: postId } },
          limit: 1,
          fields: [
            'id',
            'title',
            'summary',
            'slug',
            'content',
            'date_published',
            'image',
            'type',
            'client',
            'cost',
            'built_with',
            'video_url',
            {
              gallery: [{ directus_files_id: ['id', 'title', 'description'] }],
              author: ['name', 'job_title', 'image'],
              category: ['title', 'slug', 'color'],
              seo: ['title', 'meta_description'],
            },
          ],
        })
      );
      console.log("📌 Post Response:", JSON.stringify(postResponse, null, 2));

      if (!postResponse || postResponse.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Post Not Found - No post data in Directus' });
      }

      // 🎯 3. Gộp dữ liệu bản dịch vào dữ liệu gốc
      const pageData = postResponse[0];
      if (translatedTitle) pageData.title = translatedTitle;
      if (translatedSummary) pageData.summary = translatedSummary;
      if (translatedContent) pageData.content = translatedContent;
      if (translatedSlug) pageData.slug = translatedSlug;

      console.log("✅ Final Post Data:", JSON.stringify(pageData, null, 2));
      return pageData;
    } catch (err) {
      console.error("🚨 API Fetch Error:", err);
      throw err;
    }
  }
);

// ✅ Xử lý lỗi
if (error.value) {
  console.error('🚨 Error fetching post:', error.value);
  throw createError({ statusCode: 500, statusMessage: 'Failed to load post data' });
}

const componentMap: Record<PostType, any> = {
  blog: resolveComponent('PostBlog'),
  project: resolveComponent('PostProject'),
  video: resolveComponent('PostVideo'),
};

// ✅ Compute metadata
const metadata = computed(() => {
  const pageData = unref(page);
  const seo = pageData?.seo as SEO;
  const author = pageData?.author as Team;
  return {
    title: seo?.title ?? pageData?.title ?? undefined,
    description: seo?.meta_description ?? pageData?.summary ?? undefined,
    image: pageData?.image ? fileUrl(pageData?.image as any) : undefined,
    authorImage: author?.image ? fileUrl(author.image as any) : undefined,
    authorName: author?.name ?? undefined,
    category: (pageData?.category as Category) ?? undefined,
  };
});

// ✅ Dynamic OG Images
defineOgImageComponent('OgImageTemplate', {
  title: unref(metadata)?.title,
  summary: unref(metadata)?.description,
  imageUrl: unref(metadata)?.image,
  authorName: unref(metadata)?.authorName,
  authorImage: unref(metadata)?.authorImage,
  badgeColor: unref(metadata)?.category?.color ?? undefined,
  badgeLabel: unref(metadata)?.category?.title ?? undefined,
});

// ✅ JSON-LD
useSchemaOrg([
  defineArticle({
    headline: unref(metadata)?.title,
    description: unref(metadata)?.description,
    image: unref(metadata)?.image,
    datePublished: unref(page)?.date_published ?? undefined,
    author: [
      {
        name: unref(metadata)?.authorName,
        image: unref(metadata)?.authorImage,
      },
    ],
  }),
]);

// ✅ Page Title
useHead({
  title: unref(metadata)?.title,
});

// ✅ SEO Meta
useServerSeoMeta({
  title: unref(metadata)?.title,
  description: unref(metadata)?.description,
  ogTitle: unref(metadata)?.title,
  ogDescription: unref(metadata)?.description,
});

// ✅ Define page meta (tĩnh) và áp dụng middleware
definePageMeta({
  layout: 'default',
  middleware: 'redirect-slug',
});
</script>

<template>
  <div>
    <component :is="componentMap[page.type as PostType]" v-if="page && page.type" :page="page" />
  </div>
</template>