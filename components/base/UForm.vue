<script setup lang="ts">
import { reactive, watch, ref } from 'vue';
import { defineProps, defineEmits } from 'vue';
import type { FormField } from '~/types';
import type { FormError } from '/Users/travisvo/Projects/directustsx/types/content/form.ts';

const props = defineProps<{
  form: any;
  fields: FormField[];
}>();

const emit = defineEmits(['submit', 'update:modelValue']);

// Khởi tạo state từ fields với các trường trống, sử dụng field.id thay vì field.name
const state = reactive<{ [key: string]: any }>({});
const fields = props.fields || [];
fields.forEach((field) => {
  state[field.id] = '';  // Khởi tạo giá trị trống cho mỗi trường
  console.log(`Initialized field ${field.id} with value:`, state[field.id]);
});
const loading = ref(false);
const error: any = ref(null);
const success = ref(false);

const hasInteracted = ref(false);

// Chỉ set `hasInteracted` là true sau khi người dùng bắt đầu nhập liệu
const trackUserInteraction = () => {
  hasInteracted.value = true;
};

// Hàm applyValidation (Được thêm vào trực tiếp trong UForm.vue)
const applyValidation = (validationRules: string, value: any) => {
  let errorMessage = '';

  for (const rule of validationRules.split('|')) { // Tách các quy tắc bằng dấu |
    switch (rule) {
      case 'email':
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (value && !emailPattern.test(value)) {
          errorMessage = 'Invalid email format';
        }
        break;
      // Các quy tắc khác (minLength, maxLength, v.v.)
      default:
        break;
    }
  }

  return { isValid: errorMessage === '', message: errorMessage };
};



// Hàm validate cho form
const validate = (state: any): FormError[] => {
  const errors: FormError[] = [];

  fields.forEach((field) => {
    const fieldValue = state[field.id];  // Lấy giá trị từ field.id
    const fieldName = field.label || field.name || 'Field';

    // Kiểm tra lỗi `required`
    if (field.validation?.includes('required') && (!fieldValue || fieldValue.trim() === '')) {
      errors.push({ path: field.id, message: `${fieldName} is required` });
    }

    // Kiểm tra các validation động khác (email, minLength, v.v.)
    if (field.validation) {
      const validationResult = applyValidation(field.validation, fieldValue);
      if (!validationResult.isValid) {
        errors.push({ path: field.id, message: validationResult.message });
      }
    }
  });

  return errors;
};

// Hàm submitForm kiểm tra validation trước khi submit dữ liệu
async function submitForm() {
  loading.value = true;

  // Kiểm tra validation trước khi gửi dữ liệu
  const errors = validate(state);
  if (errors.length > 0) {
    error.value = errors;  // Nếu có lỗi, gán lỗi cho `error`
    loading.value = false;
    return; // Dừng lại nếu có lỗi
  }

  try {
    // Nếu không có lỗi, tiếp tục gửi dữ liệu
    await useDirectus(
      createItem('inbox', {
        data: state,
        form: props.form.id,
      }),
    );
    success.value = true;

    // Nếu cần redirect, thực hiện điều đó
    if (props.form.on_success === 'redirect') {
      return navigateTo(props.form.redirect_url);
    }
  } catch (err: any) {
    error.value = err; // Cập nhật lỗi vào `error`
  } finally {
    loading.value = false;
  }
}

// Lưu trạng thái tương tác của người dùng
const isSubmitted = ref(false);

watch(state, (newState) => {
  // Nếu người dùng chưa submit, không cần kiểm tra lỗi.
  if (isSubmitted.value) {
    console.log("State updated in UForm:", newState); // Debugging log
    const errors = validate(newState);
    error.value = errors;
  }
});

// Hàm để đánh dấu khi người dùng submit form
const onSubmit = () => {
  isSubmitted.value = true;
  submitForm(); // Thực hiện gửi form
};
</script>

<template>
  <div v-auto-animate>
    <div class="mb-4">
      <!-- Hiển thị thông báo lỗi chỉ khi có lỗi và đã submit -->
      <VAlert v-if="error && isSubmitted && error.length > 0" type="error">
        <ul>
          <li v-for="(err, index) in error" :key="index">{{ err.message }}</li>
        </ul>
      </VAlert>
      <VAlert v-if="form.on_success === 'message' && success" type="success">
        <div v-if="form.success_message" v-dompurify-html="form.success_message"></div>
        <p v-else>Success! Your form has been submitted.</p>
      </VAlert>
    </div>

    <!-- Form rendering -->
    <FormCustom
      v-if="!success"
      :fields="fields"
      :on-submit="onSubmit"
      v-model="state"
      class="grid gap-6 md:grid-cols-6"
    />
  </div>
</template>

















<!-- // // Validate dữ liệu form
// const validate = (state: any): FormError[] => {
// 	const errors = [];
// 	props.fields.forEach(field => {
// 		if (field.required && !state[field.key]) {
// 			errors.push({ path: field.key, message: `${field.label} is required` });
// 		}
// 	});
// 	return errors;
// }; -->

<!-- <script setup lang="ts">
 
import type { Form } from '~/types';
import type { FormError } from '@nuxt/ui/dist/runtime/types';

const props = defineProps<{
	form: Form;
}>();

const emit = defineEmits(['submit', 'update:modelValue']);

// Get query params to allow prefilling of form fields
const { query } = useRoute();
const formData = reactive({ ...query });
const loading = ref(false);
const error: any = ref(null);
const success = ref(false);

const validate = (state: any): FormError[] => {
	const errors = [];
	if (!state.email) errors.push({ path: 'email', message: 'Required' });

	return errors;
};

async function submitForm() {
	loading.value = true;

	try {
		await useDirectus(
			createItem('inbox', {
				data: formData,
				form: props.form.id,
			}),
		);

		success.value = true;

		if (props.form.on_success === 'redirect') {
			return navigateTo(props.form.redirect_url);
		}
	} catch (err: any) {
		error.value = err;
	} finally {
		loading.value = false;
	}
}

watch(
	formData,
	() => {
		emit('update:modelValue', formData);
	},
	{ deep: true },
);
</script>
<template>
	<div v-auto-animate>
		<div class="mb-4">
			<VAlert v-if="error" type="error">Oops! {{ error }}</VAlert>
			<VAlert v-if="form.on_success === 'message' && success" type="success">
				<div v-if="form.success_message" v-dompurify-html="form.success_message"></div>
				<p v-else>Success! Your form has been submitted.</p>
			</VAlert>
		</div>
		<div>
			<FormCustom
				v-if="!success"
				:schema="props.form.schema"
				:state="formData"
				:validate="validate"
				class="grid gap-6 md:grid-cols-6"
				:on-submit="submitForm"
			/>
		</div>
	</div>
	
</template> -->