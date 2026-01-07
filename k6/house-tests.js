/* global __ENV */
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8080/api/v1';

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<=1'],
  },
};

export default function () {
  const res = http.get(`${BASE_URL}/houses`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
