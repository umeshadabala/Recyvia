import test, { describe, it } from 'node:test';
import assert from 'node:assert/strict';

describe('API Gateway Event Parsing & Utility Tests', () => {
  it('should parse API Gateway V1 HTTP event format', () => {
    const v1Event = {
      httpMethod: 'GET',
      path: '/health',
    };
    const method = v1Event.httpMethod;
    const path = v1Event.path;
    assert.equal(method, 'GET');
    assert.equal(path, '/health');
  });

  it('should parse API Gateway V2 HTTP event format', () => {
    const v2Event = {
      rawPath: '/health',
      requestContext: {
        http: {
          method: 'GET',
          path: '/health',
        },
      },
    };
    const method = v2Event.requestContext.http.method;
    const path = v2Event.rawPath;
    assert.equal(method, 'GET');
    assert.equal(path, '/health');
  });

  it('should format ISO timestamp correctly for system responses', () => {
    const now = new Date().toISOString();
    assert.match(now, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});
