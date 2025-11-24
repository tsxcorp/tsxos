export default defineNuxtRouteMiddleware(async (to) => {
	const { locale } = useI18n();
	const currentLocale = locale.value === 'vi' ? 'vi-VN' : 'en-US';
	const slug = to.params.slug as string;
  
	if (!slug) return; // Không xử lý nếu không có slug
  
	console.log(`🔎 Checking slug for locale: ${currentLocale}, slug: ${slug}, path: ${to.path}`);
  
	// Truy vấn posts_translations để lấy postId từ slug hiện tại
	const translationResponse = await useDirectus(
	  readItems('posts_translations', {
		filter: {
		  slug: { _eq: slug },
		},
		fields: ['id', 'languages_code', 'posts_id'],
		limit: 1,
	  })
	);
  
	if (!translationResponse || translationResponse.length === 0) {
	  console.log(`⚠️ No translation found for slug: ${slug}`);
	  return; // Không tìm thấy bài viết, bỏ qua
	}
  
	const postId = translationResponse[0].posts_id.id;
  
	// Truy vấn slug đúng cho ngôn ngữ hiện tại
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
	  if (correctSlug !== slug) {
		console.log(`🔄 Redirecting to correct slug: ${correctSlug}`);
		const newPath = `/${locale.value === 'vi' ? 'vi/bai-viet' : 'posts'}/${correctSlug}`;
		return navigateTo(newPath, { replace: true });
	  }
	}
  
	console.log(`✅ Slug is correct: ${slug}`);
  });