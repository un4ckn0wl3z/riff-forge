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
เล่นตาม repeat / alternate ending / jump แบบเดียวกับ Guitar Pro (ปิดได้) ยังไม่มีชุดเสียง Metal แยกเฉพาะ
อ่านรายละเอียดและข้อจำกัดเพิ่มเติมใน README.md

## รุ่นแก้ปุ่ม Demo และอัปโหลด

แตก ZIP รุ่นนี้เป็นโฟลเดอร์ใหม่ แล้วรันเซิร์ฟเวอร์ในโฟลเดอร์ riff-forge นั้น

python -m http.server 8080 --directory dist

เปิด http://localhost:8080 แล้วรีเฟรชหน้าเว็บ
มี app.bundle.js ที่พร้อมใช้ ไม่ต้อง npm install
หากมีข้อผิดพลาด ข้อความด้านล่างเว็บจะแสดงสาเหตุ
หลังเลือกไฟล์ .gp ให้รอจนแสดงชื่อเพลง แล้วจึงกด Generate

## เลือกบาง bar

หลังอัปโหลด เลือก From bar และ To bar เช่น 9 ถึง 16 แล้วกด Generate
จะสร้างและส่งออกเฉพาะช่วงที่เลือก รวมทั้ง bar เริ่มและ bar จบ
ไฟล์เริ่มที่เวลา 0 ของช่วง ให้นำไปวางที่ bar เริ่มใน REAPER
กด ทั้งเพลง เพื่อกลับมาใช้ทุกห้อง


## รุ่นแก้ MIDI สำหรับ EZbass
เลือก MIDI bass target → EZbass (+12 semitones) ก่อนดาวน์โหลด MIDI เบส
โหมดนี้ยกเฉพาะ MIDI เบสขึ้น 12 semitones และไม่ส่ง Program Change โดยไม่เปลี่ยนเสียง Preview หรือ WAV
เมื่อนำเข้า EZbass ไม่ต้อง transpose เพิ่มอีก

## ฟีเจอร์ใหม่

- แผนที่ห้อง: แตะห้องแรกแล้วแตะห้องสุดท้ายเพื่อเลือกช่วง ลากเมาส์ Shift+คลิก หรือกดชื่อท่อน
- Section overrides: ตั้งแนว ความหนัก ความซับซ้อน และ double kick แยกตามท่อน เลือก Generate = Only bars with section overrides เพื่อสร้างเฉพาะท่อนที่ตั้งไว้ ห้องระหว่างกลางเงียบ
- Export start: ค่าเริ่มต้น "Song start" ไฟล์มีช่วงเงียบก่อนห้องที่เลือก วางที่ 0:00 ใน DAW ได้เลย
- Click / Full mix + click ทั้ง WAV และ MIDI และพรีวิวพร้อมคลิกกับนับนำ 1 ห้อง
- พรีวิวใช้ตัวจับเวลาใน Web Worker เสียงไม่สะดุดเมื่อสลับไปแท็บอื่น
- ทดสอบในเบราว์เซอร์จริง: npm run test:browser (ต้องมี Playwright)
