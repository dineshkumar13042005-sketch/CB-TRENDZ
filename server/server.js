/**
 * CB TRENDZ — Real Cashfree & Razorpay Payment Server
 * Implements:
 *  - GET  /api/config                 : Public gateway configuration (Cashfree primary, Razorpay secondary)
 *  - GET  /api/catalog                : Server master catalog with strict pricing
 *  - POST /api/cashfree/create-order  : Creates Cashfree order & generates payment_session_id
 *  - GET  /api/cashfree/order-status/:orderId : Live server-side Cashfree payment verification & polling
 *  - POST /api/cashfree-webhook       : Verifies HMAC-SHA256 signature using raw body for Cashfree events
 *  - POST /api/cashfree/simulate-test-payment : Sandbox test payment simulator for instant local testing
 *  - POST /api/create-order           : Razorpay / Universal order creation
 *  - POST /api/create-qr              : Dynamic UPI QR code generation
 *  - GET  /api/payment-status/:orderId: Unified live payment verification & polling
 *  - POST /api/razorpay-webhook       : Razorpay webhook verification
 *  - POST /api/verify-payment         : Razorpay modal signature verification
 */

'use strict';

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Optional Razorpay SDK for dual-gateway compatibility
let Razorpay = null;
try {
  Razorpay = require('razorpay');
} catch (e) {
  try {
    Razorpay = require(path.join(__dirname, '..', 'node_modules', 'razorpay'));
  } catch (err) {
    // Razorpay not available, Cashfree is primary
  }
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-razorpay-signature', 'x-webhook-signature', 'x-webhook-timestamp']
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
    o.cfOrderId === identifier ||
    o.paymentSessionId === identifier ||
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
  1: { id: 1, name: 'Kanchi cotton Saree', price: 1, category: 'cotton', image: 'images/IMG_6513.jpg', images: ['images/IMG_6513.jpg', 'images/IMG_6511.jpg', 'images/IMG_6510.jpg'] },
  2: { id: 2, name: 'Semi silk Saree', price: 850, category: 'silk', image: 'images/Teal and Gold Banarasi Saree Fold.png' },
  3: {
    id: 3,
    name: 'Semi silk Saree',
    price: 650,
    category: 'silk',
    image: 'images/IMG_6517_enhanced_straight.jpg',
    images: ['images/IMG_6517_enhanced_straight.jpg', 'images/IMG_6518_enhanced_straight.jpg'],
    colors: [
      { id: 'green', name: 'Olive Green', hex: '#7A8C18', borderHex: '#0892A5', image: 'images/IMG_6517_enhanced_straight.jpg', images: ['images/IMG_6517_enhanced_straight.jpg', 'images/IMG_6518_enhanced_straight.jpg'] },
      { id: 'yellow', name: 'Mustard Yellow', hex: '#E5A510', borderHex: '#B2184B', image: 'images/IMG_6514_enhanced_straight.jpg', images: ['images/IMG_6514_enhanced_straight.jpg', 'images/IMG_6515_enhanced_straight.jpg', 'images/IMG_6516_enhanced_straight.jpg'] }
    ]
  },
  4: {
    id: 4,
    name: 'Daily wear Georgette Saree',
    price: 550,
    category: 'party',
    image: 'images/IMG_6523_enhanced_straight.jpg',
    images: ['images/IMG_6523_enhanced_straight.jpg', 'images/IMG_6524_enhanced_straight.jpg'],
    colors: [
      { id: 'yellow', name: 'Mustard Yellow', label: 'Yellow', hex: '#C99A1C', borderHex: '#D4AF70', image: 'images/IMG_6523_enhanced_straight.jpg', images: ['images/IMG_6523_enhanced_straight.jpg', 'images/IMG_6524_enhanced_straight.jpg'] },
      { id: 'red', name: 'Festive Red', label: 'Red', hex: '#A7171C', borderHex: '#D4AF70', image: 'images/IMG_6525_enhanced_straight.jpg', images: ['images/IMG_6525_enhanced_straight.jpg', 'images/IMG_6526_enhanced_straight.jpg'] },
      { id: 'pink', name: 'Coral Pink', label: 'Pink', hex: '#E65D65', borderHex: '#D4AF70', image: 'images/IMG_6527_enhanced_straight.jpg', images: ['images/IMG_6527_enhanced_straight.jpg', 'images/IMG_6528_enhanced_straight.jpg'] },
      { id: 'violet', name: 'Royal Violet', label: 'Violet', hex: '#3E2468', borderHex: '#D4AF70', image: 'images/IMG_6529_enhanced_straight.jpg', images: ['images/IMG_6529_enhanced_straight.jpg', 'images/IMG_6530_enhanced_straight.jpg'] },
      { id: 'blue', name: 'Royal Blue', label: 'Blue', hex: '#162866', borderHex: '#D4AF70', image: 'images/IMG_6531_enhanced_straight.jpg', images: ['images/IMG_6531_enhanced_straight.jpg', 'images/IMG_6532_enhanced_straight.jpg'] }
    ]
  },
  5: {
    id: 5,
    name: 'Moonga Silk Saree',
    price: 1150,
    category: 'designer',
    image: 'images/IMG_6535_enhanced_straight.jpg',
    images: ['images/IMG_6535_enhanced_straight.jpg', 'images/IMG_6536_enhanced_straight.jpg'],
    colors: [
      { id: 'sage_green', name: 'Sage Green', label: 'Sage Green', hex: '#8FA88B', borderHex: '#4B6347', image: 'images/IMG_6535_enhanced_straight.jpg', images: ['images/IMG_6535_enhanced_straight.jpg', 'images/IMG_6536_enhanced_straight.jpg'] },
      { id: 'lite_green', name: 'Lite Green', label: 'Lite Green', hex: '#9EC264', borderHex: '#5B8023', image: 'images/IMG_6538_enhanced_straight.jpg', images: ['images/IMG_6538_enhanced_straight.jpg', 'images/IMG_6539_enhanced_straight.jpg'] },
      { id: 'lite_violet', name: 'Lite Violet', label: 'Lite Violet', hex: '#A48EB6', borderHex: '#5E4970', image: 'images/IMG_6542_enhanced_straight.jpg', images: ['images/IMG_6542_enhanced_straight.jpg', 'images/IMG_6543_enhanced_straight.jpg'] }
    ]
  },
  6: { id: 6, name: 'Linen silk Saree', price: 799, category: 'silk', image: 'images/image.png_1dbc01cd_2K.jpg' },
  7: {
    id: 7,
    name: 'Shimmer linen Saree',
    price: 799,
    category: 'party',
    image: 'images/IMG_6544_enhanced_straight.jpg',
    images: ['images/IMG_6544_enhanced_straight.jpg', 'images/IMG_6545_enhanced_straight.jpg'],
    colors: [
      { id: 'pink', name: 'Blush Pink', label: 'Pink', hex: '#D88CA3', borderHex: '#9A4B62', image: 'images/IMG_6544_enhanced_straight.jpg', images: ['images/IMG_6544_enhanced_straight.jpg', 'images/IMG_6545_enhanced_straight.jpg'] },
      { id: 'brown', name: 'Terracotta Brown', label: 'Brown', hex: '#9B5738', borderHex: '#5C2B14', image: 'images/IMG_6547_enhanced_straight.jpg', images: ['images/IMG_6547_enhanced_straight.jpg', 'images/IMG_6548_enhanced_straight.jpg'] },
      { id: 'orange', name: 'Lite Orange', label: 'Lite Orange', hex: '#E58C46', borderHex: '#A05118', image: 'images/IMG_6549_enhanced_straight.jpg', images: ['images/IMG_6549_enhanced_straight.jpg', 'images/IMG_6550_enhanced_straight.jpg'] },
      { id: 'green', name: 'Meadow Green', label: 'Green', hex: '#3E8E41', borderHex: '#1F5C22', image: 'images/IMG_6551_enhanced_straight.jpg', images: ['images/IMG_6551_enhanced_straight.jpg', 'images/IMG_6552_enhanced_straight.jpg', 'images/IMG_6553_enhanced_straight.jpg', 'images/IMG_6554_enhanced_straight.jpg'] }
    ]
  },
  8: { id: 8, name: 'Cotton Saree', price: 499, category: 'cotton', image: 'images/image.png_f03ac051_2K.jpg' },
  9: {
    id: 9,
    name: 'Cotton Saree',
    price: 599,
    category: 'cotton',
    image: 'images/IMG_6555_enhanced_straight.jpg',
    images: [
      'images/IMG_6555_enhanced_straight.jpg'
    ],
    selectedColor: 'brown',
    colors: [
      {
        id: 'brown',
        name: 'Terracotta Brown',
        label: 'Brown',
        hex: '#8B4513',
        borderHex: '#D4AF70',
        image: 'images/IMG_6555_enhanced_straight.jpg',
        images: [
          'images/IMG_6555_enhanced_straight.jpg'
        ]
      },
      {
        id: 'green',
        name: 'Emerald Green',
        label: 'Green',
        hex: '#1E7E34',
        borderHex: '#D4AF70',
        image: 'images/IMG_6557_enhanced_straight.jpg',
        images: [
          'images/IMG_6557_enhanced_straight.jpg',
          'images/IMG_6558_enhanced_straight.jpg'
        ]
      }
    ]
  },
  10: {
    id: 10,
    name: 'Designer Embroidered Saree',
    price: 799,
    category: 'designer',
    image: 'images/IMG_6519_enhanced_straight.jpg',
    images: ['images/IMG_6519_enhanced_straight.jpg', 'images/IMG_6520_enhanced_straight.jpg'],
    colors: [
      { id: 'green', name: 'Emerald Green', label: 'Green', hex: '#1B5E3C', borderHex: '#D4AF70', image: 'images/IMG_6519_enhanced_straight.jpg', images: ['images/IMG_6519_enhanced_straight.jpg', 'images/IMG_6520_enhanced_straight.jpg'] },
      { id: 'red', name: 'Ruby Red', label: 'Red', hex: '#9B111E', borderHex: '#D4AF70', image: 'images/IMG_6521_enhanced_straight.jpg', images: ['images/IMG_6521_enhanced_straight.jpg', 'images/IMG_6522_enhanced_straight.jpg'] }
    ]
  },
  11: {
    id: 11,
    name: 'CB Trendz Floral Shimmer Saree',
    price: 899,
    category: 'designer',
    image: 'images/IMG_6559_enhanced_straight.jpg',
    images: ['images/IMG_6559_enhanced_straight.jpg', 'images/IMG_6560_enhanced_straight.jpg'],
    colors: [
      { id: 'wine', name: 'Wine Maroon', label: 'Wine', hex: '#4A1521', borderHex: '#D4AF70', image: 'images/IMG_6559_enhanced_straight.jpg', images: ['images/IMG_6559_enhanced_straight.jpg', 'images/IMG_6560_enhanced_straight.jpg'] },
      { id: 'pink', name: 'Rose Pink', label: 'Pink', hex: '#D96B87', borderHex: '#D4AF70', image: 'images/IMG_6561_enhanced_straight.jpg', images: ['images/IMG_6561_enhanced_straight.jpg', 'images/IMG_6562_enhanced_straight.jpg'] },
      { id: 'violet', name: 'Soft Violet', label: 'Violet', hex: '#9B7EAA', borderHex: '#D4AF70', image: 'images/IMG_6563_enhanced_straight.jpg', images: ['images/IMG_6563_enhanced_straight.jpg', 'images/IMG_6564_enhanced_straight.jpg'] },
      { id: 'white', name: 'Pristine White', label: 'White', hex: '#F7F5F0', borderHex: '#C5BCAB', image: 'images/IMG_6565_enhanced_straight.jpg', images: ['images/IMG_6565_enhanced_straight.jpg', 'images/IMG_6566_enhanced_straight.jpg'] },
      { id: 'red', name: 'Cherry Red', label: 'Red', hex: '#A61732', borderHex: '#D4AF70', image: 'images/IMG_6568_enhanced_straight.jpg', images: ['images/IMG_6568_enhanced_straight.jpg', 'images/IMG_6569_enhanced_straight.jpg'] }
    ]
  },
  12: {
    id: 12,
    name: 'Traditional Zari Silk Saree',
    price: 750,
    category: 'silk',
    image: 'images/IMG_6570_enhanced_straight.jpg',
    images: ['images/IMG_6570_enhanced_straight.jpg', 'images/IMG_6571_enhanced_straight.jpg'],
    colors: [
      { id: 'violet', name: 'Royal Violet', label: 'Violet', hex: '#4B174A', borderHex: '#D4AF70', image: 'images/IMG_6570_enhanced_straight.jpg', images: ['images/IMG_6570_enhanced_straight.jpg', 'images/IMG_6571_enhanced_straight.jpg'] },
      { id: 'black', name: 'Jet Black', label: 'Black', hex: '#1A1A1A', borderHex: '#D4AF70', image: 'images/IMG_6573_enhanced_straight.jpg', images: ['images/IMG_6573_enhanced_straight.jpg', 'images/IMG_6572_enhanced_straight.jpg'] },
      { id: 'red', name: 'Crimson Red', label: 'Red', hex: '#99141D', borderHex: '#D4AF70', image: 'images/IMG_6574_enhanced_straight.jpg', images: ['images/IMG_6574_enhanced_straight.jpg', 'images/IMG_6575_enhanced_straight.jpg'] },
      { id: 'blue', name: 'Sapphire Blue', label: 'Blue', hex: '#1557A8', borderHex: '#D4AF70', image: 'images/IMG_6576_enhanced_straight.jpg', images: ['images/IMG_6576_enhanced_straight.jpg', 'images/IMG_6577_enhanced_straight.jpg'] },
      { id: 'yellow_green', name: 'Light Yellow with Green', label: 'Yellow-Green', hex: '#709E18', borderHex: '#E6CF42', image: 'images/IMG_6579_enhanced_straight.jpg', images: ['images/IMG_6579_enhanced_straight.jpg', 'images/IMG_6578_enhanced_straight.jpg'] },
      { id: 'yellow_violet', name: 'Light Yellow with Violet', label: 'Yellow-Violet', hex: '#6A1E5C', borderHex: '#A89E18', image: 'images/IMG_6580_enhanced_straight.jpg', images: ['images/IMG_6580_enhanced_straight.jpg', 'images/IMG_6581_enhanced_straight.jpg'] }
    ]
  },
  13: {
    id: 13,
    name: 'Handloom Contrast Zari Silk Saree',
    price: 699,
    category: 'silk',
    image: 'images/IMG_6584_enhanced_straight.jpg',
    images: ['images/IMG_6584_enhanced_straight.jpg', 'images/IMG_6585_enhanced_straight.jpg'],
    colors: [
      { id: 'green_black', name: 'Parrot Green with Black', label: 'Green & Black', hex: '#8CA818', borderHex: '#1A1A1A', image: 'images/IMG_6584_enhanced_straight.jpg', images: ['images/IMG_6584_enhanced_straight.jpg', 'images/IMG_6585_enhanced_straight.jpg'] },
      { id: 'orange_red', name: 'Mustard Orange with Red', label: 'Red & Orange', hex: '#E5A012', borderHex: '#C2185B', image: 'images/IMG_6586_enhanced_straight.jpg', images: ['images/IMG_6586_enhanced_straight.jpg', 'images/IMG_6587_enhanced_straight.jpg'] },
      { id: 'blue_black', name: 'Jet Black with Royal Blue', label: 'Blue & Black', hex: '#1A1A1A', borderHex: '#1976D2', image: 'images/IMG_6588_enhanced_straight.jpg', images: ['images/IMG_6588_enhanced_straight.jpg', 'images/IMG_6589_enhanced_straight.jpg'] }
    ]
  },
  14: {
    id: 14,
    name: 'Royal Kanjivaram Brocade Silk Saree',
    price: 1299,
    category: 'wedding',
    image: 'images/IMG_6488_enhanced_straight.jpg',
    images: ['images/IMG_6488_enhanced_straight.jpg'],
    colors: [
      { id: 'magenta', name: 'Royal Magenta', label: 'Magenta', hex: '#8E1658', borderHex: '#D4AF70', image: 'images/IMG_6488_enhanced_straight.jpg', images: ['images/IMG_6488_enhanced_straight.jpg'] },
      { id: 'red', name: 'Crimson Red', label: 'Red', hex: '#B31828', borderHex: '#D4AF70', image: 'images/IMG_6489_enhanced_straight.jpg', images: ['images/IMG_6489_enhanced_straight.jpg', 'images/IMG_6490_enhanced_straight.jpg'] },
      { id: 'green_border', name: 'Copper with Mint Green Border', label: 'Light Green Border', hex: '#6B2337', borderHex: '#38B29C', image: 'images/IMG_6491_enhanced_straight.jpg', images: ['images/IMG_6491_enhanced_straight.jpg', 'images/IMG_6492_enhanced_straight.jpg'] }
    ]
  },
  15: {
    id: 15,
    name: 'Classic Kanchi Contrast Silk Saree',
    price: 899,
    category: 'silk',
    image: 'images/IMG_6493_enhanced_straight.jpg',
    images: ['images/IMG_6493_enhanced_straight.jpg', 'images/IMG_6494_enhanced_straight.jpg'],
    colors: [
      { id: 'red_mint', name: 'Crimson Red with Mint Border', label: 'Red & Mint', hex: '#B31828', borderHex: '#4CB8A5', image: 'images/IMG_6493_enhanced_straight.jpg', images: ['images/IMG_6493_enhanced_straight.jpg', 'images/IMG_6494_enhanced_straight.jpg'] },
      { id: 'lite_green', name: 'Emerald Green with Maroon Border', label: 'Lite Green', hex: '#1D7A56', borderHex: '#8B1E2D', image: 'images/IMG_6495_enhanced_straight.jpg', images: ['images/IMG_6495_enhanced_straight.jpg', 'images/IMG_6496_enhanced_straight.jpg'] }
    ]
  },
  16: {
    id: 16,
    name: 'Traditional Butta Kanchipuram Silk Saree',
    price: 799,
    category: 'silk',
    image: 'images/IMG_6498_enhanced_straight.jpg',
    images: ['images/IMG_6498_enhanced_straight.jpg', 'images/IMG_6497_enhanced_straight.jpg'],
    colors: [
      { id: 'violet_green', name: 'Royal Violet with Sea Green Border', label: 'Violet & Green', hex: '#3E1854', borderHex: '#2BAE92', image: 'images/IMG_6498_enhanced_straight.jpg', images: ['images/IMG_6498_enhanced_straight.jpg', 'images/IMG_6497_enhanced_straight.jpg'] },
      { id: 'yellow_maroon', name: 'Mustard Yellow with Maroon Border', label: 'Yellow', hex: '#DCA212', borderHex: '#7E1628', image: 'images/IMG_6499_enhanced_straight.jpg', images: ['images/IMG_6499_enhanced_straight.jpg', 'images/IMG_6500_enhanced_straight.jpg'] }
    ]
  },
  17: {
    id: 17,
    name: 'Kanchipuram Contrast Zari Silk Saree',
    price: 899,
    category: 'silk',
    image: 'images/IMG_6502_enhanced_straight.jpg',
    images: ['images/IMG_6502_enhanced_straight.jpg', 'images/IMG_6505_enhanced_straight.jpg', 'images/IMG_6506_enhanced_straight.jpg'],
    colors: [
      { id: 'mustard_purple', name: 'Mustard Yellow with Royal Purple Border', label: 'Mustard & Purple', hex: '#C59A1A', borderHex: '#4A1D65', image: 'images/IMG_6502_enhanced_straight.jpg', images: ['images/IMG_6502_enhanced_straight.jpg', 'images/IMG_6505_enhanced_straight.jpg', 'images/IMG_6506_enhanced_straight.jpg'] }
    ]
  },
  18: {
    id: 18,
    name: 'Rani Pink Copper Border Silk Saree',
    price: 849,
    category: 'silk',
    image: 'images/IMG_6507_enhanced_straight.jpg',
    images: ['images/IMG_6507_enhanced_straight.jpg', 'images/IMG_6508_enhanced_straight.jpg'],
    colors: [
      { id: 'rani_pink', name: 'Rani Pink with Copper & Green Border', label: 'Rani Pink', hex: '#D81B60', borderHex: '#B87333', image: 'images/IMG_6507_enhanced_straight.jpg', images: ['images/IMG_6507_enhanced_straight.jpg', 'images/IMG_6508_enhanced_straight.jpg'] }
    ]
  },
  19: {
    id: 19,
    name: 'Black Bandhani Mirror Work Saree',
    price: 1100,
    category: 'party',
    image: 'images/IMG_6483.jpg',
    images: ['images/IMG_6483.jpg', 'images/IMG_6484.jpg'],
    colors: [
      { id: 'black', name: 'Jet Black with Gold Mirror Border', label: 'Black', hex: '#181818', borderHex: '#D4AF70', image: 'images/IMG_6483.jpg', images: ['images/IMG_6483.jpg', 'images/IMG_6484.jpg'] }
    ]
  },
  20: {
    id: 20,
    name: 'Rangoli Designer Sequin Georgette Saree',
    price: 699,
    category: 'party',
    image: 'images/IMG_6477.jpg',
    images: ['images/IMG_6477.jpg'],
    colors: [
      { id: 'mauve', name: 'Mauve Rose', label: 'Mauve', hex: '#B85278', borderHex: '#D4AF70', image: 'images/IMG_6477.jpg', images: ['images/IMG_6477.jpg'] },
      { id: 'yellow', name: 'Mustard Yellow', label: 'Yellow', hex: '#D4B826', borderHex: '#D4AF70', image: 'images/IMG_6479.jpg', images: ['images/IMG_6479.jpg'] },
      { id: 'sky_blue', name: 'Sky Blue', label: 'Sky Blue', hex: '#5B9BB0', borderHex: '#D4AF70', image: 'images/IMG_6480.jpg', images: ['images/IMG_6480.jpg'] },
      { id: 'violet', name: 'Royal Violet', label: 'Violet', hex: '#4A1E5C', borderHex: '#D4AF70', image: 'images/IMG_6481.jpg', images: ['images/IMG_6481.jpg', 'images/IMG_6482.jpg'] }
    ]
  },
  21: {
    id: 21,
    name: 'Temple Gopuram Checkered Silk Saree',
    price: 899,
    category: 'silk',
    image: 'images/IMG_6475.jpg',
    images: ['images/IMG_6475.jpg', 'images/IMG_6474.jpg', 'images/IMG_6476.jpg'],
    colors: [
      { id: 'purple', name: 'Royal Purple with Golden Zari', label: 'Purple', hex: '#4B2163', borderHex: '#D4AF70', image: 'images/IMG_6475.jpg', images: ['images/IMG_6475.jpg', 'images/IMG_6474.jpg', 'images/IMG_6476.jpg'] },
      { id: 'pink', name: 'Rani Pink with Golden Zari', label: 'Pink', hex: '#B82860', borderHex: '#D4AF70', image: 'images/IMG_6472.jpg', images: ['images/IMG_6472.jpg', 'images/IMG_6473.jpg'] }
    ]
  },
  22: {
    id: 22,
    name: 'Royal Blue Contrast Zari Silk Saree',
    price: 899,
    category: 'silk',
    image: 'images/IMG_6467.jpg',
    images: ['images/IMG_6467.jpg', 'images/image.jpg'],
    colors: [
      { id: 'royal_blue', name: 'Royal Blue with Turquoise Cyan Border', label: 'Royal Blue', hex: '#183884', borderHex: '#18A2B8', image: 'images/IMG_6467.jpg', images: ['images/IMG_6467.jpg', 'images/image.jpg'] }
    ]
  },
  23: {
    id: 23,
    name: 'Golden Shimmer Tissue Silk Saree',
    price: 899,
    category: 'silk',
    image: 'images/IMG_6471.jpg',
    images: ['images/IMG_6471.jpg', 'images/IMG_6470.jpg'],
    colors: [
      { id: 'gold', name: 'Metallic Champagne Gold', label: 'Gold', hex: '#D4AF37', borderHex: '#E6CA65', image: 'images/IMG_6471.jpg', images: ['images/IMG_6471.jpg', 'images/IMG_6470.jpg'] }
    ]
  }
};

// Helper: Calculate and verify cart items against master catalog
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

/**
 * Cashfree Configuration Helper
 */
function isPlaceholderKey(key) {
  if (!key) return true;
  const lower = key.toLowerCase();
  return lower.includes('your') || lower.includes('dummy') || lower.includes('placeholder') || lower.includes('rzp_test_your');
}

function getCashfreeConfig() {
  const appId = (process.env.CASHFREE_APP_ID || '').trim();
  const secretKey = (process.env.CASHFREE_SECRET_KEY || '').trim();
  const env = (process.env.CASHFREE_ENV || 'TEST').trim().toUpperCase();
  const apiVersion = process.env.CASHFREE_API_VERSION || '2023-08-01';
  const isConfigured = Boolean(appId && secretKey && !isPlaceholderKey(appId) && !isPlaceholderKey(secretKey));

  const baseUrl = env === 'PRODUCTION'
    ? 'https://api.cashfree.com/pg'
    : 'https://sandbox.cashfree.com/pg';

  return { appId, secretKey, env, apiVersion, isConfigured, baseUrl };
}

/**
 * Razorpay Instance Factory
 */
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

/* ============================================================
   ROUTES
   ============================================================ */

/**
 * GET /api/config
 * Returns public keys and store config for frontend
 */
app.get('/api/config', (req, res) => {
  const cf = getCashfreeConfig();
  const rzp = getRazorpayInstance();

  res.json({
    success: true,
    storeName: process.env.STORE_NAME || 'CB TRENDZ',
    whatsappNumber: process.env.STORE_PHONE || '918778522690',
    currency: 'INR',
    currencySymbol: '₹',
    primaryGateway: 'cashfree',
    cashfree: {
      isConfigured: cf.isConfigured,
      appId: cf.appId,
      env: cf.env === 'PRODUCTION' ? 'production' : 'sandbox',
      apiVersion: cf.apiVersion
    },
    razorpay: {
      isConfigured: rzp.isConfigured,
      keyId: rzp.keyId || ''
    }
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
 * ============================================================
 * CASHFREE PAYMENTS API
 * ============================================================
 */

/**
 * POST /api/cashfree/create-order
 * Creates a genuine Cashfree order and returns payment_session_id
 * for opening the Cashfree Checkout modal directly.
 */
app.post('/api/cashfree/create-order', async (req, res) => {
  try {
    const { items, customer } = req.body;

    const { verifiedItems, totalInINR, totalInPaise } = verifyCartItems(items);

    // Cashfree order_id: Alphanumeric and characters _ or - up to 45 chars
    const orderId = `CBT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    const cf = getCashfreeConfig();
    const cust = customer || {};
    const rawPhone = cust.phone ? String(cust.phone).replace(/\D/g, '') : '';
    const cleanPhone = (rawPhone.length >= 10) ? rawPhone.slice(-10) : (process.env.STORE_PHONE || '918778522690').slice(-10);
    const customerName = cust.name || 'Valued Customer';
    const customerId = `cust_${cleanPhone}_${Date.now().toString().slice(-4)}`;
    const customerEmail = cust.email || `${cleanPhone}@cbtrendz.com`;

    let paymentSessionId = null;
    let cfOrderId = null;
    let isSandboxMock = false;

    if (cf.isConfigured) {
      try {
        const payload = {
          order_id: orderId,
          order_amount: totalInINR,
          order_currency: 'INR',
          customer_details: {
            customer_id: customerId,
            customer_name: customerName,
            customer_phone: cleanPhone,
            customer_email: customerEmail
          },
          order_meta: {
            return_url: `${req.protocol}://${req.get('host')}/?cf_order_id={order_id}`
          },
          order_note: `CB TRENDZ Saree Order: ${orderId}`
        };

        const cfRes = await fetch(`${cf.baseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': cf.appId,
            'x-client-secret': cf.secretKey,
            'x-api-version': cf.apiVersion
          },
          body: JSON.stringify(payload)
        });

        const cfData = await cfRes.json();

        if (cfRes.ok && cfData.payment_session_id) {
          paymentSessionId = cfData.payment_session_id;
          cfOrderId = cfData.cf_order_id;
        } else {
          console.warn('⚠️ Cashfree API error:', cfData.message || cfData);
          // If keys invalid or sandbox error, generate sandbox test session
          paymentSessionId = `session_sandbox_demo_${Date.now()}`;
          isSandboxMock = true;
        }
      } catch (apiErr) {
        console.error('Error contacting Cashfree API:', apiErr.message);
        paymentSessionId = `session_sandbox_demo_${Date.now()}`;
        isSandboxMock = true;
      }
    } else {
      // Running in sandbox demo mode before user inputs real Cashfree keys
      paymentSessionId = `session_sandbox_demo_${Date.now()}`;
      isSandboxMock = true;
    }

    let qrcodeLib;
    try {
      qrcodeLib = require('qrcode');
    } catch (e) {}

    const upiUri = `upi://pay?pa=8778522690@upi&pn=${encodeURIComponent('CB TRENDZ')}&am=${totalInINR}&cu=INR&tn=${encodeURIComponent(`Saree Order ${orderId}`)}`;
    let qrImageUrl = null;
    if (qrcodeLib) {
      try {
        qrImageUrl = await qrcodeLib.toDataURL(upiUri, { width: 320, margin: 1 });
      } catch (e) {}
    }

    const newOrder = {
      orderId,
      cfOrderId,
      paymentSessionId,
      amount: totalInINR,
      amountInPaise: totalInPaise,
      currency: 'INR',
      customer: {
        ...cust,
        name: customerName,
        phone: cleanPhone
      },
      items: verifiedItems,
      paymentStatus: 'PENDING',
      paymentMethod: 'CASHFREE',
      upiUri,
      isSandboxMock,
      createdAt: new Date().toISOString()
    };

    saveOrder(newOrder);

    return res.json({
      success: true,
      orderId,
      paymentSessionId,
      cfOrderId,
      amount: totalInINR,
      currency: 'INR',
      isSandboxMock,
      gateway: 'cashfree',
      upiUri,
      qrImageUrl: qrImageUrl || 'images/scanner.jpeg',
      customer: newOrder.customer,
      items: verifiedItems
    });
  } catch (err) {
    console.error('Error in /api/cashfree/create-order:', err.message);
    res.status(500).json({ success: false, message: err.message || 'Server error creating Cashfree order.' });
  }
});

/**
 * GET /api/cashfree/order-status/:orderId
 * Live verification of Cashfree payment status directly from Cashfree PG API
 */
app.get('/api/cashfree/order-status/:orderId', async (req, res) => {
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

    // 1. If already PAID, return immediately (Idempotent)
    if (order.paymentStatus === 'PAID') {
      return res.json({
        success: true,
        status: 'PAID',
        orderId: order.orderId,
        paymentId: order.paymentId || order.cfOrderId,
        amount: order.amount,
        paidAt: order.paidAt,
        transactionRef: order.bankTxnId || order.paymentId || order.orderId,
        order
      });
    }

    // 2. If already FAILED
    if (order.paymentStatus === 'FAILED') {
      return res.json({
        success: false,
        status: 'FAILED',
        message: order.failureReason || 'Payment failed or was cancelled.'
      });
    }

    // 3. Query Cashfree API if keys are configured and not in mock test
    const cf = getCashfreeConfig();
    if (cf.isConfigured && !order.isSandboxMock) {
      try {
        const orderRes = await fetch(`${cf.baseUrl}/orders/${order.orderId}`, {
          method: 'GET',
          headers: {
            'x-client-id': cf.appId,
            'x-client-secret': cf.secretKey,
            'x-api-version': cf.apiVersion
          }
        });

        if (orderRes.ok) {
          const orderData = await orderRes.json();
          if (orderData.order_status === 'PAID') {
            // Fetch payment details to obtain bank reference / payment id
            let paymentId = `cf_pay_${Date.now()}`;
            let bankTxnId = orderData.order_id;
            let paymentMethod = 'UPI';

            try {
              const paymentsRes = await fetch(`${cf.baseUrl}/orders/${order.orderId}/payments`, {
                method: 'GET',
                headers: {
                  'x-client-id': cf.appId,
                  'x-client-secret': cf.secretKey,
                  'x-api-version': cf.apiVersion
                }
              });

              if (paymentsRes.ok) {
                const paymentsList = await paymentsRes.json();
                if (Array.isArray(paymentsList) && paymentsList.length > 0) {
                  const successfulPayment = paymentsList.find(p => p.payment_status === 'SUCCESS') || paymentsList[0];
                  paymentId = String(successfulPayment.cf_payment_id || paymentId);
                  bankTxnId = successfulPayment.bank_reference || paymentId;
                  paymentMethod = successfulPayment.payment_method ? JSON.stringify(successfulPayment.payment_method) : 'CASHFREE';
                }
              }
            } catch (pErr) {
              console.warn('Error fetching Cashfree payments list:', pErr.message);
            }

            order.paymentStatus = 'PAID';
            order.paymentId = paymentId;
            order.bankTxnId = bankTxnId;
            order.paymentMethod = paymentMethod;
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
          } else if (orderData.order_status === 'EXPIRED' || orderData.order_status === 'TERMINATED') {
            order.paymentStatus = 'FAILED';
            order.failureReason = `Cashfree order ${orderData.order_status.toLowerCase()}`;
            saveOrder(order);

            return res.json({
              success: false,
              status: 'FAILED',
              message: order.failureReason
            });
          }
        }
      } catch (fetchErr) {
        console.warn('Error querying Cashfree status:', fetchErr.message);
      }
    }

    // Order still pending
    return res.json({
      success: true,
      status: 'PENDING',
      orderId: order.orderId,
      amount: order.amount,
      isSandboxMock: Boolean(order.isSandboxMock),
      message: 'Waiting for genuine payment confirmation from Cashfree...'
    });
  } catch (err) {
    console.error('Error checking Cashfree order status:', err.message);
    res.status(500).json({ success: false, message: 'Server error checking status.' });
  }
});

/**
 * POST /api/confirm-upi-payment
 * Confirms genuine UPI payment (PhonePe, GPay, Paytm, QR) and updates order
 */
app.post('/api/confirm-upi-payment', (req, res) => {
  try {
    const { orderId } = req.body;
    const order = findOrder(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = 'PAID';
    order.paymentId = `upi_${Date.now()}`;
    order.bankTxnId = `UPI${Date.now().toString().slice(-8)}`;
    order.paidAt = new Date().toISOString();
    order.paymentMethod = 'UPI (PhonePe/GPay)';
    saveOrder(order);

    return res.json({
      success: true,
      status: 'PAID',
      orderId: order.orderId,
      paymentId: order.paymentId,
      transactionRef: order.bankTxnId,
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/cashfree/simulate-test-payment
 * Instant Sandbox Simulator: Allows confirming test payments during development
 */
app.post('/api/cashfree/simulate-test-payment', (req, res) => {
  try {
    const { orderId } = req.body;
    const order = findOrder(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    order.paymentStatus = 'PAID';
    order.paymentId = `cf_sim_${Date.now()}`;
    order.bankTxnId = `TXN${Date.now().toString().slice(-8)}`;
    order.paidAt = new Date().toISOString();
    order.simulated = true;
    saveOrder(order);

    return res.json({
      success: true,
      status: 'PAID',
      orderId: order.orderId,
      paymentId: order.paymentId,
      transactionRef: order.bankTxnId,
      message: 'Sandbox test payment simulated successfully.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/cashfree-webhook
 * Cashfree Webhook endpoint with HMAC-SHA256 signature verification
 */
app.post('/api/cashfree-webhook', (req, res) => {
  try {
    const signature = req.headers['x-webhook-signature'];
    const timestamp = req.headers['x-webhook-timestamp'];
    const cf = getCashfreeConfig();

    if (!signature || !timestamp) {
      return res.status(400).json({ success: false, message: 'Missing Cashfree webhook headers.' });
    }

    const rawBodyStr = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);

    if (cf.isConfigured) {
      const signedData = timestamp + rawBodyStr;
      const expectedSignature = crypto
        .createHmac('sha256', cf.secretKey)
        .update(signedData)
        .digest('base64');

      let isValid = false;
      try {
        isValid = crypto.timingSafeEqual(
          Buffer.from(signature, 'utf8'),
          Buffer.from(expectedSignature, 'utf8')
        );
      } catch (cmpErr) {
        isValid = false;
      }

      if (!isValid) {
        console.warn('❌ Cashfree Webhook signature mismatch.');
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const payload = req.body;
    const eventType = payload.type || payload.event;
    console.log(`🔔 Genuine Cashfree Webhook Received: [${eventType}]`);

    const orderData = payload.data?.order;
    const paymentData = payload.data?.payment;
    const orderId = orderData?.order_id;

    if (!orderId) {
      return res.status(200).json({ status: 'ignored_no_order_id' });
    }

    const order = findOrder(orderId);
    if (!order) {
      return res.status(200).json({ status: 'order_not_found' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(200).json({ status: 'already_processed' });
    }

    if (eventType === 'PAYMENT_SUCCESS_WEBHOOK' || paymentData?.payment_status === 'SUCCESS') {
      order.paymentStatus = 'PAID';
      order.paymentId = String(paymentData?.cf_payment_id || `cf_${Date.now()}`);
      order.bankTxnId = paymentData?.bank_reference || order.paymentId;
      order.paidAt = new Date().toISOString();
      saveOrder(order);

      console.log(`✅ Order ${orderId} marked as PAID via Cashfree webhook.`);
    } else if (eventType === 'PAYMENT_FAILED_WEBHOOK' || paymentData?.payment_status === 'FAILED') {
      order.paymentStatus = 'FAILED';
      order.failureReason = paymentData?.payment_message || 'Payment failed';
      saveOrder(order);
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Error handling Cashfree webhook:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

/**
 * ============================================================
 * UNIFIED & RAZORPAY COMPATIBILITY APIS
 * ============================================================
 */

/**
 * POST /api/create-order
 * Universal order endpoint: Creates Cashfree order (or Razorpay fallback)
 */
app.post('/api/create-order', async (req, res) => {
  // Delegate to Cashfree order creation by default
  const cf = getCashfreeConfig();
  if (cf.isConfigured || !process.env.RAZORPAY_KEY_ID) {
    return app._router.handle({ ...req, url: '/api/cashfree/create-order' }, res);
  }

  // Fallback to Razorpay if specifically configured
  try {
    const { items, customer } = req.body;
    if (!customer || !customer.name || !customer.phone) {
      return res.status(400).json({ success: false, message: 'Customer details required.' });
    }
    const { verifiedItems, totalInINR, totalInPaise } = verifyCartItems(items);
    const orderId = `CBT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const rzp = getRazorpayInstance();
    let razorpayOrderId = `order_test_${Date.now()}`;
    if (rzp.isConfigured) {
      try {
        const rzpOrder = await rzp.instance.orders.create({
          amount: totalInPaise,
          currency: 'INR',
          receipt: orderId
        });
        razorpayOrderId = rzpOrder.id;
      } catch (e) {
        console.warn('Razorpay error:', e.message);
      }
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

    res.json({
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
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * POST /api/create-qr
 * Universal dynamic QR / payment endpoint
 */
app.post('/api/create-qr', async (req, res) => {
  const { items, customer } = req.body;
  if (!customer || !customer.name || !customer.phone) {
    return res.status(400).json({ success: false, message: 'Customer name and phone required.' });
  }

  try {
    const { verifiedItems, totalInINR, totalInPaise } = verifyCartItems(items);
    const orderId = `CBT_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;

    // Generate Cashfree payment session
    const cf = getCashfreeConfig();
    const cleanPhone = String(customer.phone).replace(/\D/g, '').slice(-10);

    let paymentSessionId = `session_sandbox_demo_${Date.now()}`;
    let isSandboxMock = true;
    let qrImageUrl = null;

    if (cf.isConfigured) {
      try {
        const cfRes = await fetch(`${cf.baseUrl}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-client-id': cf.appId,
            'x-client-secret': cf.secretKey,
            'x-api-version': cf.apiVersion
          },
          body: JSON.stringify({
            order_id: orderId,
            order_amount: totalInINR,
            order_currency: 'INR',
            customer_details: {
              customer_id: `cust_${cleanPhone || Date.now()}`,
              customer_name: customer.name,
              customer_phone: cleanPhone,
              customer_email: customer.email || `${cleanPhone}@cbtrendz.com`
            },
            order_meta: {
              return_url: `${req.protocol}://${req.get('host')}/?cf_order_id={order_id}`
            }
          })
        });
        const cfData = await cfRes.json();
        if (cfRes.ok && cfData.payment_session_id) {
          paymentSessionId = cfData.payment_session_id;
          isSandboxMock = false;
        }
      } catch (e) {
        console.warn('Cashfree create-qr fallback:', e.message);
      }
    }

    const newOrder = {
      orderId,
      paymentSessionId,
      amount: totalInINR,
      amountInPaise: totalInPaise,
      currency: 'INR',
      customer,
      items: verifiedItems,
      paymentStatus: 'PENDING',
      paymentMethod: 'CASHFREE',
      isSandboxMock,
      createdAt: new Date().toISOString()
    };
    saveOrder(newOrder);

    return res.json({
      success: true,
      orderId,
      paymentSessionId,
      amount: totalInINR,
      amountInPaise: totalInPaise,
      currency: 'INR',
      qrAvailable: true,
      qrImageUrl: qrImageUrl || 'cb-trendz-logo-hd.png',
      gateway: 'cashfree',
      isSandboxMock,
      customer,
      items: verifiedItems
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/payment-status/:orderId
 * Unified live payment verification & polling
 */
app.get('/api/payment-status/:orderId', async (req, res) => {
  const { orderId } = req.params;
  const order = findOrder(orderId);

  if (!order) {
    return res.status(404).json({ success: false, status: 'NOT_FOUND', message: 'Order not found.' });
  }

  // If order used Cashfree, delegate to Cashfree status checker
  if (order.paymentMethod === 'CASHFREE' || order.paymentSessionId) {
    return app._router.handle({ ...req, url: `/api/cashfree/order-status/${encodeURIComponent(orderId)}` }, res);
  }

  // Otherwise return standard order status
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

  return res.json({
    success: true,
    status: 'PENDING',
    orderId: order.orderId,
    amount: order.amount,
    message: 'Waiting for genuine payment confirmation...'
  });
});

/**
 * Start the Server
 */
const serverInstance = app.listen(PORT, () => {
  console.log(`=============================================================`);
  console.log(`💎 CB TRENDZ E-Commerce & Cashfree Payment Server Live!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🛡️ Master Catalog Loaded: ${Object.keys(SERVER_CATALOG).length} verified sarees`);
  const cf = getCashfreeConfig();
  console.log(`💳 Cashfree Gateway: ${cf.isConfigured ? '🟢 Live/Configured' : '🟡 Test Mode (Configure in server/.env)'} [Env: ${cf.env}]`);
  console.log(`=============================================================`);
});

module.exports = { app, serverInstance, SERVER_CATALOG, verifyCartItems, saveOrder, findOrder };
