const TIMES=["9:00 AM","9:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM","12:00 PM","12:30 PM","1:00 PM","1:30 PM","2:00 PM","2:30 PM","3:00 PM","3:30 PM","4:00 PM","4:30 PM","5:00 PM","5:30 PM","6:00 PM","6:30 PM","7:00 PM","7:30 PM","8:00 PM"];
let selectedTime="";
const $=id=>document.getElementById(id);
const cfg=window.KHL_CONFIG||null;
let sb=null;
if(cfg?.SUPABASE_URL && cfg?.SUPABASE_ANON_KEY && !cfg.SUPABASE_URL.includes("YOUR-")) sb=supabase.createClient(cfg.SUPABASE_URL,cfg.SUPABASE_ANON_KEY);

const today=new Date(); $("date").min=today.toISOString().slice(0,10); $("date").value=$("date").min;
$("date").addEventListener("change",renderSlots); $("service").addEventListener("change",()=>{renderSlots();updateSummary()});
document.querySelectorAll(".service-card").forEach(c=>c.onclick=()=>{$("service").value=c.dataset.service;document.querySelector("#booking").scrollIntoView({behavior:"smooth"});renderSlots();updateSummary()});
renderSlots();

async function getBooked(date){
  if(sb){
    const {data,error}=await sb.from("bookings").select("time,status").eq("booking_date",date).in("status",["pending","confirmed"]);
    if(!error) return data.map(x=>x.time);
  }
  const local=JSON.parse(localStorage.getItem("khl_bookings")||"[]");
  return local.filter(x=>x.date===date && ["pending","confirmed"].includes(x.status)).map(x=>x.time);
}
async function renderSlots(){
  const box=$("slots"), date=$("date").value; box.innerHTML="";
  const booked=await getBooked(date);
  TIMES.forEach(t=>{const b=booked.includes(t);const el=document.createElement("button");el.type="button";el.className="slot"+(b?" booked":"");el.textContent=(b?"🔴 ":"🟢 ")+t;if(!b)el.onclick=()=>{selectedTime=t;$("time").value=t;document.querySelectorAll(".slot").forEach(x=>x.classList.remove("selected"));el.classList.add("selected");updateSummary()};box.appendChild(el)});
}
function updateSummary(){$("summaryText").textContent=$("service").value&&selectedTime?`${$("service").value} • ${selectedTime} • ${$("date").value}`:"—"}
function notice(msg,type=""){const n=$("notice");n.textContent=msg;n.className="notice "+type}
$("bookingForm").onsubmit=async e=>{
 e.preventDefault(); if(!$("time").value){notice("पहले available time select करें.","error");return}
 const booking={name:$("name").value.trim(),mobile:$("mobile").value.trim(),service:$("service").value,date:$("date").value,time:$("time").value,payment_status:"pending",status:"confirmed"};
 if(!/^[0-9]{10}$/.test(booking.mobile)){notice("10 digit mobile number डालें.","error");return}
 try{
   if(sb){
     const {data,error}=await sb.from("bookings").insert({customer_name:booking.name,mobile:booking.mobile,service:booking.service,booking_date:booking.date,time:booking.time,payment_status:"pending",status:"confirmed"}).select().single();
     if(error){
       if(error.code==="23505"){notice("यह time अभी-अभी किसी और ने book कर लिया है. दूसरा time चुनें.","error");await renderSlots();return}
       throw error;
     }
     booking.id=data.id;
   }else{
     const all=JSON.parse(localStorage.getItem("khl_bookings")||"[]");
     if(all.some(x=>x.date===booking.date&&x.time===booking.time&&["pending","confirmed"].includes(x.status))){notice("यह time अभी book हो गया है. दूसरा time चुनें.","error");await renderSlots();return}
     booking.id=crypto.randomUUID(); all.push(booking);localStorage.setItem("khl_bookings",JSON.stringify(all));
   }
   $("successText").textContent=`${booking.name}, आपकी ${booking.service} booking ${booking.date} को ${booking.time} के लिए confirm हो गई है.`;
   $("successModal").classList.remove("hidden"); selectedTime=""; $("time").value=""; $("bookingForm").reset(); $("date").value=today.toISOString().slice(0,10); await renderSlots();
 }catch(err){console.error(err);notice("Booking save नहीं हो पाई. Backend configuration check करें.","error")}
}
function closeModal(){$("successModal").classList.add("hidden")}
window.closeModal=closeModal;
