import { describe, it, expect } from '@jest/globals';

describe('API Integration Tests', () => {
  const baseUrl = 'http://localhost:3000/api';

  describe('Users API', () => {
    it('GET /api/users should require auth', async () => {
      const res = await fetch(`${baseUrl}/users`);
      expect(res.status).toBe(401);
    });

    it('POST /api/users should require auth', async () => {
      const res = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Facilities API', () => {
    it('GET /api/facilities should require auth', async () => {
      const res = await fetch(`${baseUrl}/facilities`);
      expect(res.status).toBe(401);
    });

    it('POST /api/facilities should require auth', async () => {
      const res = await fetch(`${baseUrl}/facilities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Test' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Patients API', () => {
    it('GET /api/patients should require auth', async () => {
      const res = await fetch(`${baseUrl}/patients`);
      expect(res.status).toBe(401);
    });

    it('POST /api/patients should require auth', async () => {
      const res = await fetch(`${baseUrl}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName: 'John' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Cases API', () => {
    it('GET /api/cases should require auth', async () => {
      const res = await fetch(`${baseUrl}/cases`);
      expect(res.status).toBe(401);
    });

    it('POST /api/cases should require auth', async () => {
      const res = await fetch(`${baseUrl}/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diseaseCode: 'MEASLES' }),
      });
      expect(res.status).toBe(401);
    });
  });

  describe('Alerts API', () => {
    it('GET /api/alerts should require auth', async () => {
      const res = await fetch(`${baseUrl}/alerts`);
      expect(res.status).toBe(401);
    });

    it('POST /api/alerts should require auth', async () => {
      const res = await fetch(`${baseUrl}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ diseaseCode: 'MEASLES' }),
      });
      expect(res.status).toBe(401);
    });
  });
});
