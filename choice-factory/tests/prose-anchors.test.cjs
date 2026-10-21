const {test} = require('node:test');
const assert = require('node:assert/strict');
const {resolve} = require('../prose-anchors.js');

test('reanchors an old quote after a changed prefix', () => {
  const quote='불편해질 수 있다.';
  const old='책상 위의 책도 장식이 될 수 있다. 필요한 연락이 '+quote;
  const updated='책을 눈앞에 둬도 읽지 않을 수 있다. 필요한 연락이 '+quote;
  const start=old.indexOf(quote);
  assert.deepEqual(resolve({text:quote,start,end:start+quote.length},updated,{forceQuoteOnly:true}),
    {start:updated.indexOf(quote),end:updated.length});
});
test('never paints an unrelated sentence at an obsolete offset', () => {
  assert.equal(resolve({text:'기존 문장',start:0,end:5},'바뀐 문장'),null);
});
test('an old ambiguous quote in a changed paragraph stays unpainted', () => {
  assert.equal(resolve({text:'확인',start:0,end:2},'확인 뒤 다시 확인',{forceQuoteOnly:true}),null);
});
test('new notes can target one of two identical phrases using verified offsets', () => {
  assert.deepEqual(resolve({text:'확인',start:8,end:10},'확인 뒤 다시 확인'),{start:8,end:10});
});
test('existing valid offsets preserve surrounding selected spaces', () => {
  assert.deepEqual(resolve({text:'선택',start:0,end:4},' 선택 '),{start:0,end:4});
});
test('missing and malformed quotes do not create marks', () => {
  for(const note of [null,{}, {text:''},{text:'   '},{text:42}])assert.equal(resolve(note,'본문'),null);
});
test('resolution leaves the saved quote, memo and offsets untouched', () => {
  const note={text:'원문',start:0,end:2,memo:'내 생각',id:'old-note'};
  const saved=JSON.stringify(note);
  assert.deepEqual(resolve(note,'새 원문',{forceQuoteOnly:true}),{start:2,end:4});
  assert.equal(JSON.stringify(note),saved);
});
