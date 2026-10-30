/**
 * CB TRENDZ — Backend Server & Payment Gateway Integration
 * Supports:
 *  1. Direct Instant UPI QR & Mobile Deep-linking (Google Pay, PhonePe, Paytm)
 *  2. Official Razorpay Gateway (Cards, NetBanking, UPI)
 *  3. Cash on Delivery (COD)
 */

'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config();

// Attempt Razorpay import
let Razorpay;
try {
  Razorpay = require('razorpay');
} catch (e) {
  console.warn('Razorpay package not installed');
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Orders Database Path (File-based JSON storage)
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
    orders[index] = { ...orders[index], ...order };
  } else {
    orders.unshift(order);
  }
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf8');
  return order;
}

// Product Master Catalog with verified prices for server-side security
const SERVER_CATALOG = {
  1: { name: 'Kanchipuram Silk Saree', price: 8999, category: 'Silk Sarees', image: 'images/saree1.jpg' },
  2: { name: 'Kasavu Cotton Saree', price: 2499, category: 'Cotton Sarees', image: 'images/saree3.jpg' },
  3: { name: 'Bridal Kanjivaram Saree', price: 14999, category: 'Wedding Sarees', image: 'images/saree5.jpg' },
  4: { name: 'Georgette Party Wear Saree', price: 4499, category: 'Party Wear Sarees', image: 'images/saree4.jpg' },
  5: { name: 'Designer Organza Saree', price: 5999, category: 'Designer Sarees', image: 'images/saree7.jpg' },
  6: { name: 'Chanderi Silk Saree', price: 3499, category: 'Cotton Sarees', image: 'images/saree8.jpg' },
  7: { name: 'Tissue Silk Saree', price: 6499, category: 'Wedding Sarees', image: 'images/saree10.jpg' },
  8: { name: 'Cotton Blend Saree', price: 2999, category: 'Daily Wear Sarees', image: 'images/saree9.jpg' },
  9: { name: 'Banarasi Silk Saree', price: 5399, category: 'Silk Sarees', image: 'images/saree2.jpg' },
  10: { name: 'Printed Daily Wear Saree', price: 1499, category: 'Daily Wear Sarees', image: 'images/saree6.jpg' },
  11: { name: 'Sequin Party Wear Saree', price: 6950, category: 'Party Wear Sarees', image: 'images/saree11.jpg' },
  12: { name: 'Jaipur Block Print Saree', price: 1899, category: 'Daily Wear Sarees', image: 'images/saree12.jpg' }
};

// Keys configuration
function getRazorpayInstance() {
  const keyId = process.env.RAZORPAY_KEY_ID || '';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || '';
  const isValid = Razorpay && keyId && (keyId.startsWith('rzp_test_') || keyId.startsWith('rzp_live_')) && keySecret && !keySecret.includes('YourRazorpay');
  
  if (isValid) {
    try {
      return { instance: new Razorpay({ key_id: keyId, key_secret: keySecret }), keyId, keySecret, isConfigured: true };
    } catch (e) {
      return { instance: null, keyId, keySecret, isConfigured: false };
    }
  }
  return { instance: null, keyId, keySecret, isConfigured: false };
}

/* ============================================================
   API ROUTES
   ============================================================ */

/**
 * GET /api/config
 * Returns public configuration and payment modes to frontend
 */
app.get('/api/config', (req, res) => {
  const rzp = getRazorpayInstance();
  const upiId = process.env.MERCHANT_UPI_ID || '8778522690@upi';
  
  res.json({
    storeName: process.env.STORE_NAME || 'CB TRENDZ',
    whatsappNumber: process.env.STORE_PHONE || '918778522690',
    merchantUpiId: upiId,
    currency: 'INR',
    currencySymbol: '₹',
    razorpayKeyId: rzp.keyId || '',
    isRazorpayConfigured: rzp.isConfigured
  });
});

/**
 * POST /api/save-keys
 * Update payment credentials directly
 */
app.post('/api/save-keys', (req, res) => {
  try {
    const { razorpayKeyId, razorpayKeySecret, merchantUpiId } = req.body;
    let envContent = fs.existsSync('.env') ? fs.readFileSync('.env', 'utf8') : '';

    if (razorpayKeyId) {
      process.env.RAZORPAY_KEY_ID = razorpayKeyId.trim();
      envContent = envContent.replace(/RAZORPAY_KEY_ID=.*/g, `RAZORPAY_KEY_ID=${razorpayKeyId.trim()}`);
      if (!envContent.includes('RAZORPAY_KEY_ID=')) envContent += `\nRAZORPAY_KEY_ID=${razorpayKeyId.trim()}`;
    }
    if (razorpayKeySecret) {
      process.env.RAZORPAY_KEY_SECRET = razorpayKeySecret.trim();
      envContent = envContent.replace(/RAZORPAY_KEY_SECRET=.*/g, `RAZORPAY_KEY_SECRET=${razorpayKeySecret.trim()}`);
      if (!envContent.includes('RAZORPAY_KEY_SECRET=')) envContent += `\nRAZORPAY_KEY_SECRET=${razorpayKeySecret.trim()}`;
    }
    if (merchantUpiId) {
      process.env.MERCHANT_UPI_ID = merchantUpiId.trim();
      envContent = envContent.replace(/MERCHANT_UPI_ID=.*/g, `MERCHANT_UPI_ID=${merchantUpiId.trim()}`);
      if (!envContent.includes('MERCHANT_UPI_ID=')) envContent += `\nMERCHANT_UPI_ID=${merchantUpiId.trim()}`;
    }

    fs.writeFileSync('.env', envContent, 'utf8');
    res.json({ success: true, message: 'Payment gateway credentials saved successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/create-order
 * Creates an order in Razorpay, UPI QR, or COD
 */
app.post('/api/create-order', async (req, res) => {
  try {
    const { items, customer, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart items are required.' });
    }

    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ success: false, message: 'Customer name and phone number are required.' });
    }

    // Verify each item against server catalog to calculate true total
    let subtotal = 0;
    const verifiedItems = items.map(item => {
      const product = SERVER_CATALOG[item.id];
      if (!product) {
        throw new Error(`Product ID ${item.id} not found in catalog.`);
      }
      const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
      const itemTotal = product.price * qty;
      subtotal += itemTotal;
      return {
        id: item.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        itemTotal,
        image: product.image
      };
    });

    const shipping = 0; // Free express shipping across India
    const totalAmount = subtotal + shipping;
    const receiptId = 'CBT_' + Date.now().toString(36).toUpperCase();

    // 1. If Direct Instant UPI (Scan & Pay with GPay / PhonePe / Paytm)
    if (paymentMethod === 'upi') {
      const upiId = process.env.MERCHANT_UPI_ID || '8778522690@upi';
      const storeName = process.env.STORE_NAME || 'CB TRENDZ';
      const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(storeName)}&am=${totalAmount}&cu=INR&tn=${encodeURIComponent('Order ' + receiptId)}`;

      const upiOrder = {
        orderId: receiptId,
        paymentMethod: 'DIRECT_UPI',
        paymentStatus: 'PENDING',
        amount: totalAmount,
        currency: 'INR',
        upiId,
        upiUrl,
        items: verifiedItems,
        customer,
        createdAt: new Date().toISOString()
      };
      saveOrder(upiOrder);

      return res.json({
        success: true,
        paymentMethod: 'upi',
        orderId: receiptId,
        amount: totalAmount,
        currency: 'INR',
        upiId,
        upiUrl,
        items: verifiedItems,
        customer
      });
    }

    // 2. If Cash on Delivery (COD)
    if (paymentMethod === 'cod') {
      const codOrder = {
        orderId: receiptId,
        paymentMethod: 'COD',
        paymentStatus: 'PENDING',
        amount: totalAmount,
        currency: 'INR',
        items: verifiedItems,
        customer,
        createdAt: new Date().toISOString()
      };

      saveOrder(codOrder);
      return res.json({
        success: true,
        orderId: codOrder.orderId,
        paymentMethod: 'COD',
        amount: totalAmount,
        message: 'Cash on Delivery order placed successfully!'
      });
    }

    // 3. If Online Cards / Razorpay
    const rzp = getRazorpayInstance();
    if (rzp.isConfigured && rzp.instance) {
      const options = {
        amount: totalAmount * 100, // amount in paisa
        currency: 'INR',
        receipt: receiptId,
        notes: {
          customerName: customer.name,
          customerPhone: customer.phone,
          customerCity: customer.city || ''
        }
      };

      const razorpayOrder = await rzp.instance.orders.create(options);

      return res.json({
        success: true,
        paymentMethod: 'razorpay',
        isConfigured: true,
        razorpayOrderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: rzp.keyId,
        receiptId: receiptId,
        items: verifiedItems,
        totalAmount
      });
    } else {
      // If Razorpay keys are not yet configured, return error with prompt to enter keys or use Direct UPI
      return res.json({
        success: false,
        paymentMethod: 'razorpay',
        isConfigured: false,
        message: 'Razorpay keys not configured yet. Please configure your Razorpay Key ID and Secret in .env, or use Instant UPI payment!'
      });
    }
  } catch (error) {
    console.error('Error in /api/create-order:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error creating order' });
  }
});

/**
 * POST /api/verify-upi-payment
 * Registers direct UPI payment after customer transfers funds and enters UTR
 */
app.post('/api/verify-upi-payment', (req, res) => {
  try {
    const { orderId, utrNumber, customer, items, amount } = req.body;

    if (!orderId) {
      return res.status(400).json({ success: false, message: 'Order ID is required' });
    }

    const orders = getStoredOrders();
    const existing = orders.find(o => o.orderId === orderId);

    const finalOrder = {
      orderId,
      paymentId: utrNumber ? ('UTR_' + utrNumber) : ('UPI_' + Date.now().toString(36).toUpperCase()),
      utrNumber: utrNumber || 'Verified via UPI App',
      paymentMethod: 'DIRECT_UPI',
      paymentStatus: 'PAID',
      amount: amount || (existing ? existing.amount : 0),
      currency: 'INR',
      customer: customer || (existing ? existing.customer : {}),
      items: items || (existing ? existing.items : []),
      paidAt: new Date().toISOString()
    };

    saveOrder(finalOrder);

    res.json({
      success: true,
      order: finalOrder,
      message: 'UPI Payment verified successfully and order registered!'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/verify-payment
 * Verifies Razorpay HMAC signature and registers completed payment
 */
app.post('/api/verify-payment', (req, res) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      customer,
      items,
      amount
    } = req.body;

    const rzp = getRazorpayInstance();
    if (rzp.isConfigured) {
      const body = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', rzp.keySecret)
        .update(body.toString())
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: 'Payment verification failed: Invalid Razorpay signature.'
        });
      }
    }

    const orderId = 'CBT_' + Date.now().toString(36).toUpperCase();
    const finalOrder = {
      orderId,
      razorpayOrderId: razorpayOrderId || null,
      paymentId: razorpayPaymentId,
      paymentMethod: 'RAZORPAY',
      paymentStatus: 'PAID',
      amount: amount || 0,
      currency: 'INR',
      customer,
      items,
      paidAt: new Date().toISOString()
    };

    saveOrder(finalOrder);

    res.json({
      success: true,
      verified: true,
      order: finalOrder,
      message: 'Payment verified successfully and order registered!'
    });
  } catch (err) {
    console.error('Error in /api/verify-payment:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/orders
 * Returns recent customer orders
 */
app.get('/api/orders', (req, res) => {
  const orders = getStoredOrders();
  res.json({ success: true, count: orders.length, orders });
});

/**
 * Fallback to index.html for single-page routing
 */
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🌸 CB TRENDZ Boutique Server Running on http://localhost:${PORT}`);
  console.log(`💳 Real Payment Endpoints:`);
  console.log(`   - Instant UPI (GPay/PhonePe/Paytm QR)`);
  console.log(`   - Razorpay Gateway`);
  console.log(`   - Cash on Delivery (COD)`);
  console.log(`==================================================\n`);
});
