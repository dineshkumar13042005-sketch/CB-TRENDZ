/**
 * CB TRENDZ — Real Razorpay Payment Server
 * Implements:
 *  - POST /api/create-order     : Creates official Razorpay order with server-validated prices
 *  - POST /api/create-qr        : Generates dynamic Razorpay UPI QR code (or fallback to Checkout)
 *  - GET  /api/payment-status/:orderId : Live server-side payment verification & polling
 *  - POST /api/razorpay-webhook : Verifies HMAC-SHA256 signature using raw body & processes events
 *  - POST /api/verify-payment   : Verifies Razorpay Checkout signature & captures payment
 */

'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Razorpay SDK
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.warn('Razorpay package not installed in server directory, attempting global/parent resolve');
  try {
    Razorpay = require(path.join(__dirname, '..', 'node_modules', 'razorpay'));
  } catch (err) {
    console.error('Failed to load Razorpay SDK:', err.message);
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - support local testing and production
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature']
}));

// Save raw body buffer for HMAC-SHA256 webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files from workspace root
const ROOT_DIR = path.join(__dirname, '..');
app.use(express.static(ROOT_DIR));

// Database: Local JSON file storage for orders
const DATA_DIR = path.join(__dirname, 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ORDERS_FILE)) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2), 'utf8');
}

function getStoredOrders() {
  try {
    const raw = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveOrder(order) {
  const orders = getStoredOrders();
  const index = orders.findIndex(o => o.orderId === order.orderId);
  if (index >= 0) {
    orders[index] = { ...orders[index], ...order, updatedAt: new Date().toISOString() };
  } else {
    orders.unshift({ ...order, createdAt: order.createdAt || new Date().toISOString() });
  }
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  return order;
}

function findOrder(identifier) {
  if (!identifier) return null;
  const orders = getStoredOrders();
  return orders.find(o => 
    o.orderId === identifier ||
    o.razorpayOrderId === identifier ||
    o.qrId === identifier ||
    o.paymentId === identifier
  ) || null;
}

/**
 * 🔒 SERVER MASTER CATALOG — Security Rule: NEVER trust client-submitted prices.
 * Every order total is recalculated and verified strictly from server catalog.
 */
const SERVER_CATALOG = {
  1: { id: 1, name: 'Kanchi cotton Saree', price: 1, category: 'cotton', image: 'images/Maroon Gold Zari Saree Ensemble.png' },
  2: { id: 2, name: 'Semi silk Saree', price: 850, category: 'silk', image: 'images/Teal and Gold Banarasi Saree Fold.png' },
  3: { id: 3, name: 'Semi silk Saree', price: 650, category: 'silk', image: 'images/Lime Green Silk Saree with Teal Zari Border.png' },
  4: { id: 4, name: 'Daily wear Georgette Saree', price: 550, category: 'party', image: 'images/Folded_floral_yellow_saree_displ…_f635d66d_2K.jpg' },
  5: { id: 5, name: 'Moonga Silk Saree', price: 1150, category: 'designer', image: 'images/Folded_green_saree_with_border_c449f9bc_2K.jpg' }
};

/**
 * Razorpay Instance Factory
 */
function isPlaceholderKey(key) {
  if (!key) return true;
  const lower = key.toLowerCase();
  return lower.includes('yourkey') || lower.includes('yourrazorpay') || lower.includes('placeholder') || lower.includes('dummy');
}

function getRazorpayInstance() {
  const keyId = (process.env.RAZORPAY_KEY_ID || '').trim();
  const keySecret = (process.env.RAZORPAY_KEY_SECRET || '').trim();
  const isKeyPresent = Boolean(keyId && keySecret && !isPlaceholderKey(keyId) && !isPlaceholderKey(keySecret));

  if (Razorpay && isKeyPresent) {
    try {
      const instance = new Razorpay({ key_id: keyId, key_secret: keySecret });
      return { instance, keyId, keySecret, isConfigured: true };
    } catch (err) {
      console.error('Failed to initialize Razorpay SDK instance:', err);
    }
  }
  return { instance: null, keyId, keySecret, isConfigured: false };
}

// Helper: Calculate and verify cart items
function verifyCartItems(items) {
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error('Shopping cart is empty.');
  }

  let subtotal = 0;
  const verifiedItems = items.map(item => {
    const product = SERVER_CATALOG[item.id];
    if (!product) {
      throw new Error(`Product with ID ${item.id} does not exist in catalog.`);
    }
    const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
    const itemTotal = product.price * qty;
    subtotal += itemTotal;
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: qty,
      itemTotal,
      image: product.image
    };
  });

  const shipping = 0; // Free express shipping across India
  const totalInINR = subtotal + shipping;
  const totalInPaise = Math.round(totalInINR * 100);

  return { verifiedItems, subtotal, shipping, totalInINR, totalInPaise };
}

/* ============================================================
   ROUTES
   ============================================================ */

/**
 * GET /api/config
 * Returns public keys and store config for frontend
 */
app.get('/api/config', (req, res) => {
  const rzp = getRazorpayInstance();
  res.json({
    success: true,
    storeName: process.env.STORE_NAME || 'CB TRENDZ',
    whatsappNumber: process.env.STORE_PHONE || '918778522690',
    currency: 'INR',
    currencySymbol: '₹',
    razorpayKeyId: rzp.keyId || '',
    isRazorpayConfigured: rzp.isConfigured
  });
});

/**
 * GET /api/catalog
 * Returns server product catalog
 */
app.get('/api/catalog', (req, res) => {
  res.json({
    success: true,
    catalog: Object.values(SERVER_CATALOG)
  });
});

/**
 * 1. POST /api/create-order
 * Creates a unique order in Razorpay Orders API
 * Securely recalculates total on server side
 */
app.post('/api/create-order', async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required.'
      });
    }

    const { verifiedItems, totalInINR, totalInPaise } = verifyCartItems(items);
    const orderId = `CBT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const rzp = getRazorpayInstance();

    let razorpayOrderId = null;
    if (rzp.isConfigured) {
      try {
        const orderOptions = {
          amount: totalInPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            orderId,
            customerName: customer.name,
            customerPhone: customer.phone,
            customerCity: customer.city || ''
          }
        };

        const razorpayOrder = await rzp.instance.orders.create(orderOptions);
        razorpayOrderId = razorpayOrder.id;
      } catch (rzpErr) {
        console.warn('⚠️ Razorpay orders.create API notice:', rzpErr.error?.description || rzpErr.message || rzpErr);
        if (rzpErr.statusCode === 401 || (rzpErr.error && rzpErr.error.code === 'BAD_REQUEST_ERROR')) {
          razorpayOrderId = `order_test_${Date.now()}`;
        } else {
          throw new Error(rzpErr.error?.description || rzpErr.message || 'Razorpay order creation failed');
        }
      }
    } else {
      // Keys not configured or running in test mode
      razorpayOrderId = `order_test_${Date.now()}`;
    }

    const newOrder = {
      orderId,
      razorpayOrderId,
      amount: totalInINR,
      amountInPaise: totalInPaise,
      currency: 'INR',
      customer,
      items: verifiedItems,
      paymentStatus: 'PENDING',
      paymentMethod: 'RAZORPAY',
      createdAt: new Date().toISOString()
    };

    saveOrder(newOrder);

    return res.json({
      success: true,
      orderId,
      razorpayOrderId,
      amount: totalInINR,
      amountInPaise: totalInPaise,
      currency: 'INR',
      keyId: rzp.keyId,
      customer,
      items: verifiedItems
    });
  } catch (err) {
    console.error('Error in /api/create-order:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error creating order.' });
  }
});

/**
 * 2. POST /api/create-qr
 * Generates dynamic UPI QR code via Razorpay QR Code API
 * If account feature is not enabled, provides graceful fallback to Razorpay Checkout
 */
app.post('/api/create-qr', async (req, res) => {
  try {
    const { items, customer } = req.body;

    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required.'
      });
    }

    const { verifiedItems, totalInINR, totalInPaise } = verifyCartItems(items);
    const orderId = `CBT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const rzp = getRazorpayInstance();

    let razorpayOrderId = null;
    let qrId = null;
    let qrImageUrl = null;
    let qrAvailable = true;
    let fallbackMessage = null;

    if (rzp.isConfigured) {
      // 1. Create Razorpay order first
      try {
        const orderOptions = {
          amount: totalInPaise,
          currency: 'INR',
          receipt: orderId,
          notes: {
            orderId,
            customerName: customer.name,
            customerPhone: customer.phone
          }
        };
        const rzpOrder = await rzp.instance.orders.create(orderOptions);
        razorpayOrderId = rzpOrder.id;
      } catch (orderErr) {
        console.warn('⚠️ Razorpay orders.create API notice:', orderErr.error?.description || orderErr.message);
        if (orderErr.statusCode === 401 || (orderErr.error && orderErr.error.code === 'BAD_REQUEST_ERROR')) {
          razorpayOrderId = `order_test_${Date.now()}`;
        } else {
          throw new Error(orderErr.error?.description || orderErr.message || 'Razorpay order creation failed');
        }
      }

      // 2. Attempt to create dynamic UPI QR Code via Razorpay QR Code API
      try {
        const qrResponse = await rzp.instance.qrCode.create({
          type: 'upi_qr',
          name: `CB TRENDZ - ${orderId}`,
          usage: 'single_use',
          fixed_amount: true,
          payment_amount: totalInPaise,
          description: `Saree order ${orderId}`,
          close_by: Math.floor(Date.now() / 1000) + (30 * 60), // Closes in 30 minutes
          notes: {
            orderId,
            customerName: customer.name,
            customerPhone: customer.phone
          }
        });

        qrId = qrResponse.id;
        qrImageUrl = qrResponse.image_url;
      } catch (qrErr) {
        console.warn('⚠️ Razorpay Dynamic QR Codes API error:', qrErr.error?.description || qrErr.message);
        qrAvailable = false;
        fallbackMessage = 'Dynamic UPI QR API requires business feature activation on your Razorpay account. Use standard Razorpay Checkout instead.';
      }
    } else {
      razorpayOrderId = `order_test_${Date.now()}`;
      qrId = `qr_test_${Date.now()}`;
      qrAvailable = false;
      fallbackMessage = 'Please configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in server/.env.';
    }

    const newOrder = {
      orderId,
      razorpayOrderId,
      qrId,
      qrImageUrl,
      amount: totalInINR,
      amountInPaise: totalInPaise,
      currency: 'INR',
      customer,
      items: verifiedItems,
      paymentStatus: 'PENDING',
      paymentMethod: qrAvailable ? 'RAZORPAY_QR' : 'RAZORPAY_CHECKOUT',
      createdAt: new Date().toISOString()
    };

    saveOrder(newOrder);

    return res.json({
      success: true,
      qrAvailable,
      qrId,
      qrImageUrl,
      orderId,
      razorpayOrderId,
      amount: totalInINR,
      amountInPaise: totalInPaise,
      currency: 'INR',
      keyId: rzp.keyId,
      customer,
      items: verifiedItems,
      message: fallbackMessage
    });
  } catch (err) {
    console.error('Error in /api/create-qr:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error generating payment QR.' });
  }
});

/**
 * 3. GET /api/payment-status/:orderId
 * Genuine server-side payment verification & polling endpoint
 * Actively checks Razorpay API if webhook hasn't arrived yet
 */
app.get('/api/payment-status/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = findOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        status: 'NOT_FOUND',
        message: `Order ${orderId} not found.`
      });
    }

    // 1. If already verified and PAID via webhook or previous check, return immediately (Idempotent)
    if (order.paymentStatus === 'PAID') {
      return res.json({
        success: true,
        status: 'PAID',
        orderId: order.orderId,
        paymentId: order.paymentId,
        amount: order.amount,
        paidAt: order.paidAt,
        transactionRef: order.bankTxnId || order.paymentId,
        order
      });
    }

    // 2. If already marked FAILED
    if (order.paymentStatus === 'FAILED') {
      return res.json({
        success: false,
        status: 'FAILED',
        message: order.failureReason || 'Payment failed or was cancelled.'
      });
    }

    // 3. If PENDING, actively query Razorpay API for live payment status
    const rzp = getRazorpayInstance();
    if (rzp.isConfigured) {
      // Check QR payments if qrId exists
      if (order.qrId && !order.qrId.startsWith('qr_sim_')) {
        try {
          const qrPayments = await rzp.instance.qrCode.fetchAllPayments(order.qrId);
          if (qrPayments && qrPayments.items && qrPayments.items.length > 0) {
            const captured = qrPayments.items.find(p => p.status === 'captured');
            if (captured) {
              // 🔒 Security check: Verify paid amount strictly matches order amount
              if (captured.amount === order.amountInPaise) {
                order.paymentStatus = 'PAID';
                order.paymentId = captured.id;
                order.bankTxnId = captured.acquirer_data?.bank_transaction_id || captured.acquirer_data?.rrn || captured.id;
                order.paidAt = new Date().toISOString();
                saveOrder(order);

                return res.json({
                  success: true,
                  status: 'PAID',
                  orderId: order.orderId,
                  paymentId: order.paymentId,
                  amount: order.amount,
                  paidAt: order.paidAt,
                  transactionRef: order.bankTxnId,
                  order
                });
              } else {
                console.warn(`⚠️ Amount mismatch for order ${order.orderId}: expected ${order.amountInPaise}, got ${captured.amount}`);
              }
            }
          }
        } catch (qrErr) {
          console.warn('Error fetching QR payments from Razorpay:', qrErr.message);
        }
      }

      // Check order payments if razorpayOrderId exists
      if (order.razorpayOrderId && !order.razorpayOrderId.startsWith('order_sim_')) {
        try {
          const rzpOrder = await rzp.instance.orders.fetch(order.razorpayOrderId);
          if (rzpOrder && (rzpOrder.status === 'paid' || rzpOrder.amount_paid >= order.amountInPaise)) {
            const payments = await rzp.instance.orders.fetchPayments(order.razorpayOrderId);
            const captured = payments && payments.items ? payments.items.find(p => p.status === 'captured') : null;

            order.paymentStatus = 'PAID';
            order.paymentId = captured ? captured.id : `pay_${Date.now()}`;
            order.bankTxnId = captured?.acquirer_data?.bank_transaction_id || order.paymentId;
            order.paidAt = new Date().toISOString();
            saveOrder(order);

            return res.json({
              success: true,
              status: 'PAID',
              orderId: order.orderId,
              paymentId: order.paymentId,
              amount: order.amount,
              paidAt: order.paidAt,
              transactionRef: order.bankTxnId,
              order
            });
          }
        } catch (orderErr) {
          console.warn('Error fetching order from Razorpay:', orderErr.message);
        }
      }
    }

    // Still pending customer payment
    return res.json({
      success: true,
      status: 'PENDING',
      orderId: order.orderId,
      amount: order.amount,
      message: 'Waiting for genuine payment confirmation from Razorpay...'
    });
  } catch (err) {
    console.error('Error in /api/payment-status:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error checking payment status.' });
  }
});

/**
 * 4. POST /api/razorpay-webhook
 * Official Razorpay Webhook listener with HMAC-SHA256 signature verification
 * Prevents replay attacks & duplicate order confirmations
 */
app.post('/api/razorpay-webhook', (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!webhookSecret) {
      console.error('⚠️ RAZORPAY_WEBHOOK_SECRET is not configured in .env');
      return res.status(500).send('Webhook secret not configured on server.');
    }

    if (!signature) {
      console.warn('⚠️ Missing x-razorpay-signature header on webhook request');
      return res.status(400).send('Missing webhook signature.');
    }

    // 🔒 Security: Verify signature strictly against RAW request buffer
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)
      .digest('hex');

    const isAuthentic = signature.length === expectedSignature.length && crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );

    if (!isAuthentic) {
      console.warn('❌ Webhook signature verification failed! Rejecting request.');
      return res.status(400).send('Invalid webhook signature.');
    }

    const event = req.body.event;
    const payload = req.body.payload;

    console.log(`\n🔔 Verified Razorpay Webhook Event: ${event}`);

    // Extract identifiers from payload
    const payment = payload?.payment?.entity;
    const rzpOrder = payload?.order?.entity;
    const qrCode = payload?.qr_code?.entity;

    const targetOrderId = 
      payment?.notes?.orderId ||
      rzpOrder?.notes?.orderId ||
      qrCode?.notes?.orderId ||
      payment?.order_id ||
      qrCode?.id;

    const order = findOrder(targetOrderId) || (payment?.order_id ? findOrder(payment.order_id) : null);

    if (!order) {
      console.warn(`Order not found for webhook event ${event} (Target: ${targetOrderId})`);
      // Return 200 so Razorpay does not retry permanently for unlinked test payloads
      return res.status(200).json({ status: 'ignored_order_not_found' });
    }

    // 🔒 Idempotency Check: Do not process already paid orders
    if (order.paymentStatus === 'PAID') {
      console.log(`Order ${order.orderId} is already marked PAID. Ignoring duplicate event.`);
      return res.status(200).json({ status: 'already_processed' });
    }

    // Handle captured & credited payment events
    if (event === 'payment.captured' || event === 'order.paid' || event === 'qr_code.credited') {
      const paidAmount = payment?.amount || rzpOrder?.amount_paid || qrCode?.payment_amount;

      // 🔒 Security Check: Match payment amount with original order amount
      if (paidAmount && paidAmount !== order.amountInPaise) {
        console.error(`🚨 PAYMENT AMOUNT MISMATCH for ${order.orderId}! Expected: ${order.amountInPaise}, Received: ${paidAmount}`);
        order.paymentStatus = 'AMOUNT_MISMATCH';
        order.flaggedReason = `Expected ${order.amountInPaise} paise, received ${paidAmount} paise`;
        saveOrder(order);
        return res.status(400).json({ status: 'amount_mismatch' });
      }

      order.paymentStatus = 'PAID';
      order.paymentId = payment?.id || `pay_wh_${Date.now()}`;
      order.bankTxnId = payment?.acquirer_data?.bank_transaction_id || payment?.acquirer_data?.rrn || payment?.id;
      order.paidAt = new Date().toISOString();
      order.webhookEvent = event;
      saveOrder(order);

      console.log(`✅ Order ${order.orderId} successfully confirmed and marked PAID via Webhook!`);
      return res.status(200).json({ status: 'ok', orderId: order.orderId });
    }

    // Handle failed payments
    if (event === 'payment.failed') {
      order.paymentStatus = 'FAILED';
      order.failureReason = payment?.error_description || 'Payment failed';
      saveOrder(order);

      console.log(`❌ Order ${order.orderId} marked FAILED via Webhook: ${order.failureReason}`);
      return res.status(200).json({ status: 'marked_failed', orderId: order.orderId });
    }

    return res.status(200).json({ status: 'ignored_unhandled_event' });
  } catch (err) {
    console.error('Error handling webhook:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 5. POST /api/verify-payment
 * Verifies Razorpay Standard Checkout modal signature (Cards / UPI / NetBanking)
 */
app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: 'Missing Razorpay payment verification parameters.'
      });
    }

    const rzp = getRazorpayInstance();
    if (!rzp.isConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Razorpay credentials not configured on server.'
      });
    }

    // 🔒 Verify HMAC-SHA256 signature
    const body = `${razorpayOrderId}|${razorpayPaymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', rzp.keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpaySignature) {
      console.warn(`❌ Razorpay signature verification failed for ${razorpayPaymentId}`);
      return res.status(400).json({
        success: false,
        status: 'FAILED',
        message: 'Payment verification failed: Invalid Razorpay signature.'
      });
    }

    // 🔒 Fetch payment from Razorpay API to confirm captured status & amount
    const payment = await rzp.instance.payments.fetch(razorpayPaymentId);
    if (!payment || payment.status !== 'captured') {
      return res.status(400).json({
        success: false,
        status: 'PENDING',
        message: 'Payment has not been captured yet by Razorpay.'
      });
    }

    const order = findOrder(orderId) || findOrder(razorpayOrderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order reference not found on server.'
      });
    }

    // Verify amount
    if (payment.amount !== order.amountInPaise) {
      console.error(`🚨 Payment amount mismatch: expected ${order.amountInPaise}, received ${payment.amount}`);
      return res.status(400).json({
        success: false,
        message: 'Payment amount mismatch detected.'
      });
    }

    order.paymentStatus = 'PAID';
    order.paymentId = razorpayPaymentId;
    order.bankTxnId = payment.acquirer_data?.bank_transaction_id || payment.acquirer_data?.rrn || razorpayPaymentId;
    order.paidAt = new Date().toISOString();
    order.paymentMethod = payment.method ? `RAZORPAY_${payment.method.toUpperCase()}` : 'RAZORPAY';
    saveOrder(order);

    return res.json({
      success: true,
      status: 'PAID',
      orderId: order.orderId,
      paymentId: order.paymentId,
      transactionRef: order.bankTxnId,
      amount: order.amount,
      order
    });
  } catch (err) {
    console.error('Error in /api/verify-payment:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error verifying payment.' });
  }
});

/**
 * GET /api/orders
 * Returns list of customer orders
 */
app.get('/api/orders', (req, res) => {
  const orders = getStoredOrders();
  res.json({ success: true, count: orders.length, orders });
});

/**
 * Fallback to index.html for Single-Page Application routing
 */
app.use((req, res) => {
  res.sendFile(path.join(ROOT_DIR, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🌸 CB TRENDZ — Real Razorpay Payment Server Running`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`💳 Razorpay Real Endpoints Active:`);
  console.log(`   - POST /api/create-order     (Server-validated prices)`);
  console.log(`   - POST /api/create-qr        (Dynamic UPI QR & Checkout)`);
  console.log(`   - GET  /api/payment-status/:orderId (Live Status Polling)`);
  console.log(`   - POST /api/razorpay-webhook (HMAC-SHA256 Verified Webhooks)`);
  console.log(`   - POST /api/verify-payment   (Checkout Signature Verification)`);
  console.log(`=============================================================\n`);
});
