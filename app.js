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
    const {data,error}=await sb.rpc("get_booked_times",{p_date:date});
    if(!error) return (data||[]).map(x=>x.time);
  }
  const local=JSON.parse(localStorage.getItem("khl_bookings")||"[]");
  return local.filter(x=>x.date===date && ["pending","confirmed"].includes(x.status)).map(x=>x.time);
}
async function renderSlots(){
  const box=$("slots"), date=$("date").value; box.innerHTML="";
  const booked=await getBooked(date);
  TIMES.forEach(t=>{const b=booked.includes(t);const el=document.createElement("button");el.type="button";el.className="slot"+(b?" booked":"");el.textContent=(b?"🔴 ":"🟢 ")+t;if(!b)el.onclick=()=>{selectedTime=t;$("time").value=t;document.querySelectorAll(".slot").forEach(x=>x.classList.remove("selected"));el.classList.add("selected");updateSummary()};box.appendChild(el)});
}


const UPI_ID="gsain16@ibl";
$("upiPayBtn")?.addEventListener("click",()=>{
  const service=$("service").value;
  const amount=service==="Shaving" ? 50 : service==="Haircut" ? 70 : service==="Hair Colour" ? 100 : 0;
  if(!amount){ notice("पहले service select करें.","error"); return; }
  const upiUrl=`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent("Krishna Hair Look")}&am=${amount}&cu=INR&tn=${encodeURIComponent("Krishna Hair Look Booking")}`;
  window.location.href=upiUrl;
});
$("paymentDone")?.addEventListener("change",()=>{
  $("paymentNotice").textContent=$("paymentDone").checked
    ? "✅ Payment done selected. अब Final Confirm Booking दबाएँ."
    : "Payment confirmation बाकी है.";
});

function updateSummary(){$("summaryText").textContent=$("service").value&&selectedTime?`${$("service").value} • ${selectedTime} • ${$("date").value}`:"—"}
function notice(msg,type=""){const n=$("notice");n.textContent=msg;n.className="notice "+type}
$("bookingForm").onsubmit=async e=>{
 e.preventDefault();
 if(!$("time").value){notice("पहले available time select करें.","error");return}
 if(!$("paymentDone")?.checked){notice("पहले online payment/UPI करें और “मैंने payment कर दिया है” select करें.","error");return}
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
   $("successText").textContent=`${booking.name}, आपकी booking confirm हो गई है. नीचे आपकी booking slip है.`;
   $("slipName").textContent=booking.name;
   $("slipService").textContent=booking.service;
   $("slipDate").textContent=booking.date;
   $("slipTime").textContent=booking.time;
   $("slipPayment").textContent="Payment marked as done";
   $("successModal").classList.remove("hidden");
   try{
     if("Notification" in window && Notification.permission==="granted"){
       const reg=await navigator.serviceWorker?.ready;
       const body=`New booking: ${booking.name} • ${booking.service} • ${booking.date} • ${booking.time}`;
       if(reg) reg.showNotification("🔔 New Krishna Hair Look Booking",{body,icon:"./assets/logo.jpg",tag:"new-booking"});
       else new Notification("🔔 New Krishna Hair Look Booking",{body});
     }
   }catch(_){}
   selectedTime=""; $("time").value=""; $("bookingForm").reset(); $("date").value=today.toISOString().slice(0,10); await renderSlots();
 }catch(err){console.error(err);notice("Booking save नहीं हो पाई. Backend configuration check करें.","error")}
}
function closeModal(){$("successModal").classList.add("hidden")}
function printBookingSlip(){
  const slip=document.getElementById("bookingSlip");
  const w=window.open("","_blank","width=600,height=700");
  w.document.write(`<!doctype html><html><head><title>Krishna Hair Look - Booking Slip</title>
  <style>
  body{font-family:Arial,sans-serif;padding:30px;color:#222}
  .slip{max-width:480px;margin:auto;border:2px solid #222;border-radius:12px;padding:24px}
  h1{text-align:center;margin-top:0}.line{border-top:1px dashed #999;margin:18px 0}
  p{font-size:16px;margin:12px 0}.footer{text-align:center;margin-top:22px;font-size:13px}
  </style></head><body><div class="slip">
  <h1>✂️ Krishna Hair Look</h1><h2 style="text-align:center">Booking Slip</h2>
  <div class="line"></div>
  <p><b>Customer:</b> ${document.getElementById("slipName").textContent}</p>
  <p><b>Service:</b> ${document.getElementById("slipService").textContent}</p>
  <p><b>Date:</b> ${document.getElementById("slipDate").textContent}</p>
  <p><b>Time:</b> ${document.getElementById("slipTime").textContent}</p>
  <p><b>Payment:</b> ${document.getElementById("slipPayment").textContent}</p>
  <div class="line"></div><div class="footer">Thank you for booking with Krishna Hair Look</div>
  </div></body></html>`);
  w.document.close(); w.focus(); w.print();
}

// Simple trial owner notification (same device/browser).
const OWNER_NAMES = "Govind Sen & Suresh Kotiya";
async function enableOwnerNotifications(){
  if(!("Notification" in window)){ notice("इस device/browser में notifications supported नहीं हैं.","error"); return; }
  const p = await Notification.requestPermission();
  if(p === "granted"){
    notice("✅ Trial notifications ON हैं. इस device पर नई booking का alert आएगा.","");
    if(navigator.serviceWorker?.ready){
      const reg=await navigator.serviceWorker.ready;
      reg.showNotification("Krishna Hair Look", {body:"Owner notifications are enabled.", icon:"./assets/logo.jpg"});
    }
  }else{
    notice("Notification permission allow करें.","error");
  }
}
$("enableNotifications")?.addEventListener("click",enableOwnerNotifications);

window.closeModal=closeModal; window.printBookingSlip=printBookingSlip;
