const fs = require('fs');

const products = {
  "Organic Produce": [
    { name: "Organic Hass Avocado", price: 2.50 },
    { name: "Organic Honeycrisp Apples", price: 4.99 },
    { name: "Organic Baby Spinach", price: 3.50 },
    { name: "Organic Heirloom Tomatoes", price: 5.99 },
    { name: "Organic Blueberries", price: 4.50 },
    { name: "Organic Bananas", price: 1.20 },
    { name: "Organic Kale", price: 2.99 },
    { name: "Organic Sweet Potatoes", price: 3.25 },
    { name: "Organic Carrots", price: 2.49 },
    { name: "Organic Strawberries", price: 5.50 },
    { name: "Organic Bell Peppers", price: 4.99 },
    { name: "Organic Broccoli", price: 3.75 },
    { name: "Organic Lemons", price: 0.99 },
    { name: "Organic Garlic", price: 1.50 },
    { name: "Organic Ginger", price: 2.00 }
  ],
  "Dairy & Artisanal Cheese": [
    { name: "Grass-Fed Whole Milk", price: 5.99 },
    { name: "Organic Salted Butter", price: 6.50 },
    { name: "Greek Yogurt Plain", price: 4.99 },
    { name: "Aged Sharp Cheddar", price: 8.99 },
    { name: "Fresh Mozzarella", price: 7.50 },
    { name: "Artisanal Brie", price: 12.99 },
    { name: "Goat Cheese Log", price: 6.99 },
    { name: "Parmigiano Reggiano", price: 15.50 },
    { name: "Organic Large Brown Eggs", price: 5.99 },
    { name: "Heavy Whipping Cream", price: 4.25 },
    { name: "Sour Cream", price: 3.50 },
    { name: "Cottage Cheese", price: 4.50 },
    { name: "Feta Cheese", price: 7.99 },
    { name: "Swiss Cheese Slices", price: 5.99 },
    { name: "Almond Milk Unsweetened", price: 4.99 }
  ],
  "Bakery & Patisserie": [
    { name: "Sourdough Loaf", price: 6.50 },
    { name: "French Baguette", price: 3.50 },
    { name: "Butter Croissants (4pk)", price: 8.99 },
    { name: "Chocolate Pain au Chocolat", price: 3.50 },
    { name: "Artisan Whole Wheat Bread", price: 5.99 },
    { name: "Cinnamon Rolls (2pk)", price: 6.50 },
    { name: "Blueberry Muffins (4pk)", price: 7.99 },
    { name: "Everything Bagels (6pk)", price: 6.99 },
    { name: "Rye Bread", price: 5.50 },
    { name: "Brioche Buns (4pk)", price: 5.99 },
    { name: "Focaccia with Rosemary", price: 7.50 },
    { name: "Multigrain Seeded Bread", price: 6.50 },
    { name: "Apple Turnover", price: 3.25 },
    { name: "Danish Pastry", price: 3.50 },
    { name: "Gluten-Free Bread Loaf", price: 8.50 }
  ],
  "Prime Meats": [
    { name: "Ribeye Steak (12oz)", price: 24.99 },
    { name: "Filet Mignon (8oz)", price: 29.99 },
    { name: "Ground Beef 80/20", price: 7.99 },
    { name: "Chicken Breast Organic", price: 9.50 },
    { name: "Pork Chops Bone-In", price: 12.99 },
    { name: "Lamb Chops", price: 18.50 },
    { name: "Bacon Thick Cut", price: 8.99 },
    { name: "Italian Sausage (4pk)", price: 7.50 },
    { name: "Whole Chicken", price: 14.99 },
    { name: "Turkey Breast", price: 11.50 },
    { name: "Wagyu Beef Burger Patties", price: 15.99 },
    { name: "Duck Breast", price: 16.50 },
    { name: "Veal Cutlets", price: 19.99 },
    { name: "Prosciutto di Parma", price: 10.50 },
    { name: "Smoked Ham Slices", price: 6.99 }
  ],
  "Fine Wines": [
    { name: "Cabernet Sauvignon", price: 25.99 },
    { name: "Chardonnay Reserve", price: 22.50 },
    { name: "Pinot Noir", price: 28.99 },
    { name: "Sauvignon Blanc", price: 19.50 },
    { name: "Merlot", price: 21.99 },
    { name: "Rosé d'Anjou", price: 18.00 },
    { name: "Prosecco Superiore", price: 24.50 },
    { name: "Champagne Brut", price: 45.99 },
    { name: "Malbec", price: 23.99 },
    { name: "Riesling", price: 17.50 },
    { name: "Syrah/Shiraz", price: 26.50 },
    { name: "Pinot Grigio", price: 16.99 },
    { name: "Bordeaux Blend", price: 32.00 },
    { name: "Moscato d'Asti", price: 15.99 },
    { name: "Chianti Classico", price: 20.50 }
  ],
  "Pantry Essentials": [
    { name: "Extra Virgin Olive Oil", price: 14.99 },
    { name: "Balsamic Vinegar", price: 9.50 },
    { name: "Sea Salt Flakes", price: 6.99 },
    { name: "Black Peppercorns", price: 5.50 },
    { name: "Organic Honey", price: 8.99 },
    { name: "Maple Syrup Grade A", price: 12.50 },
    { name: "Quinoa Organic", price: 7.99 },
    { name: "Basmati Rice", price: 6.50 },
    { name: "Pasta Penne Rigate", price: 2.50 },
    { name: "Tomato Passata", price: 3.99 },
    { name: "Chickpeas Canned", price: 1.50 },
    { name: "Coconut Milk", price: 2.99 },
    { name: "Peanut Butter Creamy", price: 5.99 },
    { name: "Rolled Oats", price: 4.50 }
  ]
};

// Generate image URLs
for (const dept in products) {
  products[dept] = products[dept].map(p => {
    const prompt = `Professional product photography of ${p.name} isolated on white background`;
    return {
      ...p,
      image: `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=800&nologo=true`
    };
  });
}

const newProductsStr = `const REAL_PRODUCTS: Record<string, any[]> = ${JSON.stringify(products, null, 12)};`;

let serverTs = fs.readFileSync('server.ts', 'utf8');
serverTs = serverTs.replace(/const REAL_PRODUCTS: Record<string, any\[\]> = \{[\s\S]*?\]\n        \};/, newProductsStr);
fs.writeFileSync('server.ts', serverTs);
console.log('Updated server.ts');
