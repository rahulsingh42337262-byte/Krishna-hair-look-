const cfg=window.KHL_CONFIG||null;
let sb=null;
if(cfg?.SUPABASE_URL && cfg?.SUPABASE_ANON_KEY && !cfg.SUPABASE_URL.includes("YOUR-"))
  sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);

async function guard(){
 if(!sb){ location.href="admin-login.html"; return false; }
 const {data}=await sb.auth.getUser();
 if(!data?.user){ location.href="admin-login.html"; return false; }
 return true;
}
async function load(){
 if(!(await guard())) return;
 let rows=[];
 const {data,error}=await sb.from("bookings").select("*").order("booking_date",{ascending:true}).order("time",{ascending:true});
 if(!error && data) rows=data.map(x=>({name:x.customer_name,service:x.service,date:x.booking_date,time:x.time,mobile:x.mobile,payment:x.payment_status,status:x.status}));
 const today=new Date().toISOString().slice(0,10);
 $("todayCount").textContent=rows.filter(x=>x.date===today).length;
 $("upcomingCount").textContent=rows.filter(x=>x.date>=today).length;
 $("bookedSlots").textContent=rows.filter(x=>x.date===today && ["pending","confirmed"].includes(x.status)).length;
 $("bookingRows").innerHTML=rows.map(x=>`<tr><td>${esc(x.name)}</td><td>${esc(x.service)}</td><td>${x.date}</td><td>${x.time}</td><td>${esc(x.mobile)}</td><td>${esc(x.payment||"pending")}</td><td class="status ${x.status}">${esc(x.status)}</td></tr>`).join("")||`<tr><td colspan="7">No bookings yet.</td></tr>`;
 $("adminNotice").textContent=error?"Bookings load nahi hui: "+error.message:"🔔 Admin login active • Live database connected.";
 $("adminNotice").className="notice "+(error?"error":"ok");
}
function esc(v){return String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function refreshBookings(){load()}
async function logout(){if(sb) await sb.auth.signOut(); location.href="admin-login.html"}
window.refreshBookings=refreshBookings; window.logout=logout;
load();
if(sb){sb.channel("booking-live").on("postgres_changes",{event:"*",schema:"public",table:"bookings"},load).subscribe();}
