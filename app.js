const WHATSAPP_NUMBER = "918778522690";

const products = [
  { id: 1, name: "Kanchipuram Silk Saree", category: "Silk Sarees", spec: "Rich zari work • Pure silk", price: 8999, oldPrice: 12999, tag: "31% OFF", badge: "Best Seller", rating: 5, reviews: 24, image: "images/saree1.jpg" },
  { id: 2, name: "Kasavu Cotton Saree", category: "Cotton Sarees", spec: "Lightweight • Elegant", price: 2499, oldPrice: 3499, tag: "29% OFF", badge: "New", rating: 5, reviews: 18, image: "images/saree3.jpg" },
  { id: 3, name: "Bridal Kanjivaram Saree", category: "Wedding Sarees", spec: "Grand look • Traditional", price: 14999, oldPrice: 19999, tag: "25% OFF", badge: "Popular", rating: 5, reviews: 32, image: "images/saree5.jpg" },
  { id: 4, name: "Georgette Party Wear Saree", category: "Party Wear Sarees", spec: "Lightweight • Stylish", price: 4499, oldPrice: 6499, tag: "31% OFF", badge: null, rating: 5, reviews: 21, image: "images/saree4.jpg" },
  { id: 5, name: "Designer Organza Saree", category: "Designer Sarees", spec: "Trendy • Premium fabric", price: 5999, oldPrice: 8999, tag: "33% OFF", badge: "Sale", rating: 5, reviews: 16, image: "images/saree7.jpg" },
  { id: 6, name: "Chanderi Silk Saree", category: "Cotton Sarees", spec: "Soft • Comfortable", price: 3499, oldPrice: 5499, tag: "36% OFF", badge: null, rating: 5, reviews: 12, image: "images/saree8.jpg" },
  { id: 7, name: "Tissue Silk Saree", category: "Wedding Sarees", spec: "Rich texture • Elegant", price: 6499, oldPrice: 9999, tag: "35% OFF", badge: null, rating: 5, reviews: 19, image: "images/saree10.jpg" },
  { id: 8, name: "Cotton Blend Saree", category: "Daily Wear Sarees", spec: "Breathable • Everyday comfort", price: 2999, oldPrice: 4499, tag: "33% OFF", badge: null, rating: 5, reviews: 14, image: "images/saree9.jpg" },
  { id: 9, name: "Banarasi Silk Saree", category: "Silk Sarees", spec: "Traditional weave • Royal look", price: 5399, oldPrice: 7899, tag: "31% OFF", badge: "Popular", rating: 5, reviews: 28, image: "images/saree2.jpg" },
  { id: 10, name: "Printed Daily Wear Saree", category: "Daily Wear Sarees", spec: "Easy care • Everyday grace", price: 1499, oldPrice: 2499, tag: "40% OFF", badge: "Sale", rating: 5, reviews: 15, image: "images/saree6.jpg" },
  { id: 11, name: "Sequin Party Wear Saree", category: "Party Wear Sarees", spec: "Glamorous shine • Evening party", price: 6950, oldPrice: 8500, tag: "18% OFF", badge: "New", rating: 5, reviews: 11, image: "images/saree11.jpg" },
  { id: 12, name: "Jaipur Block Print Saree", category: "Daily Wear Sarees", spec: "Handcrafted artisan cotton", price: 1899, oldPrice: 2499, tag: "24% OFF", badge: null, rating: 5, reviews: 9, image: "images/saree12.jpg" }
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
