const WHATSAPP_NUMBER = "918778522690";

const products = [
  { id: 1, name: "Kanchi cotton Saree", category: "Cotton Sarees", price: 1, image: "images/IMG_6513.jpg", images: ["images/IMG_6513.jpg", "images/IMG_6511.jpg", "images/IMG_6510.jpg"] },
  { id: 2, name: "Semi silk Saree", category: "Silk Sarees", price: 850, image: "images/Teal and Gold Banarasi Saree Fold.png" },
  {
    id: 3,
    name: "Semi silk Saree",
    category: "Silk Sarees",
    price: 650,
    image: "images/IMG_6517_enhanced_straight.jpg",
    images: ["images/IMG_6517_enhanced_straight.jpg", "images/IMG_6518_enhanced_straight.jpg"],
    colors: [
      { id: "green", name: "Olive Green", hex: "#7A8C18", borderHex: "#0892A5", image: "images/IMG_6517_enhanced_straight.jpg", images: ["images/IMG_6517_enhanced_straight.jpg", "images/IMG_6518_enhanced_straight.jpg"] },
      { id: "yellow", name: "Mustard Yellow", hex: "#E5A510", borderHex: "#B2184B", image: "images/IMG_6514_enhanced_straight.jpg", images: ["images/IMG_6514_enhanced_straight.jpg", "images/IMG_6515_enhanced_straight.jpg", "images/IMG_6516_enhanced_straight.jpg"] }
    ]
  },
  { id: 4, name: "Daily wear Georgette Saree", category: "Party Wear Sarees", price: 550, image: "images/Folded_floral_yellow_saree_displ…_f635d66d_2K.jpg" },
  { id: 5, name: "Moonga Silk Saree", category: "Designer Sarees", price: 1150, image: "images/Folded_green_saree_with_border_c449f9bc_2K.jpg" },
  { id: 6, name: "Linen silk Saree", category: "Silk Sarees", price: 799, image: "images/image.png_1dbc01cd_2K.jpg" },
  { id: 7, name: "Shimmer linen Saree", category: "Party Wear Sarees", price: 799, image: "images/image.png_26f0abe6_2K.jpg" },
  { id: 8, name: "Cotton Saree", category: "Cotton Sarees", price: 499, image: "images/image.png_f03ac051_2K.jpg" },
  { id: 9, name: "Cotton Saree", category: "Cotton Sarees", price: 599, image: "images/Folded Multicolor Silk Saree on White.png" },
  {
    id: 10,
    name: "Designer Embroidered Saree",
    category: "Designer Sarees",
    price: 799,
    image: "images/IMG_6519_enhanced_straight.jpg",
    images: ["images/IMG_6519_enhanced_straight.jpg", "images/IMG_6520_enhanced_straight.jpg"],
    colors: [
      { id: "green", name: "Emerald Green", label: "Green", hex: "#1B5E3C", borderHex: "#D4AF70", image: "images/IMG_6519_enhanced_straight.jpg", images: ["images/IMG_6519_enhanced_straight.jpg", "images/IMG_6520_enhanced_straight.jpg"] },
      { id: "red", name: "Ruby Red", label: "Red", hex: "#9B111E", borderHex: "#D4AF70", image: "images/IMG_6521_enhanced_straight.jpg", images: ["images/IMG_6521_enhanced_straight.jpg", "images/IMG_6522_enhanced_straight.jpg"] }
    ]
  }
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
