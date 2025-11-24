<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from '#i18n';
import type { Page } from '~/types';

const route = useRoute();
const { locale } = useI18n();
const { fileUrl } = useFiles();
const { globals } = useAppConfig();

// ✅ Chuyển locale về format Directus (khớp với iso trong i18n config)
const currentLocale = computed(() => {
  return locale.value === "vi" ? "vi-VN" : "en-US";
});

// ✅ Xử lý permalink để khớp với Directus
const finalPath = computed(() => {
  let path = route.params.permalink?.toString()?.trim();
  if (!path || path === '') path = '/';
  if (path.endsWith('/') && path !== '/') path = path.slice(0, -1); // Loại bỏ / dư thừa ở cuối
  // Đảm bảo path bắt đầu bằng / (khớp với Directus)
  if (!path.startsWith('/')) path = `/${path}`;
  // Xử lý đặc biệt cho trang Home tiếng Việt
  if (currentLocale.value === "vi-VN" && path === "/") path = "/vi";
  return path;
});

// ✅ Debug log
console.log("🌍 Locale:", currentLocale.value);
console.log("🔗 Final Path:", finalPath.value);

// ✅ Fetch dữ liệu từ Directus
const { data: page, error } = await useAsyncData(
  `page-${finalPath.value}-${currentLocale.value}`,
  async () => {
    try {
      console.log("🔎 Querying Directus...");

      // 🎯 1. Truy vấn `pages_translations`
      const translationResponse = await useDirectus(
        readItems('pages_translations', {
          filter: {
            languages_code: { _eq: currentLocale.value },
            permalink: { _eq: finalPath.value },
          },
          fields: ['id', 'languages_code', 'title', 'permalink', { pages_id: ['id', 'permalink', 'title'] }],
          limit: 1,
        })
      );
      console.log("📌 Translation Response:", JSON.stringify(translationResponse, null, 2));

      let pageId = null;
      let translatedTitle = null;
      let translatedPermalink = null;

      if (translationResponse.length > 0) {
        pageId = translationResponse[0].pages_id.id;
        translatedTitle = translationResponse[0].title;
        translatedPermalink = translationResponse[0].permalink;
      } else {
        // Fallback: chỉ áp dụng cho trang Home nếu finalPath là "/" hoặc "/vi"
        if (finalPath.value === "/" || finalPath.value === "/vi") {
          console.log("⚠️ Không tìm thấy trang, thử lấy trang Home mặc định...");
          const defaultTranslation = await useDirectus(
            readItems('pages_translations', {
              filter: {
                languages_code: { _eq: currentLocale.value },
                permalink: { _eq: currentLocale.value === "vi-VN" ? "/vi" : "/" },
              },
              fields: ['id', 'languages_code', 'title', 'permalink', { pages_id: ['id', 'permalink', 'title'] }],
              limit: 1,
            })
          );
          console.log("📌 Default Translation Response:", JSON.stringify(defaultTranslation, null, 2));

          if (defaultTranslation.length > 0) {
            pageId = defaultTranslation[0].pages_id.id;
            translatedTitle = defaultTranslation[0].title;
            translatedPermalink = defaultTranslation[0].permalink;
          }
        }

        // Fallback cuối: thử lấy trang khác với permalink khớp
        if (!pageId) {
          console.log("⚠️ Không tìm thấy trang với permalink:", finalPath.value);
          const fallbackTranslation = await useDirectus(
            readItems('pages_translations', {
              filter: {
                languages_code: { _eq: currentLocale.value },
                permalink: { _eq: finalPath.value },
              },
              fields: ['id', 'languages_code', 'title', 'permalink', { pages_id: ['id', 'permalink', 'title'] }],
              limit: 1,
            })
          );
          console.log("📌 Fallback Translation Response:", JSON.stringify(fallbackTranslation, null, 2));

          if (fallbackTranslation.length > 0) {
            pageId = fallbackTranslation[0].pages_id.id;
            translatedTitle = fallbackTranslation[0].title;
            translatedPermalink = fallbackTranslation[0].permalink;
          } else {
            throw createError({ statusCode: 404, statusMessage: `Page Not Found - No matching page found for ${finalPath.value}` });
          }
        }
      }

      // 🎯 2. Truy vấn `pages` với tất cả các block
      const response = await useDirectus(
        readItems('pages', {
          filter: { id: { _eq: pageId } },
          fields: [
            'id',
            'permalink',
            'title',
            {
              seo: ['title', 'meta_description'],
              blocks: [
                'id',
                'collection',
                'hide_block',
                {
                  item: {
                    block_hero: [
                      'id',
                      'title',
                      'headline',
                      'content',
                      'image',
                      'image_position',
                      {
                        button_group: [
                          'id',
                          'alignment',
                          {
                            buttons: [
                              'id',
                              'label',
                              'type',
                              'color',
                              'variant',
                              'external_url',
                              { page: ['id', 'permalink'] },
                              { post: ['id', 'slug'] },
                            ],
                          },
                        ],
                      },
                    ],
                    block_faqs: ['id', 'title', 'faqs', 'headline', 'alignment'],
                    block_richtext: ['id', 'title', 'headline', 'content', 'alignment'],
                    block_testimonials: [
                      'id',
                      'title',
                      'headline',
                      {
                        testimonials: [
                          {
                            testimonials_id: [
                              'id',
                              'title',
                              'subtitle',
                              'content',
                              'company',
                              'company_logo',
                              { image: ['id', 'title', 'description'] },
                            ],
                          },
                        ],
                      },
                    ],
                    block_steps: [
                      'id',
                      'title',
                      'headline',
                      'show_step_numbers',
                      'alternate_image_position',
                      {
                        steps: [
                          'id',
                          'title',
                          'content',
                          'image',
                          {
                            button_group: [
                              'id',
                              'alignment',
                              {
                                buttons: [
                                  'id',
                                  'label',
                                  'type',
                                  'color',
                                  'variant',
                                  'external_url',
                                  { page: ['id', 'permalink'] },
                                  { post: ['id', 'slug'] },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    block_columns: [
                      'id',
                      'title',
                      'headline',
                      {
                        rows: [
                          'id',
                          'title',
                          'content',
                          'image_position',
                          { image: ['id', 'title', 'description'] },
                          {
                            button_group: [
                              'id',
                              'alignment',
                              {
                                buttons: [
                                  'id',
                                  'label',
                                  'type',
                                  'color',
                                  'variant',
                                  'external_url',
                                  { page: ['id', 'permalink'] },
                                  { post: ['id', 'slug'] },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                    block_team: ['*'],
                    block_form: ['id', 'title', 'headline', { form: ['*'] }],
                    block_quote: ['*'],
                    block_logocloud: [
                      'id',
                      'title',
                      'headline',
                      {
                        logos: [
                          'id',
                          { directus_files_id: ['id', 'title', 'description'] },
                        ],
                      },
                    ],
                    block_gallery: [
                      'id',
                      'title',
                      'headline',
                      {
                        gallery_items: [
                          { directus_files_id: ['id', 'title', 'description'] },
                        ],
                      },
                    ],
                    block_cta: [
                      'id',
                      'title',
                      'headline',
                      'content',
                      {
                        button_group: [
                          'id',
                          'alignment',
                          {
                            buttons: [
                              'id',
                              'label',
                              'type',
                              'color',
                              'variant',
                              'external_url',
                              { page: ['id', 'permalink'] },
                              { post: ['id', 'slug'] },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                },
              ],
            },
          ],
          limit: 1,
        })
      );

      if (!response || response.length === 0) {
        throw createError({ statusCode: 404, statusMessage: 'Page Not Found - No page data in Directus' });
      }

      // 🎯 3. Định nghĩa các block cần dịch
      const translatableBlocks = {
        block_hero: ['title', 'headline', 'content'],
        block_faqs: ['title', 'headline'],
        block_richtext: ['title', 'headline', 'content'],
        block_testimonials: ['title', 'headline'],
        block_steps: ['title', 'headline'],
        block_columns: ['title', 'headline'],
        block_team: ['title', 'headline', 'content'],
        block_cta: ['title', 'headline', 'content'],
        block_quote: ['title', 'subtitle', 'content'],
        block_logocloud: ['title', 'headline'],
        block_richtext: ['title', 'headline', 'content'],
      };

      let translationsData = {};

      // 🎯 4. Fetch translations cho các block thông thường
      for (const [blockType, fields] of Object.entries(translatableBlocks)) {
        const blocks = response[0]?.blocks.filter(block => block.collection === blockType) || [];
        if (blocks.length > 0) {
          const blockTranslations = await useDirectus(
            readItems(`${blockType}_translations`, {
              filter: {
                languages_code: { _eq: currentLocale.value },
                [`${blockType}_id`]: { _in: blocks.map(block => block.item.id) },
              },
              fields: ['id', `${blockType}_id`, 'languages_code', ...fields],
            })
          );
          translationsData[blockType] = blockTranslations;
        }
      }

      // 🎯 5.1 Fetch translations cho block_columns.rows
      const columnsBlocks = response[0]?.blocks.filter(block => block.collection === "block_columns") || [];
      if (columnsBlocks.length > 0) {
        const columnRowIds = columnsBlocks.flatMap(block => block.item.rows.map(row => row.id));
        if (columnRowIds.length > 0) {
          const columnRowTranslations = await useDirectus(
            readItems('block_columns_rows_translations', {
              filter: {
                languages_code: { _eq: currentLocale.value },
                block_columns_rows_id: { _in: columnRowIds },
              },
              fields: ['id', 'block_columns_rows_id', 'languages_code', 'title', 'content'],
            })
          );
          translationsData['block_columns_rows'] = columnRowTranslations;
        }
      }

      // 🎯 5.2 Fetch translations cho block_steps.steps
      const stepsBlocks = response[0]?.blocks.filter(block => block.collection === "block_steps") || [];
      if (stepsBlocks.length > 0) {
        const stepsIds = stepsBlocks.flatMap(block => block.item.steps.map(step => step.id));
        if (stepsIds.length > 0) {
          const stepsTranslations = await useDirectus(
            readItems('block_step_items_translations', {
              filter: {
                languages_code: { _eq: currentLocale.value },
                block_step_items_id: { _in: stepsIds },
              },
              fields: ['id', 'block_step_items_id', 'languages_code', 'title', 'content'],
            })
          );
          translationsData['block_step_items'] = stepsTranslations;
        }
      }

      // 🎯 5.3 Fetch translations cho testimonials
      const testimonialsBlocks = response[0]?.blocks.filter(block => block.collection === "block_testimonials") || [];
      if (testimonialsBlocks.length > 0) {
        const testimonialIds = testimonialsBlocks.flatMap(block =>
          block.item.testimonials.map(t => t.testimonials_id.id)
        );
        if (testimonialIds.length > 0) {
          const testimonialsTranslations = await useDirectus(
            readItems('testimonials_translations', {
              filter: {
                languages_code: { _eq: currentLocale.value },
                testimonials_id: { _in: testimonialIds },
              },
              fields: ['id', 'testimonials_id', 'languages_code', 'title', 'subtitle', 'content'],
            })
          );
          translationsData['testimonials'] = testimonialsTranslations;
        }
      }

      // 🎯 5.4 Fetch translations cho buttons trong block_button_group và tạo URL dịch
      const allBlocksWithButtonGroup = response[0]?.blocks.filter(block =>
        ['block_hero', 'block_cta', 'block_steps', 'block_columns'].includes(block.collection)
      ) || [];
      if (allBlocksWithButtonGroup.length > 0) {
        const buttonIds = [];
        const pageIds = [];
        const postIds = [];

        allBlocksWithButtonGroup.forEach(block => {
          if (block.collection === 'block_steps') {
            block.item.steps.forEach(step => {
              if (step.button_group && step.button_group.buttons) {
                step.button_group.buttons.forEach(button => {
                  buttonIds.push(button.id);
                  if (button.type === 'pages' && button.page?.id) pageIds.push(button.page.id);
                  if (button.type === 'posts' && button.post?.id) postIds.push(button.post.id);
                });
              }
            });
          } else if (block.collection === 'block_columns') {
            block.item.rows.forEach(row => {
              if (row.button_group && row.button_group.buttons) {
                row.button_group.buttons.forEach(button => {
                  buttonIds.push(button.id);
                  if (button.type === 'pages' && button.page?.id) pageIds.push(button.page.id);
                  if (button.type === 'posts' && button.post?.id) postIds.push(button.post.id);
                });
              }
            });
          } else if (block.item.button_group && block.item.button_group.buttons) {
            block.item.button_group.buttons.forEach(button => {
              buttonIds.push(button.id);
              if (button.type === 'pages' && button.page?.id) pageIds.push(button.page.id);
              if (button.type === 'posts' && button.post?.id) postIds.push(button.post.id);
            });
          }
        });

        if (buttonIds.length > 0) {
          const buttonTranslations = await useDirectus(
            readItems('block_button_translations', {
              filter: {
                languages_code: { _eq: currentLocale.value },
                block_button_id: { _in: buttonIds },
              },
              fields: ['id', 'block_button_id', 'languages_code', 'label'],
            })
          );
          translationsData['block_button'] = buttonTranslations;

          let pageTranslations = [];
          if (pageIds.length > 0) {
            pageTranslations = await useDirectus(
              readItems('pages_translations', {
                filter: {
                  languages_code: { _eq: currentLocale.value },
                  pages_id: { _in: pageIds },
                },
                fields: ['pages_id', 'permalink'],
              })
            );
          }

          let postTranslations = [];
          if (postIds.length > 0) {
            postTranslations = await useDirectus(
              readItems('posts_translations', {
                filter: {
                  languages_code: { _eq: currentLocale.value },
                  posts_id: { _in: postIds },
                },
                fields: ['posts_id', 'slug'],
              })
            );
          }

          const localePrefix = currentLocale.value === "vi-VN" ? "/vi" : "";

          allBlocksWithButtonGroup.forEach(block => {
            const applyTranslationsAndUrls = (buttons: any[]) => {
              buttons.forEach(button => {
                const translatedButton = translationsData['block_button']?.find(t => t.block_button_id === button.id);
                if (translatedButton) button.label = translatedButton.label || button.label;

                if (button.type === 'external') {
                  button.translatedUrl = button.external_url || '#';
                } else if (button.type === 'pages' && button.page?.id) {
                  const pageTranslation = pageTranslations.find(t => t.pages_id === button.page.id);
                  const slug = (pageTranslation ? pageTranslation.permalink : button.page.permalink).replace(/^\/+/, '').trim();
                  button.translatedUrl = `${localePrefix}/${slug}`;
                } else if (button.type === 'posts' && button.post?.id) {
                  const postTranslation = postTranslations.find(t => t.posts_id === button.post.id);
                  const slug = (postTranslation ? postTranslation.slug : button.post.slug).replace(/^\/+/, '').trim();
                  button.translatedUrl = `${localePrefix}/posts/${slug}`;
                } else {
                  button.translatedUrl = '#';
                }
              });
            };

            if (block.collection === 'block_steps') {
              block.item.steps.forEach(step => {
                if (step.button_group && step.button_group.buttons) {
                  applyTranslationsAndUrls(step.button_group.buttons);
                }
              });
            } else if (block.collection === 'block_columns') {
              block.item.rows.forEach(row => {
                if (row.button_group && row.button_group.buttons) {
                  applyTranslationsAndUrls(row.button_group.buttons);
                }
              });
            } else if (block.item.button_group && block.item.button_group.buttons) {
              applyTranslationsAndUrls(block.item.button_group.buttons);
            }
          });
        }
      }

      console.log('📌 All Block Translations:', JSON.stringify(translationsData, null, 2));

      // 🎯 6. Áp dụng translations vào dữ liệu
      response[0].blocks.forEach(block => {
        if (translatableBlocks[block.collection]) {
          const translatedBlock = translationsData[block.collection]?.find(t => t[`${block.collection}_id`] === block.item.id);
          if (translatedBlock) {
            for (const field of translatableBlocks[block.collection]) {
              block.item[field] = translatedBlock[field] || block.item[field];
            }
          }
        }

        if (block.collection === "block_columns") {
          block.item.rows.forEach(row => {
            const translatedRow = translationsData['block_columns_rows']?.find(t => t.block_columns_rows_id === row.id);
            if (translatedRow) {
              row.title = translatedRow.title || row.title;
              row.content = translatedRow.content || row.content;
            }
            if (row.button_group && row.button_group.buttons) {
              row.button_group.buttons.forEach(button => {
                const translatedButton = translationsData['block_button']?.find(t => t.block_button_id === button.id);
                if (translatedButton) {
                  button.label = translatedButton.label || button.label;
                }
              });
            }
          });
        }

        if (block.collection === "block_steps") {
          block.item.steps.forEach(step => {
            const translatedStep = translationsData['block_step_items']?.find(t => t.block_step_items_id === step.id);
            if (translatedStep) {
              step.title = translatedStep.title || step.title;
              step.content = translatedStep.content || step.content;
            }
            if (step.button_group && step.button_group.buttons) {
              step.button_group.buttons.forEach(button => {
                const translatedButton = translationsData['block_button']?.find(t => t.block_button_id === button.id);
                if (translatedButton) {
                  button.label = translatedButton.label || button.label;
                }
              });
            }
          });
        }

        if (block.collection === "block_testimonials") {
          block.item.testimonials.forEach(testimonial => {
            const translatedTestimonial = translationsData['testimonials']?.find(t => t.testimonials_id === testimonial.testimonials_id.id);
            if (translatedTestimonial) {
              testimonial.testimonials_id.title = translatedTestimonial.title || testimonial.testimonials_id.title;
              testimonial.testimonials_id.subtitle = translatedTestimonial.subtitle || testimonial.testimonials_id.subtitle;
              testimonial.testimonials_id.content = translatedTestimonial.content || testimonial.testimonials_id.content;
            }
          });
        }

        if (['block_hero', 'block_cta'].includes(block.collection) && block.item.button_group && block.item.button_group.buttons) {
          block.item.button_group.buttons.forEach(button => {
            const translatedButton = translationsData['block_button']?.find(t => t.block_button_id === button.id);
            if (translatedButton) {
              button.label = translatedButton.label || button.label;
            }
          });
        }
      });

      // 🎯 7. Áp dụng bản dịch cho page
      const pageData = response[0];
      if (translatedTitle) {
        pageData.title = translatedTitle;
        pageData.permalink = translatedPermalink;
      }

      console.log("✅ Final Translated Page Data:", JSON.stringify(pageData, null, 2));
      return pageData;
    } catch (err) {
      console.error("🚨 API Fetch Error:", err);
      throw err;
    }
  }
);

// ✅ Xử lý lỗi
if (error.value) {
  console.error('🚨 Error fetching page:', error.value);
  throw createError({ statusCode: 500, statusMessage: 'Failed to load page data' });
}

// ✅ SEO Metadata
const metadata = computed(() => ({
  title: page.value?.seo?.title ?? page.value?.title ?? undefined,
  description: page.value?.seo?.meta_description ?? undefined,
  image: globals?.og_image ? fileUrl(globals?.og_image) : undefined,
  canonical: page.value?.seo?.canonical_url ?? route.fullPath,
}));

useServerSeoMeta({
  title: () => metadata.value.title,
  description: () => metadata.value.description,
  ogTitle: () => metadata.value.title,
  ogDescription: () => metadata.value.description,
});
</script>

<template>
  <NuxtErrorBoundary>
    <PageBuilder v-if="page" :page="page as Page" />
    <template #error="{ error }">
      <BlockContainer>
        <VAlert type="error">{{ error }}</VAlert>
      </BlockContainer>
    </template>
  </NuxtErrorBoundary>
</template>