/**
 * Comprehensive Automated Test Suite for CB TRENDZ Razorpay Backend
 */

'use strict';

const http = require('http');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:5000';
const WEBHOOK_SECRET = 'TestWebhookSecret123';

// Helper: HTTP Request
function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch(e) { json = data; }
        resolve({ status: res.statusCode, data: json, raw: data });
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Running CB TRENDZ Razorpay Integration Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. GET /api/config
    console.log('Test 1: Public Config Endpoint');
    const configRes = await makeRequest('GET', '/api/config');
    assert(configRes.status === 200, 'GET /api/config returns 200');
    assert(configRes.data.storeName === 'CB TRENDZ', 'Store name is CB TRENDZ');
    assert(configRes.data.currency === 'INR', 'Currency is INR');

    // 2. POST /api/create-order
    console.log('\nTest 2: Create Order API (Server-side price verification)');
    const orderPayload = {
      items: [{ id: 1, quantity: 2 }, { id: 2, quantity: 1 }],
      customer: {
        name: 'Priya Sharma',
        phone: '9876543210',
        address: '12 Temple St',
        city: 'Chennai',
        pincode: '600001'
      }
    };
    // Saree 1 is ₹1 (qty 2 = ₹2), Saree 2 is ₹850 (qty 1 = ₹850). Total = ₹852 = 85200 paise
    const createOrderRes = await makeRequest('POST', '/api/create-order', orderPayload);
    assert(createOrderRes.status === 200, 'POST /api/create-order returns 200');
    assert(createOrderRes.data.success === true, 'Order created successfully');
    assert(createOrderRes.data.amount === 852, 'Server correctly calculated amount ₹852 from catalog');
    assert(createOrderRes.data.amountInPaise === 85200, 'Amount in paise is 85200');
    const createdOrderId = createOrderRes.data.orderId;
    assert(Boolean(createdOrderId), `Received order ID: ${createdOrderId}`);

    // 3. POST /api/create-qr
    console.log('\nTest 3: Create Dynamic QR API');
    const qrPayload = {
      items: [{ id: 1, quantity: 1 }],
      customer: {
        name: 'Ananya Rao',
        phone: '9876543210',
        address: '45 Lake View',
        city: 'Coimbatore',
        pincode: '641001'
      }
    };
    const createQrRes = await makeRequest('POST', '/api/create-qr', qrPayload);
    assert(createQrRes.status === 200, 'POST /api/create-qr returns 200');
    assert(createQrRes.data.success === true, 'QR creation endpoint succeeded');
    assert(createQrRes.data.amount === 1, 'Amount is ₹1');
    const qrOrderId = createQrRes.data.orderId;

    // 4. GET /api/payment-status/:orderId (Initial Pending Status)
    console.log('\nTest 4: Payment Status Initial Check');
    const statusRes1 = await makeRequest('GET', `/api/payment-status/${qrOrderId}`);
    assert(statusRes1.status === 200, 'Status endpoint returns 200');
    assert(statusRes1.data.status === 'PENDING', 'Initial status is PENDING');

    // 5. POST /api/razorpay-webhook Security Tests
    console.log('\nTest 5: Webhook Signature Verification & Security');
    // 5a. Missing signature
    const noSigRes = await makeRequest('POST', '/api/razorpay-webhook', { event: 'payment.captured' });
    assert(noSigRes.status === 400, 'Rejects webhook missing x-razorpay-signature with 400');

    // 5b. Invalid signature
    const fakeSigRes = await makeRequest('POST', '/api/razorpay-webhook', { event: 'payment.captured' }, {
      'x-razorpay-signature': 'fake_signature_abc123'
    });
    assert(fakeSigRes.status === 400, 'Rejects webhook with forged signature with 400');

    // 5c. Valid HMAC-SHA256 signature for payment.captured
    console.log('\nTest 6: Genuine Webhook Event Processing (HMAC-SHA256 Verified)');
    const webhookPayload = JSON.stringify({
      entity: 'event',
      account_id: 'acc_test123',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_test_' + Date.now(),
            entity: 'payment',
            amount: 100, // 100 paise = ₹1.00 matches qrOrderId amount
            currency: 'INR',
            status: 'captured',
            order_id: createQrRes.data.razorpayOrderId,
            method: 'upi',
            notes: {
              orderId: qrOrderId
            },
            acquirer_data: {
              bank_transaction_id: 'UTR_BANK_998877',
              rrn: '123456789012'
            }
          }
        }
      },
      created_at: Math.floor(Date.now() / 1000)
    });

    const validSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || 'YourWebhookSecretHere')
      .update(webhookPayload)
      .digest('hex');

    const validWebhookRes = await makeRequest('POST', '/api/razorpay-webhook', webhookPayload, {
      'x-razorpay-signature': validSignature
    });
    assert(validWebhookRes.status === 200, 'Valid webhook accepted with 200 OK');
    assert(validWebhookRes.data.status === 'ok', 'Webhook handler returned status ok');

    // 7. Verify order status is now PAID via polling endpoint
    console.log('\nTest 7: Verification of PAID Status after Webhook');
    const statusRes2 = await makeRequest('GET', `/api/payment-status/${qrOrderId}`);
    assert(statusRes2.status === 200, 'Status check returns 200');
    assert(statusRes2.data.status === 'PAID', 'Order status updated to PAID');
    assert(statusRes2.data.transactionRef === 'UTR_BANK_998877', 'Genuine bank transaction reference recorded');
    assert(Boolean(statusRes2.data.paidAt), 'Timestamp paidAt is recorded');

    // 8. Idempotency test: Re-sending the same webhook should not duplicate or error
    console.log('\nTest 8: Idempotency Protection against Duplicate Webhooks');
    const duplicateRes = await makeRequest('POST', '/api/razorpay-webhook', webhookPayload, {
      'x-razorpay-signature': validSignature
    });
    assert(duplicateRes.status === 200, 'Duplicate webhook returns 200');
    assert(duplicateRes.data.status === 'already_processed', 'Recognized as already_processed without duplicate side effects');

    // 9. POST /api/verify-payment Tests (Checkout Signature Verification)
    console.log('\nTest 9: Checkout Modal Signature Verification API');
    const missingVerifyRes = await makeRequest('POST', '/api/verify-payment', {});
    assert(missingVerifyRes.status === 400, 'Rejects missing payment verification parameters with 400');

    console.log(`\n=============================================================`);
    console.log(`🏁 TEST RESULTS: ${passed} Passed, ${failed} Failed`);
    console.log(`=============================================================\n`);

    process.exit(failed > 0 ? 1 : 0);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runTests();
