
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50,
  duration: '10s',
};

export default function () {
  const payload = JSON.stringify({
    productId: '0328ced7-d44f-4577-97da-2e5d456cfc19',
    quantity: 1,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post('http://localhost:3000/products/purchase', payload, params);

  check(res, {
    'status is 200 or 400': (r) => r.status === 200 || r.status === 400,
  });

  sleep(0.2);
}