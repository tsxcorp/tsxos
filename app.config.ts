import { theme } from '~/theme';

export default defineAppConfig({
  theme,
  globals: {
  "id": "ab89c489-faea-4310-8b59-7ddb3caf279a",
  "url": "https://app.tsx.vn",
  "title": "TSX Corporation",
  "tagline": "Transforming Workflows, Elevating Success",
  "description": "TSX Corporation is a business transformation agency committed to helping enterprises digitize workflows, optimize processes, and enhance operational efficiency. We specialize in developing scalable and automation-driven solutions that enable businesses to streamline operations, improve productivity, and drive sustainable growth. Through cutting-edge technology and tailored digital strategies, we empower organizations to navigate the digital landscape with agility and achieve long-term success.",
  "og_image": "6bf3ce5b-8d48-4aae-a067-02d458219b0e",
  "social_links": [
  ],
  "street_address": "72 Đường Số 2, Phường Thảo Điền, Thủ Đức",
  "address_locality": "Hồ Chí Minh",
  "address_region": "HCMC",
  "postal_code": "700000",
  "address_country": "VN",
  "email": "info@tsx.vn",
  "phone": "(+84) 28 6682 7794",
  "logo_on_dark_bg": "a179013b-207b-4373-bd5e-76b1f4b00e6c",
  "logo_on_light_bg": "ade467a5-8e26-4c39-952d-ddd49dc71e3d",
  "theme": {
    "primary": "violet",
    "gray": "slate",
    "borderRadius": "lg",
    "googleFonts": {
      "Inter": true,
      "Fira Code": true,
      "Poppins": [
        400,
        500,
        600,
        700,
        800,
        900
      ],
      "Nothing You Could Do": true
    },
    "fonts": {
      "display": "Poppins",
      "sans": "Inter",
      "code": "Fira Code",
      "signature": "Nothing You Could Do",
      "families": {
        "display": "Poppins",
        "body": "Inter",
        "code": "Fira Code"
      }
    }
  }
},
  ui: {
    strategy: 'override',
    primary: theme.primary,
    gray: theme.gray,
    notifications: {
      position: 'top-0 right-0 bottom-auto left-auto',
    },
    card: {
      base: 'transition duration-200',
      shadow: 'shadow-none',
      body: { base: 'h-full flex flex-col' },
      rounded: 'rounded-card',
    },
    button: {
      font: 'font-bold',
      rounded: 'rounded-button',
      default: { loadingIcon: 'material-symbols:sync-rounded' },
    },
    badge: { rounded: 'rounded-button' },
    input: {
      default: { loadingIcon: 'material-symbols:sync-rounded' },
      rounded: `rounded-${theme.borderRadius}`,
    },
    select: {
      rounded: 'rounded-input',
      default: {
        loadingIcon: 'material-symbols:sync-rounded',
        trailingIcon: 'material-symbols:expand-more-rounded',
      },
    },
    textarea: { rounded: 'rounded-input' },
    selectMenu: {
      rounded: 'rounded-input',
      default: { selectedIcon: 'material-symbols:fitbit-check-small-rounded' },
    },
    notification: {
      default: { closeButton: { icon: 'i-octicon-x-24' } },
    },
    commandPalette: {
      default: {
        icon: 'material-symbols:search-rounded',
        loadingIcon: 'material-symbols:sync-rounded',
        selectedIcon: 'material-symbols:fitbit-check-small-rounded',
        emptyState: { icon: 'material-symbols:search-rounded' },
      },
    },
    table: {
      default: {
        sortAscIcon: 'octicon:sort-asc-24',
        sortDescIcon: 'octicon:sort-desc-24',
        loadingState: { icon: 'material-symbols:sync-rounded' },
        emptyState: { icon: 'material-symbols:database-outline' },
      },
    },
    avatar: { default: {}, rounded: 'rounded-button' },
    breadcrumb: { default: { divider: 'material-symbols:chevron-right' } },
    pagination: {
      rounded: 'first:rounded-l-button last:rounded-r-button',
      default: {
        prevButton: { icon: 'material-symbols:arrow-back-rounded' },
        nextButton: { icon: 'material-symbols:arrow-forward-rounded' },
      },
    },
  },
});
