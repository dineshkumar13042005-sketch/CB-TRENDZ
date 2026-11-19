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
  {
    id: 4,
    name: "Daily wear Georgette Saree",
    category: "Party Wear Sarees",
    price: 550,
    image: "images/IMG_6523_enhanced_straight.jpg",
    images: ["images/IMG_6523_enhanced_straight.jpg", "images/IMG_6524_enhanced_straight.jpg"],
    colors: [
      { id: "yellow", name: "Mustard Yellow", label: "Yellow", hex: "#C99A1C", borderHex: "#D4AF70", image: "images/IMG_6523_enhanced_straight.jpg", images: ["images/IMG_6523_enhanced_straight.jpg", "images/IMG_6524_enhanced_straight.jpg"] },
      { id: "red", name: "Festive Red", label: "Red", hex: "#A7171C", borderHex: "#D4AF70", image: "images/IMG_6525_enhanced_straight.jpg", images: ["images/IMG_6525_enhanced_straight.jpg", "images/IMG_6526_enhanced_straight.jpg"] },
      { id: "pink", name: "Coral Pink", label: "Pink", hex: "#E65D65", borderHex: "#D4AF70", image: "images/IMG_6527_enhanced_straight.jpg", images: ["images/IMG_6527_enhanced_straight.jpg", "images/IMG_6528_enhanced_straight.jpg"] },
      { id: "violet", name: "Royal Violet", label: "Violet", hex: "#2E1E5B", borderHex: "#6A4E9E", image: "images/IMG_6529_enhanced_straight.jpg", images: ["images/IMG_6529_enhanced_straight.jpg", "images/IMG_6530_enhanced_straight.jpg", "images/IMG_6531_enhanced_straight.jpg", "images/IMG_6532_enhanced_straight.jpg"] }
    ]
  },
  {
    id: 5,
    name: "Moonga Silk Saree",
    category: "Designer Sarees",
    price: 1150,
    image: "images/IMG_6535_enhanced_straight.jpg",
    images: ["images/IMG_6535_enhanced_straight.jpg", "images/IMG_6536_enhanced_straight.jpg"],
    colors: [
      { id: "sage_green", name: "Sage Green", label: "Sage Green", hex: "#8FA88B", borderHex: "#4B6347", image: "images/IMG_6535_enhanced_straight.jpg", images: ["images/IMG_6535_enhanced_straight.jpg", "images/IMG_6536_enhanced_straight.jpg"] },
      { id: "lite_green", name: "Lite Green", label: "Lite Green", hex: "#9EC264", borderHex: "#5B8023", image: "images/IMG_6538_enhanced_straight.jpg", images: ["images/IMG_6538_enhanced_straight.jpg", "images/IMG_6539_enhanced_straight.jpg"] },
      { id: "lite_violet", name: "Lite Violet", label: "Lite Violet", hex: "#A48EB6", borderHex: "#5E4970", image: "images/IMG_6542_enhanced_straight.jpg", images: ["images/IMG_6542_enhanced_straight.jpg", "images/IMG_6543_enhanced_straight.jpg"] }
    ]
  },
  { id: 6, name: "Linen silk Saree", category: "Silk Sarees", price: 799, image: "images/image.png_1dbc01cd_2K.jpg" },
  {
    id: 7,
    name: 'Shimmer linen Saree',
    category: 'Party Wear Sarees',
    price: 799,
    image: 'images/IMG_6544_enhanced_straight.jpg',
    images: ['images/IMG_6544_enhanced_straight.jpg', 'images/IMG_6545_enhanced_straight.jpg'],
    colors: [
      { id: 'pink', name: 'Blush Pink', label: 'Pink', hex: '#D88CA3', borderHex: '#9A4B62', image: 'images/IMG_6544_enhanced_straight.jpg', images: ['images/IMG_6544_enhanced_straight.jpg', 'images/IMG_6545_enhanced_straight.jpg'] },
      { id: 'brown', name: 'Terracotta Brown', label: 'Brown', hex: '#9B5738', borderHex: '#5C2B14', image: 'images/IMG_6547_enhanced_straight.jpg', images: ['images/IMG_6547_enhanced_straight.jpg', 'images/IMG_6548_enhanced_straight.jpg'] },
      { id: 'orange', name: 'Lite Orange', label: 'Lite Orange', hex: '#E58C46', borderHex: '#A05118', image: 'images/IMG_6549_enhanced_straight.jpg', images: ['images/IMG_6549_enhanced_straight.jpg', 'images/IMG_6550_enhanced_straight.jpg'] },
      { id: 'green', name: 'Meadow Green', label: 'Green', hex: '#3E8E41', borderHex: '#1F5C22', image: 'images/IMG_6551_enhanced_straight.jpg', images: ['images/IMG_6551_enhanced_straight.jpg', 'images/IMG_6552_enhanced_straight.jpg', 'images/IMG_6553_enhanced_straight.jpg', 'images/IMG_6554_enhanced_straight.jpg'] }
    ]
  },
  { id: 8, name: "Cotton Saree", category: "Cotton Sarees", price: 499, image: "images/image.png_f03ac051_2K.jpg" },
  {
    id: 9,
    name: 'Cotton Saree',
    category: 'Cotton Sarees',
    price: 599,
    image: 'images/IMG_6555_enhanced_straight.jpg',
    images: [
      'images/IMG_6555_enhanced_straight.jpg',
      'images/IMG_6557_enhanced_straight.jpg',
      'images/IMG_6558_enhanced_straight.jpg'
    ]
  },
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
  },
  {
    id: 11,
    name: "CB Trendz Floral Shimmer Saree",
    category: "Designer Sarees",
    price: 899,
    image: "images/IMG_6559_enhanced_straight.jpg",
    images: ["images/IMG_6559_enhanced_straight.jpg", "images/IMG_6560_enhanced_straight.jpg"],
    colors: [
      { id: "wine", name: "Wine Maroon", label: "Wine", hex: "#4A1521", borderHex: "#D4AF70", image: "images/IMG_6559_enhanced_straight.jpg", images: ["images/IMG_6559_enhanced_straight.jpg", "images/IMG_6560_enhanced_straight.jpg"] },
      { id: "pink", name: "Rose Pink", label: "Pink", hex: "#D96B87", borderHex: "#D4AF70", image: "images/IMG_6561_enhanced_straight.jpg", images: ["images/IMG_6561_enhanced_straight.jpg", "images/IMG_6562_enhanced_straight.jpg"] },
      { id: "violet", name: "Soft Violet", label: "Violet", hex: "#9B7EAA", borderHex: "#D4AF70", image: "images/IMG_6563_enhanced_straight.jpg", images: ["images/IMG_6563_enhanced_straight.jpg", "images/IMG_6564_enhanced_straight.jpg"] },
      { id: "white", name: "Pristine White", label: "White", hex: "#F7F5F0", borderHex: "#C5BCAB", image: "images/IMG_6565_enhanced_straight.jpg", images: ["images/IMG_6565_enhanced_straight.jpg", "images/IMG_6566_enhanced_straight.jpg"] },
      { id: "red", name: "Cherry Red", label: "Red", hex: "#A61732", borderHex: "#D4AF70", image: "images/IMG_6568_enhanced_straight.jpg", images: ["images/IMG_6568_enhanced_straight.jpg", "images/IMG_6569_enhanced_straight.jpg"] }
    ]
  },
  {
    id: 12,
    name: "Traditional Zari Silk Saree",
    category: "Silk Sarees",
    price: 750,
    image: "images/IMG_6570_enhanced_straight.jpg",
    images: ["images/IMG_6570_enhanced_straight.jpg", "images/IMG_6571_enhanced_straight.jpg"],
    colors: [
      { id: "violet", name: "Royal Violet", label: "Violet", hex: "#4B174A", borderHex: "#D4AF70", image: "images/IMG_6570_enhanced_straight.jpg", images: ["images/IMG_6570_enhanced_straight.jpg", "images/IMG_6571_enhanced_straight.jpg"] },
      { id: "black", name: "Jet Black", label: "Black", hex: "#1A1A1A", borderHex: "#D4AF70", image: "images/IMG_6573_enhanced_straight.jpg", images: ["images/IMG_6573_enhanced_straight.jpg", "images/IMG_6572_enhanced_straight.jpg"] },
      { id: "red", name: "Crimson Red", label: "Red", hex: "#99141D", borderHex: "#D4AF70", image: "images/IMG_6574_enhanced_straight.jpg", images: ["images/IMG_6574_enhanced_straight.jpg", "images/IMG_6575_enhanced_straight.jpg"] },
      { id: "blue", name: "Sapphire Blue", label: "Blue", hex: "#1557A8", borderHex: "#D4AF70", image: "images/IMG_6576_enhanced_straight.jpg", images: ["images/IMG_6576_enhanced_straight.jpg", "images/IMG_6577_enhanced_straight.jpg"] },
      { id: "yellow_green", name: "Light Yellow with Green", label: "Yellow-Green", hex: "#709E18", borderHex: "#E6CF42", image: "images/IMG_6579_enhanced_straight.jpg", images: ["images/IMG_6579_enhanced_straight.jpg", "images/IMG_6578_enhanced_straight.jpg"] },
      { id: "yellow_violet", name: "Light Yellow with Violet", label: "Yellow-Violet", hex: "#6A1E5C", borderHex: "#A89E18", image: "images/IMG_6580_enhanced_straight.jpg", images: ["images/IMG_6580_enhanced_straight.jpg", "images/IMG_6581_enhanced_straight.jpg"] }
    ]
  },
  {
    id: 13,
    name: "Handloom Contrast Zari Silk Saree",
    category: "Silk Sarees",
    price: 699,
    image: "images/IMG_6584_enhanced_straight.jpg",
    images: ["images/IMG_6584_enhanced_straight.jpg", "images/IMG_6585_enhanced_straight.jpg"],
    colors: [
      { id: "green_black", name: "Parrot Green with Black", label: "Green & Black", hex: "#8CA818", borderHex: "#1A1A1A", image: "images/IMG_6584_enhanced_straight.jpg", images: ["images/IMG_6584_enhanced_straight.jpg", "images/IMG_6585_enhanced_straight.jpg"] },
      { id: "orange_red", name: "Mustard Orange with Red", label: "Red & Orange", hex: "#E5A012", borderHex: "#C2185B", image: "images/IMG_6586_enhanced_straight.jpg", images: ["images/IMG_6586_enhanced_straight.jpg", "images/IMG_6587_enhanced_straight.jpg"] },
      { id: "blue_black", name: "Jet Black with Royal Blue", label: "Blue & Black", hex: "#1A1A1A", borderHex: "#1976D2", image: "images/IMG_6588_enhanced_straight.jpg", images: ["images/IMG_6588_enhanced_straight.jpg", "images/IMG_6589_enhanced_straight.jpg"] }
    ]
  },
  {
    id: 14,
    name: "Royal Kanjivaram Brocade Silk Saree",
    category: "Wedding Sarees",
    price: 1299,
    image: "images/IMG_6488_enhanced_straight.jpg",
    images: ["images/IMG_6488_enhanced_straight.jpg"],
    colors: [
      { id: "magenta", name: "Royal Magenta", label: "Magenta", hex: "#8E1658", borderHex: "#D4AF70", image: "images/IMG_6488_enhanced_straight.jpg", images: ["images/IMG_6488_enhanced_straight.jpg"] },
      { id: "red", name: "Crimson Red", label: "Red", hex: "#B31828", borderHex: "#D4AF70", image: "images/IMG_6489_enhanced_straight.jpg", images: ["images/IMG_6489_enhanced_straight.jpg", "images/IMG_6490_enhanced_straight.jpg"] },
      { id: "green_border", name: "Copper with Mint Green Border", label: "Light Green Border", hex: "#6B2337", borderHex: "#38B29C", image: "images/IMG_6491_enhanced_straight.jpg", images: ["images/IMG_6491_enhanced_straight.jpg", "images/IMG_6492_enhanced_straight.jpg"] }
    ]
  },
  {
    id: 15,
    name: "Classic Kanchi Contrast Silk Saree",
    category: "Silk Sarees",
    price: 899,
    image: "images/IMG_6493_enhanced_straight.jpg",
    images: ["images/IMG_6493_enhanced_straight.jpg", "images/IMG_6494_enhanced_straight.jpg"],
    colors: [
      { id: "red_mint", name: "Crimson Red with Mint Border", label: "Red & Mint", hex: "#B31828", borderHex: "#4CB8A5", image: "images/IMG_6493_enhanced_straight.jpg", images: ["images/IMG_6493_enhanced_straight.jpg", "images/IMG_6494_enhanced_straight.jpg"] },
      { id: "lite_green", name: "Emerald Green with Maroon Border", label: "Lite Green", hex: "#1D7A56", borderHex: "#8B1E2D", image: "images/IMG_6495_enhanced_straight.jpg", images: ["images/IMG_6495_enhanced_straight.jpg", "images/IMG_6496_enhanced_straight.jpg"] }
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
