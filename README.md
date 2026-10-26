# Gareeb Vastarlaya

A working, customizable storefront and admin dashboard for a saree and ethnic-wear boutique in Jhansi, Uttar Pradesh.

## Overview

This project delivers a local-first e-commerce app using Next.js App Router, a file-backed store layer for local development, and a Prisma-ready schema for future PostgreSQL integration. It includes a public storefront, product browsing, cart and checkout, admin login, inventory basics, and SEO-focused pages.

## Features

- Storefront homepage, collections, product detail pages, search, and about/contact pages
- Product catalogue with pricing, variants, and stock safeguards
- Cart and checkout flow with order records
- Admin dashboard with protected routes
- Configurable store settings
- SEO metadata and sitemap
- Prisma schema for future database migration

## Local setup

1. Copy .env.example to .env.local and fill values.
2. Install dependencies: npm install
3. Start dev server: npm run dev
4. Visit http://localhost:3000

## Admin login

Use the values from ADMIN_USERNAME and ADMIN_PASSWORD in .env.local.

## Production notes

- The app uses file-backed JSON storage for the local dev build.
- For production, replace the store layer with PostgreSQL + Prisma.
- Payment provider remains unconfigured until real credentials are supplied.

## Deployment

A low-cost first deployment is Next.js on Vercel with a managed PostgreSQL service, while keeping payment and image storage behind adapter interfaces.
