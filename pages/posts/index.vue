<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from '#i18n';

const { path } = useRoute();
const { locale } = useI18n();
const { globals } = useAppConfig();
const { fileUrl } = useFiles();

// ✅ Chuyển locale về format Directus (hỗ trợ cả en/vi và en-US/vi-VN)
const currentLocale = computed(() => {
  const loc = locale.value === 'vi' ? 'vi-VN' : 'en-US';
  console.log("🌍 Locale:", loc);
  return loc;
});

// ✅ Debug log
console.log("🔗 Path:", path);

// Lấy danh sách bài viết & trang blog từ Directus theo ngôn ngữ hiện tại
const { data, error } = await useAsyncData(
  `blog-${locale.value}`,
  async () => {
    try {
      // 🎯 1. Lấy danh sách bài viết từ posts_translations
      const translationsPromise = useDirectus(
        readItems('posts_translations', {
          filter: {
            languages_code: { _in: [currentLocale.value] },
          },
          fields: ['id', 'languages_code', 'title', 'summary', 'slug', 'content', { posts_id: ['id'] }],
        })
      );

      // 🎯 2. Lấy dữ liệu trang blog từ pages_translations
      const pagePromise = useDirectus(
        readItems('pages_translations', {
          filter: {
            languages_code: { _in: [currentLocale.value] },
            permalink: { _eq: currentLocale.value === 'vi-VN' ? '/vi/bai-viet' : '/posts' },
          },
          fields: [
            'id',
            'languages_code',
            'title',
            'headline',
            'content',
            { pages_id: ['id', 'featured_post'] },
            { pages_id: { seo: ['title', 'meta_description'] } },
            { pages_id: { featured_post: ['id'] } },
          ],
          limit: 1,
        })
      );

      const [translations, pageTranslations] = await Promise.all([translationsPromise, pagePromise]);
      console.log("📌 Translations Response:", JSON.stringify(translations, null, 2));
      console.log("📌 Page Translations Response:", JSON.stringify(pageTranslations, null, 2));

      // Kiểm tra dữ liệu trước khi xử lý
      if (!translations || !Array.isArray(translations)) {
        console.warn("⚠️ Translations is not an array:", translations);
        return { posts: [], page: null };
      }
      if (!pageTranslations || !Array.isArray(pageTranslations)) {
        console.warn("⚠️ Page Translations is not an array:", pageTranslations);
        return { posts: [], page: null };
      }

      if (translations.length === 0) {
        return { posts: [], page: null };
      }

      // 🎯 3. Lấy dữ liệu chi tiết từ posts
      const postIds = translations.map(t => t.posts_id.id);
      const featuredPostId = pageTranslations[0]?.pages_id?.featured_post?.id;
      if (featuredPostId && !postIds.includes(featuredPostId)) {
        postIds.push(featuredPostId);
      }

      const postPromise = useDirectus(
        readItems('posts', {
          filter: { id: { _in: postIds } },
          sort: ['date_published'],
          fields: [
            'id',
            'image',
            'type',
            'date_published',
            {
              category: ['title', 'slug', 'color'],
              author: ['name', 'job_title', 'image'],
            },
          ],
        })
      );

      const posts = await postPromise;
      console.log("📌 Posts Response:", JSON.stringify(posts, null, 2));

      // 🎯 4. Gộp dữ liệu bài viết
      const translatedPosts = translations.map(translation => {
        const post = posts.find(p => p.id === translation.posts_id.id) || {};
        return {
          id: post.id,
          slug: translation.slug || '',
          title: translation.title || '',
          summary: translation.summary || '',
          content: translation.content || '',
          image: post.image,
          type: post.type,
          date_published: post.date_published,
          category: post.category,
          author: post.author,
        };
      });

      // 🎯 5. Gộp dữ liệu trang blog và featured_post
      let pageData = null;
      let featuredPostData = null;
      if (pageTranslations && pageTranslations.length > 0) {
        const pageTranslation = pageTranslations[0];
        const page = pageTranslation.pages_id || {};

        // Lấy dữ liệu featured_post từ posts_translations
        if (page.featured_post?.id) {
          const featuredTranslation = await useDirectus(
            readItems('posts_translations', {
              filter: {
                languages_code: { _in: [currentLocale.value] },
                posts_id: { _eq: page.featured_post.id },
              },
              fields: ['id', 'languages_code', 'title', 'summary', 'slug', 'content', { posts_id: ['id'] }],
              limit: 1,
            })
          );
          console.log("📌 Featured Post Translation:", JSON.stringify(featuredTranslation, null, 2));

          if (featuredTranslation && featuredTranslation.length > 0) {
            const featuredPost = posts.find(p => p.id === page.featured_post.id) || {};
            featuredPostData = {
              id: featuredPost.id,
              slug: featuredTranslation[0].slug || '',
              title: featuredTranslation[0].title || '',
              summary: featuredTranslation[0].summary || '',
              content: featuredTranslation[0].content || '',
              image: featuredPost.image,
              type: featuredPost.type,
              date_published: featuredPost.date_published,
              category: featuredPost.category,
              author: featuredPost.author,
            };
          }
        }

        pageData = {
          id: page.id,
          title: pageTranslation.title || page.title || '',
          headline: pageTranslation.headline || page.headline || '',
          content: pageTranslation.content || page.content || '',
          seo: page.seo || { title: '', meta_description: '' },
          featured_post: featuredPostData,
        };
      }

      return {
        posts: translatedPosts,
        page: pageData,
      };
    } catch (err) {
      console.error("🚨 API Fetch Error:", err);
      return { posts: [], page: null };
    }
  },
  {
    default: () => ({ posts: [], page: null }),
  }
);

// ✅ Xử lý lỗi
if (error.value) {
  console.error('🚨 Error fetching blog data:', error.value);
  throw createError({ statusCode: 500, statusMessage: 'Failed to load blog data' });
}

// Xử lý dữ liệu
const page = computed(() => unref(data)?.page);
const posts = computed(() => {
  const filteredPosts = unref(data)?.posts.filter(post => post.id !== unref(page)?.featured_post?.id) || [];
  return filteredPosts;
});

// Metadata SEO
const metadata = computed(() => ({
  title: page.value?.seo?.title ?? page.value?.title ?? 'Blog',
  description: page.value?.seo?.meta_description ?? page.value?.headline ?? 'Latest blog posts',
  image: globals?.og_image ? fileUrl(globals?.og_image) : undefined,
}));

// Dynamic OG Images
defineOgImageComponent('OgImageTemplate', {
  title: metadata.value.title,
  summary: metadata.value.description,
  imageUrl: metadata.value.image,
});

// JSON-LD
useSchemaOrg([
  defineWebPage({
    '@type': 'CollectionPage',
    name: metadata.value.title,
    description: metadata.value.description,
  }),
]);

// Page Title
useHead({ title: () => metadata.value.title });

// SEO Meta
useServerSeoMeta({
  title: () => metadata.value.title,
  description: () => metadata.value.description,
  ogTitle: () => metadata.value.title,
  ogDescription: () => metadata.value.description,
});

// ✅ Define page meta (tĩnh)
definePageMeta({
  layout: 'default',
});
</script>

<template>
  <BlockContainer>
    <header class="pb-6 border-b border-gray-300 dark:border-gray-700">
      <TypographyTitle>{{ page?.title }}</TypographyTitle>
      <TypographyHeadline :content="page?.headline || 'Latest Blog Posts'" />
    </header>
    <section class="relative w-full py-12 space-y-12">
      <div
        class="relative grid w-full gap-12 pb-12 border-b-2 border-gray-300 md:grid-cols-2 lg:grid-cols-4 dark:border-gray-700"
      >
        <div>
          <TypographyTitle class="text-gray-700 dark:text-gray-400">Search</TypographyTitle>
          <GlobalSearch :collections="['posts']" class="flex" />
          <TypographyTitle class="mt-8 text-gray-700 dark:text-gray-400">Categories</TypographyTitle>
          <Categories />
        </div>
        <div class="space-y-4 lg:col-span-3">
          <TypographyTitle>Featured Article</TypographyTitle>
          <PostCard v-if="page?.featured_post" :post="page.featured_post" direction="horizontal" />
          <p v-else class="text-gray-500">No featured article available</p>
        </div>
      </div>
      <div class="space-y-4">
        <TypographyTitle>Latest & Greatest</TypographyTitle>
        <div class="relative grid gap-8 md:gap-12 md:grid-cols-3 lg:grid-cols-6">
          <PostCard
            v-for="(post, postIdx) in posts"
            :key="post.id"
            :post="post"
            :class="[
              'border-b border-gray-300 pb-6 dark:border-gray-700',
              postIdx < 2 ? 'md:col-span-3' : 'md:col-span-2',
            ]"
          />
        </div>
      </div>
    </section>
  </BlockContainer>
</template>