(function(){
 var status=document.getElementById('status'),complete=false;
 function report(message){if(status){status.textContent=message;status.classList.add('error')}}
 if(location.protocol==='file:'){report('ต้องเปิดผ่านเว็บเซิร์ฟเวอร์: รัน python -m http.server 8080 --directory dist แล้วเข้า http://localhost:8080');return}
 var timer=setTimeout(function(){if(!complete)report('แอปยังโหลดไม่ครบ กรุณารีเฟรชหน้าเว็บ และตรวจว่าไฟล์ dist ถูกแตกครบ')},12000);
 window.addEventListener('error',function(event){if(event.message)report('เกิดข้อผิดพลาด: '+event.message)});
 window.addEventListener('unhandledrejection',function(event){report('ทำงานไม่สำเร็จ: '+(event.reason&&event.reason.message?event.reason.message:String(event.reason)))});
 var script=document.createElement('script');script.src='app.bundle.js?v=20261030-genres';
 script.onload=function(){complete=true;clearTimeout(timer)};
 script.onerror=function(){complete=true;clearTimeout(timer);report('โหลดโค้ดแอปไม่สำเร็จ กรุณาตรวจว่าไฟล์ app.bundle.js อยู่ในโฟลเดอร์ dist และรีเฟรชหน้าเว็บ')};
 document.body.appendChild(script);
})();
