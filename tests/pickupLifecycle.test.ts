import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

const VALID_TRANSITIONS: Record<string, string[]> = {
  REQUESTED: ['MATCHING', 'ACCEPTED', 'CANCELLED'],
  MATCHING: ['ACCEPTED', 'CANCELLED'],
  ACCEPTED: ['ON_THE_WAY', 'ARRIVED', 'CANCELLED'],
  ON_THE_WAY: ['ARRIVED', 'CANCELLED'],
  ARRIVED: ['OTP_VERIFICATION', 'COLLECTING', 'CANCELLED'],
  OTP_VERIFICATION: ['COLLECTING', 'CANCELLED'],
  COLLECTING: ['WEIGHT_VERIFICATION', 'PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
  WEIGHT_VERIFICATION: ['PAYMENT_PENDING', 'COMPLETED', 'CANCELLED'],
  PAYMENT_PENDING: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

function isValidTransition(current: string, next: string): boolean {
  return (VALID_TRANSITIONS[current] || []).includes(next);
}

describe('Recyvia Waste Management Lifecycle Tests', () => {
  it('should validate allowed state machine transitions', () => {
    assert.equal(isValidTransition('REQUESTED', 'MATCHING'), true);
    assert.equal(isValidTransition('REQUESTED', 'ACCEPTED'), true);
    assert.equal(isValidTransition('MATCHING', 'ACCEPTED'), true);
    assert.equal(isValidTransition('ACCEPTED', 'ON_THE_WAY'), true);
    assert.equal(isValidTransition('ON_THE_WAY', 'ARRIVED'), true);
    assert.equal(isValidTransition('ARRIVED', 'OTP_VERIFICATION'), true);
    assert.equal(isValidTransition('ARRIVED', 'COLLECTING'), true);
    assert.equal(isValidTransition('OTP_VERIFICATION', 'COLLECTING'), true);
    assert.equal(isValidTransition('COLLECTING', 'WEIGHT_VERIFICATION'), true);
    assert.equal(isValidTransition('WEIGHT_VERIFICATION', 'PAYMENT_PENDING'), true);
    assert.equal(isValidTransition('PAYMENT_PENDING', 'COMPLETED'), true);
  });

  it('should reject invalid or skip transitions', () => {
    assert.equal(isValidTransition('REQUESTED', 'COMPLETED'), false);
    assert.equal(isValidTransition('ACCEPTED', 'COMPLETED'), false);
    assert.equal(isValidTransition('COMPLETED', 'ACCEPTED'), false);
  });

  it('should format transaction sequence IDs correctly', () => {
    const txNumber = `RCV-TX-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    assert.match(txNumber, /^RCV-TX-2026-\d{6}$/);
  });

  it('should correctly format AWS AppSync Events WebSocket subprotocols', () => {
    const apiKey = 'da2-42lzzeoshbay3dj3bm2cnbjmqm';
    const host = '6vttraufbnezzbnn75irdtxytu.appsync-api.ap-south-1.amazonaws.com';
    const auth = { 'x-api-key': apiKey, host };
    const base64 = Buffer.from(JSON.stringify(auth)).toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    const headerProtocol = `header-${base64}`;

    assert.equal(headerProtocol.startsWith('header-'), true);
    assert.equal(headerProtocol.includes('+'), false);
    assert.equal(headerProtocol.includes('/'), false);
    assert.equal(headerProtocol.includes('='), false);

    // Decode and verify payload
    const decoded = JSON.parse(Buffer.from(base64.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    assert.equal(decoded['x-api-key'], apiKey);
    assert.equal(decoded.host, host);
  });

  it('should validate OTP format and demo code', () => {
    const demoOtp = '123456';
    assert.equal(demoOtp.length, 6);
    assert.match(demoOtp, /^\d{6}$/);

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    assert.equal(generatedOtp.length, 6);
    assert.match(generatedOtp, /^\d{6}$/);
  });

  it('should validate closed-loop recovery state machine and batch IDs', () => {
    const RECOVERY_TRANSITIONS: Record<string, string[]> = {
      AVAILABLE: ['RECEIVED'],
      RECEIVED: ['PROCESSING'],
      PROCESSING: ['RECOVERED'],
      RECOVERED: [],
    };

    function isValidRecoveryTransition(current: string, next: string): boolean {
      return (RECOVERY_TRANSITIONS[current] || []).includes(next);
    }

    assert.equal(isValidRecoveryTransition('AVAILABLE', 'RECEIVED'), true);
    assert.equal(isValidRecoveryTransition('RECEIVED', 'PROCESSING'), true);
    assert.equal(isValidRecoveryTransition('PROCESSING', 'RECOVERED'), true);
    assert.equal(isValidRecoveryTransition('AVAILABLE', 'RECOVERED'), false);

    const batchNumber = `RCV-REC-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    assert.match(batchNumber, /^RCV-REC-2026-\d{6}$/);

    const recoveryCert = `COR-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    assert.match(recoveryCert, /^COR-2026-\d{6}$/);
  });
});
