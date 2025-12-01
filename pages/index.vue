<script setup lang="ts">
definePageMeta({
  layout: 'blank'
})

const countdown = ref(30)

onMounted(() => {
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
      window.location.href = 'https://benocode.vn'
    }
  }, 1000)
})

const redirectToBenocode = () => {
  window.location.href = 'https://benocode.vn'
}
</script>

<template>
  <div class="min-h-screen bg-white text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-purple-500/20">
    <!-- Noise Texture -->
    <div class="absolute inset-0 z-[1] opacity-[0.4] pointer-events-none mix-blend-multiply" style="background-image: url('https://grainy-gradients.vercel.app/noise.svg'); filter: contrast(120%) brightness(120%);"></div>

    <!-- Background effects -->
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
       <div class="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-blue-400/20 rounded-full blur-[120px] animate-float mix-blend-multiply"></div>
       <div class="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-purple-400/20 rounded-full blur-[120px] animate-float animation-delay-2000 mix-blend-multiply"></div>
       <div class="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-pink-400/20 rounded-full blur-[120px] animate-float animation-delay-4000 mix-blend-multiply"></div>
    </div>

    <div class="z-10 max-w-5xl w-full space-y-12 text-center relative"
         v-motion
         :initial="{ opacity: 0, y: 50, scale: 0.95 }"
         :enter="{ opacity: 1, y: 0, scale: 1, transition: { duration: 1200, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' } }">
      
      <!-- Logo / Header -->
      <div class="flex flex-col md:flex-row items-center justify-center gap-12 mb-20">
         <img src="~/assets/img/TSX.svg" alt="TSX" class="h-14 md:h-20 w-auto opacity-80 hover:opacity-100 transition-opacity duration-500" />
         <UIcon name="i-heroicons-arrow-right" class="text-3xl text-slate-300 rotate-90 md:rotate-0 animate-pulse" />
         <img src="~/assets/img/Benocode.svg" alt="Benocode" class="h-14 md:h-20 w-auto drop-shadow-[0_10px_30px_rgba(168,85,247,0.15)] hover:scale-105 transition-transform duration-500 ease-out" />
      </div>

      <div class="grid md:grid-cols-2 gap-12 text-left relative">
        <!-- Vertical Divider -->
        <div class="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-200 to-transparent -translate-x-1/2"></div>

        <!-- Vietnamese -->
        <div class="space-y-6" v-motion :initial="{ opacity: 0, x: -50 }" :enter="{ opacity: 1, x: 0, transition: { delay: 300, duration: 1000, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' } }">
           <h2 class="text-2xl font-semibold text-blue-600 flex items-center gap-3">
             <UIcon name="i-flag-vn-4x3" class="text-xl rounded-sm shadow-sm ring-1 ring-slate-200" />
             <span class="tracking-wide">Thông báo hợp nhất thương hiệu</span>
           </h2>
           <div class="prose prose-slate prose-sm md:prose-base text-slate-600 leading-relaxed font-light">
             <p>Kính gửi Quý khách hàng, đối tác và cộng đồng,</p>
             <p>TSX Corporation xin trân trọng thông báo: Từ nay, toàn bộ hoạt động công nghệ, sản phẩm và dịch vụ của TSX sẽ được hợp nhất và vận hành dưới một thương hiệu duy nhất – <strong class="text-slate-900 font-semibold">Benocode</strong>.</p>
             <p>Việc hợp nhất này nằm trong chiến lược tái cấu trúc và phát triển dài hạn, nhằm tập trung nguồn lực xây dựng hệ sinh thái giải pháp mạnh mẽ hơn. Benocode đại diện cho năng lực cốt lõi trong:</p>
             <ul class="list-none space-y-3 pl-0">
               <li class="flex items-start gap-3 group"><UIcon name="i-heroicons-check-circle" class="text-blue-500 mt-1 shrink-0 group-hover:text-blue-600 transition-colors" /> Giải pháp chuyển đổi số & tối ưu vận hành</li>
               <li class="flex items-start gap-3 group"><UIcon name="i-heroicons-check-circle" class="text-blue-500 mt-1 shrink-0 group-hover:text-blue-600 transition-colors" /> Phát triển nền tảng No-code/Low-code</li>
               <li class="flex items-start gap-3 group"><UIcon name="i-heroicons-check-circle" class="text-blue-500 mt-1 shrink-0 group-hover:text-blue-600 transition-colors" /> Tự động hóa quy trình (Automation Platform)</li>
             </ul>
             <p>Chúng tôi cam kết mọi quyền lợi của khách hàng TSX sẽ được duy trì đầy đủ dưới thương hiệu Benocode.</p>
             <p class="font-medium text-slate-900 pt-4 border-t border-slate-200 mt-6">Trân trọng,<br><span class="text-slate-500 font-normal">Đội ngũ TSX Corporation – nay là Benocode</span></p>
           </div>
        </div>

        <!-- English -->
        <div class="space-y-6" v-motion :initial="{ opacity: 0, x: 50 }" :enter="{ opacity: 1, x: 0, transition: { delay: 500, duration: 1000, ease: 'cubic-bezier(0.22, 1, 0.36, 1)' } }">
           <h2 class="text-2xl font-semibold text-purple-600 flex items-center gap-3">
             <UIcon name="i-flag-us-4x3" class="text-xl rounded-sm shadow-sm ring-1 ring-slate-200" />
             <span class="tracking-wide">Brand Consolidation Announcement</span>
           </h2>
           <div class="prose prose-slate prose-sm md:prose-base text-slate-600 leading-relaxed font-light">
             <p>Dear valued customers, partners, and community,</p>
             <p>TSX Corporation is pleased to announce that all technology operations, products, and services will now be unified under a single brand – <strong class="text-slate-900 font-semibold">Benocode</strong>.</p>
             <p>This consolidation is part of our long-term strategy to build a more powerful ecosystem. Benocode represents our core capabilities across:</p>
             <ul class="list-none space-y-3 pl-0">
               <li class="flex items-start gap-3 group"><UIcon name="i-heroicons-check-circle" class="text-purple-500 mt-1 shrink-0 group-hover:text-purple-600 transition-colors" /> Digital transformation & optimization</li>
               <li class="flex items-start gap-3 group"><UIcon name="i-heroicons-check-circle" class="text-purple-500 mt-1 shrink-0 group-hover:text-purple-600 transition-colors" /> No-code/Low-code development</li>
               <li class="flex items-start gap-3 group"><UIcon name="i-heroicons-check-circle" class="text-purple-500 mt-1 shrink-0 group-hover:text-purple-600 transition-colors" /> Workflow automation & integration</li>
             </ul>
             <p>We assure you that all benefits and commitments provided under TSX will continue seamlessly under the Benocode brand.</p>
             <p class="font-medium text-slate-900 pt-4 border-t border-slate-200 mt-6">Warm regards,<br><span class="text-slate-500 font-normal">TSX Corporation – now Benocode</span></p>
           </div>
        </div>
      </div>

      <!-- Action -->
      <div class="flex flex-col items-center gap-8 pt-16" v-motion :initial="{ opacity: 0, y: 30 }" :enter="{ opacity: 1, y: 0, transition: { delay: 1000, duration: 800 } }">
         <button @click="redirectToBenocode" class="group relative px-12 py-4 bg-slate-900 text-white font-medium rounded-full overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[0_10px_40px_rgba(15,23,42,0.2)]">
            <span class="relative z-10 flex items-center gap-3 text-lg tracking-wide">
              Truy cập / Visit Benocode.vn
              <UIcon name="i-heroicons-arrow-right" class="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </span>
         </button>
         
         <div class="flex flex-col items-center gap-3">
            <div class="w-48 h-[2px] bg-slate-200 rounded-full overflow-hidden">
                <div class="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(168,85,247,0.3)]" :style="{ width: `${(countdown / 10) * 100}%` }"></div>
            </div>
            <p class="text-slate-400 text-xs font-mono tracking-widest uppercase">
              Redirecting in <span class="text-slate-900 font-bold">{{ countdown }}</span>s
            </p>
         </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-float {
  animation: float 20s infinite ease-in-out;
}
.animation-delay-2000 {
  animation-delay: -2s;
}
.animation-delay-4000 {
  animation-delay: -4s;
}
@keyframes float {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
</style>
