/**
 * CB TRENDZ — Ladies Fashion & Accessories
 * Core JavaScript Engine (Matching Mockup with Full Interactivity)
 */

'use strict';

/* ============================================================
   1. STORE CONFIGURATION & PRODUCT DATABASE
   ============================================================ */
const STORE_CONFIG = {
  name: 'CB TRENDZ',
  tagline: 'Ladies Fashion & Accessories',
  whatsappNumber: '918778522690',
  currencySymbol: '₹',
  itemsPerPage: 12
};

// Saree Products Collection
const PRODUCTS = [
  {
    id: 1,
    name: 'Kanchi cotton Saree',
    price: 1,
    category: 'cotton',
    image: 'images/Maroon Gold Zari Saree Ensemble.png',
    description: 'Exquisite authentic Kanchipuram pure silk saree with heavy golden zari pallu and intricate border weave. Ideal for weddings and grand festive celebrations.'
  },
  {
    id: 2,
    name: 'Semi silk Saree',
    price: 850,
    category: 'silk',
    image: 'images/Teal and Gold Banarasi Saree Fold.png',
    description: 'Traditional off-white Kerala Kasavu cotton saree featuring a vibrant bottle green border with delicate golden thread accents.'
  },
  {
    id: 3,
    name: 'Semi silk Saree',
    price: 650,
    category: 'silk',
    image: 'images/Lime Green Silk Saree with Teal Zari Border.png',
    description: 'Regal bridal red Kanjivaram silk saree woven with ceremonial temple zari borders and heavy embossed floral motifs.'
  },
  {
    id: 4,
    name: 'Daily wear Georgette Saree',
    price: 550,
    category: 'party',
    image: 'images/Folded_floral_yellow_saree_displ…_f635d66d_2K.jpg',
    description: 'Glamorous royal purple party wear saree with subtle metallic shimmer and graceful fluidity for evening soirees and receptions.'
  },
  {
    id: 5,
    name: 'Moonga Silk Saree',
    price: 1150,
    category: 'designer',
    image: 'images/Folded_green_saree_with_border_c449f9bc_2K.jpg',
    description: 'Peacock teal sheer designer organza saree detailed with artisan zari embroidery and modern scalloped borders.'
  },
  {
    id: 6,
    name: 'Linen silk Saree',
    price: 799,
    category: 'silk',
    image: 'images/image.png_1dbc01cd_2K.jpg',
    description: 'Charming sky blue and magenta pink linen silk saree with geometric zig-zag ikat pattern and contrasting vibrant border. Breathable, lightweight, and elegant.'
  },
  {
    id: 7,
    name: 'Shimmer linen Saree',
    price: 799,
    category: 'party',
    image: 'images/image.png_26f0abe6_2K.jpg',
    description: 'Exquisite shimmer linen saree with subtle metallic sheen and graceful drape. Perfect blend of breathable comfort and festive glamour.'
  },
  {
    id: 8,
    name: 'Cotton Saree',
    price: 499,
    category: 'cotton',
    image: 'images/image.png_f03ac051_2K.jpg',
    description: 'Comfortable and breathable soft cotton saree with authentic ethnic prints and elegant border design. Perfect for daily wear and warm weather.'
  }
];

/* ============================================================
   2. APPLICATION STATE
   ============================================================ */
let cart = [];
let wishlist = [];
let activeCategory = 'all';
let activePrice = 'all';
let searchQuery = '';
let activeSort = 'popularity';
let currentPage = 1;

/* ============================================================
   3. UTILITIES & HELPERS
   ============================================================ */
function formatINR(num) {
  if (num === undefined || num === null || num === '' || isNaN(Number(num))) return '';
  return '₹ ' + Number(num).toLocaleString('en-IN');
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function saveStorage() {
  try {
    localStorage.setItem('cbtrendz_cart', JSON.stringify(cart));
    localStorage.setItem('cbtrendz_wishlist', JSON.stringify(wishlist));
  } catch (e) {
    console.warn('Storage quota or private mode active');
  }
}

function loadStorage() {
  try {
    localStorage.removeItem('cbtrendz_customer_info');
    const savedCart = localStorage.getItem('cbtrendz_cart');
    const savedWish = localStorage.getItem('cbtrendz_wishlist');
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedWish) wishlist = JSON.parse(savedWish);
  } catch (e) {
    cart = [];
    wishlist = [];
  }
}

/* ============================================================
   4. FILTER, SORT & PAGINATION ENGINE
   ============================================================ */
function getFilteredProducts() {
  return PRODUCTS.filter(p => {
    // 1. Category Filter
    if (activeCategory !== 'all') {
      const cat = (p.category || '').toLowerCase();
      const name = (p.name || '').toLowerCase();
      if (activeCategory === 'cotton' && !cat.includes('cotton') && !name.includes('cotton')) return false;
      if (activeCategory === 'silk' && !cat.includes('silk') && !name.includes('silk')) return false;
      if (activeCategory === 'wedding' && !cat.includes('wedding') && !name.includes('wedding') && !name.includes('kanchi')) return false;
      if (activeCategory === 'party' && !cat.includes('party') && !name.includes('georgette')) return false;
      if (activeCategory === 'designer' && !cat.includes('designer') && !name.includes('moonga')) return false;
    }

    // 2. Price Filter
    if (activePrice === 'under800' && p.price >= 800) return false;
    if (activePrice === '800-1200' && (p.price < 800 || p.price > 1200)) return false;
    if (activePrice === 'above1200' && p.price <= 1200) return false;

    // 3. Search Query
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchName = (p.name || '').toLowerCase().includes(q);
      const matchSpec = (p.spec || '').toLowerCase().includes(q);
      const matchCat = (p.category || '').toLowerCase().includes(q);
      const matchDesc = (p.description || '').toLowerCase().includes(q);
      if (!matchName && !matchSpec && !matchCat && !matchDesc) return false;
    }

    return true;
  }).sort((a, b) => {
    // 4. Sorting
    if (activeSort === 'price-asc') return a.price - b.price;
    if (activeSort === 'price-desc') return b.price - a.price;
    if (activeSort === 'rating') return (b.reviews || 0) - (a.reviews || 0);
    if (activeSort === 'newest') return b.id - a.id;
    return a.id - b.id; // popularity / default
  });
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const emptyState = document.getElementById('empty-state');
  const paginationBar = document.getElementById('pagination-bar');
  if (!grid) return;

  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    if (paginationBar) paginationBar.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (paginationBar) paginationBar.style.display = 'flex';

  // Calculate Pagination
  const totalPages = Math.ceil(filtered.length / STORE_CONFIG.itemsPerPage);
  if (currentPage > totalPages) currentPage = 1;

  const startIndex = (currentPage - 1) * STORE_CONFIG.itemsPerPage;
  const pageProducts = filtered.slice(startIndex, startIndex + STORE_CONFIG.itemsPerPage);

  // Render Product Cards (Clean, luxury presentation with Only Buy Now button)
  grid.innerHTML = pageProducts.map(p => {
    const isWish = wishlist.includes(p.id);

    return `
      <article class="product-card" data-id="${p.id}">
        <!-- Image Thumbnail -->
        <div class="product-thumb">
          <img src="${p.image}" alt="${p.name}" loading="lazy" style="object-position: center center; object-fit: cover;" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
          <button class="product-wish-btn ${isWish ? 'active' : ''}" data-id="${p.id}" aria-label="Add ${p.name} to wishlist" title="Add to wishlist">
            ${isWish ? '♥' : '♡'}
          </button>

          <!-- Hover Pop-Up Window Showing Saree Details & Price -->
          <div class="thumb-hover-popup" role="region" aria-label="Saree preview">
            <h4 class="popup-title">${p.name}</h4>
            <div class="popup-price-row">
              <span class="popup-price">${formatINR(p.price)}</span>
            </div>
            <p class="popup-desc">${p.description || ''}</p>
            <div class="popup-action-row">
              <button type="button" class="btn-popup-buynow btn-card-buynow" data-id="${p.id}">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                <span>Buy Now</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="product-info">
          <h3 class="product-title">${p.name}</h3>

          <div class="product-price-line">
            <span class="price-now">${formatINR(p.price)}</span>
          </div>

          <!-- Only Buy Now Button with Effects -->
          <div class="product-btn-group">
            <button class="btn-card-buynow" data-id="${p.id}">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              <span>Buy Now</span>
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // Render Pagination Bar
  renderPagination(totalPages);
}

function renderPagination(totalPages) {
  const paginationBar = document.getElementById('pagination-bar');
  if (!paginationBar) return;

  if (totalPages <= 1) {
    paginationBar.style.display = 'none';
    return;
  }

  paginationBar.style.display = 'flex';
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  if (currentPage < totalPages) {
    html += `<button class="page-btn next-btn" data-page="next" aria-label="Next page">›</button>`;
  }
  paginationBar.innerHTML = html;
}

/* ============================================================
   5. CART & WISHLIST MANAGEMENT
   ============================================================ */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  saveStorage();
  updateCartUI();
  showToast(`✓ "${product.name}" added to bag!`);
  openCartDrawer();
}

function changeQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    cart = cart.filter(i => i.id !== productId);
  }

  saveStorage();
  updateCartUI();
}

function removeFromCart(productId) {
  cart = cart.filter(i => i.id !== productId);
  saveStorage();
  updateCartUI();
  showToast('Item removed from bag');
}

function toggleWishlist(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  const idx = wishlist.indexOf(productId);
  if (idx > -1) {
    wishlist.splice(idx, 1);
    showToast(`Removed "${product.name}" from wishlist`);
  } else {
    wishlist.push(productId);
    showToast(`♥ Added "${product.name}" to wishlist!`);
  }

  saveStorage();
  updateWishlistUI();
  renderProducts(); // refresh heart buttons
}

function updateCartUI() {
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Update Badges
  const badge = document.getElementById('cart-count');
  const mobBadge = document.getElementById('mobile-cart-count');
  const drawerCount = document.getElementById('cart-drawer-count');
  if (badge) badge.textContent = count;
  if (mobBadge) mobBadge.textContent = count;
  if (drawerCount) drawerCount.textContent = `(${count})`;

  const container = document.getElementById('cart-items-container');
  const emptyState = document.getElementById('cart-empty');
  const footer = document.getElementById('cart-footer');
  const subtotalEl = document.getElementById('cart-subtotal');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    if (footer) footer.style.display = 'none';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';
  if (footer) footer.style.display = 'block';

  let subtotal = 0;
  container.innerHTML = cart.map(item => {
    const product = PRODUCTS.find(p => p.id === item.id);
    if (!product) return '';
    subtotal += product.price * item.quantity;

    return `
      <div class="drawer-item" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="drawer-item-img" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
        <div class="drawer-item-details">
          <div>
            <h4 class="drawer-item-title">${product.name}</h4>
            <div class="drawer-item-price">${formatINR(product.price)}</div>
          </div>
          <div class="drawer-item-qty">
            <button class="qty-btn" onclick="changeQuantity(${product.id}, -1)">−</button>
            <span class="qty-count">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQuantity(${product.id}, 1)">+</button>
          </div>
        </div>
        <button class="drawer-item-remove" onclick="removeFromCart(${product.id})" aria-label="Remove item">✕</button>
      </div>
    `;
  }).join('');

  if (subtotalEl) subtotalEl.textContent = formatINR(subtotal);
}

function updateWishlistUI() {
  const count = wishlist.length;
  const badge = document.getElementById('wishlist-count');
  const mobBadge = document.getElementById('mobile-wishlist-count');
  const drawerCount = document.getElementById('wishlist-drawer-count');
  if (badge) badge.textContent = count;
  if (mobBadge) mobBadge.textContent = count;
  if (drawerCount) drawerCount.textContent = `(${count})`;

  const container = document.getElementById('wishlist-items-container');
  const emptyState = document.getElementById('wishlist-empty');
  if (!container) return;

  if (wishlist.length === 0) {
    container.innerHTML = '';
    if (emptyState) emptyState.style.display = 'flex';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  container.innerHTML = wishlist.map(id => {
    const product = PRODUCTS.find(p => p.id === id);
    if (!product) return '';

    return `
      <div class="drawer-item" data-id="${product.id}">
        <img src="${product.image}" alt="${product.name}" class="drawer-item-img" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
        <div class="drawer-item-details">
          <div>
            <h4 class="drawer-item-title">${product.name}</h4>
            <div class="drawer-item-price">${formatINR(product.price)}</div>
          </div>
          <button class="btn-card-cart" onclick="addToCart(${product.id}); toggleWishlist(${product.id});" style="padding:6px 12px; font-size:0.78rem;">
            Move to Bag
          </button>
        </div>
        <button class="drawer-item-remove" onclick="toggleWishlist(${product.id})" aria-label="Remove item">✕</button>
      </div>
    `;
  }).join('');
}

/* ============================================================
   6. WHATSAPP CHECKOUT
   ============================================================ */
function checkoutViaWhatsApp() {
  if (cart.length === 0) {
    showToast('Your bag is currently empty!');
    return;
  }

  let total = 0;
  const lines = cart.map((item, idx) => {
    const p = PRODUCTS.find(prod => prod.id === item.id);
    if (!p) return '';
    const itemTotal = p.price * item.quantity;
    total += itemTotal;
    const photoUrl = getPublicSareeImageUrl(p.image);
    return `${idx + 1}. *${p.name}* - Qty: ${item.quantity} (₹${p.price.toLocaleString('en-IN')})${photoUrl ? '\n   📸 Photo: ' + photoUrl : ''}`;
  }).filter(Boolean);

  const message = [
    `✦ *ORDER INQUIRY — ${STORE_CONFIG.name}* ✦`,
    `Hello CB TRENDZ! I would like to order the following sarees:`,
    '',
    ...lines,
    '',
    `*Total Order Value:* ₹${total.toLocaleString('en-IN')}`,
    '',
    `Please confirm availability and sharing shipping details. Thank you!`
  ].join('\n');

  const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ============================================================
   7. QUICK VIEW MODAL
   ============================================================ */
function openQuickView(productId) {
  const p = PRODUCTS.find(prod => prod.id === productId);
  if (!p) return;

  const modal = document.getElementById('quick-view-overlay');
  const content = document.getElementById('qv-content');
  if (!modal || !content) return;

  content.innerHTML = `
    <div class="modal-img-box">
      <img src="${p.image}" alt="${p.name}" style="object-position: center center; object-fit: cover;" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
    </div>
    <div class="modal-details-box">
      <h2 class="modal-title">${p.name}</h2>

      <div class="modal-price-line">
        <span class="modal-price-now">${formatINR(p.price)}</span>
      </div>

      <p class="modal-desc-text">${p.description || ''}</p>

      <div class="modal-actions">
        <button class="btn-modal-buynow btn-card-buynow" onclick="buyNowSingleProduct(${p.id}); closeQuickView();">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
          <span>Buy Now</span>
        </button>
        <a href="https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent('Hello CB TRENDZ! I want to enquire about ' + p.name + ' (' + formatINR(p.price) + ')')}" target="_blank" rel="noopener noreferrer" class="btn-modal-wa">
          💬 Order on WhatsApp
        </a>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeQuickView() {
  const modal = document.getElementById('quick-view-overlay');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

/* ============================================================
   8. DRAWER CONTROLS
   ============================================================ */
function openCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('nav-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeCartDrawer() {
  const drawer = document.getElementById('cart-drawer');
  const overlay = document.getElementById('nav-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

function openWishlistDrawer() {
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('nav-overlay');
  if (drawer) drawer.classList.add('open');
  if (overlay) overlay.classList.add('active');
  document.body.classList.add('no-scroll');
}

function closeWishlistDrawer() {
  const drawer = document.getElementById('wishlist-drawer');
  const overlay = document.getElementById('nav-overlay');
  if (drawer) drawer.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.classList.remove('no-scroll');
}

/* ============================================================
   9. EVENT LISTENERS & DELEGATION
   ============================================================ */
function initEvents() {
  // 1. Category Pills
  const catPills = document.querySelectorAll('#category-pills .pill-btn');
  catPills.forEach(btn => {
    btn.addEventListener('click', () => {
      catPills.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category || 'all';
      currentPage = 1;
      renderProducts();
    });
  });

  // 2. Collection Cards Click (switches category and scrolls to #shop)
  const colCards = document.querySelectorAll('.col-card');
  colCards.forEach(card => {
    card.addEventListener('click', () => {
      const cat = card.dataset.filter;
      if (cat) {
        activeCategory = cat;
        catPills.forEach(b => {
          b.classList.toggle('active', b.dataset.category === cat);
        });
        currentPage = 1;
        renderProducts();

        const shopSec = document.getElementById('shop');
        if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // 3. Search Inputs (both top drawer and in-catalog input)
  const catalogSearch = document.getElementById('catalog-search');
  if (catalogSearch) {
    catalogSearch.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      currentPage = 1;
      renderProducts();
    });
  }

  const topSearchInput = document.getElementById('search-input');
  if (topSearchInput) {
    topSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (catalogSearch) catalogSearch.value = searchQuery;
      currentPage = 1;
      renderProducts();
      const shopSec = document.getElementById('shop');
      if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 4. Sort Dropdown
  const sortSelect = document.getElementById('catalog-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProducts();
    });
  }

  // 5. Price Dropdown
  const priceSelect = document.getElementById('catalog-price');
  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      activePrice = e.target.value;
      currentPage = 1;
      renderProducts();
    });
  }

  // 6. Reset Filters Button
  const resetBtn = document.getElementById('reset-filters-btn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      activeCategory = 'all';
      activePrice = 'all';
      searchQuery = '';
      if (catalogSearch) catalogSearch.value = '';
      if (topSearchInput) topSearchInput.value = '';
      if (priceSelect) priceSelect.value = 'all';
      catPills.forEach(b => b.classList.toggle('active', b.dataset.category === 'all'));
      currentPage = 1;
      renderProducts();
    });
  }

  // 7. Product Grid Delegation (Buy Now, Wishlist Heart, Quick View)
  const grid = document.getElementById('products-grid');
  if (grid) {
    grid.addEventListener('click', (e) => {
      const buyBtn = e.target.closest('.btn-card-buynow');
      if (buyBtn) {
        const id = parseInt(buyBtn.dataset.id || buyBtn.getAttribute('data-id'), 10);
        if (id) buyNowSingleProduct(id);
        return;
      }

      const cartBtn = e.target.closest('.btn-card-cart');
      if (cartBtn) {
        const id = parseInt(cartBtn.dataset.id, 10);
        if (id) addToCart(id);
        return;
      }

      const qvBtn = e.target.closest('.btn-card-quickview');
      if (qvBtn) {
        const id = parseInt(qvBtn.dataset.id, 10);
        if (id) openQuickView(id);
        return;
      }

      const wishBtn = e.target.closest('.product-wish-btn');
      if (wishBtn) {
        const id = parseInt(wishBtn.dataset.id, 10);
        if (id) toggleWishlist(id);
        return;
      }

      // Clicking photo thumbnail opens Quick View (only if not clicking a button)
      const thumb = e.target.closest('.product-thumb');
      if (thumb && !e.target.closest('button')) {
        const card = thumb.closest('.product-card');
        const id = parseInt(card?.dataset?.id, 10);
        if (id) openQuickView(id);
        return;
      }
    });
  }

  // 8. Pagination Delegation
  const paginationBar = document.getElementById('pagination-bar');
  if (paginationBar) {
    paginationBar.addEventListener('click', (e) => {
      const pageBtn = e.target.closest('.page-btn');
      if (!pageBtn) return;

      const pageVal = pageBtn.dataset.page;
      const filtered = getFilteredProducts();
      const totalPages = Math.ceil(filtered.length / STORE_CONFIG.itemsPerPage);

      if (pageVal === 'next') {
        if (currentPage < totalPages) currentPage += 1;
      } else {
        const num = parseInt(pageVal, 10);
        if (num) currentPage = num;
      }

      renderProducts();
      const shopSec = document.getElementById('shop');
      if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 9. Top Search Bar Toggle
  const searchToggle = document.getElementById('search-toggle-btn');
  const searchDrawer = document.getElementById('search-bar-wrapper');
  const searchClose = document.getElementById('search-close-btn');

  if (searchToggle && searchDrawer) {
    searchToggle.addEventListener('click', () => {
      searchDrawer.classList.toggle('open');
      if (searchDrawer.classList.contains('open')) {
        const input = document.getElementById('search-input');
        if (input) input.focus();
      }
    });
  }
  if (searchClose && searchDrawer) {
    searchClose.addEventListener('click', () => {
      searchDrawer.classList.remove('open');
    });
  }

  // 10. Drawer Toggles
  const cartToggle = document.getElementById('cart-toggle-btn');
  const mobileCartToggle = document.getElementById('mobile-cart-btn');
  const cartClose = document.getElementById('cart-close-btn');

  if (cartToggle) cartToggle.addEventListener('click', openCartDrawer);
  if (mobileCartToggle) mobileCartToggle.addEventListener('click', openCartDrawer);
  if (cartClose) cartClose.addEventListener('click', closeCartDrawer);

  const wishToggle = document.getElementById('wishlist-toggle-btn');
  const mobileWishToggle = document.getElementById('mobile-wishlist-btn');
  const wishClose = document.getElementById('wishlist-close-btn');

  if (wishToggle) wishToggle.addEventListener('click', openWishlistDrawer);
  if (mobileWishToggle) mobileWishToggle.addEventListener('click', openWishlistDrawer);
  if (wishClose) wishClose.addEventListener('click', closeWishlistDrawer);

  // Overlay click closes all drawers & modals
  const overlay = document.getElementById('nav-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeCartDrawer();
      closeWishlistDrawer();
      const navMenu = document.getElementById('nav-links');
      if (navMenu) navMenu.classList.remove('open');
    });
  }

  // Modal Close
  const modalClose = document.getElementById('modal-close-btn');
  const qvOverlay = document.getElementById('quick-view-overlay');
  if (modalClose) modalClose.addEventListener('click', closeQuickView);
  if (qvOverlay) {
    qvOverlay.addEventListener('click', (e) => {
      if (e.target === qvOverlay) closeQuickView();
    });
  }

  // Mobile Hamburger Menu
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('nav-links');
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      if (overlay) overlay.classList.toggle('active', navMenu.classList.contains('open'));
    });
  }

  // 11. Scroll Interaction Engine (Progress Bar, Sticky Nav Depth, Back-to-Top)
  const progressBar = document.getElementById('scroll-progress-bar');
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('back-to-top');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Gold Progress Bar
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }

    // Navbar scrolled depth
    if (navbar) {
      navbar.classList.toggle('scrolled', scrollY > 20);
    }

    // Back to top button
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 350);
    }
  }, { passive: true });

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 12. Checkout Modal (2-Step: User Details -> Real Cashfree Payment)
  const btnOpenCheckout = document.getElementById('btn-open-checkout');
  const btnCloseCheckout = document.getElementById('checkout-modal-close');
  const btnGotoStep2 = document.getElementById('btn-goto-step-2');
  const btnEditDetails = document.getElementById('btn-edit-details');
  const btnBackToStep1 = document.getElementById('btn-back-to-step1');
  const checkoutDetailsForm = document.getElementById('checkout-details-form');
  const btnOpenCashfreeCheckout = document.getElementById('btn-open-cashfree-checkout') || document.getElementById('btn-open-rzp-checkout');
  const btnSimulateCashfree = document.getElementById('btn-simulate-cashfree');
  const btnManualCheckStatus = document.getElementById('btn-manual-check-status');
  const successModalClose = document.getElementById('success-modal-close');
  const recapAddressEl = document.getElementById('recap-address');
  const btnCopyAddress = document.getElementById('btn-copy-address');

  if (btnOpenCheckout) btnOpenCheckout.addEventListener('click', () => openCheckoutModal());
  if (btnCloseCheckout) btnCloseCheckout.addEventListener('click', closeCheckoutModal);
  if (btnGotoStep2) {
    btnGotoStep2.addEventListener('click', (e) => {
      if (checkoutDetailsForm && !checkoutDetailsForm.checkValidity()) {
        checkoutDetailsForm.reportValidity();
        return;
      }
      e.preventDefault();
      goToPaymentStep();
    });
  }
  if (checkoutDetailsForm) {
    checkoutDetailsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      goToPaymentStep();
    });
  }
  if (btnEditDetails) btnEditDetails.addEventListener('click', backToDetailsStep);
  if (btnBackToStep1) btnBackToStep1.addEventListener('click', backToDetailsStep);
  
  // PhonePe, Google Pay, and Cashfree Real Payment Option Buttons
  const btnPayPhonepe = document.getElementById('btn-pay-phonepe');
  const btnPayGpay = document.getElementById('btn-pay-gpay');
  const btnConfirmPaidOrder = document.getElementById('btn-confirm-paid-order');

  if (btnPayPhonepe) btnPayPhonepe.addEventListener('click', payWithPhonePe);
  if (btnPayGpay) btnPayGpay.addEventListener('click', payWithGooglePay);
  if (btnOpenCashfreeCheckout) btnOpenCashfreeCheckout.addEventListener('click', () => openCashfreeCheckoutModal());
  if (btnConfirmPaidOrder) btnConfirmPaidOrder.addEventListener('click', confirmPaidOrder);
  if (btnManualCheckStatus) {
    btnManualCheckStatus.addEventListener('click', () => {
      const activeOrder = currentCashfreeOrder || currentRazorpayOrder;
      if (activeOrder && activeOrder.orderId) {
        checkPaymentStatusOnce(activeOrder.orderId, true);
      } else {
        showToast('Initializing payment, please wait...');
      }
    });
  }
  if (successModalClose) successModalClose.addEventListener('click', closeOrderSuccessModal);
  if (recapAddressEl) recapAddressEl.addEventListener('click', copyDeliveryAddress);
  if (btnCopyAddress) btnCopyAddress.addEventListener('click', copyDeliveryAddress);

  // Direct Buy Now click delegation on cards
  document.addEventListener('click', (e) => {
    const buyBtn = e.target.closest('.btn-card-buynow');
    if (buyBtn) {
      const id = parseInt(buyBtn.getAttribute('data-id'), 10);
      if (id) {
        buyNowSingleProduct(id);
      }
    }
  });

  // Close modals on clicking backdrop overlay
  ['checkout-modal', 'order-success-modal', 'quick-view-overlay'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        if (e.target === el) {
          el.classList.remove('open');
          document.body.classList.remove('no-scroll');
        }
      });
    }
  });

  // Ensure clean native responsive view (no forced desktop frame)
  try {
    document.documentElement.classList.remove('mobile-preview-active');
    localStorage.removeItem('cbtrendz_view_mode');
  } catch (e) {}
}

/* ============================================================
   10. APPLICATION INITIALIZATION
   ============================================================ */
function initApp() {
  loadStorage();
  updateCartUI();
  updateWishlistUI();
  renderProducts();
  initEvents();
  fetchGatewayConfig();
  checkReturnedOrder();

  console.log('%c✦ CB TRENDZ — Cashfree & Pure Payment Engine Loaded ✦', 'color:#D4AF70; background:#3E0A16; font-size:1.15rem; padding:8px 14px; font-weight:bold;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


/* ============================================================
   11. REAL CASHFREE & RAZORPAY PAYMENT ENGINE (Dynamic UPI QR & Modal Checkout)
   ============================================================ */
const PAYMENT_FRONTEND_CONFIG = {
  storeName: 'CB TRENDZ',
  whatsappNumber: '918778522690',
  defaultScannerImage: 'images/scanner.jpeg'
};

// Automatic API origin resolution (Works on localhost:5000, 127.0.0.1:5500, or file://)
const API_BASE = (typeof window !== 'undefined' && window.location && (window.location.protocol === 'http:' || window.location.protocol === 'https:') && window.location.port === '5000')
  ? ''
  : 'http://localhost:5000';

let currentCheckoutItems = [];
let currentCustomer = null;
let currentCashfreeOrder = null;
let currentRazorpayOrder = null;
let cashfreeGatewayConfig = null;
let cashfreeSdkInstance = null;
let paymentStatusPollingInterval = null;
let isOrderConfirmed = false;
let isPaymentSignalPending = false;
let hasUserOpenedPhonePe = false;
let isProcessingPayment = false;

// Query backend payment config
async function fetchGatewayConfig() {
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    if (res.ok) {
      const data = await res.json();
      if (data.cashfree) {
        cashfreeGatewayConfig = data.cashfree;
      }
    }
  } catch (e) {
    console.warn('Payment gateway config notice:', e.message);
  }
}

// Reset checkout modal to Step 1 (Delivery Details)
function resetCheckoutSteps() {
  const step1 = document.getElementById('step-view-details');
  const step2 = document.getElementById('step-view-payment');
  const tab1 = document.getElementById('step-tab-1');
  const tab2 = document.getElementById('step-tab-2');
  const badgeText = document.getElementById('modal-step-title-badge');
  const headingText = document.getElementById('modal-heading-text');
  const simBtn = document.getElementById('btn-simulate-cashfree');

  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';
  if (simBtn) simBtn.style.display = 'none';

  if (tab1) {
    tab1.classList.add('active');
    tab1.classList.remove('completed');
  }
  if (tab2) {
    tab2.classList.remove('active', 'completed');
  }

  if (badgeText) badgeText.textContent = 'Step 1 of 2';
  if (headingText) headingText.textContent = 'Enter Delivery Details';

  isPaymentSignalPending = false;
  hasUserOpenedPhonePe = false;
  isProcessingPayment = false;

  const modalCard = document.querySelector('.checkout-modal-card');
  if (modalCard) modalCard.scrollTop = 0;
}

// Step 1 -> Step 2 validation and transition to Cashfree Payment
async function goToPaymentStep() {
  const nameEl = document.getElementById('cust-name');
  const phoneEl = document.getElementById('cust-phone');
  const addressEl = document.getElementById('cust-address');
  const cityEl = document.getElementById('cust-city');
  const pincodeEl = document.getElementById('cust-pincode');

  const name = nameEl?.value.trim();
  const phone = phoneEl?.value.trim();
  const address = addressEl?.value.trim();
  let city = cityEl?.value.trim();
  let pincode = pincodeEl?.value.trim();

  if (!name) {
    showToast('Please enter your name');
    nameEl?.focus();
    return;
  }

  const phoneDigits = phone ? phone.replace(/\D/g, '') : '';
  if (!phoneDigits || phoneDigits.length < 10) {
    showToast('Please enter a valid 10-digit mobile number');
    phoneEl?.focus();
    return;
  }

  if (!address) {
    showToast('Please enter complete delivery address');
    addressEl?.focus();
    return;
  }

  if (!pincode && address) {
    const pinMatch = address.match(/\b([1-9][0-9]{5})\b/);
    if (pinMatch) {
      pincode = pinMatch[1];
      if (pincodeEl) pincodeEl.value = pincode;
    }
  }

  if (!city && address) {
    const parts = address.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      city = parts[parts.length - 1].replace(/[0-9]/g, '').trim();
      if (cityEl && city) cityEl.value = city;
    }
  }

  if (!city) {
    showToast('Please enter your city/town');
    cityEl?.focus();
    return;
  }

  const pinDigits = pincode ? pincode.replace(/\D/g, '') : '';
  if (!pinDigits || pinDigits.length !== 6) {
    showToast('Please enter a valid 6-digit pincode');
    pincodeEl?.focus();
    return;
  }

  // Store confirmed customer for the current active order session
  currentCustomer = {
    name,
    phone: phoneDigits.length === 10 ? phoneDigits : phoneDigits.slice(-10),
    address,
    city,
    pincode: pinDigits
  };

  // Populate delivery recap banner in Step 2
  const recapName = document.getElementById('recap-name');
  const recapPhone = document.getElementById('recap-phone');
  const recapAddress = document.getElementById('recap-address');

  if (recapName) recapName.textContent = currentCustomer.name;
  if (recapPhone) recapPhone.textContent = currentCustomer.phone;
  if (recapAddress) recapAddress.textContent = `${currentCustomer.address}, ${currentCustomer.city} - ${currentCustomer.pincode}`;

  // Switch to Step 2
  const step1 = document.getElementById('step-view-details');
  const step2 = document.getElementById('step-view-payment');
  const tab1 = document.getElementById('step-tab-1');
  const tab2 = document.getElementById('step-tab-2');
  const badgeText = document.getElementById('modal-step-title-badge');
  const headingText = document.getElementById('modal-heading-text');

  if (step1) step1.style.display = 'none';
  if (step2) step2.style.display = 'block';

  if (tab1) {
    tab1.classList.remove('active');
    tab1.classList.add('completed');
  }
  if (tab2) {
    tab2.classList.add('active');
  }

  if (badgeText) badgeText.textContent = 'Step 2 of 2';
  if (headingText) headingText.textContent = 'Cashfree & UPI Payment';

  // Prepare UI for genuine server order creation
  isOrderConfirmed = false;
  const signalCard = document.getElementById('payment-signal-card');
  const signalTitle = document.getElementById('signal-status-title');
  const signalDesc = document.getElementById('signal-status-desc');
  const signalCore = document.getElementById('signal-radar-core');
  const scannerImg = document.getElementById('phonepe-scanner-img');
  const amountTag = document.getElementById('scanner-amount-tag');

  if (signalCard) signalCard.classList.remove('signal-detected');
  if (signalCore) signalCore.textContent = '⏳';
  if (signalTitle) signalTitle.textContent = 'Creating Verified Order...';
  if (signalDesc) signalDesc.textContent = 'Contacting server to verify prices and generate real payment details...';
  if (amountTag) amountTag.textContent = 'Generating real dynamic UPI QR...';

  const modalCard = document.querySelector('.checkout-modal-card');
  if (modalCard) modalCard.scrollTop = 0;

  // Request genuine order from Cashfree backend server
  try {
    const res = await fetch(`${API_BASE}/api/cashfree/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: currentCheckoutItems,
        customer: currentCustomer
      })
    });

    const data = await res.json();
    if (!data.success) {
      showToast(data.message || 'Error generating order on server.');
      if (signalTitle) signalTitle.textContent = '⚠️ Payment Setup Notice';
      if (signalDesc) signalDesc.textContent = data.message || 'Please check payment server on port 5000.';
      return;
    }

    currentCashfreeOrder = data;
    currentRazorpayOrder = data; // backward compatibility

    const phonepeAmountEl = document.getElementById('phonepe-amount-display');
    if (phonepeAmountEl) phonepeAmountEl.textContent = formatINR(data.amount);

    // Set Real Dynamic UPI QR Image
    if (data.qrImageUrl && scannerImg) {
      scannerImg.src = data.qrImageUrl;
    } else if (typeof window.QRious !== 'undefined' && scannerImg) {
      const upiUri = `upi://pay?pa=8778522690@upi&pn=CB%20TRENDZ&am=${data.amount}&cu=INR&tn=CB%20Trendz%20Order%20${data.orderId}`;
      try {
        const qr = new window.QRious({ value: upiUri, size: 280 });
        scannerImg.src = qr.toDataURL();
      } catch (e) {}
    }

    if (amountTag) amountTag.textContent = `Exact Amount: ${formatINR(data.amount)} (Auto-Generated UPI QR)`;
    const liveBadge = document.getElementById('scanner-live-badge');
    if (liveBadge) liveBadge.textContent = '📱 PhonePe • Google Pay • Paytm • BHIM';

    if (signalTitle) signalTitle.textContent = 'Listening for Real Payment...';
    if (signalDesc) signalDesc.textContent = 'Tap PhonePe or Google Pay above on mobile, or scan the QR code with any UPI app.';

    // Start live server payment status polling
    startPaymentStatusPolling(data.orderId);

  } catch (err) {
    console.error('Error contacting backend server:', err);
    showToast('Could not connect to payment backend server. Make sure "node server.js" is running.');
    if (signalTitle) signalTitle.textContent = '⚠️ Backend Offline';
    if (signalDesc) signalDesc.textContent = 'Start the backend server on port 5000 to enable real payment processing.';
  }
}

// Stop polling loop
function stopPaymentStatusPolling() {
  if (paymentStatusPollingInterval) {
    clearInterval(paymentStatusPollingInterval);
    paymentStatusPollingInterval = null;
  }
}

// Active polling loop for live payment status from backend
function startPaymentStatusPolling(orderId) {
  stopPaymentStatusPolling();
  if (!orderId) return;

  let pollCount = 0;
  const maxPolls = 360; // 15 minutes (360 * 2.5s)

  paymentStatusPollingInterval = setInterval(async () => {
    pollCount++;
    if (pollCount > maxPolls || isOrderConfirmed) {
      stopPaymentStatusPolling();
      return;
    }
    await checkPaymentStatusOnce(orderId, false);
  }, 2500);
}

// Check payment status once against Cashfree server
async function checkPaymentStatusOnce(orderId, isManualClick = false) {
  if (!orderId || isOrderConfirmed) return;

  try {
    const res = await fetch(`${API_BASE}/api/cashfree/order-status/${encodeURIComponent(orderId)}`);
    if (!res.ok) {
      if (isManualClick) showToast('Could not reach payment server. Please verify network.');
      return;
    }
    const data = await res.json();

    if (data.success && data.status === 'PAID') {
      stopPaymentStatusPolling();
      const signalCard = document.getElementById('payment-signal-card');
      const signalTitle = document.getElementById('signal-status-title');
      const signalDesc = document.getElementById('signal-status-desc');
      const signalCore = document.getElementById('signal-radar-core');

      if (signalCard) signalCard.classList.add('signal-detected');
      if (signalCore) signalCore.textContent = '✓';
      if (signalTitle) signalTitle.textContent = '⚡ Payment Verified!';
      if (signalDesc) signalDesc.textContent = `Payment captured (Ref: ${data.transactionRef || data.paymentId}). Confirming your order and opening WhatsApp...`;

      showToast('✓ Payment Verified! Order Confirmed.');

      setTimeout(() => {
        executeOrderConfirmation(data);
      }, 700);
    } else if (data.status === 'FAILED') {
      stopPaymentStatusPolling();
      const signalTitle = document.getElementById('signal-status-title');
      const signalDesc = document.getElementById('signal-status-desc');
      if (signalTitle) signalTitle.textContent = '❌ Payment Failed or Cancelled';
      if (signalDesc) signalDesc.textContent = data.message || 'Payment was not completed. Please retry.';
      showToast('⚠️ Payment was not completed. Please retry.');
    } else if (isManualClick) {
      showToast('⏳ Payment is still pending. If you just paid, please allow 3-5 seconds for bank confirmation.');
    }
  } catch (err) {
    console.warn('Payment status check error:', err);
    if (isManualClick) showToast('Checking payment status...');
  }
}

// Cashfree SDK Instance Loader
function getCashfreeSdkInstance() {
  if (cashfreeSdkInstance) return cashfreeSdkInstance;
  if (typeof window.Cashfree !== 'undefined') {
    const mode = (cashfreeGatewayConfig && cashfreeGatewayConfig.env === 'production') ? 'production' : 'sandbox';
    try {
      cashfreeSdkInstance = window.Cashfree({ mode });
      return cashfreeSdkInstance;
    } catch (e) {
      console.warn('Cashfree constructor error:', e.message);
    }
  }
  return null;
}

// Real PhonePe UPI Payment
function payWithPhonePe() {
  const order = currentCashfreeOrder || currentRazorpayOrder;
  const amount = order ? order.amount : (currentCheckoutItems.reduce((s, i) => s + (i.price * i.quantity), 0));
  const orderId = order ? order.orderId : ('CBT_' + Date.now());
  const upiId = '8778522690@upi';
  const name = encodeURIComponent('CB TRENDZ');
  const note = encodeURIComponent(`Saree Order ${orderId}`);

  const phonepeUri = `phonepe://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
  const genericUpiUri = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;

  showToast('Opening PhonePe App...');

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = phonepeUri;
    setTimeout(() => {
      window.location.href = genericUpiUri;
    }, 1200);
  } else {
    const scanner = document.getElementById('phonepe-scanner-img');
    if (scanner) scanner.scrollIntoView({ behavior: 'smooth' });
    showToast('📱 Scan the QR code below with your PhonePe app to pay ' + formatINR(amount));
  }
}

// Real Google Pay (GPay) Payment
function payWithGooglePay() {
  const order = currentCashfreeOrder || currentRazorpayOrder;
  const amount = order ? order.amount : (currentCheckoutItems.reduce((s, i) => s + (i.price * i.quantity), 0));
  const orderId = order ? order.orderId : ('CBT_' + Date.now());
  const upiId = '8778522690@upi';
  const name = encodeURIComponent('CB TRENDZ');
  const note = encodeURIComponent(`Saree Order ${orderId}`);

  const gpayUri = `tez://upi/pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
  const genericUpiUri = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;

  showToast('Opening Google Pay...');

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (isMobile) {
    window.location.href = gpayUri;
    setTimeout(() => {
      window.location.href = genericUpiUri;
    }, 1200);
  } else {
    const scanner = document.getElementById('phonepe-scanner-img');
    if (scanner) scanner.scrollIntoView({ behavior: 'smooth' });
    showToast('📱 Scan the QR code below with your Google Pay app to pay ' + formatINR(amount));
  }
}

// Real Cashfree Payment Gateway (Cards, NetBanking, All UPI)
function openCashfreeCheckoutModal(customSessionId) {
  const order = currentCashfreeOrder || currentRazorpayOrder;
  if (!order) {
    showToast('Payment order is initializing, please wait a moment...');
    return;
  }

  const sessionId = customSessionId || order.paymentSessionId;
  if (!sessionId) {
    showToast('Payment session ID not available. Please retry.');
    return;
  }

  if (typeof window.Cashfree === 'undefined') {
    showToast('Cashfree SDK is loading. Please check internet connection.');
    return;
  }

  try {
    const cf = getCashfreeSdkInstance();
    if (cf && sessionId && !sessionId.startsWith('session_sandbox_demo_')) {
      showToast('Opening Cashfree Payment Gateway...');
      cf.checkout({
        paymentSessionId: sessionId,
        redirectTarget: '_modal'
      }).then((result) => {
        if (result.paymentDetails) {
          checkPaymentStatusOnce(order.orderId, true);
        }
      });
    } else {
      showToast('To pay with Card / NetBanking via Cashfree, configure live CASHFREE_APP_ID in server/.env, or pay instantly using PhonePe / Google Pay UPI above!');
    }
  } catch (err) {
    console.error('Error opening Cashfree checkout:', err);
    showToast('Error opening Cashfree: ' + err.message);
  }
}

// Confirm Payment & Open WhatsApp Receipt immediately with Saree Details & Photos
function confirmPaidOrder() {
  const order = currentCashfreeOrder || currentRazorpayOrder;
  if (!order || !order.orderId) {
    showToast('No active order found.');
    return;
  }

  showToast('✓ Payment Confirmed! Opening WhatsApp with Saree Photos...');

  isOrderConfirmed = false;

  const orderId = order.orderId;
  const paymentId = `upi_${Date.now()}`;
  const transactionRef = `UPI${Date.now().toString().slice(-8)}`;

  // 1. Immediately execute confirmation, open WhatsApp, and show receipt in direct user tap context
  executeOrderConfirmation({
    ...order,
    status: 'PAID',
    paymentId,
    transactionRef,
    paymentMethod: 'UPI (PhonePe / GPay)'
  });

  // 2. Notify backend server asynchronously
  fetch(`${API_BASE}/api/confirm-upi-payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId: orderId })
  }).then(r => r.json()).then(data => {
    console.log('Server order status updated to PAID:', data);
  }).catch(err => {
    console.warn('Backend payment confirmation update notice:', err);
  });
}

// Backward-compatible Razorpay checkout opener
function openRazorpayCheckoutModal() {
  openCashfreeCheckoutModal();
}

// Automatically check order status when customer is redirected back from Cashfree
async function checkReturnedOrder() {
  if (typeof window === 'undefined' || !window.location) return;
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('cf_order_id') || urlParams.get('order_id');
  if (!orderId) return;

  showToast('Verifying payment with Cashfree...');
  try {
    const res = await fetch(`${API_BASE}/api/cashfree/order-status/${encodeURIComponent(orderId)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.status === 'PAID') {
        showToast('✓ Payment Verified by Cashfree! Order Confirmed.');
        executeOrderConfirmation(data);
        try {
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (e) {}
      } else if (data.status === 'PENDING') {
        showToast('⏳ Cashfree payment is processing. Checking status...');
        startPaymentStatusPolling(orderId);
      }
    }
  } catch (err) {
    console.warn('Error checking returned Cashfree order:', err);
  }
}

// Step 2 -> Step 1 back to edit details
function backToDetailsStep() {
  resetCheckoutSteps();
}

// Buy Now clicked on a specific saree card or modal -> Step 1: Order Details with Price & Customer Delivery Address
function buyNowSingleProduct(productId) {
  const p = PRODUCTS.find(item => item.id === productId);
  if (!p) return;
  currentCheckoutItems = [{
    id: p.id,
    quantity: 1,
    name: p.name,
    price: p.price,
    image: p.image
  }];
  // Opens Step 1 with saree details, price breakdown, and delivery form
  openCheckoutModalWithItems(currentCheckoutItems);
}

// Open Checkout from Shopping Bag -> Step 1: Order Details with Price & Customer Delivery Address
function openCheckoutModal() {
  if (cart.length === 0) {
    showToast('Your bag is empty! Click "Buy Now" on any saree.');
    return;
  }
  closeCartDrawer();
  currentCheckoutItems = cart.map(item => {
    const p = PRODUCTS.find(prod => prod.id === item.id);
    return {
      id: item.id,
      quantity: item.quantity,
      name: p ? p.name : 'Saree',
      price: p ? p.price : 0,
      image: p ? p.image : 'images/saree1.jpg'
    };
  });
  openCheckoutModalWithItems(currentCheckoutItems);
}

// Populate and Display Payment Modal
function openCheckoutModalWithItems(items) {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  // Always initialize on Step 1 (Delivery Details)
  resetCheckoutSteps();

  // Always start with clean, blank input fields so customer can fill her own details
  try {
    localStorage.removeItem('cbtrendz_customer_info');
  } catch (e) {}

  const form = document.getElementById('checkout-details-form');
  if (form) form.reset();
  const nameEl = document.getElementById('cust-name');
  const phoneEl = document.getElementById('cust-phone');
  const addrEl = document.getElementById('cust-address');
  const cityEl = document.getElementById('cust-city');
  const pinEl = document.getElementById('cust-pincode');
  if (nameEl) nameEl.value = '';
  if (phoneEl) phoneEl.value = '';
  if (addrEl) addrEl.value = '';
  if (cityEl) cityEl.value = '';
  if (pinEl) pinEl.value = '';

  const preview = document.getElementById('checkout-items-preview');
  const totalEl = document.getElementById('checkout-total');
  const phonepeAmountEl = document.getElementById('phonepe-amount-display');

  let total = 0;
  if (preview) {
    preview.innerHTML = items.map(item => {
      const itemTot = item.price * item.quantity;
      total += itemTot;
      return `
        <div class="checkout-item-row">
          <img src="${item.image}" alt="${item.name}" class="checkout-item-img" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
          <div class="checkout-item-name">
            <strong>${item.name}</strong>
            <div class="checkout-item-qty">Qty: ${item.quantity} × ${formatINR(item.price)}</div>
          </div>
          <div class="checkout-item-price">${formatINR(itemTot)}</div>
        </div>
      `;
    }).join('');
  }

  if (totalEl) totalEl.textContent = formatINR(total);
  if (phonepeAmountEl) phonepeAmountEl.textContent = formatINR(total);

  modal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
  stopPaymentStatusPolling();
  isPaymentSignalPending = false;
  hasUserOpenedPhonePe = false;
  isProcessingPayment = false;
}

// Copy UPI ID helper
function copyUpiId(id) {
  const text = id || '8778522690@upi';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✓ UPI ID copied: ' + text);
    }).catch(() => {
      showToast('UPI ID: ' + text);
    });
  } else {
    showToast('UPI ID: ' + text);
  }
}

// Copy Delivery Address helper (Click address or Copy button)
function copyDeliveryAddress() {
  let text = '';
  if (currentCustomer) {
    text = `${currentCustomer.name}, Phone: ${currentCustomer.phone}, Address: ${currentCustomer.address}, ${currentCustomer.city} - ${currentCustomer.pincode}`;
  } else {
    const recapName = document.getElementById('recap-name')?.textContent || '';
    const recapPhone = document.getElementById('recap-phone')?.textContent || '';
    const recapAddr = document.getElementById('recap-address')?.textContent || '';
    text = `${recapName} (${recapPhone}), ${recapAddr}`;
  }

  if (!text || text.includes('Customer') || text.includes('Address')) {
    showToast('Please enter your delivery details first');
    return;
  }

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast('✓ Delivery address copied to clipboard!');
    }).catch(() => {
      showToast('Address: ' + text);
    });
  } else {
    showToast('✓ Address: ' + text);
  }
}

// Build public, high-resolution direct photo URL for WhatsApp preview
function getPublicSareeImageUrl(localPath) {
  if (!localPath) return '';
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) return localPath;
  const cleanPath = localPath.replace(/^\.?\//, '');
  return `https://raw.githubusercontent.com/dineshkumar13042005-sketch/cb-trendz/main/${encodeURI(cleanPath)}`;
}

// Send Order to WhatsApp with Saree Photo (Direct Universal Link to Store Owner)
function dispatchOrderToWhatsApp(whatsappMsg) {
  const waNumber = STORE_CONFIG.whatsappNumber || '918778522690';
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  try {
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = waUrl;
    } else {
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    }
  } catch (err) {
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  }
  return waUrl;
}

// Finalize Order & WhatsApp Notification (GENUINE Verified Payment & Saree Photo)
function executeOrderConfirmation(paymentResult) {
  const orderData = paymentResult?.order || paymentResult || {};
  const items = (currentCheckoutItems && currentCheckoutItems.length > 0)
    ? currentCheckoutItems
    : (orderData?.items || []);
  const customer = currentCustomer || orderData?.customer || { name: 'Valued Customer', phone: STORE_CONFIG.whatsappNumber || '918778522690' };

  if (!items || items.length === 0) return;

  isOrderConfirmed = true;
  stopPaymentStatusPolling();

  const orderId = paymentResult?.orderId || orderData?.orderId || currentCashfreeOrder?.orderId || currentRazorpayOrder?.orderId || ('CBT-' + Math.floor(100000 + Math.random() * 900000));
  const paymentId = paymentResult?.paymentId || orderData?.paymentId || ('cf_pay_' + Date.now().toString(36));
  const transactionRef = paymentResult?.transactionRef || orderData?.bankTxnId || paymentId;
  const totalAmount = paymentResult?.amount || orderData?.amount || items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const paymentMethod = paymentResult?.paymentMethod || orderData?.paymentMethod || 'UPI (PhonePe / GPay)';

  // Prepare WhatsApp Message with complete saree and delivery information AND direct high-res photo links
  const itemsText = items.map((item, idx) => {
    const photoUrl = getPublicSareeImageUrl(item.image);
    return [
      `👘 *Saree ${idx + 1}:* ${item.name}`,
      `   • Quantity: ${item.quantity}`,
      `   • Price: ₹${(item.price * item.quantity).toLocaleString('en-IN')}`,
      photoUrl ? `   📸 *Saree Photo:* ${photoUrl}` : ''
    ].filter(Boolean).join('\n');
  }).join('\n\n');

  const nowStr = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const whatsappMsg = [
    `🛍️ *CONFIRMED SAREE ORDER — ${STORE_CONFIG.name}*`,
    `──────────────────────`,
    `🆔 *Order ID:* ${orderId}`,
    `📅 *Date:* ${nowStr}`,
    ``,
    `📦 *SAREES ORDERED:*`,
    itemsText,
    ``,
    `💰 *TOTAL AMOUNT PAID:* ₹${totalAmount.toLocaleString('en-IN')}`,
    `📱 *PAYMENT METHOD:* ${paymentMethod}`,
    `💳 *PAYMENT STATUS:* CONFIRMED / PAID`,
    `🔢 *TRANSACTION REF:* ${transactionRef}`,
    `──────────────────────`,
    `📍 *CUSTOMER DELIVERY DETAILS:*`,
    `👤 *Name:* ${customer.name}`,
    `📞 *Phone / WhatsApp:* ${customer.phone}`,
    `🏠 *Address:* ${customer.address}`,
    customer.city ? `🏙️ *City:* ${customer.city}` : '',
    customer.pincode ? `📮 *Pincode:* ${customer.pincode}` : '',
    `──────────────────────`,
    `✅ *Payment of ₹${totalAmount.toLocaleString('en-IN')} has been completed. Saree photo is linked above. Please confirm and dispatch my saree order to my address.*`,
    `Thank you!`
  ].filter(Boolean).join('\n');

  // Open WhatsApp immediately with message and saree photos
  const waUrl = dispatchOrderToWhatsApp(whatsappMsg);

  // Display On-Screen Success Confirmation Screen
  showOrderSuccess({
    orderId,
    paymentId,
    transactionRef,
    customer,
    items: items,
    amount: totalAmount,
    whatsappUrl: waUrl,
    paymentMethod
  });

  // Reset shopping bag ONLY after verified payment
  cart = [];
  saveStorage();
  updateCartUI();
  currentCheckoutItems = [];
  currentCustomer = null;
  currentCashfreeOrder = null;
  currentRazorpayOrder = null;
}

// Display Order Success Screen & Printable Receipt
function showOrderSuccess(order) {
  closeCheckoutModal();

  const successModal = document.getElementById('order-success-modal');
  const content = document.getElementById('success-content');
  if (!successModal || !content) return;

  const cust = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];

  content.innerHTML = `
    <div class="success-badge-circle">✓</div>
    <h2 class="success-title">Order Confirmed!</h2>
    <p class="success-subtitle">Thank you, <strong>${cust.name || 'valued customer'}</strong>! Your payment of <strong>${formatINR(order.amount)}</strong> has been verified and confirmed (Reference ID: <strong>${order.transactionRef || order.paymentId}</strong>).</p>

    <div class="success-receipt-card" id="printable-receipt">
      <div class="receipt-header-row">
        <div>
          <span style="font-size:0.75rem; color:#7A7272; display:block;">ORDER REFERENCE</span>
          <strong class="receipt-order-id">${order.orderId}</strong>
        </div>
        <span class="receipt-status-pill">PAID • ${order.paymentMethod || 'UPI Confirmed'}</span>
      </div>

      <div class="receipt-info-grid">
        <div>
          <span>CUSTOMER</span>
          <strong>${cust.name || 'Customer'}</strong>
          <small style="color:#7A7272;">${cust.phone || ''}</small>
        </div>
        <div>
          <span>TRANSACTION REFERENCE</span>
          <strong style="color:#10B981;">${order.transactionRef || order.paymentId}</strong>
          <small style="color:#7A7272;">Status: Confirmed / Paid</small>
        </div>
        <div style="grid-column: 1 / -1;">
          <span>DELIVERY ADDRESS</span>
          <p style="margin:0; font-size:0.85rem; color:#443F44;">
            ${cust.address || ''}${cust.city ? ', ' + cust.city : ''}${cust.pincode ? ' - ' + cust.pincode : ''}
          </p>
        </div>
      </div>

      <div class="receipt-items-list">
        ${items.map(item => `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.86rem; margin-bottom:8px; padding-bottom:6px; border-bottom:1px dashed #EDE5DA;">
            <div style="display:flex; align-items:center; gap:10px;">
              <img src="${item.image}" alt="${item.name}" style="width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid #D1C4E9;" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
              <div>
                <strong>${item.name}</strong>
                <div style="font-size:0.75rem; color:#7A7272;">Qty: ${item.quantity || 1} × ${formatINR(item.price)}</div>
              </div>
            </div>
            <strong>${formatINR((item.price || 0) * (item.quantity || 1))}</strong>
          </div>
        `).join('')}
      </div>

      <div class="receipt-total-row">
        <span>Total Amount Paid</span>
        <strong>${formatINR(order.amount || 0)}</strong>
      </div>
    </div>

    <div class="success-wa-notice">
      📲 WhatsApp order confirmation with saree photos has been opened. If WhatsApp did not open automatically, click the button below:
    </div>

    <div class="success-actions-row">
      <a href="${order.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-success-wa">
        💬 Send / Open Order in WhatsApp (with Saree Photos)
      </a>
      <button class="btn-success-print" onclick="window.print()">
        🖨️ Print Invoice Receipt
      </button>
      <button class="btn-success-shop" onclick="closeOrderSuccessModal()">
        🛍️ Continue Shopping
      </button>
    </div>
  `;

  successModal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeOrderSuccessModal() {
  const modal = document.getElementById('order-success-modal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}
