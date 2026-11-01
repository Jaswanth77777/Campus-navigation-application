# Supabase setup and account provisioning

## Edge Functions
Install Supabase CLI and link the project:
```sh
supabase login
supabase link --project-ref YOUR_PROJECT_ID
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY DOB_HASH_SECRET=YOUR_LONG_RANDOM_SECRET SUPABASE_ANON_KEY=YOUR_ANON_KEY
supabase functions deploy request-login --no-verify-jwt
supabase functions deploy submit-admission --no-verify-jwt
```
Set each function's allowed CORS origin to your exact GitHub Pages origin before production (for example, https://YOUR_GITHUB_NAME.github.io). The source currently uses a permissive CORS placeholder for initial testing.

## Provision student/faculty/admin accounts
Run `supabase/schema.sql` first. On a trusted computer, install the Supabase JS client and run `supabase/provision-profile.example.mjs` with the required environment variables. Never commit the service-role key or DOB secret. For student use PROFILE_ROLE=student and PROFILE_IDENTIFIER=roll number; faculty uses PROFILE_ROLE=faculty and PROFILE_IDENTIFIER=faculty ID; administrators use PROFILE_ROLE=admin and omit PROFILE_IDENTIFIER. The script creates/links the Auth user and stores only an HMAC digest of DOB.

Example (macOS/Linux shell):
```sh
export SUPABASE_URL="https://YOUR_PROJECT_ID.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="YOUR_SERVICE_ROLE_KEY"
export DOB_HASH_SECRET="a-long-random-secret-kept-private"
export PROFILE_EMAIL="student@example.edu"
export PROFILE_NAME="Example Student"
export PROFILE_ROLE="student"
export PROFILE_DOB="2005-01-31"
export PROFILE_IDENTIFIER="JU2025001"
node supabase/provision-profile.example.mjs
```

## QR locations
Insert QR values in Supabase, for example:
```sql
insert into public.campus_locations(name,description,block_id,qr_code)
values ('Administrative Block','Main administrative block','1','JU:admin-block');
```
Print a QR code containing exactly `JU:admin-block`. Use the numeric block IDs from the original campus BLOCKS list for block_id. The QR scanner looks up the code and opens that block in the 3D campus.

## Admissions
The public admission form creates a pending request. Verify the applicant through official college records before provisioning a student account. Do not automatically approve a request based only on the submitted form.

## Email OTP
In Supabase Dashboard > Authentication > Providers, enable Email OTP. Add the GitHub Pages URL and `https://YOUR_GITHUB_NAME.github.io/Campus-navigation-application/campus.html` to allowed redirect URLs if required by your Auth settings.
