/* ============================================================
   CB TRENDZ — script.js
   Premium Luxury Saree Boutique — Vanilla JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   DATA: PRODUCTS (8 Featured in Mockup + 4 Additional)
   ============================================================ */
const products = [
  {
    id: 1,
    name: 'Kanjivaram Silk Saree',
    category: 'silk',
    price: 4599,
    originalPrice: 6999,
    discount: 34,
    badge: '34% OFF',
    image: 'images/saree1.jpg',
    description: 'Magnificent Kanjivaram pure silk saree featuring intricate gold zari border work and rich temple motifs. Handcrafted by master artisans.',
    fabric: 'Pure Kanjivaram Silk',
    rating: 4.9
  },
  {
    id: 2,
    name: 'Pure Cotton Saree',
    category: 'cotton',
    price: 1999,
    originalPrice: 2899,
    discount: 31,
    badge: '31% OFF',
    image: 'images/saree3.jpg',
    description: 'Lightweight, breathable pure handloom cotton saree with elegant contrasting zari border. Perfect for everyday grace and summer comfort.',
    fabric: 'Pure Handloom Cotton',
    rating: 4.8
  },
  {
    id: 3,
    name: 'Bridal Silk Saree',
    category: 'wedding',
    price: 8599,
    originalPrice: 12999,
    discount: 33,
    badge: '33% OFF',
    image: 'images/saree5.jpg',
    description: 'A regal bridal saree woven with heavy gold brocade zari work in royal red. Designed to make your wedding moments unforgettable.',
    fabric: 'Pure Brocade Silk',
    rating: 5.0
  },
  {
    id: 4,
    name: 'Designer Organza Saree',
    category: 'party',
    price: 3499,
    originalPrice: 5199,
    discount: 32,
    badge: '32% OFF',
    image: 'images/saree4.jpg',
    description: 'Shimmering organza saree with delicate hand embroidery and scalloped border. Lightweight, sheer, and party-ready.',
    fabric: 'Premium Sheer Organza',
    rating: 4.7
  },
  {
    id: 5,
    name: 'Banarasi Silk Saree',
    category: 'silk',
    price: 5399,
    originalPrice: 7899,
    discount: 31,
    badge: '31% OFF',
    image: 'images/saree2.jpg',
    description: 'Classic Banarasi silk saree adorned with floral jaal weaving and kadwa zari motifs. A heritage piece from Varanasi.',
    fabric: 'Varanasi Katan Silk',
    rating: 4.9
  },
  {
    id: 6,
    name: 'Chanderi Silk Saree',
    category: 'cotton',
    price: 2999,
    originalPrice: 4499,
    discount: 33,
    badge: '33% OFF',
    image: 'images/saree8.jpg',
    description: 'Delicate Chanderi silk saree with golden booties and sheer glossy texture. Effortlessly sophisticated for daytime celebrations.',
    fabric: 'Chanderi Silk-Cotton',
    rating: 4.8
  },
  {
    id: 7,
    name: 'Tussar Silk Saree',
    category: 'wedding',
    price: 3599,
    originalPrice: 5299,
    discount: 32,
    badge: '32% OFF',
    image: 'images/saree10.jpg',
    description: 'Natural golden-tone Tussar silk saree with tribal kantha embroidery along the pallu and border. Pure artisanal craftsmanship.',
    fabric: 'Pure Wild Tussar Silk',
    rating: 4.9
  },
  {
    id: 8,
    name: 'Printed Daily Wear Saree',
    category: 'daily',
    price: 1499,
    originalPrice: 2499,
    discount: 40,
    badge: '40% OFF',
    image: 'images/saree6.jpg',
    description: 'Ultra-soft everyday saree with contemporary block print motifs. Crease-resistant and easy to drape for work or home.',
    fabric: 'Soft Linen Blend',
    rating: 4.7
  },
  {
    id: 9,
    name: 'Designer Georgette Saree',
    category: 'designer',
    price: 4599,
    originalPrice: 5500,
    discount: 16,
    badge: '16% OFF',
    image: 'images/saree7.jpg',
    description: 'Modern georgette drape with subtle sequin accents and contrast designer blouse piece.',
    fabric: 'Pure Georgette',
    rating: 4.8
  },
  {
    id: 10,
    name: 'Kasavu Kerala Cotton Saree',
    category: 'cotton',
    price: 2499,
    originalPrice: 3000,
    discount: 17,
    badge: '17% OFF',
    image: 'images/saree9.jpg',
    description: 'Pristine off-white Kasavu cotton with handwoven golden kasavu zari border from Kerala.',
    fabric: 'Handloom Kasavu Cotton',
    rating: 4.8
  },
  {
    id: 11,
    name: 'Sequin Party Wear Saree',
    category: 'party',
    price: 6950,
    originalPrice: 8500,
    discount: 18,
    badge: '18% OFF',
    image: 'images/saree11.jpg',
    description: 'Dazzling dual-tone sequin saree on fine tulle that catches every light at evening galas.',
    fabric: 'Fine Net with Sequins',
    rating: 4.9
  },
  {
    id: 12,
    name: 'Jaipur Block Print Saree',
    category: 'daily',
    price: 1899,
    originalPrice: 2499,
    discount: 24,
    badge: '24% OFF',
    image: 'images/saree12.jpg',
    description: 'Artisanal hand-block printed Sanganeri cotton saree using natural vegetable dyes.',
    fabric: '100% Mulmul Cotton',
    rating: 4.7
  }
];

/* ============================================================
   DATA: COLLECTIONS
   ============================================================ */
const collections = [
  { name: 'Silk Sarees', image: 'images/saree1.jpg', filter: 'silk' },
  { name: 'Cotton Sarees', image: 'images/saree3.jpg', filter: 'cotton' },
  { name: 'Wedding Sarees', image: 'images/saree5.jpg', filter: 'wedding' },
  { name: 'Party Wear Sarees', image: 'images/saree4.jpg', filter: 'party' },
  { name: 'Designer Sarees', image: 'images/saree7.jpg', filter: 'designer' },
  { name: 'Daily Wear Sarees', image: 'images/saree6.jpg', filter: 'daily' }
];

/* ============================================================
   STATE
   ============================================================ */
let cart = [];
let wishlist = [];
let activeCategory = 'all';
let activePrice = 'all';
let activeSearch = '';
let activeSort = 'popularity';

const WHATSAPP_NUMBER = '918778522690';

/* ============================================================
   HELPERS
   ============================================================ */
const formatPrice = amount => '₹ ' + amount.toLocaleString('en-IN');

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}

function saveStorage() {
  localStorage.setItem('cb_cart', JSON.stringify(cart));
  localStorage.setItem('cb_wishlist', JSON.stringify(wishlist));
}

function loadStorage() {
  try {
    const savedCart = localStorage.getItem('cb_cart');
    const savedWish = localStorage.getItem('cb_wishlist');
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedWish) wishlist = JSON.parse(savedWish);
  } catch (e) {
    cart = [];
    wishlist = [];
  }
}

const isWishlisted = id => wishlist.includes(id);

/* ============================================================
   CART & WISHLIST LOGIC
   ============================================================ */
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  saveStorage();
  updateCartUI();
  showToast(`✓ "${product.name}" added to bag`);
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
}

function toggleWishlist(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (isWishlisted(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    showToast(`Removed "${product.name}" from wishlist`);
  } else {
    wishlist.push(productId);
    showToast(`♥ Saved "${product.name}" to wishlist`);
  }
  saveStorage();
  updateWishlistUI();
  updateWishlistButtons();
}

function updateCartUI() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const cartCountEl = document.getElementById('cart-count');
  const mobileCartCountEl = document.getElementById('mobile-cart-count');
  const drawerCountEl = document.getElementById('cart-drawer-count');
  const container = document.getElementById('cart-items-container');
  const emptyEl = document.getElementById('cart-empty');
  const footerEl = document.getElementById('cart-footer');
  const subtotalEl = document.getElementById('cart-subtotal');

  if (cartCountEl) cartCountEl.textContent = count;
  if (mobileCartCountEl) mobileCartCountEl.textContent = count;
  if (drawerCountEl) drawerCountEl.textContent = `(${count})`;

  if (cart.length === 0) {
    if (container) container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
    if (footerEl) footerEl.style.display = 'none';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    if (footerEl) footerEl.style.display = 'block';
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);

    if (container) {
      container.innerHTML = cart.map(item => `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
          <div class="item-info">
            <h4 class="item-name">${item.name}</h4>
            <div class="item-price">${formatPrice(item.price)}</div>
            <div class="item-qty-row">
              <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)">−</button>
              <span>${item.quantity}</span>
              <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
              <button class="item-remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

function updateWishlistUI() {
  const count = wishlist.length;
  const wishCountEl = document.getElementById('wishlist-count');
  const mobileWishCountEl = document.getElementById('mobile-wishlist-count');
  const drawerCountEl = document.getElementById('wishlist-drawer-count');
  const container = document.getElementById('wishlist-items-container');
  const emptyEl = document.getElementById('wishlist-empty');

  if (wishCountEl) wishCountEl.textContent = count;
  if (mobileWishCountEl) mobileWishCountEl.textContent = count;
  if (drawerCountEl) drawerCountEl.textContent = `(${count})`;

  const wishlistedItems = products.filter(p => wishlist.includes(p.id));

  if (wishlistedItems.length === 0) {
    if (container) container.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'flex';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    if (container) {
      container.innerHTML = wishlistedItems.map(item => `
        <div class="wishlist-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
          <div class="item-info">
            <h4 class="item-name">${item.name}</h4>
            <div class="item-price">${formatPrice(item.price)}</div>
            <div class="item-qty-row">
              <button class="btn-empty-shop" style="margin-top:4px; padding:4px 10px; font-size:0.75rem;" onclick="addToCart(${item.id})">Add to Bag</button>
              <button class="item-remove-btn" onclick="toggleWishlist(${item.id})">Remove</button>
            </div>
          </div>
        </div>
      `).join('');
    }
  }
}

function updateWishlistButtons() {
  document.querySelectorAll('.wishlist-btn-round').forEach(btn => {
    const id = parseInt(btn.dataset.id, 10);
    const wish = isWishlisted(id);
    btn.classList.toggle('active', wish);
    btn.textContent = wish ? '♥' : '♡';
  });
}

/* ============================================================
   DRAWERS & MODAL CONTROLS
   ============================================================ */
function openCartDrawer() {
  const d = document.getElementById('cart-drawer');
  const o = document.getElementById('nav-overlay');
  if (d) d.classList.add('open');
  if (o) o.classList.add('active');
  closeWishlistDrawer();
}

function closeCartDrawer() {
  const d = document.getElementById('cart-drawer');
  const o = document.getElementById('nav-overlay');
  if (d) d.classList.remove('open');
  if (o) o.classList.remove('active');
}

function openWishlistDrawer() {
  const d = document.getElementById('wishlist-drawer');
  const o = document.getElementById('nav-overlay');
  if (d) d.classList.add('open');
  if (o) o.classList.add('active');
  closeCartDrawer();
}

function closeWishlistDrawer() {
  const d = document.getElementById('wishlist-drawer');
  const o = document.getElementById('nav-overlay');
  if (d) d.classList.remove('open');
  if (o) o.classList.remove('active');
}

function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const overlay = document.getElementById('quick-view-overlay');
  const content = document.getElementById('qv-content');

  content.innerHTML = `
    <div class="modal-img-box">
      <img src="${product.image}" alt="${product.name}" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
    </div>
    <div class="modal-details-box">
      <span style="font-size:0.8rem; color:var(--gold); text-transform:uppercase; letter-spacing:0.1em; font-weight:600; margin-bottom:4px;">${product.category.toUpperCase()} SAREE</span>
      <h2>${product.name}</h2>
      <div class="modal-price-row">
        <strong style="font-size:1.4rem; color:var(--maroon);">${formatPrice(product.price)}</strong>
        <span style="text-decoration:line-through; color:#888;">${formatPrice(product.originalPrice)}</span>
        <span class="discount-tag">${product.discount}% OFF</span>
      </div>
      <p class="modal-desc">${product.description}</p>
      <p class="modal-meta"><strong>Fabric:</strong> ${product.fabric} &nbsp;|&nbsp; <strong>Blouse:</strong> Included (Unstitched)</p>
      <div style="display:flex; gap:12px; margin-top:auto;">
        <button class="btn-cart-main" style="flex:1;" onclick="addToCart(${product.id}); closeQuickView();">ADD TO BAG</button>
        <button class="wishlist-btn-round" style="position:static; width:44px; height:44px;" onclick="toggleWishlist(${product.id}); closeQuickView();">${isWishlisted(product.id) ? '♥' : '♡'}</button>
      </div>
    </div>
  `;

  overlay.classList.add('open');
  document.body.classList.add('no-scroll');
}

function closeQuickView() {
  const overlay = document.getElementById('quick-view-overlay');
  if (overlay) overlay.classList.remove('open');
  document.body.classList.remove('no-scroll');
}

function checkoutViaWhatsApp() {
  if (cart.length === 0) return;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemsText = cart.map(item => `- ${item.name} (${item.quantity}x) @ ${formatPrice(item.price)}`).join('%0A');
  const text = `Hello CB TRENDZ! I would like to order:%0A%0A${itemsText}%0A%0ATotal: ${formatPrice(subtotal)}%0A%0APlease confirm availability.`;
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, '_blank');
}

/* ============================================================
   RENDER PRODUCTS & FILTERING
   ============================================================ */
function getFilteredProducts() {
  let list = [...products];

  // Category
  if (activeCategory !== 'all') {
    list = list.filter(p => p.category === activeCategory);
  }

  // Price Range
  if (activePrice === 'under-3000') {
    list = list.filter(p => p.price < 3000);
  } else if (activePrice === '3000-6000') {
    list = list.filter(p => p.price >= 3000 && p.price <= 6000);
  } else if (activePrice === 'above-6000') {
    list = list.filter(p => p.price > 6000);
  }

  // Search
  if (activeSearch.trim()) {
    const q = activeSearch.toLowerCase().trim();
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q)
    );
  }

  // Sort
  if (activeSort === 'low-high') {
    list.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'high-low') {
    list.sort((a, b) => b.price - a.price);
  } else if (activeSort === 'newest') {
    list.sort((a, b) => b.id - a.id);
  }

  return list;
}

function renderProductHTML(p) {
  const wish = isWishlisted(p.id);
  return `
    <article class="product-item" data-id="${p.id}" data-category="${p.category}" aria-label="${p.name}">
      <div class="product-thumb">
        <img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.onerror=null; this.src='images/saree1.jpg';" />
        <button class="wishlist-btn-round ${wish ? 'active' : ''}" data-id="${p.id}" aria-label="Add ${p.name} to wishlist" title="Add to wishlist">${wish ? '♥' : '♡'}</button>
        <button class="quick-view-btn-pill" data-id="${p.id}">👁 Quick View</button>
      </div>
      <div class="product-details">
        <h3 class="product-heading">${p.name}</h3>
        <div class="product-price-line">
          <span class="price-val">${formatPrice(p.price)}</span>
          <span class="price-strike">${formatPrice(p.originalPrice)}</span>
          <span class="discount-tag">${p.discount}% OFF</span>
        </div>
        <button class="btn-cart-main" data-id="${p.id}" aria-label="Add ${p.name} to cart">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          ADD TO CART
        </button>
      </div>
    </article>
  `;
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const emptyEl = document.getElementById('empty-state');
  if (!grid) return;

  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    if (emptyEl) emptyEl.style.display = 'block';
  } else {
    if (emptyEl) emptyEl.style.display = 'none';
    grid.innerHTML = filtered.map(renderProductHTML).join('');
  }
}

function resetFilters() {
  activeCategory = 'all';
  activePrice = 'all';
  activeSearch = '';
  activeSort = 'popularity';

  const catSelect = document.getElementById('filter-category');
  const priceSelect = document.getElementById('filter-price');
  const searchInput = document.getElementById('catalog-search');
  const sortSelect = document.getElementById('filter-sort');

  if (catSelect) catSelect.value = 'all';
  if (priceSelect) priceSelect.value = 'all';
  if (searchInput) searchInput.value = '';
  if (sortSelect) sortSelect.value = 'popularity';

  renderProducts();
}
window.resetFilters = resetFilters;

/* ============================================================
   EVENT DELEGATION & LISTENERS
   ============================================================ */
function initEvents() {
  // Global click delegation for products & collections
  document.addEventListener('click', (e) => {
    // Add to cart button
    const cartBtn = e.target.closest('.btn-cart-main');
    if (cartBtn && cartBtn.dataset.id) {
      e.preventDefault();
      addToCart(parseInt(cartBtn.dataset.id, 10));
      return;
    }

    // Wishlist button
    const wishBtn = e.target.closest('.wishlist-btn-round');
    if (wishBtn && wishBtn.dataset.id) {
      e.preventDefault();
      toggleWishlist(parseInt(wishBtn.dataset.id, 10));
      return;
    }

    // Quick View button
    const qvBtn = e.target.closest('.quick-view-btn-pill');
    if (qvBtn && qvBtn.dataset.id) {
      e.preventDefault();
      openQuickView(parseInt(qvBtn.dataset.id, 10));
      return;
    }

    // Collection cards filter click
    const colCard = e.target.closest('.col-card');
    if (colCard && colCard.dataset.filter) {
      e.preventDefault();
      activeCategory = colCard.dataset.filter;
      const catSelect = document.getElementById('filter-category');
      if (catSelect) catSelect.value = activeCategory;
      renderProducts();
      const shopSec = document.getElementById('shop');
      if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    // Discover collection link in banner
    const bannerBtn = e.target.closest('.btn-featured-discover');
    if (bannerBtn && bannerBtn.dataset.filter) {
      e.preventDefault();
      activeCategory = bannerBtn.dataset.filter;
      const catSelect = document.getElementById('filter-category');
      if (catSelect) catSelect.value = activeCategory;
      renderProducts();
      const shopSec = document.getElementById('shop');
      if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
      return;
    }
  });

  // Filter Bar Selects
  const catSelect = document.getElementById('filter-category');
  if (catSelect) {
    catSelect.addEventListener('change', (e) => {
      activeCategory = e.target.value;
      renderProducts();
    });
  }

  const priceSelect = document.getElementById('filter-price');
  if (priceSelect) {
    priceSelect.addEventListener('change', (e) => {
      activePrice = e.target.value;
      renderProducts();
    });
  }

  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      renderProducts();
    });
  }

  const sortSelect = document.getElementById('filter-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value;
      renderProducts();
    });
  }

  // Header Search toggle
  const searchToggle = document.getElementById('search-toggle-btn');
  const searchDrawer = document.getElementById('search-bar-wrapper');
  const searchClose = document.getElementById('search-close-btn');
  const headerSearchInput = document.getElementById('search-input');

  if (searchToggle && searchDrawer) {
    searchToggle.addEventListener('click', () => {
      searchDrawer.classList.toggle('open');
      if (searchDrawer.classList.contains('open') && headerSearchInput) {
        headerSearchInput.focus();
      }
    });
  }

  if (searchClose && searchDrawer) {
    searchClose.addEventListener('click', () => searchDrawer.classList.remove('open'));
  }

  if (headerSearchInput) {
    headerSearchInput.addEventListener('input', (e) => {
      activeSearch = e.target.value;
      const shopInput = document.getElementById('catalog-search');
      if (shopInput) shopInput.value = activeSearch;
      renderProducts();
      const shopSec = document.getElementById('shop');
      if (shopSec) shopSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Drawers Toggles
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

  // Overlay click closes all drawers and modals
  const overlay = document.getElementById('nav-overlay');
  if (overlay) {
    overlay.addEventListener('click', () => {
      closeCartDrawer();
      closeWishlistDrawer();
      const navMenu = document.getElementById('nav-links');
      if (navMenu) navMenu.classList.remove('open');
    });
  }

  // Modal close
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

  // Back to Top button
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================================
  // ADVANCED SCROLL-DRIVEN EFFECTS ENGINE
  // ============================================================
  const progressBar = document.getElementById('scroll-progress-bar');
  const navbar = document.getElementById('navbar');
  const heroImg = document.querySelector('.hero-bg-image');
  const heroBox = document.querySelector('.hero-textbox');
  const navLinks = document.querySelectorAll('.nav-menu .nav-item');
  const sections = document.querySelectorAll('section[id]');

  let ticking = false;

  function onScrollHandler() {
    const scrollY = window.scrollY;

    // 1. Gold Scroll Progress Bar
    if (progressBar) {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollY / docHeight) * 100 : 0;
      progressBar.style.width = Math.min(100, Math.max(0, progress)) + '%';
    }

    // 2. Compact Glass Navbar on Scroll
    if (navbar) {
      if (scrollY > 35) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }
    }

    // 3. Hero Parallax Depth & Soft Dissolve
    if (scrollY < 900) {
      if (heroImg) {
        heroImg.style.transform = 'translateY(' + (scrollY * 0.32) + 'px) scale(1.05)';
      }
      if (heroBox) {
        heroBox.style.transform = 'translateY(' + (scrollY * 0.16) + 'px)';
        const opacity = Math.max(0, 1 - (scrollY / 520));
        heroBox.style.opacity = opacity.toString();
      }
    }

    // 4. Back to Top Visibility
    if (backToTop) {
      backToTop.classList.toggle('visible', scrollY > 380);
    }

    // 5. Active Nav Spy on Scroll
    let currentSectionId = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      const height = sec.offsetHeight;
      if (scrollY >= top && scrollY < top + height) {
        currentSectionId = sec.getAttribute('id');
      }
    });

    if (currentSectionId) {
      navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === '#' + currentSectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      });
    }

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(onScrollHandler);
      ticking = true;
    }
  }, { passive: true });

  // Initial trigger
  onScrollHandler();

  // 6. IntersectionObserver for Scroll-Reveal Elements
  const revealElements = document.querySelectorAll('.scroll-reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('in-view'));
  }
}

/* ============================================================
   APP INITIALIZATION
   ============================================================ */
function initApp() {
  loadStorage();
  updateCartUI();
  updateWishlistUI();
  updateWishlistButtons();
  initEvents();

  console.log('%c✦ CB TRENDZ — Premium Saree Boutique Loaded ✦', 'color:#D4AF70; background:#4A1220; font-size:1.1rem; padding:6px 12px;');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
