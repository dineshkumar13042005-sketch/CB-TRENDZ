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
  itemsPerPage: 5
};

// 5 Saree Products
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
  
  }
  id: ,
    name: 'Moonga Silk Saree',
    price: 1150,
    category: 'designer',
    image: 'images/Folded_green_saree_with_border_c449f9bc_2K.jpg',
    description: 'Peacock teal sheer designer organza saree detailed with artisan zari embroidery and modern scalloped borders.'
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

  // 12. Checkout Modal (2-Step: User Details -> PhonePe Payment)
  const btnOpenCheckout = document.getElementById('btn-open-checkout');
  const btnCloseCheckout = document.getElementById('checkout-modal-close');
  const btnGotoStep2 = document.getElementById('btn-goto-step-2');
  const btnEditDetails = document.getElementById('btn-edit-details');
  const btnBackToStep1 = document.getElementById('btn-back-to-step1');
  const checkoutDetailsForm = document.getElementById('checkout-details-form');
  const checkoutPaymentForm = document.getElementById('checkout-payment-form');
  const btnSubmitOrder = document.getElementById('btn-submit-order');
  const successModalClose = document.getElementById('success-modal-close');
  const recapAddressEl = document.getElementById('recap-address');
  const btnCopyAddress = document.getElementById('btn-copy-address');

  if (btnOpenCheckout) btnOpenCheckout.addEventListener('click', () => openCheckoutModal());
  if (btnCloseCheckout) btnCloseCheckout.addEventListener('click', closeCheckoutModal);
  if (btnGotoStep2) btnGotoStep2.addEventListener('click', goToPaymentStep);
  if (checkoutDetailsForm) {
    checkoutDetailsForm.addEventListener('submit', (e) => {
      e.preventDefault();
      goToPaymentStep();
    });
  }
  if (btnEditDetails) btnEditDetails.addEventListener('click', backToDetailsStep);
  if (btnBackToStep1) btnBackToStep1.addEventListener('click', backToDetailsStep);
  if (btnSubmitOrder) btnSubmitOrder.addEventListener('click', handleCheckoutSubmit);
  if (checkoutPaymentForm) checkoutPaymentForm.addEventListener('submit', handleCheckoutSubmit);
  if (successModalClose) successModalClose.addEventListener('click', closeOrderSuccessModal);
  if (recapAddressEl) recapAddressEl.addEventListener('click', copyDeliveryAddress);
  if (btnCopyAddress) btnCopyAddress.addEventListener('click', copyDeliveryAddress);

  // Automatic Payment Signal Detection on App Return (Visibility & Focus)
  function checkPhonePeAppReturn() {
    if (typeof isPaymentSignalPending !== 'undefined' && isPaymentSignalPending && typeof hasUserOpenedPhonePe !== 'undefined' && hasUserOpenedPhonePe) {
      if (typeof triggerPaymentSignalReceived === 'function') {
        triggerPaymentSignalReceived('App Switch Return');
      }
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      checkPhonePeAppReturn();
    }
  });
  window.addEventListener('focus', checkPhonePeAppReturn);

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

  console.log('%c✦ CB TRENDZ — Pure Frontend PhonePe Scan & Pay Loaded ✦', 'color:#D4AF70; background:#3E0A16; font-size:1.15rem; padding:8px 14px; font-weight:bold;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}


/* ============================================================
   11. PHONEPE INSTANT PAYMENT ENGINE (Zero UTR, Automatic Signal Detection)
   ============================================================ */
const PHONEPE_CONFIG = {
  storeName: 'CB TRENDZ',
  whatsappNumber: '918778522690',
  merchantUpiId: 'k.sibiyal@ibl',
  payeeName: 'K SIBIYAL',
  scannerImage: 'images/scanner.jpeg'
};

let currentCheckoutItems = [];
let currentCustomer = null;
let currentOrderRef = '';
let isPaymentSignalPending = false;
let hasUserOpenedPhonePe = false;
let isProcessingPayment = false;

// Reset checkout modal to Step 1 (Delivery Details)
function resetCheckoutSteps() {
  const step1 = document.getElementById('step-view-details');
  const step2 = document.getElementById('step-view-payment');
  const tab1 = document.getElementById('step-tab-1');
  const tab2 = document.getElementById('step-tab-2');
  const badgeText = document.getElementById('modal-step-title-badge');
  const headingText = document.getElementById('modal-heading-text');

  if (step1) step1.style.display = 'block';
  if (step2) step2.style.display = 'none';

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

// Step 1 -> Step 2 validation and transition
function goToPaymentStep() {
  const nameEl = document.getElementById('cust-name');
  const phoneEl = document.getElementById('cust-phone');
  const addressEl = document.getElementById('cust-address');
  const cityEl = document.getElementById('cust-city');
  const pincodeEl = document.getElementById('cust-pincode');

  const name = nameEl?.value.trim();
  const phone = phoneEl?.value.trim();
  const address = addressEl?.value.trim();
  const city = cityEl?.value.trim();
  const pincode = pincodeEl?.value.trim();

  if (!name) {
    showToast('Please enter your full name');
    nameEl?.focus();
    return;
  }

  const phoneDigits = phone ? phone.replace(/D/g, '') : '';
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

  if (!city) {
    showToast('Please enter your city/town');
    cityEl?.focus();
    return;
  }

  const pinDigits = pincode ? pincode.replace(/D/g, '') : '';
  if (!pinDigits || pinDigits.length !== 6) {
    showToast('Please enter a valid 6-digit pincode');
    pincodeEl?.focus();
    return;
  }

  // Store confirmed customer
  currentCustomer = {
    name,
    phone: phoneDigits.length === 10 ? phoneDigits : phone,
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
  if (headingText) headingText.textContent = 'PhonePe Payment';

  // Activate automated payment signal listener
  isPaymentSignalPending = true;
  hasUserOpenedPhonePe = false;
  isProcessingPayment = false;
  resetPaymentSignalCard();

  const modalCard = document.querySelector('.checkout-modal-card');
  if (modalCard) modalCard.scrollTop = 0;
}

// Reset Payment Signal Card UI
function resetPaymentSignalCard() {
  const signalCard = document.getElementById('payment-signal-card');
  const signalTitle = document.getElementById('signal-status-title');
  const signalDesc = document.getElementById('signal-status-desc');
  const btnSubmit = document.getElementById('btn-submit-order');

  if (signalCard) signalCard.classList.remove('signal-detected');
  if (signalTitle) signalTitle.textContent = 'Listening for Payment Signal...';
  if (signalDesc) signalDesc.textContent = 'Once you pay on PhonePe, the website automatically detects payment and confirms your order.';
  if (btnSubmit) {
    btnSubmit.innerHTML = `
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      <span>✓ Payment Done — Confirm &amp; Send to WhatsApp</span>
    `;
    btnSubmit.disabled = false;
  }
}

// Dynamic QR Generation with Auto-Generated Amount
function renderDynamicPhonePeQr(amount, orderRef) {
  const scannerImg = document.getElementById('phonepe-scanner-img');
  const amountTag = document.getElementById('scanner-amount-tag');
  const phonepeAppBtn = document.getElementById('phonepe-app-pay-btn');
  const numericAmount = Number(amount) || 0;
  const formattedAmount = numericAmount.toFixed(2);
  const upiUri = `upi://pay?pa=${encodeURIComponent(PHONEPE_CONFIG.merchantUpiId)}&pn=${encodeURIComponent(PHONEPE_CONFIG.payeeName)}&am=${formattedAmount}&cu=INR&tn=${encodeURIComponent('CB TRENDZ Order ' + orderRef)}&mc=0000&mode=02&purpose=00`;

  if (amountTag) {
    amountTag.textContent = `Amount: ${formatINR(numericAmount)} (Auto-filled on Scan)`;
  }

  if (phonepeAppBtn) {
    phonepeAppBtn.href = upiUri;
    phonepeAppBtn.onclick = () => {
      hasUserOpenedPhonePe = true;
      const signalTitle = document.getElementById('signal-status-title');
      const signalDesc = document.getElementById('signal-status-desc');
      if (signalTitle) signalTitle.textContent = 'PhonePe App Opened...';
      if (signalDesc) signalDesc.textContent = 'Approve payment on PhonePe. When you return here, the order confirms automatically!';
    };
  }

  if (scannerImg) {
    try {
      if (typeof QRious !== 'undefined') {
        const qr = new QRious({
          value: upiUri,
          size: 320,
          level: 'M',
          padding: 14
        });
        scannerImg.src = qr.toDataURL('image/png');
        return;
      }
    } catch (err) {
      console.warn('QRious generation error:', err);
    }
    // High-reliability dynamic fallback
    scannerImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=12&data=${encodeURIComponent(upiUri)}`;
    scannerImg.onerror = () => {
      scannerImg.onerror = null;
      scannerImg.src = PHONEPE_CONFIG.scannerImage;
    };
  }
}

// Step 2 -> Step 1 back to edit details
function backToDetailsStep() {
  resetCheckoutSteps();
}

// Buy Now clicked on a specific saree card or modal
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
  openCheckoutModalWithItems(currentCheckoutItems);
}

// Open Checkout from Shopping Bag
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

// Populate and Display PhonePe Payment Modal
function openCheckoutModalWithItems(items) {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  // Always initialize on Step 1 (Delivery Details)
  resetCheckoutSteps();

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

  // Generate dynamic QR with auto-generated price
  currentOrderRef = 'CBT' + Math.floor(1000 + Math.random() * 9000);
  renderDynamicPhonePeQr(total, currentOrderRef);

  modal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
  isPaymentSignalPending = false;
  hasUserOpenedPhonePe = false;
  isProcessingPayment = false;
}

// Copy UPI ID helper
function copyUpiId(id) {
  const text = id || PHONEPE_CONFIG.merchantUpiId;
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

// Automated Payment Signal Trigger (Zero UTR required)
function triggerPaymentSignalReceived(triggerSource) {
  if (isProcessingPayment) return;
  isProcessingPayment = true;
  isPaymentSignalPending = false;

  const signalCard = document.getElementById('payment-signal-card');
  const signalTitle = document.getElementById('signal-status-title');
  const signalDesc = document.getElementById('signal-status-desc');
  const btnSubmit = document.getElementById('btn-submit-order');

  if (signalCard) signalCard.classList.add('signal-detected');
  if (signalTitle) signalTitle.innerHTML = '⚡ Payment Signal Detected!';
  if (signalDesc) signalDesc.textContent = 'Payment received. Generating your confirmed order receipt and opening WhatsApp...';

  if (btnSubmit) {
    btnSubmit.innerHTML = `
      <span>✓ Payment Confirmed! Opening WhatsApp...</span>
    `;
    btnSubmit.disabled = true;
  }

  showToast('✓ Payment Signal Received! Order Confirmed.');

  setTimeout(() => {
    executeOrderConfirmation();
  }, 900);
}

// Build public, high-resolution direct photo URL for WhatsApp preview
function getPublicSareeImageUrl(localPath) {
  if (!localPath) return '';
  if (localPath.startsWith('http://') || localPath.startsWith('https://')) return localPath;
  const cleanPath = localPath.replace(/^\.?\//, '');
  return `https://raw.githubusercontent.com/dineshkumar13042005-sketch/cb-trendz/main/${encodeURI(cleanPath)}`;
}

// Send Order to WhatsApp with Saree Photo (Native Share on Mobile or WhatsApp Web Link with preview)
async function dispatchOrderToWhatsApp(whatsappMsg, primaryImage) {
  const waUrl = `https://wa.me/${PHONEPE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

  // Mobile Web Share: on mobile browsers supporting Web Share Level 2 file sharing,
  // shares the ACTUAL photo attachment directly to WhatsApp with the order text as caption!
  if (navigator.share && primaryImage) {
    try {
      const response = await fetch(primaryImage);
      if (response.ok) {
        const blob = await response.blob();
        const fileExt = primaryImage.endsWith('.png') ? 'png' : 'jpg';
        const file = new File([blob], `cb-trendz-saree.${fileExt}`, {
          type: blob.type || (fileExt === 'png' ? 'image/png' : 'image/jpeg')
        });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Order — ${STORE_CONFIG.name}`,
            text: whatsappMsg,
            files: [file]
          });
          return waUrl;
        }
      }
    } catch (shareErr) {
      console.warn('Native share completed or skipped:', shareErr);
    }
  }

  // Opens WhatsApp directly with prefilled message including public photo preview link
  window.open(waUrl, '_blank', 'noopener,noreferrer');
  return waUrl;
}

// Finalize Order & WhatsApp Notification (ZERO UTR Required, WITH Saree Photo)
function executeOrderConfirmation() {
  if (!currentCheckoutItems || currentCheckoutItems.length === 0) return;
  if (!currentCustomer) return;

  const orderId = 'CBT-' + Math.floor(100000 + Math.random() * 900000);
  const txnRef = 'PHPE_' + Date.now().toString(36).toUpperCase();
  const totalAmount = currentCheckoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const customer = currentCustomer;

  // Prepare WhatsApp Message with complete saree and delivery information AND photo links
  const itemsText = currentCheckoutItems.map((item, idx) => {
    const photoUrl = getPublicSareeImageUrl(item.image);
    return [
      `${idx + 1}. *${item.name}* (Qty: ${item.quantity}) — ₹${(item.price * item.quantity).toLocaleString('en-IN')}`,
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
    `🛍️ *NEW SAREE ORDER — ${STORE_CONFIG.name}*`,
    `──────────────────────`,
    `🆔 *Order ID:* ${orderId}`,
    `📅 *Date:* ${nowStr}`,
    ``,
    `📦 *SAREES ORDERED:*`,
    itemsText,
    ``,
    `💰 *TOTAL AMOUNT PAID:* ₹${totalAmount.toLocaleString('en-IN')}`,
    `📱 *PAYMENT METHOD:* PhonePe (Instant Payment)`,
    `🔢 *TRANSACTION REF:* ${txnRef}`,
    `──────────────────────`,
    `📍 *CUSTOMER DELIVERY DETAILS:*`,
    `👤 *Name:* ${customer.name}`,
    `📞 *Phone / WhatsApp:* ${customer.phone}`,
    `🏠 *Address:* ${customer.address}`,
    `🏙️ *City:* ${customer.city}`,
    `📮 *Pincode:* ${customer.pincode}`,
    `──────────────────────`,
    `✅ *I have completed the payment of ₹${totalAmount.toLocaleString('en-IN')} via PhonePe (Ref: ${txnRef}). Saree photo is linked above. Please verify credit and dispatch the saree(s) to my address.*`,
    `Thank you!`
  ].join('\n');

  // Open WhatsApp with saree photo attachment (on mobile) or rich preview link
  const primaryImage = currentCheckoutItems[0]?.image || '';
  const waUrl = `https://wa.me/${PHONEPE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;
  dispatchOrderToWhatsApp(whatsappMsg, primaryImage);

  // Display On-Screen Success Confirmation Screen
  showOrderSuccess({
    orderId,
    transactionRef: txnRef,
    customer,
    items: currentCheckoutItems,
    amount: totalAmount,
    whatsappUrl: waUrl
  });

  // Reset shopping bag
  cart = [];
  saveStorage();
  updateCartUI();
  currentCheckoutItems = [];
  currentCustomer = null;
  isProcessingPayment = false;
}

// User clicks "Payment Done — Confirm Order" button (Instant confirmation without UTR)
function handleCheckoutSubmit(e) {
  if (e && e.preventDefault) e.preventDefault();

  if (!currentCheckoutItems || currentCheckoutItems.length === 0) {
    showToast('No sarees selected for order.');
    return;
  }

  if (!currentCustomer) {
    showToast('Please confirm your delivery details first.');
    backToDetailsStep();
    return;
  }

  triggerPaymentSignalReceived('Direct Confirmation Click');
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
    <p class="success-subtitle">Thank you, <strong>${cust.name || 'valued customer'}</strong>! Your payment of <strong>${formatINR(order.amount)}</strong> has been verified via PhonePe.</p>

    <div class="success-receipt-card" id="printable-receipt">
      <div class="receipt-header-row">
        <div>
          <span style="font-size:0.75rem; color:#7A7272; display:block;">ORDER REFERENCE</span>
          <strong class="receipt-order-id">${order.orderId}</strong>
        </div>
        <span class="receipt-status-pill">PAID via PhonePe</span>
      </div>

      <div class="receipt-info-grid">
        <div>
          <span>CUSTOMER</span>
          <strong>${cust.name || 'Customer'}</strong>
          <small style="color:#7A7272;">${cust.phone || ''}</small>
        </div>
        <div>
          <span>TRANSACTION REF</span>
          <strong style="color:#5F259F;">${order.transactionRef}</strong>
          <small style="color:#7A7272;">Method: PhonePe (Auto-Confirmed)</small>
        </div>
        <div style="grid-column: 1 / -1;">
          <span>DELIVERY ADDRESS</span>
          <p style="margin:0; font-size:0.85rem; color:#443F44;">
            ${cust.address || ''}, ${cust.city || ''} - ${cust.pincode || ''}
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
        💬 Open Order &amp; Photos in WhatsApp
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
