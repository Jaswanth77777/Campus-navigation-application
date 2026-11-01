// Supabase Edge Function: request-login. Deploy with SUPABASE_URL, SUPABASE_ANON_KEY,
// SUPABASE_SERVICE_ROLE_KEY, and DOB_HASH_SECRET configured as function secrets.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});try{
 const {role,identifier,dob}=await req.json();if(!['student','faculty'].includes(role)||!identifier||!/^\d{4}-\d{2}-\d{2}$/.test(dob||''))return json({error:'Invalid details'},400);
 const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const field=role==='student'?'roll_no':'faculty_id';
 let q=admin.from('profiles').select('id,email,dob_hash,approved,role').eq('role',role);
 q=identifier.includes('@')?q.eq('email',identifier.toLowerCase()):q.eq(field,identifier);
 const {data:p,error}=await q.maybeSingle();if(error||!p||!p.approved)return json({error:'Details could not be verified. Contact the college office.'},401);
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(Deno.env.get('DOB_HASH_SECRET')!),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(dob));
 const digest=Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
 if(digest!==p.dob_hash)return json({error:'Details could not be verified. Contact the college office.'},401);
 const auth=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_ANON_KEY')!);
 const {error:otpError}=await auth.auth.signInWithOtp({email:p.email,options:{shouldCreateUser:false}});
 if(otpError)return json({error:'Could not send verification code.'},400);
 const [name,domain]=p.email.split('@');return json({email:p.email,masked_email:name.slice(0,2)+'***@'+domain});
 }catch{return json({error:'Request could not be processed.'},400)}});
