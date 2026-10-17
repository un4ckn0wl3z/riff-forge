# เริ่มใช้งาน Riff Forge

ซอร์สเวอร์ชันกลอง + เบส พร้อมเสียง SoundFont, ส่งออก MIDI และ WAV

## รันเว็บบนเครื่อง

1. แตก ZIP แล้วเปิด Terminal ในโฟลเดอร์ riff-forge
2. รันคำสั่ง (ต้องมี Python 3):

   python -m http.server 8080 --directory dist

3. เปิด http://localhost:8080

ถ้าเครื่องใช้คำสั่ง python3 ให้เปลี่ยน python เป็น python3
ไม่ต้อง npm install และไม่ต้องใช้ API key
ต้องเปิดผ่าน HTTP server เพราะมี JavaScript modules และ Web Worker

## โค้ดหลัก

- dist/app.js: หน้าจอและการทำงานของแอป
- dist/engine.js: อ่านข้อมูลริฟฟ์ สร้างกลอง ส่งออก MIDI
- dist/bass.js: สร้างไลน์เบส
- dist/audio.js: เล่นเสียง
- dist/render-wav.js, dist/wav-worker.js: สร้าง WAV
- dist/samples/: ชุดเสียงกลองและเบส พร้อมข้อมูลสิทธิ์ใช้งาน
- tests/: การทดสอบ (ใช้ Node.js, รัน npm test)

เป็น rule-based generator ไม่ใช่ AI model
ยังไม่คลี่ repeat/alternate ending และยังไม่มีชุดเสียง Metal แยกเฉพาะ
อ่านรายละเอียดและข้อจำกัดเพิ่มเติมใน README.md

## รุ่นแก้ปุ่ม Demo และอัปโหลด

แตก ZIP รุ่นนี้เป็นโฟลเดอร์ใหม่ แล้วรันเซิร์ฟเวอร์ในโฟลเดอร์ riff-forge นั้น

python -m http.server 8080 --directory dist

เปิด http://localhost:8080 แล้วรีเฟรชหน้าเว็บ
มี app.bundle.js ที่พร้อมใช้ ไม่ต้อง npm install
หากมีข้อผิดพลาด ข้อความด้านล่างเว็บจะแสดงสาเหตุ
หลังเลือกไฟล์ .gp ให้รอจนแสดงชื่อเพลง แล้วจึงกด Generate
