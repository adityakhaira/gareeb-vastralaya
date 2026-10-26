# Architecture overview

This project uses a modular storefront and admin structure. Public pages read product data from the store layer, while admin actions update the same store file in a controlled way. The Prisma schema is included to guide future migration to PostgreSQL without rewriting the storefront.
