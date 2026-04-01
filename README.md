# NAO Medical Trainual Dashboard

This project is a Next.js + Supabase dashboard for showing Trainual completion by employee and by manager using only uploaded source files.

## What is included

- NAO Medical branded dashboard UI
- Supabase-backed data model
- Login page with Supabase Auth magic link flow
- Interactive dashboard filters and charts
- Manager detail page
- Admin import workbench for the two CSV exports you shared
- SQL schema with RLS

## Source files supported

### Trainual completion export
Expected from files like:
- `Users-Report-2026-04-01-16-01-33.csv`

Mapped fields currently used:
- `Name`
- `Email`
- `Job title`
- `Completion score`
- `Reports to`
- `Last active`
- optional: `User ID`
- optional: `Completed modules`
- optional: `Total modules`
- optional: `Remaining modules`

### Employee and manager mapping export
Expected from files like:
- `EmployeeInformation-ActiveEmployeesperManager_1775059397419.csv`

This file has metadata rows and grouped manager sections. The parser is customized to:
- skip report metadata
- detect manager section rows
- assign each employee to the current manager block
- preserve employee status, role, type, and available ID

## Status rules

- `100%` = `Complete`
- `80% to 99%` = `Nearly Complete`
- `<80%` = `Needs Attention`

## Local setup

1. Install Node.js 20+.
2. Copy `.env.local.example` to `.env.local`.
3. Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
4. Install dependencies with `npm install`.
5. Run the app with `npm run dev`.

## Supabase setup

1. Create a new Supabase project.
2. Open the SQL editor.
3. Run [schema.sql](/C:/Users/Margen/OneDrive/Documents/DES%20Tasks/nao-trainual-dashboard/supabase/schema.sql).
4. Enable email auth in Supabase Auth.
5. Create at least one admin profile row in `public.profiles` for your user ID.

Example:

```sql
insert into public.profiles (id, role)
values ('YOUR_AUTH_USER_UUID', 'admin')
on conflict (id) do update set role = excluded.role;
```

## GitHub push

```bash
git init
git add .
git commit -m "Initial NAO Medical Trainual dashboard"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Vercel deployment

1. Import the GitHub repo into Vercel.
2. Add the same environment variables from `.env.local`.
3. Deploy.
4. Add your Vercel URL to the Supabase Auth redirect settings.

## Dashboard behavior

- Dashboard is empty until files are imported.
- Filters update KPI cards, charts, and the employee table together.
- Clicking a manager bar filters the rest of the dashboard.
- Filtered employee rows can be exported to CSV.

## Import workflow

1. Log in as an admin user.
2. Go to `/admin/imports`.
3. Upload the Trainual completion CSV.
4. Upload the manager mapping CSV.
5. Click `Preview import`.
6. Review the parsed output.
7. Click `Commit import`.

## Matching assumptions

- Prefer employee external ID when available.
- Fall back to employee email.
- Fall back to normalized employee name.
- Manager assignments prefer the HR mapping file over the Trainual `Reports to` field when both exist.

## Notes

- App pages already redirect unauthenticated users to login and restrict the imports page to admins.
- Because Node.js is not installed in the current workspace, this code was scaffolded but not locally executed here.
