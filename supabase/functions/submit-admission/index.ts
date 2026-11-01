// Supabase Edge Function: submit-admission. Configure service-role key and DOB_HASH_SECRET.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
const cors={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
const json=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:{...cors,'Content-Type':'application/json'}});
Deno.serve(async req=>{if(req.method==='OPTIONS')return new Response('ok',{headers:cors});try{
 const {full_name,email,dob,admission_ref}=await req.json();
 if(!full_name||!email||!/^\d{4}-\d{2}-\d{2}$/.test(dob||'')||!admission_ref)return json({error:'Complete all admission fields.'},400);
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(Deno.env.get('DOB_HASH_SECRET')!),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const sig=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(dob));
 const dob_hash=Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('');
 const admin=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const {error}=await admin.from('admissions').insert({full_name,email:email.toLowerCase(),dob_hash,admission_ref});
 if(error)return json({error:'Could not submit. Check your application details with admissions.'},400);
 return json({message:'Admission request received. The admissions office will review it.'});
 }catch{return json({error:'Request could not be processed.'},400)}});
