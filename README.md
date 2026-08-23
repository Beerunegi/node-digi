# Digi Web Tech Next.js Migration

This project now runs as a Next.js App Router application while preserving the existing marketing-site UI from the legacy EJS templates.

## What was added

- Next.js SSR/ISR for the current marketing pages
- Legacy EJS page-body rendering inside Next to preserve design and layout
- Blog listing, post pages, category pages, tag pages, and search
- SEO metadata, JSON-LD schema, `sitemap.xml`, and `robots.txt`
- Admin CMS with login, create/edit/delete/publish, slug control, and image upload
- MySQL-compatible SQL integration for blog content
- Contact and audit form handling moved to Next route handlers

## Environment variables

Copy `.env.example` to `.env` and configure:

- `NEXT_PUBLIC_SITE_URL`
- `LEAD_FORM_SECRET`
- `CMS_JWT_SECRET`
- `CMS_ADMIN_USERNAME`
- `CMS_ADMIN_PASSWORD_HASH`
- `DATABASE_URL` or the individual `MYSQL_*` variables
- SMTP settings for enquiry emails
- `GOOGLE_SHEETS_WEBHOOK_URL` if lead sync is needed
- Cloudinary keys for CMS image upload

## Admin password hash

Generate a bcrypt hash:

```bash
node scripts/createAdmin.js your-password-here
```

## Development

```bash
npm install
npm run dev
```

## Production

Recommended deployment target: Vercel.

- Add the environment variables in Vercel
- Point the app to your MySQL-compatible SQL database
- Use Cloudinary for uploaded CMS media
- Set `NEXT_PUBLIC_SITE_URL` to the production domain

## Notes

- Existing public styles remain in `public/css/style.css`
- New blog/CMS styles live in `public/css/next-blog.css`
- Legacy marketing page content still comes from `views/*.ejs`
