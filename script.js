/* ============================================================
   CB TRENDZ — script.js
   Premium Luxury Saree Boutique — Vanilla JavaScript
   ============================================================ */

'use strict';

/* ============================================================
   DATA: PRODUCTS  (12 unique saree photos — no repeats)
   ============================================================ */
const products = [
  {
    id: 1,
    name: 'Royal Kanjivaram Silk Saree',
    category: 'silk',
    price: 8499,
    originalPrice: 11999,
    discount: 29,
    badge: 'sale',
    image: 'images/saree1.jpg',
    description: 'A magnificent Kanjivaram silk saree featuring intricate zari border work and vibrant jewel tones. Handwoven by master artisans in Tamil Nadu, this piece is a timeless addition to any wardrobe.',
    tags: ['Silk', 'Zari Border', 'Wedding', 'Handwoven'],
    fabric: 'Pure Mulberry Silk',
  },
  {
    id: 2,
    name: 'Banarasi Brocade Silk Saree',
    category: 'silk',
    price: 12999,
    originalPrice: 16500,
    discount: 21,
    badge: 'sale',
    image: 'images/saree2.jpg',
    description: 'Opulent Banarasi brocade with real gold-tone zari weaving, perfect for weddings and grand celebrations. A timeless heirloom piece steeped in Varanasi heritage.',
    tags: ['Banarasi', 'Brocade', 'Zari', 'Wedding'],
    fabric: 'Pure Silk Brocade',
  },
  {
    id: 3,
    name: 'Pure Chanderi Cotton Silk Saree',
    category: 'cotton',
    price: 3299,
    originalPrice: null,
    discount: null,
    badge: 'new',
    image: 'images/saree3.jpg',
    description: 'Lightweight Chanderi saree crafted from a cotton-silk blend. Perfect for daily elegance — breathable, beautiful, and effortlessly graceful.',
    tags: ['Chanderi', 'Cotton-Silk', 'Daily Wear', 'Lightweight'],
    fabric: 'Chanderi Cotton-Silk',
  },
  {
    id: 4,
    name: 'Embroidered Organza Party Saree',
    category: 'party',
    price: 5799,
    originalPrice: 7200,
    discount: 19,
    badge: 'trend',
    image: 'images/saree4.jpg',
    description: 'Shimmering organza saree with hand-embroidered floral motifs. This party-perfect piece catches the light beautifully and makes every entrance unforgettable.',
    tags: ['Organza', 'Embroidered', 'Party', 'Sheer'],
    fabric: 'Pure Organza',
  },
  {
    id: 5,
    name: 'Heritage Bridal Patola Saree',
    category: 'wedding',
    price: 22500,
    originalPrice: 28000,
    discount: 20,
    badge: 'sale',
    image: 'images/saree5.jpg',
    description: 'An exquisite double-ikat Patola saree, handcrafted using a centuries-old Gujarati weaving technique. A prestigious choice for the modern bride who values heritage.',
    tags: ['Patola', 'Double Ikat', 'Bridal', 'Heritage'],
    fabric: 'Pure Silk',
  },
  {
    id: 6,
    name: 'Handloom Linen Everyday Saree',
    category: 'daily',
    price: 1899,
    originalPrice: null,
    discount: null,
    badge: 'new',
    image: 'images/saree6.jpg',
    description: 'Crisp, comfortable handloom linen saree ideal for office, college, or casual outings. Available in earthy tones with simple woven borders.',
    tags: ['Linen', 'Handloom', 'Daily Wear', 'Office'],
    fabric: 'Pure Handloom Linen',
  },
  {
    id: 7,
    name: 'Designer Georgette Printed Saree',
    category: 'designer',
    price: 4599,
    originalPrice: 5500,
    discount: 16,
    badge: 'trend',
    image: 'images/saree7.jpg',
    description: 'Contemporary designer georgette saree with digital floral prints and contrast blouse piece. The perfect fusion of tradition and modernity.',
    tags: ['Georgette', 'Designer', 'Printed', 'Modern'],
    fabric: 'Premium Georgette',
  },
  {
    id: 8,
    name: 'Mysore Crepe Silk Saree',
    category: 'silk',
    price: 6200,
    originalPrice: null,
    discount: null,
    badge: 'new',
    image: 'images/saree8.jpg',
    description: 'Soft, lustrous Mysore crepe silk with a distinctive sheen. Lightweight enough for all-day comfort, elegant enough for evening occasions.',
    tags: ['Crepe Silk', 'Mysore', 'Elegant', 'Versatile'],
    fabric: 'Mysore Crepe Silk',
  },
  {
    id: 9,
    name: 'Kasavu Kerala Cotton Saree',
    category: 'cotton',
    price: 2499,
    originalPrice: 3000,
    discount: 17,
    badge: null,
    image: 'images/saree9.jpg',
    description: 'Iconic Kerala Kasavu saree in pristine white with a traditional golden zari border. A symbol of South Indian elegance, perfect for festivals and ceremonies.',
    tags: ['Kasavu', 'Cotton', 'Traditional', 'Kerala'],
    fabric: 'Handloom Cotton',
  },
  {
    id: 10,
    name: 'Velvet Border Bridal Saree',
    category: 'wedding',
    price: 18750,
    originalPrice: 22000,
    discount: 15,
    badge: 'sale',
    image: 'images/saree10.jpg',
    description: 'Luxurious silk saree with a stunning velvet border and stone-work embellishments. A showstopper for brides who want to make a statement.',
    tags: ['Velvet Border', 'Bridal', 'Silk', 'Embellished'],
    fabric: 'Silk with Velvet Border',
  },
  {
    id: 11,
    name: 'Sequin Party Wear Saree',
    category: 'party',
    price: 6950,
    originalPrice: 8500,
    discount: 18,
    badge: 'trend',
    image: 'images/saree11.jpg',
    description: 'All-over sequin embroidered saree that glistens under every light. Perfect for cocktail parties, receptions, and festive evenings.',
    tags: ['Sequin', 'Party Wear', 'Embroidered', 'Glam'],
    fabric: 'Net with Sequin Work',
  },
  {
    id: 12,
    name: 'Block Print Cotton Saree',
    category: 'daily',
    price: 1499,
    originalPrice: null,
    discount: null,
    badge: 'new',
    image: 'images/saree12.jpg',
    description: 'Handcrafted block print cotton saree from Rajasthan — vibrant jaipur prints on breathable cotton. Ideal for breezy summer days and casual occasions.',
    tags: ['Block Print', 'Cotton', 'Rajasthan', 'Casual'],
    fabric: 'Pure Cotton',
  },
];

/* ============================================================
   DATA: COLLECTIONS
   ============================================================ */
const collections = [
  {
    name: 'Silk Sarees',
    subtitle: 'Pure Luxury',
    filter: 'silk',
    image: 'images/saree1.jpg',
  },
  {
    name: 'Cotton Sarees',
    subtitle: 'Everyday Elegance',
    filter: 'cotton',
    image: 'images/saree3.jpg',
  },
  {
    name: 'Wedding Sarees',
    subtitle: 'For Your Big Day',
    filter: 'wedding',
    image: 'images/saree8.jpg',
  },
  {
    name: 'Designer Sarees',
    subtitle: 'Modern & Bold',
    filter: 'designer',
    image: 'images/saree7.jpg',
  },
  {
    name: 'Party Wear',
    subtitle: 'Dazzle & Shine',
    filter: 'party',
    image: 'images/saree4.jpg',
  },
  {
    name: 'Daily Wear',
    subtitle: 'Comfort & Style',
    filter: 'daily',
    image: 'images/saree6.jpg',
  },
];

/* ============================================================
   DATA: GALLERY IMAGES  (6 different photos — all unique)
   ============================================================ */
const galleryImages = [
  'images/saree1.jpg',
  'images/saree2.jpg',
  'images/saree5.jpg',
  'images/saree7.jpg',
  'images/saree8.jpg',
  'images/saree10.jpg',
];

/* ============================================================
   STATE
   ============================================================ */
let cart = [];             // Array of { ...product, quantity }
let wishlist = [];         // Array of product ids
let activeFilter = 'all';  // Current category filter
let activeSearch = '';     // Current search string
let activeSort   = 'default'; // Current sort option

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

/** Format a number as Indian Rupee string */
const formatPrice = (amount) =>
  `₹${amount.toLocaleString('en-IN')}`;

/** Show a toast notification */
const showToast = (() => {
  const toast = document.getElementById('toast');
  let timer = null;
  return (message) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => toast.classList.remove('show'), 3000);
  };
})();

/** Toggle body scroll lock */
const lockScroll   = () => document.body.classList.add('no-scroll');
const unlockScroll = () => document.body.classList.remove('no-scroll');

/* ============================================================
   LOCAL STORAGE — PERSIST CART & WISHLIST
   ============================================================ */

/** Save cart array to localStorage */
function saveCart() {
  localStorage.setItem('cbtrendz_cart', JSON.stringify(cart));
}

/** Save wishlist array to localStorage */
function saveWishlist() {
  localStorage.setItem('cbtrendz_wishlist', JSON.stringify(wishlist));
}

/** Load persisted data from localStorage on page load */
function loadPersistedData() {
  const savedCart = localStorage.getItem('cbtrendz_cart');
  const savedWishlist = localStorage.getItem('cbtrendz_wishlist');
  if (savedCart) {
    try { cart = JSON.parse(savedCart); } catch { cart = []; }
  }
  if (savedWishlist) {
    try { wishlist = JSON.parse(savedWishlist); } catch { wishlist = []; }
  }
}

/* ============================================================
   CART FUNCTIONS
   ============================================================ */

/** Add a product to the cart (increase qty if already present) */
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`✓ "${product.name}" added to your bag`);
  openCartDrawer();
}

/** Remove a product from the cart entirely */
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
}

/** Change the quantity of a cart item */
function changeQuantity(productId, delta) {
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity < 1) {
    removeFromCart(productId);
  } else {
    saveCart();
    updateCartUI();
  }
}

/** Compute cart subtotal */
function getCartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/** Compute total number of items in cart */
function getCartItemCount() {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/** Re-render the cart drawer and update the badge count */
function updateCartUI() {
  const count = getCartItemCount();
  const badge = document.getElementById('cart-count');
  const mobileBadge = document.getElementById('mobile-cart-count');
  const drawerCount = document.getElementById('cart-drawer-count');
  const container   = document.getElementById('cart-items-container');
  const emptyEl     = document.getElementById('cart-empty');
  const footerEl    = document.getElementById('cart-footer');
  const subtotalEl  = document.getElementById('cart-subtotal');

  // Update badge
  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);
  if (mobileBadge) {
    mobileBadge.textContent = count;
    mobileBadge.classList.toggle('visible', count > 0);
  }

  // Update drawer count label
  if (drawerCount) drawerCount.textContent = `(${count})`;

  // Render cart items
  if (cart.length === 0) {
    container.style.display = 'none';
    emptyEl.style.display   = 'flex';
    footerEl.style.display  = 'none';
  } else {
    container.style.display = 'flex';
    emptyEl.style.display   = 'none';
    footerEl.style.display  = 'flex';

    container.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}"
             onerror="this.onerror=null; this.src='images/saree1.jpg'" />
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" data-action="decrease" data-id="${item.id}" aria-label="Decrease quantity">−</button>
            <span class="qty-count">${item.quantity}</span>
            <button class="qty-btn" data-action="increase" data-id="${item.id}" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="cart-item-remove" data-id="${item.id}" aria-label="Remove ${item.name} from cart">Remove</button>
      </div>
    `).join('');

    subtotalEl.textContent = formatPrice(getCartSubtotal());
  }
}

/* ============================================================
   WISHLIST FUNCTIONS
   ============================================================ */

/** Check if a product is in the wishlist */
const isWishlisted = (id) => wishlist.includes(id);

/** Toggle wishlist for a product */
function toggleWishlist(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  if (isWishlisted(productId)) {
    wishlist = wishlist.filter(id => id !== productId);
    showToast(`Removed "${product.name}" from wishlist`);
  } else {
    wishlist.push(productId);
    showToast(`♥ "${product.name}" saved to wishlist`);
  }
  saveWishlist();
  updateWishlistUI();
  // Update heart icons in product grid
  updateWishlistHearts();
}

/** Update all wishlist heart buttons on the page */
function updateWishlistHearts() {
  document.querySelectorAll('.wishlist-heart').forEach(btn => {
    const id = parseInt(btn.dataset.id, 10);
    btn.classList.toggle('active', isWishlisted(id));
    btn.setAttribute('aria-pressed', isWishlisted(id) ? 'true' : 'false');
    btn.title = isWishlisted(id) ? 'Remove from wishlist' : 'Add to wishlist';
    btn.textContent = isWishlisted(id) ? '♥' : '♡';
  });
}

/** Re-render wishlist drawer and badge */
function updateWishlistUI() {
  const count       = wishlist.length;
  const badge       = document.getElementById('wishlist-count');
  const mobileBadge = document.getElementById('mobile-wishlist-count');
  const drawerCount = document.getElementById('wishlist-drawer-count');
  const container   = document.getElementById('wishlist-items-container');
  const emptyEl     = document.getElementById('wishlist-empty');

  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);
  if (mobileBadge) {
    mobileBadge.textContent = count;
    mobileBadge.classList.toggle('visible', count > 0);
  }
  if (drawerCount) drawerCount.textContent = `(${count})`;

  const wishlisted = products.filter(p => wishlist.includes(p.id));

  if (wishlisted.length === 0) {
    container.style.display = 'none';
    emptyEl.style.display   = 'flex';
  } else {
    container.style.display = 'flex';
    emptyEl.style.display   = 'none';

    container.innerHTML = wishlisted.map(item => `
      <div class="wishlist-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}"
             onerror="this.onerror=null; this.src='images/saree1.jpg'" />
        <div class="wishlist-item-info">
          <div class="wishlist-item-name">${item.name}</div>
          <div class="wishlist-item-price">${formatPrice(item.price)}</div>
          <div class="wishlist-item-actions">
            <button class="btn-wl-cart" data-id="${item.id}">Add to Cart</button>
            <button class="btn-wl-remove" data-id="${item.id}">Remove</button>
          </div>
        </div>
      </div>
    `).join('');
  }
}

/* ============================================================
   PRODUCT RENDERING
   ============================================================ */

/** Return filtered & sorted products based on current state */
function getFilteredProducts() {
  let result = [...products];

  // 1. Category filter
  if (activeFilter !== 'all') {
    result = result.filter(p => p.category === activeFilter);
  }

  // 2. Search filter (case-insensitive, matches name or category)
  if (activeSearch.trim()) {
    const q = activeSearch.toLowerCase().trim();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q))
    );
  }

  // 3. Sort
  if (activeSort === 'low-high') {
    result.sort((a, b) => a.price - b.price);
  } else if (activeSort === 'high-low') {
    result.sort((a, b) => b.price - a.price);
  }

  return result;
}

/** Generate HTML for a product card */
function productCardHTML(product) {
  const { id, name, category, price, originalPrice, discount, badge, image } = product;
  const heartSymbol = isWishlisted(id) ? '♥' : '♡';
  const heartActive  = isWishlisted(id) ? 'active' : '';

  const badgeHTML = badge
    ? `<span class="product-badge badge-${badge}">${badge === 'sale' ? `${discount}% Off` : badge === 'new' ? 'New' : 'Trending'}</span>`
    : '';

  const priceHTML = originalPrice
    ? `<span class="product-price">${formatPrice(price)}</span>
       <span class="product-original-price">${formatPrice(originalPrice)}</span>
       <span class="product-discount">${discount}% off</span>`
    : `<span class="product-price">${formatPrice(price)}</span>`;

  return `
    <article class="product-card reveal" data-id="${id}" data-category="${category}" aria-label="${name}">
      <div class="product-image-wrapper">
        <img src="${image}" alt="${name}" loading="lazy"
             onerror="this.onerror=null; this.src='images/saree1.jpg'" />
        ${badgeHTML}
        <button class="wishlist-heart ${heartActive}" data-id="${id}"
                aria-label="Add ${name} to wishlist" aria-pressed="${isWishlisted(id)}"
                title="${isWishlisted(id) ? 'Remove from wishlist' : 'Add to wishlist'}">${heartSymbol}</button>
        <div class="product-actions">
          <button class="product-action-btn btn-quick-view" data-id="${id}">Quick View</button>
          <button class="product-action-btn btn-add-cart" data-id="${id}">Add to Bag</button>
        </div>
      </div>
      <div class="product-info">
        <span class="product-category">${category.charAt(0).toUpperCase() + category.slice(1)} Saree</span>
        <h3 class="product-name">${name}</h3>
        <div class="product-price-row">${priceHTML}</div>
        <button class="btn-add-cart-main" data-id="${id}" aria-label="Add ${name} to cart">Add to Cart</button>
      </div>
    </article>
  `;
}

/** Render all products matching the current filter/search/sort */
function renderProducts() {
  const grid     = document.getElementById('products-grid');
  const emptyEl  = document.getElementById('empty-state');
  const filtered = getFilteredProducts();

  if (filtered.length === 0) {
    grid.innerHTML = '';
    emptyEl.style.display = 'block';
  } else {
    emptyEl.style.display = 'none';
    grid.innerHTML = filtered.map(productCardHTML).join('');
    observeRevealElements();
  }
}

/** Reset all filters — globally accessible */
function resetFilters() {
  activeFilter = 'all';
  activeSearch = '';
  activeSort   = 'default';

  const searchInput = document.getElementById('search-input');
  if (searchInput) searchInput.value = '';

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) sortSelect.value = 'default';

  document.querySelectorAll('.filter-tab').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === 'all');
    btn.setAttribute('aria-selected', btn.dataset.filter === 'all' ? 'true' : 'false');
  });

  renderProducts();
}
window.resetFilters = resetFilters;

/* ============================================================
   COLLECTIONS RENDERING
   ============================================================ */
function renderCollections() {
  const grid = document.getElementById('collections-grid');
  if (!grid) return;

  grid.innerHTML = collections.map(col => `
    <button class="collection-card reveal" data-filter="${col.filter}"
            aria-label="Browse ${col.name}">
      <img src="${col.image}" alt="${col.name}" loading="lazy"
           onerror="this.src='images/saree1.jpg'" />
      <div class="collection-card-overlay">
        <h3>${col.name}</h3>
        <span>${col.subtitle}</span>
      </div>
    </button>
  `).join('');
}

/* ============================================================
   GALLERY RENDERING
   ============================================================ */
function renderGallery() {
  const grid = document.getElementById('gallery-grid');
  if (!grid) return;

  grid.innerHTML = galleryImages.map((url, idx) => `
    <div class="gallery-item reveal" tabindex="0" role="img"
         aria-label="CB Trendz saree photo ${idx + 1}">
      <img src="${url}" alt="CB Trendz saree look ${idx + 1}" loading="lazy"
           onerror="this.src='images/saree1.jpg'" />
      <div class="gallery-item-overlay">
        <span>♥</span>
      </div>
    </div>
  `).join('');
}

/* ============================================================
   QUICK VIEW MODAL
   ============================================================ */
function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const overlay = document.getElementById('quick-view-overlay');
  const content = document.getElementById('qv-content');

  const priceHTML = product.originalPrice
    ? `<span class="qv-price">${formatPrice(product.price)}</span>
       <span class="qv-original">${formatPrice(product.originalPrice)}</span>
       <span class="qv-discount">${product.discount}% Off</span>`
    : `<span class="qv-price">${formatPrice(product.price)}</span>`;

  const tagsHTML = (product.tags || [])
    .map(t => `<span class="qv-tag">${t}</span>`)
    .join('');

  content.innerHTML = `
    <div class="qv-image">
      <img src="${product.image}" alt="${product.name}"
           onerror="this.onerror=null; this.src='images/saree1.jpg'" />
    </div>
    <div class="qv-details">
      <span class="qv-category">${product.category.charAt(0).toUpperCase() + product.category.slice(1)} Saree</span>
      <h2 class="qv-name">${product.name}</h2>
      <div class="qv-price-row">${priceHTML}</div>
      <div class="qv-divider"></div>
      <p class="qv-desc">${product.description}</p>
      <div>
        <p class="qv-label">Fabric</p>
        <span class="qv-tag">${product.fabric}</span>
      </div>
      <div>
        <p class="qv-label">Tags</p>
        <div class="qv-tags">${tagsHTML}</div>
      </div>
      <div class="qv-divider"></div>
      <div class="qv-actions">
        <button class="btn btn-primary btn-add-cart" data-id="${product.id}" onclick="addToCart(${product.id}); closeQuickView();">Add to Cart</button>
        <button class="btn btn-outline" onclick="toggleWishlist(${product.id}); updateWishlistHearts();">
          ${isWishlisted(product.id) ? '♥ Wishlisted' : '♡ Add to Wishlist'}
        </button>
      </div>
    </div>
  `;

  overlay.style.display = 'flex';
  lockScroll();
}

function closeQuickView() {
  document.getElementById('quick-view-overlay').style.display = 'none';
  unlockScroll();
}

// Expose globally for inline onclick in quick view
window.addToCart          = addToCart;
window.toggleWishlist     = toggleWishlist;
window.updateWishlistHearts = updateWishlistHearts;
window.closeQuickView     = closeQuickView;

/* ============================================================
   DRAWER: CART
   ============================================================ */
function openCartDrawer() {
  document.getElementById('cart-drawer').classList.add('open');
  lockScroll();
}
function closeCartDrawer() {
  document.getElementById('cart-drawer').classList.remove('open');
  unlockScroll();
}

/* ============================================================
   DRAWER: WISHLIST
   ============================================================ */
function openWishlistDrawer() {
  document.getElementById('wishlist-drawer').classList.add('open');
  lockScroll();
}
function closeWishlistDrawer() {
  document.getElementById('wishlist-drawer').classList.remove('open');
  unlockScroll();
}

/* ============================================================
   TESTIMONIALS SLIDER
   ============================================================ */
function initTestimonials() {
  const track   = document.getElementById('testimonials-track');
  const prevBtn = document.getElementById('t-prev');
  const nextBtn = document.getElementById('t-next');
  if (!track || !prevBtn || !nextBtn) return;

  const cards = track.querySelectorAll('.testimonial-card');
  if (cards.length === 0) return;

  let current = 0;

  function getVisible() {
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function getCardWidth() {
    const gap = 28;
    const visible = getVisible();
    return (track.parentElement.offsetWidth - gap * (visible - 1)) / visible;
  }

  function maxIndex() {
    return Math.max(0, cards.length - getVisible());
  }

  function slideTo(index) {
    current = Math.max(0, Math.min(index, maxIndex()));
    const cardW  = getCardWidth();
    const offset = current * (cardW + 28);
    track.style.transform = `translateX(-${offset}px)`;
  }

  prevBtn.addEventListener('click', () => slideTo(current - 1));
  nextBtn.addEventListener('click', () => slideTo(current + 1));

  let autoSlide = setInterval(() => {
    slideTo(current < maxIndex() ? current + 1 : 0);
  }, 5000);

  track.addEventListener('mouseenter', () => clearInterval(autoSlide));
  track.addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => {
      slideTo(current < maxIndex() ? current + 1 : 0);
    }, 5000);
  });

  window.addEventListener('resize', () => slideTo(current));
}

/* ============================================================
   SCROLL REVEAL (INTERSECTION OBSERVER)
   ============================================================ */
let revealObserver;

function observeRevealElements() {
  const elements = document.querySelectorAll('.reveal:not(.in-view)');
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
  }
  elements.forEach(el => revealObserver.observe(el));
}

/* ============================================================
   NAVBAR BEHAVIOURS
   ============================================================ */
function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('hamburger');
  const navLinks   = document.getElementById('nav-links');
  const navOverlay = document.getElementById('nav-overlay');

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    const btn = document.getElementById('back-to-top');
    btn.classList.toggle('visible', window.scrollY > 400);
    updateActiveNavLink();
  }, { passive: true });

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', isOpen);
    navOverlay.classList.toggle('visible', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    isOpen ? lockScroll() : unlockScroll();
  });

  navOverlay.addEventListener('click', closeMobileMenu);
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  function closeMobileMenu() {
    navLinks.classList.remove('open');
    hamburger.classList.remove('open');
    navOverlay.classList.remove('visible');
    hamburger.setAttribute('aria-expanded', 'false');
    unlockScroll();
  }

  function updateActiveNavLink() {
    const sections = ['home', 'collections', 'shop', 'about', 'contact'];
    let current = 'home';
    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el && window.scrollY >= el.offsetTop - 100) current = id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
    document.querySelectorAll('.mobile-nav-item[href]').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
  }
}

/* ============================================================
   SEARCH BAR
   ============================================================ */
function initSearch() {
  const toggleBtn = document.getElementById('search-toggle-btn');
  const wrapper   = document.getElementById('search-bar-wrapper');
  const closeBtn  = document.getElementById('search-close-btn');
  const input     = document.getElementById('search-input');

  toggleBtn.addEventListener('click', () => {
    const isOpen = wrapper.classList.toggle('open');
    if (isOpen) {
      input.focus();
      document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
    }
  });

  closeBtn.addEventListener('click', () => {
    wrapper.classList.remove('open');
    input.value = '';
    activeSearch = '';
    renderProducts();
  });

  let debounce;
  input.addEventListener('input', () => {
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      activeSearch = input.value;
      renderProducts();
    }, 300);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && wrapper.classList.contains('open')) {
      wrapper.classList.remove('open');
      input.value = '';
      activeSearch = '';
      renderProducts();
    }
  });
}

/* ============================================================
   FILTER TABS
   ============================================================ */
function initFilters() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      activeFilter = tab.dataset.filter;
      tabs.forEach(t => {
        t.classList.toggle('active', t.dataset.filter === activeFilter);
        t.setAttribute('aria-selected', t.dataset.filter === activeFilter ? 'true' : 'false');
      });
      renderProducts();
    });
  });
}

/* ============================================================
   SORT SELECT
   ============================================================ */
function initSort() {
  const sortSelect = document.getElementById('sort-select');
  sortSelect.addEventListener('change', () => {
    activeSort = sortSelect.value;
    renderProducts();
  });
}

/* ============================================================
   COLLECTION CARDS → FILTER SHOP
   ============================================================ */
function initCollectionFiltering() {
  document.getElementById('collections-grid').addEventListener('click', (e) => {
    const card = e.target.closest('.collection-card');
    if (!card) return;
    const filter = card.dataset.filter;
    activeFilter = filter;

    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.filter === filter);
      tab.setAttribute('aria-selected', tab.dataset.filter === filter ? 'true' : 'false');
    });

    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
    renderProducts();
  });

  document.querySelectorAll('[data-filter]').forEach(el => {
    if (el.classList.contains('filter-tab') || el.classList.contains('collection-card')) return;
    el.addEventListener('click', () => {
      const filter = el.dataset.filter;
      if (!filter) return;
      activeFilter = filter;
      document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
      });
      setTimeout(() => {
        document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
        renderProducts();
      }, 100);
    });
  });
}

/* ============================================================
   PRODUCTS GRID EVENT DELEGATION
   ============================================================ */
function initProductsGrid() {
  const grid = document.getElementById('products-grid');

  grid.addEventListener('click', (e) => {
    const quickViewBtn = e.target.closest('.btn-quick-view');
    if (quickViewBtn) {
      openQuickView(parseInt(quickViewBtn.dataset.id, 10));
      return;
    }

    const addCartBtn = e.target.closest('.btn-add-cart, .btn-add-cart-main');
    if (addCartBtn) {
      addToCart(parseInt(addCartBtn.dataset.id, 10));
      return;
    }

    const heartBtn = e.target.closest('.wishlist-heart');
    if (heartBtn) {
      toggleWishlist(parseInt(heartBtn.dataset.id, 10));
      updateWishlistHearts();
      return;
    }
  });
}

/* ============================================================
   CART DRAWER EVENTS
   ============================================================ */
function initCartDrawer() {
  document.getElementById('cart-toggle-btn').addEventListener('click', openCartDrawer);
  const mobileCart = document.getElementById('mobile-cart-btn');
  if (mobileCart) mobileCart.addEventListener('click', openCartDrawer);
  document.getElementById('cart-close-btn').addEventListener('click', closeCartDrawer);
  document.getElementById('cart-overlay').addEventListener('click', closeCartDrawer);
  document.getElementById('cart-continue-btn').addEventListener('click', closeCartDrawer);
  document.getElementById('cart-shop-btn').addEventListener('click', () => {
    closeCartDrawer();
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  });

  const cartContainer = document.getElementById('cart-items-container');
  cartContainer.addEventListener('click', (e) => {
    const qtyBtn = e.target.closest('.qty-btn');
    if (qtyBtn) {
      const id    = parseInt(qtyBtn.dataset.id, 10);
      const delta = qtyBtn.dataset.action === 'increase' ? 1 : -1;
      changeQuantity(id, delta);
      return;
    }
    const removeBtn = e.target.closest('.cart-item-remove');
    if (removeBtn) {
      removeFromCart(parseInt(removeBtn.dataset.id, 10));
      return;
    }
  });
}

/* ============================================================
   WISHLIST DRAWER EVENTS
   ============================================================ */
function initWishlistDrawer() {
  document.getElementById('wishlist-toggle-btn').addEventListener('click', openWishlistDrawer);
  const mobileWishlist = document.getElementById('mobile-wishlist-btn');
  if (mobileWishlist) mobileWishlist.addEventListener('click', openWishlistDrawer);
  document.getElementById('wishlist-close-btn').addEventListener('click', closeWishlistDrawer);
  document.getElementById('wishlist-overlay').addEventListener('click', closeWishlistDrawer);
  document.getElementById('wishlist-shop-btn').addEventListener('click', () => {
    closeWishlistDrawer();
    document.getElementById('shop').scrollIntoView({ behavior: 'smooth' });
  });

  const wishlistContainer = document.getElementById('wishlist-items-container');
  wishlistContainer.addEventListener('click', (e) => {
    const cartBtn = e.target.closest('.btn-wl-cart');
    if (cartBtn) {
      addToCart(parseInt(cartBtn.dataset.id, 10));
      return;
    }
    const removeBtn = e.target.closest('.btn-wl-remove');
    if (removeBtn) {
      toggleWishlist(parseInt(removeBtn.dataset.id, 10));
      updateWishlistHearts();
      return;
    }
  });
}

/* ============================================================
   QUICK VIEW MODAL EVENTS
   ============================================================ */
function initQuickViewModal() {
  const overlay  = document.getElementById('quick-view-overlay');
  const closeBtn = document.getElementById('quick-view-close');

  closeBtn.addEventListener('click', closeQuickView);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeQuickView();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') closeQuickView();
  });
}

/* ============================================================
   CONTACT FORM
   ============================================================ */
function initContactForm() {
  const form    = document.getElementById('contact-form');
  const success = document.getElementById('form-success');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name    = document.getElementById('contact-name').value.trim();
    const email   = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
      showToast('⚠️ Please fill in all required fields.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('⚠️ Please enter a valid email address.');
      return;
    }

    const submitBtn = form.querySelector('[type="submit"]');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    setTimeout(() => {
      form.reset();
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
      success.style.display = 'block';
      setTimeout(() => (success.style.display = 'none'), 5000);
    }, 1200);
  });
}

/* ============================================================
   BACK TO TOP BUTTON
   ============================================================ */
function initBackToTop() {
  document.getElementById('back-to-top').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ============================================================
   FOOTER YEAR
   ============================================================ */
function setFooterYear() {
  const el = document.getElementById('footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

/* ============================================================
   SMOOTH ANCHOR SCROLLING
   ============================================================ */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

/* ============================================================
   INIT STATIC REVEAL ELEMENTS
   ============================================================ */
function initRevealObserver() {
  const targets = document.querySelectorAll(
    '.why-card, .testimonial-card, .gallery-item, .contact-item, .section-header'
  );
  targets.forEach(el => el.classList.add('reveal'));
  observeRevealElements();
}

/* ============================================================
   MAIN INITIALIZATION
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  loadPersistedData();

  renderCollections();
  renderProducts();
  renderGallery();

  updateCartUI();
  updateWishlistUI();
  updateWishlistHearts();

  initNavbar();
  initSearch();
  initFilters();
  initSort();
  initCollectionFiltering();
  initProductsGrid();
  initCartDrawer();
  initWishlistDrawer();
  initQuickViewModal();
  initTestimonials();
  initContactForm();
  initBackToTop();
  initSmoothScroll();
  initRevealObserver();
  setFooterYear();

  console.log('%c✦ CB TRENDZ ✦', 'color:#D4AF70;font-size:1.2rem;font-weight:bold;background:#651B2B;padding:6px 16px;border-radius:4px;');
  console.log('%cWelcome! Saree boutique website loaded successfully.', 'color:#651B2B;font-size:0.9rem;');
});
