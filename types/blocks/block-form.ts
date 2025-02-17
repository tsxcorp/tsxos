import type { Form } from '../content';
import type { FormField } from '../content';

export interface BlockForm {
	form?: (string | Form) | null;
	formfields?: (string | FormField);
 	headline?: string | null;
	id?: string;
	title?: string | null;
}
