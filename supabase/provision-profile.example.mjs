// Run locally only: npm install @supabase/supabase-js
// Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DOB_HASH_SECRET,
// PROFILE_EMAIL, PROFILE_NAME, PROFILE_ROLE, PROFILE_DOB and PROFILE_IDENTIFIER.
// PROFILE_ROLE: student | faculty | admin. PROFILE_IDENTIFIER is roll number / faculty ID.
import { createClient } from '@supabase/supabase-js';
import { createHmac } from 'node:crypto';
const required=['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','DOB_HASH_SECRET','PROFILE_EMAIL','PROFILE_NAME','PROFILE_ROLE','PROFILE_DOB'];
for(const key of required) if(!process.env[key]) throw new Error('Missing '+key);
const role=process.env.PROFILE_ROLE;
if(!['student','faculty','admin'].includes(role)) throw new Error('Invalid PROFILE_ROLE');
const supabase=createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY,{auth:{autoRefreshToken:false,persistSession:false}});
const email=process.env.PROFILE_EMAIL.toLowerCase();
let {data:{users},error:listError}=await supabase.auth.admin.listUsers({page:1,perPage:1000});
if(listError) throw listError;
let user=users.find(u=>u.email?.toLowerCase()===email);
if(!user){const created=await supabase.auth.admin.createUser({email,email_confirm:true});if(created.error)throw created.error;user=created.data.user;}
const dob_hash=createHmac('sha256',process.env.DOB_HASH_SECRET).update(process.env.PROFILE_DOB).digest('hex');
const profile={id:user.id,email,full_name:process.env.PROFILE_NAME,role,dob_hash,approved:true};
if(role==='student')profile.roll_no=process.env.PROFILE_IDENTIFIER;
if(role==='faculty')profile.faculty_id=process.env.PROFILE_IDENTIFIER;
const {error}=await supabase.from('profiles').upsert(profile,{onConflict:'id'});
if(error)throw error;
console.log('Provisioned',role,email,'auth user',user.id);
