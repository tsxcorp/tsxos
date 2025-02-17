import { defineComponent, h} from 'vue';
import type { PropType } from 'vue';
import type { FormField } from '~/types';  // Đảm bảo FormField được import từ đúng file kiểu
import FormGroup from '#ui/components/forms/FormGroup.vue';
import Input from '#ui/components/forms/Input.vue';
import Textarea from '#ui/components/forms/Textarea.vue';
import Checkbox from '#ui/components/forms/Checkbox.vue';
import Radio from '#ui/components/forms/Radio.vue';
import Range from '#ui/components/forms/Range.vue';
import Toggle from '#ui/components/forms/Toggle.vue'
import SelectMenu from '#ui/components/forms/SelectMenu.vue'
import Select from '#ui/components/forms/Select.vue';
import Button from '#ui/components/elements/Button.vue';
import VUpload from '~/components/base/VUpload.vue';
import VSignature from '~/components/base/VSignature.vue';
import Form from '#ui/components/forms/Form.vue';
import { FormKit } from '@formkit/vue';

const widthClassMap = {
  '33': 'md:col-span-2',
  '50': 'md:col-span-3',
  '67': 'md:col-span-4',
  '100': 'md:col-span-6',
};

// Hàm renderInput cập nhật giá trị vào state thông qua v-model
function renderInput(fields: FormField, state: any, error: string | undefined) {
  const commonProps = {
    modelValue: state[fields.id] || '', // Đảm bảo rằng giá trị modelValue được đồng bộ hóa
    'onUpdate:modelValue': (value: any) => {
      state[fields.id] = value; // Cập nhật state khi người dùng nhập
      console.log(`Field ${fields.name} updated with value:`, value); // Debugging
    },
    validation: fields.validation || undefined, // Đảm bảo có validation được xác định
    'validation-messages': fields.validation_messages || {}, // Đảm bảo có thông báo lỗi nếu có
    error, // Thêm lỗi vào các props
  };

  switch (fields.type) {
    case 'textarea':
      return h(FormKit, { ...commonProps, placeholder: fields.placeholder, type: 'textarea' });
    case 'file':
      return h(VUpload, { 
        ...commonProps, 
        placeholder: fields.placeholder,
        modelValue: Array.isArray(state[fields.id]) ? state[fields.id] : [] // Đảm bảo modelValue là mảng
      });
    case 'signature':
      return h(VSignature, { ...commonProps, placeholder: fields.placeholder });
    case 'checkbox':
      return h(FormKit, { 
        modelValue: state[fields.id] ?? false, // Dùng Boolean cho checkbox
        'onUpdate:modelValue': (value: any) => {
          state[fields.id] = value;
        },
        type: 'checkbox', 
        label: fields.name
      });
    case 'select':
      return h(FormKit, { ...commonProps, options: fields.options || [], type: 'select' });
    case 'radio':
      return h(FormKit, { ...commonProps, options: fields.options || [], type: 'radio' });
    
    case 'datepicker':
        return h(FormKit, {
          ...commonProps,
          type: 'datetime-local',
          format: 'yyyy-MM-dd',  // Cấu hình định dạng ngày tháng
          clearable: true,        // Cho phép xóa ngày đã chọn
          placeholder: fields.placeholder || 'Select a date', // Thêm placeholder nếu cần
        });
    
    default:
      return h(FormKit, { ...commonProps, placeholder: fields.placeholder, type: 'text' }); // Thử dùng FormKit cho input
  }
}

export default defineComponent({
  props: {
    fields: {
      type: Array as PropType<FormField[]>,  // Đảm bảo sử dụng PropType cho Array của FormField
      default: () => [],
    },
    modelValue: {  // Đảm bảo modelValue được truyền từ parent
      type: Object as PropType<Record<string, any>>,  // Sử dụng Record để chỉ định kiểu object
      default: () => ({}),
    },
    onSubmit: {
      type: Function,
      required: true,
    },
    error: {
      type: Object as PropType<{ [key: string]: string }>, // Đảm bảo truyền object lỗi từ parent
      default: () => ({}),
    },
  },
  setup(props, { emit }) {
    const state = props.modelValue;

    const groups = props.fields.map((field) => {
      const { name, label, placeholder, width, description } = field;
      const cssClass = widthClassMap[width] || 'md:col-span-6';

      // Lấy lỗi cho từng field từ props.error
      const fieldError = props.error[field.id];

      return h(FormGroup, {
        id: field.id,
        name: field.name,
        label: field.name,
        description: field.description,
        class: cssClass,
        size: 'lg',
      }, () => [renderInput(field, state, fieldError)]);
    });

    groups.push(
      h(
        'div',
        { class: 'md:col-span-6' },
        h(Button, {
          type: 'submit',
          size: 'lg',
          label: 'Submit',
          onClick: (event: Event) => {
            event.preventDefault();
            props.onSubmit();  // Gọi hàm onSubmit từ props
          },
        }),
      ),
    );

    // Truyền modelValue vào Form và phát sự kiện update:modelValue
    return () => h(Form, {
      modelValue: state,  // Truyền modelValue từ props
      'onUpdate:modelValue': (newValue: any) => {
        emit('update:modelValue', newValue);  // Phát sự kiện cập nhật modelValue
      }
    }, () => groups);
  },
});
