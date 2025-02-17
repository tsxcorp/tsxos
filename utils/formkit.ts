import { unref } from 'vue';

export interface Condition {
  field: string;
  action: 'show' | 'hide';
  condition: 'is_empty' | 'is_filled' | 'contains' | 'not_contains' | 'equals' | 'not_equal';
  value: string;
}

function convertBoolean(value: string) {
  if (value === 'true' || value === 'false') {
    return value === 'true';
  } else {
    return value;
  }
}

function mapCondition(condition: Condition['condition'], target: string) {
  switch (condition) {
    case 'is_empty':
      return `!$get(${target}).value`;
    case 'is_filled':
      return `$get(${target}).value`;
    default:
      return undefined;
  }
}

export function transformFields(fields: Array<object>) {
  const items = unref(fields);
  
  return items.map((field: any) => {
    const { conditions, key, label, type, placeholder, options, width, description, validation, validation_messages } = field;
    
    const formKitValidation = validation ? validation : '';
    
    const cmpField = {
      $cmp: 'FormKit',
      props: {
        id: key,
        name: key,
        label: label,
        type: type,
        placeholder: placeholder || '',
        options: options || [],
        description: description || '',
        validation: formKitValidation,  // Truyền validation từ Directus
        'validation-messages': validation_messages || {},  // Thông báo lỗi từ Directus
      },
    };
    
    if (conditions?.length) {
      cmpField['if'] = mapCondition(conditions[0].condition, key);
    }

    switch (width) {
      case '33':
        cmpField.props.outerClass = 'md:col-span-2';
        break;
      case '50':
        cmpField.props.outerClass = 'md:col-span-3';
        break;
      case '67':
        cmpField.props.outerClass = 'md:col-span-4';
        break;
      case '100':
        cmpField.props.outerClass = 'md:col-span-6';
        break;
      default:
        cmpField.props.outerClass = 'md:col-span-6';
    }
    
    return cmpField;
  });
}

  

// import { unref } from 'vue';

// export interface Condition {
// 	field: string;
// 	action: 'show' | 'hide';
// 	condition: 'is_empty' | 'is_filled' | 'contains' | 'not_contains' | 'equals' | 'not_equal';
// 	value: string;
// }

// function convertBoolean(value: string) {
// 	if (value === 'true' || value === 'false') {
// 		return value === 'true';
// 	} else {
// 		return value;
// 	}
// }

// function mapCondition(condition: Condition['condition'], target: string) {
// 	switch (condition) {
// 		case 'is_empty':
// 			return `!$get(${target}).value)`;
// 		case 'is_filled':
// 			return `$get(${target}).value)`;
// 		default:
// 			return undefined;
// 	}
// }

// export function mapConditions(conditions: Condition[]) {
// 	// Both $el and $cmp schema nodes can leverage an if property that roughly equates to a v-if in Vue. If the expression assigned to the if property is truthy, the node is rendered, otherwise it is not:
// }

// export function transformSchema(schema: Array<object>) {
// 	// Loop through the form schema from Directus
// 	// This is required for FormKit to work
// 	const items = unref(schema);
// 	return items.map((item: any) => {
// 		const { conditions, field, name, children, ...props } = item;

// 		// console.log('conditions', conditions);
// 		// console.log('mapCondition', mapCondition(conditions[0].condition, field));

// 		const cmpSchema = {
// 			$cmp: item.$el ? item.$el : 'FormKit',

// 			children: children,
// 			// if: conditions ? mapCondition(conditions[0].condition, field) : undefined,

// 			props: {
// 				id: name,
// 				...props,
// 			},
// 		};

// 		// Switch statement to handle item widths
// 		switch (item.width) {
// 			case '33':
// 				cmpSchema.props.outerClass = 'md:col-span-2';
// 				break;
// 			case '50':
// 				cmpSchema.props.outerClass = 'md:col-span-3';
// 				break;
// 			case '67':
// 				cmpSchema.props.outerClass = 'md:col-span-4';
// 				break;
// 			case '100':
// 				cmpSchema.props.outerClass = 'md:col-span-6';
// 				break;
// 			default:
// 				cmpSchema.props.outerClass = 'md:col-span-6';
// 		}

// 		return cmpSchema;
// 	});
// }