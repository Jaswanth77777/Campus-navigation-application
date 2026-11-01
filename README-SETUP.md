# Joy University Smart Campus Portal

This branch adds a Supabase-backed portal, email OTP sign-in, QR campus scanner, admin login history, and a responsive layout while preserving the original 3D campus as `campus.html`.

## Before deployment
1. Create a Supabase project.
2. In SQL Editor, run `supabase/schema.sql`.
3. Replace `YOUR_PROJECT_ID` and `YOUR_SUPABASE_ANON_KEY` in `js/supabase.js`.
4. Upload your official college photo as `assets/joy-campus.jpg` (create the assets folder if needed).
5. Deploy the Edge Functions described in `supabase/functions/` with secrets configured.
6. Add verified student/faculty profiles from a trusted admin process. Store DOB HMAC digests, not DOB values. Set `approved=true`.
7. Add campus QR rows to `campus_locations`.
8. Enable email OTP in Supabase Auth and configure the allowed redirect URLs for your GitHub Pages site.

## Authentication flow
A student/faculty enters roll number or faculty ID (or registered email) and DOB. The server-side `request-login` function checks the approved record and DOB HMAC, then asks Supabase Auth to send an email OTP. The browser verifies the OTP; DOB is never used as a password.
New admissions submit full name, email, DOB and application reference to a server-side function. They remain pending until the admissions office verifies them.

## Important
- Do not publish a Supabase service-role key in this repository.
- Configure a strong private `DOB_HASH_SECRET` for server-side HMAC.
- Restrict Edge Function CORS to your GitHub Pages origin in production.
- Protect the first admin account using a trusted provisioning process.
- Login history is visible only to users with the admin role.
- GitHub Pages serves static files only; Supabase provides authentication and database services.

## Local preview
Open with a local static server (for example VS Code Live Server). Camera access requires HTTPS or localhost.
