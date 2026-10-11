# Staffora — Public Website (`client`)

Premium React.js marketing website for an international recruitment and staffing agency.

## Stack

- React 19
- Vite
- React Router DOM
- Tailwind CSS v4 (`@tailwindcss/vite`)
- Framer Motion
- Lucide React
- React Hook Form

## Scripts

```bash
npm install
npm run dev      # local development
npm run build    # production build
npm run preview  # preview production build
npm run lint     # oxlint
```

## Key folders

- `src/pages` — route-level pages
- `src/components` — layout, sections, cards, forms, UI
- `src/data` — services, industries, jobs, FAQs, images
- `src/config/site.js` — brand + contact configuration
- `src/styles/index.css` — design tokens and base styles
- `public/` — favicon, robots.txt, optional local images

## Configuration

Update brand name, contact details, and CTAs in:

`src/config/site.js`

Phone and postal address are intentionally blank until genuine details are supplied.

## Forms

All forms are frontend-only in this phase:

- Validation, loading states, and local success feedback are implemented
- No remote submission or storage is performed
- CV upload validates type/size only; storage requires backend integration

## Images

Photographic assets use verified Unsplash URLs defined in `src/data/images.js`, with lazy loading, responsive `srcset` where applicable, and graceful fallbacks.
