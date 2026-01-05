import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';

export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500'],
    http_req_failed: ['rate<0.01'],
  },
  scenarios: {
    login_load: {
      executor: 'constant-vus',
      exec: 'login',
      vus: 10,
      duration: '30s',
    },
    login_spike: {
      executor: 'ramping-vus',
      exec: 'login',
      startVUs: 0,
      stages: [
        { duration: '5s', target: 5 },
        { duration: '5s', target: 50 },
        { duration: '10s', target: 5 },
      ],
      startTime: '35s',
    },
  },
};

export function login() {
  const payload = JSON.stringify({
    email: 'test@homiease.com',
    password: 'test1234',
  });

  const res = http.post(`${BASE_URL}/auth/login`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
