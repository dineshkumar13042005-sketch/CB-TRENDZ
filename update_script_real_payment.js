const fs = require('fs');

let js = fs.readFileSync('script.js', 'utf8');

// Replace the checkout submit and payment logic with full Real UPI & Razorpay Engine
const newPaymentLogic = `
/* ============================================================
   11. BACKEND REAL PAYMENT GATEWAY ENGINE (UPI, Razorpay & COD)
   ============================================================ */
let backendConfig = {
  storeName: 'CB TRENDZ',
  whatsappNumber: '918778522690',
  merchantUpiId: '8778522690@upi',
  razorpayKeyId: '',
  isRazorpayConfigured: false
};

let currentPendingOrder = null;

// Fetch Backend Configuration
async function fetchBackendConfig() {
  try {
    const res = await fetch('/api/config');
    if (res.ok) {
      const data = await res.json();
      backendConfig = Object.assign(backendConfig, data);
      console.log('✓ CB TRENDZ Payment Gateway Active. UPI ID:', backendConfig.merchantUpiId, '| Razorpay Configured:', backendConfig.isRazorpayConfigured);
    }
  } catch (err) {
    console.warn('Backend server not responding. Check http://localhost:5000');
  }
}

// Copy UPI ID to clipboard
function copyUpiId() {
  const upiId = backendConfig.merchantUpiId || '8778522690@upi';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(upiId).then(() => {
      showToast('✓ UPI ID copied: ' + upiId);
    }).catch(() => {
      showToast('UPI ID: ' + upiId);
    });
  } else {
    showToast('UPI ID: ' + upiId);
  }
}

// Open Checkout Modal
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('Your bag is empty! Add sarees to checkout.');
    return;
  }

  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  // Render Order Items Preview in Checkout
  const preview = document.getElementById('checkout-items-preview');
  const subtotalEl = document.getElementById('checkout-subtotal');
  const totalEl = document.getElementById('checkout-total');

  let subtotal = 0;
  if (preview) {
    preview.innerHTML = cart.map(item => {
      const product = PRODUCTS.find(p => p.id === item.id);
      if (!product) return '';
      const itemTot = product.price * item.quantity;
      subtotal += itemTot;
      return \`
        <div class="checkout-item-row">
          <img src="\${product.image}" alt="\${product.name}" class="checkout-item-img" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
          <div class="checkout-item-name">
            \${product.name}
            <div class="checkout-item-qty">Qty: \${item.quantity} × \${formatINR(product.price)}</div>
          </div>
          <div class="checkout-item-price">\${formatINR(itemTot)}</div>
        </div>
      \`;
    }).join('');
  }

  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
  if (totalEl) totalEl.textContent = formatINR(subtotal);

  updatePaymentButtonLabel(subtotal);

  modal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

function updatePaymentButtonLabel(amount) {
  const payLabel = document.getElementById('btn-pay-label');
  const isUpi = document.getElementById('pm-upi')?.checked;
  const isCod = document.getElementById('pm-cod')?.checked;
  
  const currentTotal = amount !== undefined ? amount : cart.reduce((acc, i) => {
    const p = PRODUCTS.find(prod => prod.id === i.id);
    return acc + (p ? p.price * i.quantity : 0);
  }, 0);

  if (!payLabel) return;

  if (isCod) {
    payLabel.textContent = \`Place Cash on Delivery Order (\${formatINR(currentTotal)})\`;
  } else if (isUpi) {
    payLabel.textContent = \`Pay with UPI / QR (\${formatINR(currentTotal)})\`;
  } else {
    payLabel.textContent = \`Pay Securely \${formatINR(currentTotal)} (Cards / NetBanking)\`;
  }
}

// Handle Checkout Form Submission (Create Order & Process Payment)
async function handleCheckoutSubmit(e) {
  e.preventDefault();

  if (cart.length === 0) {
    showToast('Your bag is empty.');
    return;
  }

  const submitBtn = document.getElementById('btn-submit-payment');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span>⏳ Preparing Payment...</span>';

  const emailInput = document.getElementById('cust-email');
  const rawEmail = emailInput ? emailInput.value.trim() : '';
  const customer = {
    name: document.getElementById('cust-name').value.trim(),
    phone: document.getElementById('cust-phone').value.trim(),
    email: rawEmail || 'customer@cbtrendz.com',
    address: document.getElementById('cust-address').value.trim(),
    city: document.getElementById('cust-city').value.trim(),
    state: document.getElementById('cust-state').value,
    pincode: document.getElementById('cust-pincode').value.trim()
  };

  const isUpi = document.getElementById('pm-upi')?.checked;
  const isCod = document.getElementById('pm-cod')?.checked;
  let paymentMethod = 'online';
  if (isUpi) paymentMethod = 'upi';
  if (isCod) paymentMethod = 'cod';

  try {
    const res = await fetch('/api/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: cart,
        customer,
        paymentMethod
      })
    });

    const data = await res.json();

    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;

    if (!data.success) {
      if (paymentMethod === 'online' && !data.isConfigured) {
        showGatewaySettingsModal();
        showToast('Please add your Razorpay keys, or choose Instant UPI payment.');
        return;
      }
      throw new Error(data.message || 'Failed to create order on server');
    }

    // 1. If Direct Instant UPI (Scan QR or Pay via UPI App)
    if (paymentMethod === 'upi') {
      currentPendingOrder = {
        orderId: data.orderId,
        customer,
        amount: data.amount,
        items: data.items,
        upiUrl: data.upiUrl,
        upiId: data.upiId
      };
      closeCheckoutModal();
      openUpiPaymentModal(currentPendingOrder);
      return;
    }

    // 2. If Cash on Delivery (COD)
    if (paymentMethod === 'cod') {
      showOrderSuccess({
        orderId: data.orderId,
        paymentMethod: 'Cash on Delivery (COD)',
        paymentStatus: 'Pending (Pay upon Delivery)',
        paymentId: 'COD_' + Date.now().toString(36).toUpperCase(),
        customer,
        amount: data.amount,
        items: cart.map(i => {
          const p = PRODUCTS.find(prod => prod.id === i.id);
          return { name: p.name, quantity: i.quantity, price: p.price, itemTotal: p.price * i.quantity };
        })
      });
      return;
    }

    // 3. Online Cards / NetBanking via Razorpay Gateway
    if (typeof Razorpay === 'undefined') {
      showToast('Razorpay SDK loading. Please retry or choose UPI.');
      return;
    }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: backendConfig.storeName,
      description: 'Luxury Sarees Purchase',
      image: 'cb-trendz-logo-hd.png',
      order_id: data.razorpayOrderId,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone
      },
      theme: {
        color: '#4A1220'
      },
      handler: async function (response) {
        submitBtn.innerHTML = '<span>🔒 Verifying Payment...</span>';
        try {
          const verifyRes = await fetch('/api/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              customer,
              items: data.items,
              amount: data.totalAmount
            })
          });

          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            showOrderSuccess(verifyData.order);
          } else {
            showToast('Verification failed: ' + verifyData.message);
          }
        } catch (err) {
          showToast('Payment verification error: ' + err.message);
        }
      },
      modal: {
        ondismiss: function () {
          showToast('Payment window closed by user.');
        }
      }
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', function (response) {
      showToast('Payment Failed: ' + (response.error.description || 'Transaction declined'));
    });
    rzp.open();

  } catch (error) {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
    console.error('Payment Error:', error);
    showToast('Payment error: ' + error.message);
  }
}

// Open UPI Modal with Dynamic QR & App Links
function openUpiPaymentModal(order) {
  const modal = document.getElementById('upi-modal');
  if (!modal) return;

  document.getElementById('upi-order-id-display').textContent = order.orderId;
  document.getElementById('upi-amount-display').textContent = formatINR(order.amount);
  document.getElementById('upi-vpa-display').textContent = order.upiId;

  // Generate Real Dynamic QR Code Image via standard UPI URL
  const qrImg = document.getElementById('upi-qr-img');
  if (qrImg) {
    qrImg.src = 'https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=' + encodeURIComponent(order.upiUrl);
  }

  // Set Mobile App Links
  const linkGpay = document.getElementById('link-gpay');
  const linkPhonepe = document.getElementById('link-phonepe');
  const linkPaytm = document.getElementById('link-paytm');

  if (linkGpay) linkGpay.href = order.upiUrl;
  if (linkPhonepe) linkPhonepe.href = order.upiUrl;
  if (linkPaytm) linkPaytm.href = order.upiUrl;

  modal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeUpiPaymentModal() {
  const modal = document.getElementById('upi-modal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

// Handle UPI Verification Form Submit (with UTR Number)
async function handleUpiVerifySubmit(e) {
  e.preventDefault();
  if (!currentPendingOrder) return;

  const utrInput = document.getElementById('upi-utr-input');
  const utr = utrInput ? utrInput.value.trim() : '';

  const submitBtn = document.getElementById('btn-submit-upi');
  submitBtn.disabled = true;
  submitBtn.textContent = '⏳ Confirming Transaction...';

  try {
    const res = await fetch('/api/verify-upi-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: currentPendingOrder.orderId,
        utrNumber: utr,
        customer: currentPendingOrder.customer,
        items: currentPendingOrder.items,
        amount: currentPendingOrder.amount
      })
    });

    const data = await res.json();
    submitBtn.disabled = false;
    submitBtn.textContent = '✓ I Have Paid — Confirm Order';

    if (data.success) {
      closeUpiPaymentModal();
      showOrderSuccess(data.order);
      currentPendingOrder = null;
    } else {
      showToast(data.message || 'Payment confirmation failed.');
    }
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = '✓ I Have Paid — Confirm Order';
    showToast('Verification failed: ' + err.message);
  }
}

// Gateway Settings Modal
function showGatewaySettingsModal() {
  const modal = document.getElementById('gateway-settings-modal');
  if (!modal) return;
  document.getElementById('set-merchant-upi').value = backendConfig.merchantUpiId || '8778522690@upi';
  document.getElementById('set-rzp-key').value = backendConfig.razorpayKeyId || '';
  modal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeGatewaySettingsModal() {
  const modal = document.getElementById('gateway-settings-modal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

async function handleSaveKeysSubmit(e) {
  e.preventDefault();
  const upiId = document.getElementById('set-merchant-upi').value.trim();
  const keyId = document.getElementById('set-rzp-key').value.trim();
  const keySecret = document.getElementById('set-rzp-secret').value.trim();

  try {
    const res = await fetch('/api/save-keys', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        merchantUpiId: upiId,
        razorpayKeyId: keyId,
        razorpayKeySecret: keySecret
      })
    });

    const data = await res.json();
    if (data.success) {
      showToast('✓ Payment credentials saved!');
      await fetchBackendConfig();
      closeGatewaySettingsModal();
    } else {
      showToast(data.message || 'Failed to save credentials.');
    }
  } catch (err) {
    showToast('Error saving credentials: ' + err.message);
  }
}

// Display Order Success Screen & Receipt
function showOrderSuccess(order) {
  closeCheckoutModal();

  const successModal = document.getElementById('order-success-modal');
  const content = document.getElementById('success-content');
  if (!successModal || !content) return;

  const isCod = order.paymentMethod.includes('COD');

  content.innerHTML = \`
    <div class="success-badge-circle">✓</div>
    <h2 class="success-title">\${isCod ? 'Order Confirmed!' : 'Real Payment Confirmed!'}</h2>
    <p class="success-subtitle">Thank you, \${order.customer.name}! Your payment has been received by CB TRENDZ.</p>

    <div class="success-receipt-card" id="printable-receipt">
      <div class="receipt-header-row">
        <div>
          <span style="font-size:0.75rem; color:#7A7272; display:block;">ORDER REFERENCE</span>
          <strong class="receipt-order-id">\${order.orderId}</strong>
        </div>
        <span class="receipt-status-pill \${isCod ? 'cod' : ''}">\${order.paymentStatus}</span>
      </div>

      <div class="receipt-info-grid">
        <div>
          <span>CUSTOMER</span>
          <strong>\${order.customer.name}</strong>
          <small style="color:#7A7272;">\${order.customer.phone}</small>
        </div>
        <div>
          <span>PAYMENT METHOD</span>
          <strong>\${order.paymentMethod}</strong>
          <small style="color:#7A7272;">Txn ID: \${order.paymentId.substring(0, 18)}...</small>
        </div>
        <div style="grid-column: 1 / -1;">
          <span>DELIVERY ADDRESS</span>
          <p style="margin:0; font-size:0.85rem; color:#443F44;">
            \${order.customer.address}, \${order.customer.city}, \${order.customer.state} - \${order.customer.pincode}
          </p>
        </div>
      </div>

      <div class="receipt-items-list">
        \${order.items.map(item => \`
          <div style="display:flex; justify-content:space-between; font-size:0.86rem; margin-bottom:6px;">
            <span>\${item.name} (Qty: \${item.quantity})</span>
            <strong>\${formatINR(item.itemTotal || (item.price * item.quantity))}</strong>
          </div>
        \`).join('')}
      </div>

      <div class="receipt-total-row">
        <span>Total Amount Paid</span>
        <strong>\${formatINR(order.amount)}</strong>
      </div>
    </div>

    <div class="success-actions-row">
      <button class="btn-success-print" onclick="window.print()">
        🖨️ Print Invoice Receipt
      </button>
      <button class="btn-success-wa" onclick="sendOrderConfirmationWhatsApp('\${order.orderId}', '\${order.customer.name}', '\${order.amount}', '\${order.paymentMethod}')">
        💬 Send Confirmation on WhatsApp
      </button>
      <button class="btn-success-shop" onclick="closeOrderSuccessModal()">
        🛍️ Continue Shopping
      </button>
    </div>
  \`;

  // Clear Cart
  cart = [];
  saveStorage();
  updateCartUI();

  successModal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('order-success-modal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

function sendOrderConfirmationWhatsApp(orderId, name, amount, method) {
  const msg = [
    \`✦ *PAID ORDER CONFIRMATION — \${STORE_CONFIG.name}* ✦\`,
    \`Hello CB TRENDZ! I have completed real payment for my order.\`,
    \`*Order ID:* \${orderId}\`,
    \`*Customer:* \${name}\`,
    \`*Amount:* \${formatINR(amount)}\`,
    \`*Payment Method:* \${method || 'Paid Online'}\`,
    \`Please find my delivery details and confirm dispatch schedule. Thank you!\`
  ].join('\\n');

  const url = \`https://wa.me/\${STORE_CONFIG.whatsappNumber}?text=\${encodeURIComponent(msg)}\`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
`;

// Replace section 11 in script.js
const regexSection11 = /\/\* =+\s*11\. BACKEND PAYMENT GATEWAY ENGINE[\s\S]*$/;
if (regexSection11.test(js)) {
  js = js.replace(regexSection11, newPaymentLogic);
  console.log('✓ Replaced Section 11 with Real Payment & UPI engine');
} else {
  js += '\n' + newPaymentLogic;
}

// Also update payment radio event listeners in initEvents
const oldRadioLogic = `  // Payment radio buttons toggle visual selected style & label
  const pmOnline = document.getElementById('pm-online');
  const pmCod = document.getElementById('pm-cod');
  const pmOnlineLabel = document.getElementById('pm-online-label');
  const pmCodLabel = document.getElementById('pm-cod-label');

  if (pmOnline && pmCod) {
    pmOnline.addEventListener('change', () => {
      if (pmOnline.checked) {
        pmOnlineLabel.classList.add('selected');
        pmCodLabel.classList.remove('selected');
        updatePaymentButtonLabel();
      }
    });
    pmCod.addEventListener('change', () => {
      if (pmCod.checked) {
        pmCodLabel.classList.add('selected');
        pmOnlineLabel.classList.remove('selected');
        updatePaymentButtonLabel();
      }
    });
  }`;

const newRadioLogic = `  // Payment radio buttons toggle visual selected style & label
  const pmUpi = document.getElementById('pm-upi');
  const pmOnline = document.getElementById('pm-online');
  const pmCod = document.getElementById('pm-cod');
  const pmUpiLabel = document.getElementById('pm-upi-label');
  const pmOnlineLabel = document.getElementById('pm-online-label');
  const pmCodLabel = document.getElementById('pm-cod-label');

  function syncPaymentLabels() {
    if (pmUpiLabel) pmUpiLabel.classList.toggle('selected', pmUpi?.checked);
    if (pmOnlineLabel) pmOnlineLabel.classList.toggle('selected', pmOnline?.checked);
    if (pmCodLabel) pmCodLabel.classList.toggle('selected', pmCod?.checked);
    updatePaymentButtonLabel();
  }

  if (pmUpi) pmUpi.addEventListener('change', syncPaymentLabels);
  if (pmOnline) pmOnline.addEventListener('change', syncPaymentLabels);
  if (pmCod) pmCod.addEventListener('change', syncPaymentLabels);

  // UPI Modal & Settings Modal hooks
  const btnUpiClose = document.getElementById('upi-modal-close');
  const upiVerifyForm = document.getElementById('upi-verify-form');
  const btnOpenSettings = document.getElementById('btn-open-gateway-settings');
  const btnCloseSettings = document.getElementById('gateway-settings-close');
  const formSettings = document.getElementById('gateway-keys-form');

  if (btnUpiClose) btnUpiClose.addEventListener('click', closeUpiPaymentModal);
  if (upiVerifyForm) upiVerifyForm.addEventListener('submit', handleUpiVerifySubmit);
  if (btnOpenSettings) btnOpenSettings.addEventListener('click', showGatewaySettingsModal);
  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeGatewaySettingsModal);
  if (formSettings) formSettings.addEventListener('submit', handleSaveKeysSubmit);`;

if (js.includes(oldRadioLogic)) {
  js = js.replace(oldRadioLogic, newRadioLogic);
  console.log('✓ Replaced payment radio listeners in script.js');
}

fs.writeFileSync('script.js', js, 'utf8');
console.log('Successfully updated script.js with Real Payment Engine!');

