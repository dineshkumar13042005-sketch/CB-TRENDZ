const WHATSAPP_NUMBER = "918778522690";

const products = [
  { id: 1, name: "Kanchi cotton Saree", category: "Cotton Sarees", price: 1350, image: "images/Maroon Gold Zari Saree Ensemble.png" },
  { id: 2, name: "Semi silk Saree", category: "Silk Sarees", price: 850, image: "images/Teal and Gold Banarasi Saree Fold.png" },
  { id: 3, name: "Semi silk Saree", category: "Silk Sarees", price: 650, image: "images/Lime Green Silk Saree with Teal Zari Border.png" },
  { id: 4, name: "Daily wear Georgette Saree", category: "Party Wear Sarees", price: 550, image: "images/Folded_floral_yellow_saree_displ…_f635d66d_2K.jpg" },
  { id: 5, name: "Moonga Silk Saree", category: "Designer Sarees", price: 1150, image: "images/Folded_green_saree_with_border_c449f9bc_2K.jpg" }
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
