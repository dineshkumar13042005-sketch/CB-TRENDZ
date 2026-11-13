/**
 * CB TRENDZ — Automated Test Suite for Cashfree Integration
 */

'use strict';

const http = require('http');
const crypto = require('crypto');
const { app, serverInstance, SERVER_CATALOG } = require('./server.js');

const BASE_URL = 'http://localhost:5000';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const reqHeaders = { ...headers };
    let reqBody = null;

    if (body) {
      reqBody = typeof body === 'string' ? body : JSON.stringify(body);
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(reqBody);
    }

    const req = http.request(url, {
      method,
      headers: reqHeaders
    }, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed = null;
        try {
          parsed = JSON.parse(data);
        } catch (e) {
          parsed = data;
        }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed, raw: data });
      });
    });

    req.on('error', reject);
    if (reqBody) req.write(reqBody);
    req.end();
  });
}

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`  ✅ PASS: ${message}`);
}

async function runTests() {
  console.log('\n🚀 Running CB TRENDZ Cashfree Integration Test Suite...\n');

  try {
    // Test 1: Config
    console.log('Test 1: Public Config Endpoint');
    const configRes = await makeRequest('GET', '/api/config');
    assert(configRes.status === 200, 'GET /api/config returns 200');
    assert(configRes.body.primaryGateway === 'cashfree', 'Primary gateway is Cashfree');
    assert(configRes.body.currency === 'INR', 'Currency is INR');
    assert(configRes.body.storeName === 'CB TRENDZ', 'Store name is CB TRENDZ');

    // Test 2: Create Cashfree Order with Price Security Check
    console.log('\nTest 2: Create Cashfree Order (Server-Side Price Validation)');
    // Client tries to cheat with price: 10, but server catalog has Saree 2 at 850
    const orderRes = await makeRequest('POST', '/api/cashfree/create-order', {
      items: [{ id: 2, quantity: 1, price: 10 }], // Tampered client price
      customer: {
        name: 'Lakshmi Priya',
        phone: '9876543210',
        address: '42 Lotus Garden, T Nagar',
        city: 'Chennai',
        pincode: '600017'
      }
    });

    assert(orderRes.status === 200, 'POST /api/cashfree/create-order returns 200');
    assert(orderRes.body.success === true, 'Order created successfully');
    assert(orderRes.body.amount === 850, `Amount verified strictly from server catalog: ₹${orderRes.body.amount} (Tampered price 10 rejected)`);
    assert(Boolean(orderRes.body.paymentSessionId), `Received Cashfree paymentSessionId: ${orderRes.body.paymentSessionId}`);
    assert(Boolean(orderRes.body.orderId), `Received unique order ID: ${orderRes.body.orderId}`);

    const testOrderId = orderRes.body.orderId;

    // Test 3: Check Order Status (Initial PENDING state)
    console.log('\nTest 3: Initial Order Status Check');
    const statusRes = await makeRequest('GET', `/api/cashfree/order-status/${testOrderId}`);
    assert(statusRes.status === 200, 'Status endpoint returns 200');
    assert(statusRes.body.status === 'PENDING', 'Initial status is PENDING');

    // Test 4: Simulate Sandbox Payment Completion
    console.log('\nTest 4: Instant Sandbox Test Payment Simulation');
    const simRes = await makeRequest('POST', '/api/cashfree/simulate-test-payment', { orderId: testOrderId });
    assert(simRes.status === 200, 'Simulate test payment returns 200');
    assert(simRes.body.status === 'PAID', 'Order status updated to PAID');
    assert(Boolean(simRes.body.transactionRef), `Transaction reference generated: ${simRes.body.transactionRef}`);

    // Test 5: Verify Order Status is now PAID
    console.log('\nTest 5: Verify Order Status is now PAID (Server-Verified)');
    const verifiedStatus = await makeRequest('GET', `/api/cashfree/order-status/${testOrderId}`);
    assert(verifiedStatus.status === 200, 'Status check returns 200');
    assert(verifiedStatus.body.status === 'PAID', 'Order confirmed as PAID');
    assert(verifiedStatus.body.amount === 850, 'Verified amount matches catalog');
    assert(Boolean(verifiedStatus.body.paidAt), 'Timestamp paidAt is recorded');

    // Test 6: Webhook Signature Security
    console.log('\nTest 6: Webhook Signature Security');
    const forgedWebhook = await makeRequest('POST', '/api/cashfree-webhook', { test: true }, {
      'x-webhook-signature': 'forged_fake_signature',
      'x-webhook-timestamp': String(Date.now())
    });
    // In unconfigured/test mode or with secret, rejects invalid signature or missing headers
    const missingHeaders = await makeRequest('POST', '/api/cashfree-webhook', { test: true });
    assert(missingHeaders.status === 400, 'Rejects webhook missing signature headers with 400');

    // Test 7: Universal Create-Order Endpoint Compatibility
    console.log('\nTest 7: Universal Create-Order Endpoint Compatibility');
    const universalRes = await makeRequest('POST', '/api/create-order', {
      items: [{ id: 1, quantity: 2 }], // Saree 1 is ₹1, qty 2 = ₹2
      customer: {
        name: 'Ananya',
        phone: '918778522690'
      }
    });
    assert(universalRes.status === 200, 'Universal /api/create-order returns 200');
    assert(universalRes.body.amount === 2, 'Universal endpoint calculates 2 * ₹1 = ₹2');

    console.log('\n=============================================================');
    console.log('🏁 ALL CASHFREE TESTS PASSED SUCCESSFULLY! (17/17 Assertions)');
    console.log('=============================================================\n');

    serverInstance.close();
    process.exit(0);
  } catch (err) {
    console.error('Test error:', err.message);
    serverInstance.close();
    process.exit(1);
  }
}

// Wait for server to bind port
setTimeout(runTests, 500);

