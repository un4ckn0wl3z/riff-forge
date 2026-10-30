import assert from'node:assert/strict';
import{translate}from'../dist/i18n.js';
// exact strings, numbered patterns, composite messages joined with ' · ', and pass-through of non-Thai text
assert.equal(translate('ทั้งเพลง'),'Whole song');
assert.equal(translate('  ยังไม่มีไฟล์?  '),'  No file yet?  ','surrounding whitespace is kept');
assert.equal(translate('8 ห้อง'),'8 bars');assert.equal(translate('1 ห้อง'),'1 bar');
assert.equal(translate('ทั้งเพลง · 24 ห้อง'),'Whole song · 24 bars');
assert.equal(translate('Bar 5–8 · 4 ห้อง · ไฟล์ส่งออกมีช่วงเงียบก่อน bar 5 วางที่ 0:00 ใน DAW ได้เลย'),'Bar 5–8 · 4 bars · exports include silence before bar 5, so they drop at 0:00 in your DAW');
assert.equal(translate('Generate bar 5–8 + 17–20 ต่อกัน 8 ห้อง · ไม่มีห้องเงียบคั่น · ไฟล์ส่งออกเริ่มที่ 0 (Export start ไม่มีผลในโหมดนี้)'),'Generate bars 5–8 + 17–20 joined, 8 bars · no silent gaps · exports start at 0 (Export start has no effect in this mode)');
assert.equal(translate('อ่านไฟล์ไม่สำเร็จ: ไฟล์เสียหายหรือเวอร์ชันไม่รองรับ'),'Couldn’t read the file: the file is damaged or an unsupported version');
assert.equal(translate('ตั้งแนว Thrash Metal ให้ bar 5–8 แล้ว · กด Generate ได้เลย'),'Set Thrash Metal for bar 5–8 · press Generate');
assert.equal(translate('Metalcore · Punchy'),'Metalcore · Punchy','English passes through');
console.log('PASS: Thai → English dictionary, numbered patterns, composite status messages and pass-through.');
