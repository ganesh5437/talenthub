const test = require('node:test');
const assert = require('node:assert');
const {
  canTransition, getAllowedTransitions, canScheduleInterview, isTerminal,
} = require('../src/utils/applicationPipeline');

test('rejected application is final and cannot be accepted/hired later', () => {
  assert.ok(isTerminal('REJECTED'));
  assert.deepStrictEqual(getAllowedTransitions('REJECTED'), []);
  for (const to of ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'SELECTED', 'OFFER_RELEASED', 'HIRED']) {
    assert.strictEqual(canTransition('REJECTED', to), false, `REJECTED -> ${to} must be blocked`);
  }
});

test('hired application is final', () => {
  assert.deepStrictEqual(getAllowedTransitions('HIRED'), []);
  assert.strictEqual(canTransition('HIRED', 'REJECTED'), false);
});

test('any active application can be rejected', () => {
  for (const from of ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW_SCHEDULED', 'SELECTED', 'OFFER_RELEASED']) {
    assert.ok(canTransition(from, 'REJECTED'), `${from} -> REJECTED must be allowed`);
  }
});

test('pipeline only moves forward', () => {
  assert.ok(canTransition('APPLIED', 'SHORTLISTED'));
  assert.ok(canTransition('SELECTED', 'OFFER_RELEASED'));
  assert.ok(canTransition('OFFER_RELEASED', 'HIRED'));
  assert.strictEqual(canTransition('SHORTLISTED', 'APPLIED'), false);
  assert.strictEqual(canTransition('OFFER_RELEASED', 'UNDER_REVIEW'), false);
});

test('interview stage is only reachable by scheduling an interview', () => {
  assert.strictEqual(canTransition('SHORTLISTED', 'INTERVIEW_SCHEDULED'), false);
  assert.ok(canScheduleInterview('SHORTLISTED'));
  assert.ok(canScheduleInterview('INTERVIEW_SCHEDULED'));
  assert.strictEqual(canScheduleInterview('REJECTED'), false);
  assert.strictEqual(canScheduleInterview('SELECTED'), false);
});
