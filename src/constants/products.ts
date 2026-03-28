export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  department: string;
  stock?: number;
  description?: string;
  options?: {
    sizes?: string[];
    colors?: string[];
    [key: string]: any;
  };
}

export const DEPARTMENTS = [
  "All",
  "Organic Produce",
  "Dairy & Artisanal Cheese",
  "Bakery & Patisserie",
  "Prime Meats",
  "Fine Wines",
  "Pantry Essentials"
];

export const PRODUCTS: Product[] = [
  // Organic Produce
  {
    id: "1",
    name: "Organic Hass Avocado",
    price: 2.50,
    image: "https://loremflickr.com/800/800/avocado?lock=1",
    department: "Organic Produce",
    options: {
      ripeness: ["Firm", "Ready to Eat", "Very Soft"]
    }
  },
  {
    id: "2",
    name: "Heirloom Tomatoes",
    price: 4.99,
    image: "https://loremflickr.com/800/800/tomato?lock=2",
    department: "Organic Produce",
    options: {
      variety: ["Red", "Yellow", "Purple"]
    }
  },
  {
    id: "3",
    name: "Organic Baby Spinach",
    price: 3.49,
    image: "https://loremflickr.com/800/800/spinach?lock=3",
    department: "Organic Produce",
    options: {
      size: ["Small Bag", "Family Size"]
    }
  },
  {
    id: "4",
    name: "Fresh Honeycrisp Apples",
    price: 5.99,
    image: "https://loremflickr.com/800/800/apple?lock=4",
    department: "Organic Produce",
    options: {
      quantity: ["Single", "Bag of 6", "Box of 12"]
    }
  },
  {
    id: "5",
    name: "Organic Carrots Bunch",
    price: 2.99,
    image: "https://loremflickr.com/800/800/carrot?lock=5",
    department: "Organic Produce"
  },

  // Dairy & Artisanal Cheese
  {
    id: "6",
    name: "Artisanal Brie",
    price: 12.99,
    image: "https://loremflickr.com/800/800/brie?lock=6",
    department: "Dairy & Artisanal Cheese",
    options: {
      weight: ["250g", "500g"]
    }
  },
  {
    id: "7",
    name: "Aged Cheddar Block",
    price: 8.50,
    image: "https://loremflickr.com/800/800/cheddar?lock=7",
    department: "Dairy & Artisanal Cheese",
    options: {
      aging: ["12 Months", "24 Months", "36 Months"]
    }
  },
  {
    id: "8",
    name: "Organic Whole Milk",
    price: 4.99,
    image: "https://loremflickr.com/800/800/milk?lock=8",
    department: "Dairy & Artisanal Cheese",
    options: {
      size: ["1L", "2L"]
    }
  },
  {
    id: "9",
    name: "Grass-Fed Butter",
    price: 5.99,
    image: "https://loremflickr.com/800/800/butter?lock=9",
    department: "Dairy & Artisanal Cheese",
    options: {
      type: ["Salted", "Unsalted"]
    }
  },
  {
    id: "10",
    name: "Greek Yogurt Plain",
    price: 6.49,
    image: "https://loremflickr.com/800/800/yogurt?lock=10",
    department: "Dairy & Artisanal Cheese",
    options: {
      fat_content: ["0%", "2%", "5%"]
    }
  },

  // Bakery & Patisserie
  {
    id: "11",
    name: "Sourdough Loaf",
    price: 6.50,
    image: "https://loremflickr.com/800/800/sourdough?lock=11",
    department: "Bakery & Patisserie",
    options: {
      sliced: ["Yes", "No"]
    }
  },
  {
    id: "12",
    name: "Butter Croissants (4-pack)",
    price: 8.99,
    image: "https://loremflickr.com/800/800/croissant?lock=12",
    department: "Bakery & Patisserie"
  },
  {
    id: "13",
    name: "French Baguette",
    price: 3.99,
    image: "https://loremflickr.com/800/800/baguette?lock=13",
    department: "Bakery & Patisserie"
  },
  {
    id: "14",
    name: "Chocolate Babka",
    price: 12.50,
    image: "https://loremflickr.com/800/800/babka?lock=14",
    department: "Bakery & Patisserie"
  },
  {
    id: "15",
    name: "Blueberry Muffins (6-pack)",
    price: 9.99,
    image: "https://loremflickr.com/800/800/muffin?lock=15",
    department: "Bakery & Patisserie"
  },

  // Prime Meats
  {
    id: "16",
    name: "Ribeye Steak (12oz)",
    price: 24.99,
    image: "https://loremflickr.com/800/800/steak?lock=16",
    department: "Prime Meats",
    options: {
      cut: ["Standard", "Thick Cut"]
    }
  },
  {
    id: "17",
    name: "Organic Chicken Breast",
    price: 14.50,
    image: "https://loremflickr.com/800/800/chicken?lock=17",
    department: "Prime Meats",
    options: {
      quantity: ["2-pack", "4-pack"]
    }
  },
  {
    id: "18",
    name: "Wild Caught Salmon Fillet",
    price: 18.99,
    image: "https://loremflickr.com/800/800/salmon?lock=18",
    department: "Prime Meats",
    options: {
      skin: ["On", "Off"]
    }
  },
  {
    id: "19",
    name: "Thick-Cut Bacon",
    price: 9.99,
    image: "https://loremflickr.com/800/800/bacon?lock=19",
    department: "Prime Meats",
    options: {
      flavor: ["Smoked", "Maple", "Peppered"]
    }
  },
  {
    id: "20",
    name: "Ground Wagyu Beef",
    price: 16.99,
    image: "https://loremflickr.com/800/800/beef?lock=20",
    department: "Prime Meats",
    options: {
      fat_ratio: ["80/20", "90/10"]
    }
  },

  // Fine Wines
  {
    id: "21",
    name: "Cabernet Sauvignon",
    price: 25.99,
    image: "https://loremflickr.com/800/800/wine?lock=21",
    department: "Fine Wines",
    options: {
      size: ["750ml", "1.5L"]
    }
  },
  {
    id: "22",
    name: "Napa Valley Chardonnay",
    price: 22.50,
    image: "https://loremflickr.com/800/800/wine?lock=22",
    department: "Fine Wines",
    options: {
      size: ["750ml"]
    }
  },
  {
    id: "23",
    name: "French Pinot Noir",
    price: 28.99,
    image: "https://loremflickr.com/800/800/wine?lock=23",
    department: "Fine Wines"
  },
  {
    id: "24",
    name: "Prosecco Sparkling Wine",
    price: 19.99,
    image: "https://loremflickr.com/800/800/champagne?lock=24",
    department: "Fine Wines"
  },
  {
    id: "25",
    name: "New Zealand Sauvignon Blanc",
    price: 21.99,
    image: "https://loremflickr.com/800/800/wine?lock=25",
    department: "Fine Wines"
  },

  // Pantry Essentials
  {
    id: "26",
    name: "Extra Virgin Olive Oil",
    price: 14.99,
    image: "https://loremflickr.com/800/800/oliveoil?lock=26",
    department: "Pantry Essentials",
    options: {
      size: ["500ml", "1L"]
    }
  },
  {
    id: "27",
    name: "Artisanal Pasta",
    price: 5.99,
    image: "https://loremflickr.com/800/800/pasta?lock=27",
    department: "Pantry Essentials",
    options: {
      shape: ["Penne", "Fusilli", "Spaghetti"]
    }
  },
  {
    id: "28",
    name: "Jasmine Rice (5 lbs)",
    price: 8.99,
    image: "https://loremflickr.com/800/800/rice?lock=28",
    department: "Pantry Essentials"
  },
  {
    id: "29",
    name: "Organic Maple Syrup",
    price: 12.99,
    image: "https://loremflickr.com/800/800/syrup?lock=29",
    department: "Pantry Essentials",
    options: {
      grade: ["Grade A Golden", "Grade A Amber", "Grade A Dark"]
    }
  },
  {
    id: "30",
    name: "Sea Salt Flakes",
    price: 6.50,
    image: "https://loremflickr.com/800/800/salt?lock=30",
    department: "Pantry Essentials"
  }
];
