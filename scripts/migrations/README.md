# Database Migrations

This directory contains SQL migration files for updating the database schema.

## How to Apply Migrations

1. Connect to your Supabase database via the SQL Editor in the Supabase dashboard.
2. Open the migration file you want to apply (e.g., `001_add_paid_date.sql`)
3. Copy the SQL content and paste it into the SQL Editor
4. Execute the SQL statements

## Migration Files

- `001_add_paid_date.sql`: Adds the `paid_date` column to the invoices table and creates triggers to automatically set the paid date when an invoice status is changed to "paid".

## Notes

- Migrations are designed to be idempotent (can be run multiple times without causing errors)
- Always backup your database before applying migrations in production
