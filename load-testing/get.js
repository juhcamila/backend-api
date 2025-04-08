import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 100,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<100'], 
  },
};

export default function () {
  const res = http.get('http://localhost:3000/products');

  check(res, {
    'status é 200': (r) => r.status === 200,
  });

  sleep(1);
}
