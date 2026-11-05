const WHATSAPP_NUMBER = "918778522690";

const products = [
  { id: 1, name: "Kanchipuram Silk Saree", category: "Silk Sarees", spec: "Rich zari work • Pure silk", price: 8999, oldPrice: 12999, tag: "31% OFF", badge: "Best Seller", rating: 5, reviews: 24, image: "images/Maroon Gold Zari Saree Ensemble.png" },
  { id: 2, name: "Kasavu Cotton Saree", category: "Cotton Sarees", spec: "Lightweight • Elegant", price: 2499, oldPrice: 3499, tag: "29% OFF", badge: "New", rating: 5, reviews: 18, image: "images/Teal and Gold Banarasi Saree Fold.png" },
  { id: 3, name: "Bridal Kanjivaram Saree", category: "Wedding Sarees", spec: "Grand look • Traditional", price: 14999, oldPrice: 19999, tag: "25% OFF", badge: "Popular", rating: 5, reviews: 32, image: "images/Lime Green Silk Saree with Teal Zari Border.png" },
  { id: 4, name: "Georgette Party Wear Saree", category: "Party Wear Sarees", spec: "Lightweight • Stylish", price: 4499, oldPrice: 6499, tag: "31% OFF", badge: null, rating: 5, reviews: 21, image: "images/Folded_floral_yellow_saree_displ…_f635d66d_2K.jpg" },
  { id: 5, name: "Designer Organza Saree", category: "Designer Sarees", spec: "Trendy • Premium fabric", price: 5999, oldPrice: 8999, tag: "33% OFF", badge: "Sale", rating: 5, reviews: 16, image: "images/Folded_green_saree_with_border_c449f9bc_2K.jpg" }
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

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

let cart = loadStorage("cart", []);
let wishlist = loadStorage("wishlist", []);
