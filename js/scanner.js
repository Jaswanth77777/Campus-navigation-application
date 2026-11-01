import { supabase } from './supabase.js';
const result=document.getElementById('scanResult'),open=document.getElementById('openCampus');
let destination=null;
const scanner=new Html5Qrcode('reader');
const {data:{session}}=await supabase.auth.getSession();
if(!session){location.replace('index.html');throw new Error('Authentication required');}
const {data:profile}=await supabase.from('profiles').select('approved').eq('id',session.user.id).maybeSingle();
if(!profile?.approved){await supabase.auth.signOut();location.replace('index.html');throw new Error('Approved campus account required');}
async function onScan(text){try{const code=text.trim().replace(/^JU:/i,'');const {data,error}=await supabase.from('campus_locations').select('name,description,block_id').eq('qr_code',code).single();if(error)throw error;destination=data;result.textContent='Found: '+data.name+(data.description?' — '+data.description:'');open.hidden=false;await scanner.stop();}catch(e){result.textContent='This QR code is not registered for Joy University.';}}
Html5Qrcode.getCameras().then(cameras=>{if(!cameras.length)throw new Error('No camera found.');return scanner.start({facingMode:'environment'},{fps:10,qrbox:{width:240,height:240}},onScan,()=>{});}).catch(e=>result.textContent=e.message+' Check camera permission and use HTTPS.');
open.addEventListener('click',()=>{if(destination)location.href='campus.html?place='+encodeURIComponent(destination.block_id||destination.name)});
