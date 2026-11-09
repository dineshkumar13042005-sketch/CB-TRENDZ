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
    price: 1350,
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
    return `${idx + 1}. ${p.name} - Qty: ${item.quantity} (₹${p.price.toLocaleString('en-IN')})`;
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
  const checkoutPaymentForm = document.getElementById('checkout-payment-form');
  const successModalClose = document.getElementById('success-modal-close');

  if (btnOpenCheckout) btnOpenCheckout.addEventListener('click', () => openCheckoutModal());
  if (btnCloseCheckout) btnCloseCheckout.addEventListener('click', closeCheckoutModal);
  if (btnGotoStep2) btnGotoStep2.addEventListener('click', goToPaymentStep);
  if (btnEditDetails) btnEditDetails.addEventListener('click', backToDetailsStep);
  if (btnBackToStep1) btnBackToStep1.addEventListener('click', backToDetailsStep);
  if (checkoutPaymentForm) checkoutPaymentForm.addEventListener('submit', handleCheckoutSubmit);
  if (successModalClose) successModalClose.addEventListener('click', closeOrderSuccessModal);

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

  // 13. Mobile / Desktop View Mode Toggle Engine
  const btnToggleView = document.getElementById('btn-toggle-view');
  if (btnToggleView) {
    const savedMode = localStorage.getItem('cbtrendz_view_mode');
    // Default to mobile view active as requested
    const isMobileMode = savedMode === null ? true : (savedMode === 'mobile');

    if (isMobileMode && window.innerWidth > 768) {
      document.documentElement.classList.add('mobile-preview-active');
      btnToggleView.innerHTML = '<span class="view-icon">🖥️</span><span class="view-text">Desktop View</span>';
    } else {
      btnToggleView.innerHTML = '<span class="view-icon">📱</span><span class="view-text">Mobile View</span>';
    }

    btnToggleView.addEventListener('click', () => {
      const active = document.documentElement.classList.toggle('mobile-preview-active');
      localStorage.setItem('cbtrendz_view_mode', active ? 'mobile' : 'desktop');
      btnToggleView.innerHTML = active
        ? '<span class="view-icon">🖥️</span><span class="view-text">Desktop View</span>'
        : '<span class="view-icon">📱</span><span class="view-text">Mobile View</span>';
      showToast(active ? '📱 Mobile View Enabled' : '🖥️ Desktop View Enabled');
    });
  }
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
   11. PHONEPE SCAN & PAY ENGINE (100% Pure Frontend, No Backend)
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
  if (headingText) headingText.textContent = 'Scan & Pay with PhonePe';

  const utrInput = document.getElementById('phonepe-utr-input');
  if (utrInput) {
    setTimeout(() => utrInput.focus(), 150);
  }

  const modalCard = document.querySelector('.checkout-modal-card');
  if (modalCard) modalCard.scrollTop = 0;
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

// Populate and Display PhonePe Scan & Pay Modal
function openCheckoutModalWithItems(items) {
  closeCartDrawer();
  const modal = document.getElementById('checkout-modal');
  if (!modal) return;

  // Always initialize on Step 1 (Delivery Details)
  resetCheckoutSteps();

  const preview = document.getElementById('checkout-items-preview');
  const totalEl = document.getElementById('checkout-total');
  const phonepeAmountEl = document.getElementById('phonepe-amount-display');
  const phonepeAppBtn = document.getElementById('phonepe-app-pay-btn');
  const scannerImg = document.getElementById('phonepe-scanner-img');
  const utrInput = document.getElementById('phonepe-utr-input');

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

  // Set uploaded PhonePe scanner image
  if (scannerImg) {
    scannerImg.src = PHONEPE_CONFIG.scannerImage;
  }

  // Set Mobile PhonePe Deep-Link URI with exact total amount
  const orderRef = 'CBT' + Math.floor(1000 + Math.random() * 9000);
  const upiUri = `upi://pay?pa=${encodeURIComponent(PHONEPE_CONFIG.merchantUpiId)}&pn=${encodeURIComponent(PHONEPE_CONFIG.payeeName)}&am=${total}&cu=INR&tn=${encodeURIComponent('CB TRENDZ Order ' + orderRef)}`;
  if (phonepeAppBtn) {
    phonepeAppBtn.href = upiUri;
  }

  if (utrInput) {
    utrInput.value = '';
  }

  modal.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeCheckoutModal() {
  const modal = document.getElementById('checkout-modal');
  if (modal) modal.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

// Copy UPI ID to clipboard helper
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

// Handle Order Confirmation & WhatsApp Dispatch
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

  const utrInput = document.getElementById('phonepe-utr-input');
  const utr = utrInput?.value.trim();

  if (!utr || utr.length < 8) {
    showToast('Please enter the 12-digit PhonePe UTR Number.');
    utrInput?.focus();
    return;
  }

  const orderId = 'CBT-' + Math.floor(100000 + Math.random() * 900000);
  const totalAmount = currentCheckoutItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const customer = currentCustomer;

  // Prepare WhatsApp Message with complete saree and delivery information
  const itemsText = currentCheckoutItems.map((item, idx) => {
    return `${idx + 1}. *${item.name}* × ${item.quantity} — ₹${(item.price * item.quantity).toLocaleString('en-IN')}`;
  }).join('\n');

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
    `📱 *PAYMENT METHOD:* PhonePe (Scan & Pay)`,
    `🔢 *PHONEPE UTR / TXN ID:* ${utr}`,
    `──────────────────────`,
    `📍 *CUSTOMER DELIVERY DETAILS:*`,
    `👤 *Name:* ${customer.name}`,
    `📞 *Phone / WhatsApp:* ${customer.phone}`,
    `🏠 *Address:* ${customer.address}`,
    `🏙️ *City:* ${customer.city}`,
    `📮 *Pincode:* ${customer.pincode}`,
    `──────────────────────`,
    `✅ *I have scanned the QR and paid ₹${totalAmount.toLocaleString('en-IN')} via PhonePe (UTR: ${utr}). Please verify and dispatch the saree(s) to my address.*`
  ].join('\n');

  // Open WhatsApp directly to store owner
  const waUrl = `https://wa.me/${PHONEPE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;
  window.open(waUrl, '_blank', 'noopener,noreferrer');

  // Display On-Screen Success Confirmation Screen
  showOrderSuccess({
    orderId,
    utrNumber: utr,
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
}

// Display Order Success Screen & Receipt
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
    <p class="success-subtitle">Thank you, <strong>${cust.name || 'valued customer'}</strong>! Your PhonePe payment has been recorded with UTR <strong>${order.utrNumber}</strong>.</p>

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
          <span>PHONEPE UTR / TXN ID</span>
          <strong style="color:#5F259F;">${order.utrNumber}</strong>
          <small style="color:#7A7272;">Method: PhonePe Scan & Pay</small>
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
          <div style="display:flex; justify-content:space-between; font-size:0.86rem; margin-bottom:6px;">
            <span>${item.name || 'Saree'} (Qty: ${item.quantity || 1})</span>
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
      📲 WhatsApp order confirmation has been opened. If WhatsApp did not open automatically, click the button below:
    </div>

    <div class="success-actions-row">
      <a href="${order.whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-success-wa">
        💬 Open Order in WhatsApp
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
