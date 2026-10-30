const WHATSAPP_NUMBER = "918778522690"; // Updated phone number

const products = [
  { id: 1, name: "Kanjivaram Silk Saree", category: "Silk Sarees", price: 4599, oldPrice: 6999, tag: "34% OFF", image: "images/saree1.jpg" },
  { id: 2, name: "Pure Cotton Saree", category: "Cotton Sarees", price: 1999, oldPrice: 2899, tag: "31% OFF", image: "images/saree3.jpg" },
  { id: 3, name: "Bridal Silk Saree", category: "Wedding Sarees", price: 8599, oldPrice: 12999, tag: "33% OFF", image: "images/saree5.jpg" },
  { id: 4, name: "Designer Organza Saree", category: "Party Wear Sarees", price: 3499, oldPrice: 5199, tag: "32% OFF", image: "images/saree4.jpg" },
  { id: 5, name: "Banarasi Silk Saree", category: "Silk Sarees", price: 5399, oldPrice: 7899, tag: "31% OFF", image: "images/saree2.jpg" },
  { id: 6, name: "Chanderi Silk Saree", category: "Cotton Sarees", price: 2999, oldPrice: 4499, tag: "33% OFF", image: "images/saree8.jpg" },
  { id: 7, name: "Tussar Silk Saree", category: "Wedding Sarees", price: 3599, oldPrice: 5299, tag: "32% OFF", image: "images/saree10.jpg" },
  { id: 8, name: "Printed Daily Wear Saree", category: "Daily Wear Sarees", price: 1499, oldPrice: 2499, tag: "40% OFF", image: "images/saree6.jpg" },
  { id: 9, name: "Designer Georgette Saree", category: "Designer Sarees", price: 4599, oldPrice: 5500, tag: "16% OFF", image: "images/saree7.jpg" },
  { id: 10, name: "Kasavu Kerala Cotton Saree", category: "Cotton Sarees", price: 2499, oldPrice: 3000, tag: "17% OFF", image: "images/saree9.jpg" },
  { id: 11, name: "Sequin Party Wear Saree", category: "Party Wear Sarees", price: 6950, oldPrice: 8500, tag: "18% OFF", image: "images/saree11.jpg" },
  { id: 12, name: "Jaipur Block Print Saree", category: "Daily Wear Sarees", price: 1899, oldPrice: 2499, tag: "24% OFF", image: "images/saree12.jpg" }
];

const money = amount => new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
}).format(amount);

const imageUrl = img => img;

function loadStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

let cart = loadStorage("cbTrendzCart", []);
let wishlist = loadStorage("cbTrendzWishlist", []);

const productGrid = document.getElementById("productGrid");
const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");
const emptyMessage = document.getElementById("emptyMessage");
const cartDrawer = document.getElementById("cartDrawer");
const wishlistDrawer = document.getElementById("wishlistDrawer");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const toast = document.getElementById("toast");

let toastTimeout;

function saveState() {
  localStorage.setItem("cbTrendzCart", JSON.stringify(cart));
  localStorage.setItem("cbTrendzWishlist", JSON.stringify(wishlist));
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
}

function renderProducts() {
  const search = searchInput.value.trim().toLowerCase();
  const category = categoryFilter.value;
  const sort = sortSelect.value;

  let filtered = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(search) ||
      product.category.toLowerCase().includes(search);

    const matchesCategory =
      category === "All" || product.category === category;

    return matchesSearch && matchesCategory;
  });

  if (sort === "low") filtered.sort((a, b) => a.price - b.price);
  if (sort === "high") filtered.sort((a, b) => b.price - a.price);
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));

  productGrid.innerHTML = filtered.map(product => {
    const isWishlisted = wishlist.includes(product.id);
    const discount = Math.round(
      ((product.oldPrice - product.price) / product.oldPrice) * 100
    );

    return `
      <article class="product-card">
        <div class="product-image">
          <img
            src="${imageUrl(product.image)}"
            alt="${product.name}"
            loading="lazy"
            onerror="this.onerror=null;this.src='images/saree1.jpg'"
          >
          <span class="product-tag">${product.tag}</span>
          <button
            class="wish-btn ${isWishlisted ? "active" : ""}"
            data-action="wishlist"
            data-id="${product.id}"
            aria-label="Toggle wishlist"
          >${isWishlisted ? "♥" : "♡"}</button>
          <button class="quick-btn" data-action="quick" data-id="${product.id}">
            QUICK VIEW
          </button>
        </div>
        <div class="product-info">
          <p class="product-category">${product.category}</p>
          <h3>${product.name}</h3>
          <div class="price-row">
            <span class="price">${money(product.price)}</span>
            <span class="old-price">${money(product.oldPrice)}</span>
            <span class="discount">${discount}% OFF</span>
          </div>
          <button class="add-btn" data-action="add" data-id="${product.id}">
            ADD TO BAG +
          </button>
        </div>
      </article>
    `;
  }).join("");

  emptyMessage.hidden = filtered.length !== 0;
}

function addToCart(id) {
  const existing = cart.find(item => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveState();
  renderCart();
  showToast("Beautiful choice! Added to your bag.");
}

function changeQuantity(id, amount) {
  const item = cart.find(item => item.id === id);
  if (!item) return;

  item.quantity += amount;
  cart = cart.filter(item => item.quantity > 0);

  saveState();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(item => item.id !== id);
  saveState();
  renderCart();
  showToast("Item removed from bag.");
}

function renderCart() {
  // Remove invalid products and invalid quantities from saved data.
  cart = cart.filter(item =>
    products.some(product => product.id === item.id) &&
    Number.isInteger(item.quantity) &&
    item.quantity > 0
  );

  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => {
    const product = products.find(product => product.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);

  document.getElementById("cartCount").textContent = count;
  document.getElementById("cartSubtotal").textContent = money(subtotal);

  const cartItems = document.getElementById("cartItems");

  if (!cart.length) {
    cartItems.innerHTML = '<p class="drawer-empty">Your bag is waiting for something beautiful.</p>';
  } else {
    cartItems.innerHTML = cart.map(item => {
      const product = products.find(product => product.id === item.id);

      return `
        <div class="cart-row">
          <img src="${imageUrl(product.image)}" alt="${product.name}">
          <div class="cart-row-content">
            <h3>${product.name}</h3>
            <p>${money(product.price)}</p>
            <div class="quantity-controls">
              <button data-action="decrease" data-id="${product.id}" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button data-action="increase" data-id="${product.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-btn" data-action="remove" data-id="${product.id}">Remove</button>
          </div>
        </div>
      `;
    }).join("");
  }

  saveState();
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(itemId => itemId !== id);
    showToast("Removed from wishlist.");
  } else {
    wishlist.push(id);
    showToast("Added to your wishlist ♥");
  }

  saveState();
  renderProducts();
  renderWishlist();
}

function renderWishlist() {
  document.getElementById("wishCount").textContent = wishlist.length;

  const wishlistItems = document.getElementById("wishlistItems");
  const savedProducts = wishlist
    .map(id => products.find(product => product.id === id))
    .filter(Boolean);

  if (!savedProducts.length) {
    wishlistItems.innerHTML = '<p class="drawer-empty">Your wishlist is empty. Save the sarees you love!</p>';
    return;
  }

  wishlistItems.innerHTML = savedProducts.map(product => `
    <div class="wish-row">
      <img src="${imageUrl(product.image)}" alt="${product.name}">
      <div class="wish-row-content">
        <h3>${product.name}</h3>
        <p>${money(product.price)}</p>
        <button class="remove-btn" data-action="add-wish" data-id="${product.id}">Add to bag</button>
        <button class="remove-btn" data-action="wishlist" data-id="${product.id}">Remove ♥</button>
      </div>
    </div>
  `).join("");
}

function openDrawer(drawer) {
  cartDrawer.classList.remove("open");
  wishlistDrawer.classList.remove("open");

  drawer.classList.add("open");
  drawerBackdrop.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeDrawers() {
  cartDrawer.classList.remove("open");
  wishlistDrawer.classList.remove("open");
  drawerBackdrop.classList.remove("open");
  document.body.style.overflow = "";
}

function showQuickView(id) {
  const product = products.find(product => product.id === id);
  if (!product) return;

  document.getElementById("quickViewContent").innerHTML = `
    <div class="quick-product">
      <img src="${imageUrl(product.image)}" alt="${product.name}">
      <div>
        <p class="product-category">${product.category}</p>
        <h2>${product.name}</h2>
        <p>${money(product.price)}</p>
        <p>A beautiful addition to your ethnic wardrobe. Contact CB TRENDZ for product availability and details.</p>
        <button class="btn btn-gold" data-action="add-quick" data-id="${product.id}">Add to Bag +</button>
      </div>
    </div>
  `;

  document.getElementById("quickView").showModal();
}

// Event delegation: handles buttons inside dynamically rendered products.
document.addEventListener("click", event => {
  const button = event.target.closest("[data-action]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const action = button.dataset.action;

  switch (action) {
    case "add":
    case "add-wish":
    case "add-quick":
      addToCart(id);
      if (action === "add-quick") {
        document.getElementById("quickView").close();
      }
      if (action === "add-wish") closeDrawers();
      break;

    case "wishlist":
      toggleWishlist(id);
      break;

    case "quick":
      showQuickView(id);
      break;

    case "increase":
      changeQuantity(id, 1);
      break;

    case "decrease":
      changeQuantity(id, -1);
      break;

    case "remove":
      removeFromCart(id);
      break;
  }
});

searchInput.addEventListener("input", renderProducts);
categoryFilter.addEventListener("change", renderProducts);
sortSelect.addEventListener("change", renderProducts);

document.getElementById("searchFocus").addEventListener("click", () => {
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  searchInput.focus({ preventScroll: true });
});

document.getElementById("wishlistFocus").addEventListener("click", () => {
  renderWishlist();
  openDrawer(wishlistDrawer);
});

document.getElementById("cartOpen").addEventListener("click", () => {
  renderCart();
  openDrawer(cartDrawer);
});

document.querySelectorAll("[data-close]").forEach(button => {
  button.addEventListener("click", closeDrawers);
});

drawerBackdrop.addEventListener("click", closeDrawers);

document.getElementById("menuToggle").addEventListener("click", () => {
  const menu = document.getElementById("navMenu");
  menu.classList.toggle("open");

  document.getElementById("menuToggle").textContent =
    menu.classList.contains("open") ? "✕" : "☰";
});

document.querySelectorAll("#navMenu a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("navMenu").classList.remove("open");
    document.getElementById("menuToggle").textContent = "☰";
  });
});

document.querySelectorAll(".collection-card").forEach(card => {
  card.addEventListener("click", () => {
    categoryFilter.value = card.dataset.category;
    renderProducts();
    document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("quickClose").addEventListener("click", () => {
  document.getElementById("quickView").close();
});

document.getElementById("quickView").addEventListener("click", event => {
  if (event.target === event.currentTarget) {
    event.currentTarget.close();
  }
});

document.getElementById("checkoutButton").addEventListener("click", () => {
  if (!cart.length) {
    showToast("Your shopping bag is empty.");
    return;
  }

  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    showToast("Please add the shop's WhatsApp number in script.js.");
    return;
  }

  const lines = cart.map(item => {
    const product = products.find(product => product.id === item.id);
    return `${product.name} x ${item.quantity} = ${money(product.price * item.quantity)}`;
  });

  const total = cart.reduce((sum, item) => {
    const product = products.find(product => product.id === item.id);
    return sum + product.price * item.quantity;
  }, 0);

  const message = [
    "Hello CB TRENDZ! I would like to enquire about these sarees:",
    "",
    ...lines,
    "",
    `Subtotal: ${money(total)}`,
    "Please confirm availability and delivery details."
  ].join("\n");

  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank", "noopener,noreferrer");
});

document.getElementById("whatsappLink").addEventListener("click", event => {
  event.preventDefault();

  if (!/^\d{10,15}$/.test(WHATSAPP_NUMBER)) {
    showToast("Please configure the WhatsApp number in script.js.");
    return;
  }

  window.open(
    `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello CB TRENDZ! I would like to enquire about your saree collection.")}`,
    "_blank",
    "noopener,noreferrer"
  );
});

document.getElementById("year").textContent = new Date().getFullYear();

renderProducts();
renderCart();
renderWishlist();
