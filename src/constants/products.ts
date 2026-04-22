export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  image: string;
  department: string;
  stock?: number;
  description?: string;
  options?: {
    [key: string]: string[];
  };
  optionPriceModifiers?: {
    [optionKey: string]: {
      [optionValue: string]: number;
    };
  };
  gallery?: string[];
  optionImages?: {
    [optionKey: string]: {
      [optionValue: string]: string;
    };
  };
}

export const DEPARTMENTS = [
  "All",
  "Signature Coffee",
  "Artisanal Tea",
  "Gourmet Pastries",
  "Merchandise"
];

export const PRODUCTS: Product[] = [
  // Signature Coffee
  {
    id: "1",
    name: "Zenith Gold Espresso",
    price: 3.50,
    originalPrice: 4.50,
    discountPercentage: 22,
    description: "Our signature blend with notes of dark chocolate and toasted hazelnut. Sourced from sustainable farms in the highlands.",
    image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1497933321027-94483f1585de?auto=format&fit=crop&q=80&w=800"
    ],
    department: "Signature Coffee",
    options: {
      size: ["Single Shot", "Double Shot", "Triple Shot"],
      bean: ["House Blend", "Ethopian Single Origin", "Decaf"]
    },
    optionPriceModifiers: {
      size: {
        "Double Shot": 1.50,
        "Triple Shot": 2.50
      },
      bean: {
        "Ethopian Single Origin": 1.00
      }
    }
  },
  {
    id: "2",
    name: "Velvet Oat Latte",
    price: 5.50,
    description: "Smooth espresso paired with creamy oat milk and a hint of Madagascar vanilla. A vegan favorite.",
    image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1572286258217-ea152504620f?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=800"
    ],
    department: "Signature Coffee",
    options: {
      size: ["Regular", "Large"],
      sweetness: ["None", "Less Sugar", "Normal", "Extra Sweet"]
    },
    optionPriceModifiers: {
      size: {
        "Large": 1.25
      }
    }
  },
  {
    id: "3",
    name: "Midnight Cold Brew",
    price: 4.75,
    originalPrice: 5.50,
    discountPercentage: 14,
    description: "18-hour slow-steeped cold brew for a bold, low-acid finish. Perfectly refreshing on a hot day.",
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1504502350688-00f5d59bbdeb?auto=format&fit=crop&q=80&w=800"
    ],
    department: "Signature Coffee",
    options: {
      size: ["12oz", "16oz", "24oz"],
      topping: ["None", "Sweet Cream Cold Foam", "Salted Caramel Foam"]
    },
    optionPriceModifiers: {
      size: {
        "16oz": 0.75,
        "24oz": 1.50
      },
      topping: {
        "Sweet Cream Cold Foam": 1.00,
        "Salted Caramel Foam": 1.25
      }
    }
  },
  {
    id: "9",
    name: "Zenith Ceramic Mug",
    price: 18.00,
    description: "Handcrafted ceramic mug with a weighted bottom and ergonomic handle. Available in signature matte finishes.",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fbed39?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1577937927133-66ef06ac9df2?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1514228742587-6b1558fbed39?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&q=80&w=800"
    ],
    department: "Merchandise",
    options: {
      color: ["#1a1a1a", "#ffffff", "#d35400"],
      finish: ["Matte", "Glossy"]
    },
    optionPriceModifiers: {
      finish: {
        "Glossy": 2.00
      },
      color: {
        "#d35400": 3.00
      }
    },
    optionImages: {
      color: {
        "#1a1a1a": "https://images.unsplash.com/photo-1514228742587-6b1558fbed39?auto=format&fit=crop&q=80&w=800",
        "#ffffff": "https://images.unsplash.com/photo-1577937927133-66ef06ac9df2?auto=format&fit=crop&q=80&w=800",
        "#d35400": "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?auto=format&fit=crop&q=80&w=800"
      }
    }
  },

  // Artisanal Tea
  {
    id: "4",
    name: "Ceremonial Matcha Latte",
    price: 6.00,
    description: "Premium grade Uji matcha whisked to perfection with your choice of milk.",
    image: "https://images.unsplash.com/photo-1536281140500-77814e0c5fb5?auto=format&fit=crop&q=80&w=800",
    department: "Artisanal Tea",
    options: {
      size: ["Regular", "Large"],
      milk: ["Whole Milk", "Oat Milk", "Almond Milk", "Soy Milk"]
    },
    optionPriceModifiers: {
      size: {
        "Large": 1.00
      },
      milk: {
        "Oat Milk": 0.50,
        "Almond Milk": 0.50
      }
    }
  },
  {
    id: "5",
    name: "Imperial Earl Grey",
    price: 4.00,
    description: "Fine black tea infused with cold-pressed bergamot oil.",
    image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cbf9?auto=format&fit=crop&q=80&w=800",
    department: "Artisanal Tea",
    options: {
      size: ["Pot for One", "Pot for Two"],
      honey: ["None", "Wildflower Honey", "Manuka Honey"]
    },
    optionPriceModifiers: {
      size: {
        "Pot for Two": 3.00
      },
      honey: {
        "Manuka Honey": 2.00
      }
    }
  },

  // Gourmet Pastries
  {
    id: "6",
    name: "Honeycomb Croissant",
    price: 4.50,
    originalPrice: 5.50,
    discountPercentage: 18,
    description: "Flaky, buttery layers filled with house-made honeycomb toffee.",
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800",
    department: "Gourmet Pastries",
    options: {
      warming: ["Room Temp", "Warmed"]
    }
  },
  {
    id: "7",
    name: "Dark Chocolate Sea Salt Muffin",
    price: 3.75,
    description: "Rich Belgian chocolate muffin topped with Maldon sea salt flakes.",
    image: "https://images.unsplash.com/photo-1525124568695-c4c6cd3ea847?auto=format&fit=crop&q=80&w=800",
    department: "Gourmet Pastries",
    options: {
      pack: ["Single", "Box of 4", "Box of 12"]
    },
    optionPriceModifiers: {
      pack: {
        "Box of 4": 10.00,
        "Box of 12": 28.00
      }
    }
  },
  {
    id: "8",
    name: "Pistachio Baklava Tart",
    price: 5.25,
    description: "A fusion of traditional baklava flavors in a delicate shortcrust tart.",
    image: "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&q=80&w=800",
    department: "Gourmet Pastries"
  }
];
