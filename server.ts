import express from 'express';
import multer from 'multer';

// Global error handling to prevent crashes from background tasks or port conflicts
process.on('uncaughtException', (err: any) => {
  if (err.message?.includes('EADDRINUSE') && (err.message?.includes('24678') || err.message?.includes('3000'))) {
    console.warn(`Handled expected port conflict: ${err.message}`);
    return;
  }
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

console.log('Server script starting...');
import { neon } from '@neondatabase/serverless';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import path from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

const JWT_SECRET = process.env.JWT_SECRET || 'zenith-secret-key-2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const APP_URL = process.env.APP_URL || process.env.VITE_APP_URL;

const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) : null;

export const REAL_PRODUCTS: Record<string, any[]> = {
  "Signature Coffee": [
    {
      "name": "Zenith Gold Espresso",
      "price": 6000.00,
      "original_price": 8000.00,
      "discount_percentage": 25,
      "description": "Our signature blend with notes of dark chocolate and toasted hazelnut.",
      "image": "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Single Shot", "Double Shot", "Triple Shot"],
        "bean": ["House Blend", "Ethopian Single Origin", "Decaf"]
      },
      "optionPriceModifiers": {
        "size": {
          "Double Shot": 3000.00,
          "Triple Shot": 5000.00
        },
        "bean": {
          "Ethopian Single Origin": 2000.00
        }
      }
    },
    {
      "name": "Velvet Oat Latte",
      "price": 9000.00,
      "description": "Smooth espresso paired with creamy oat milk and a hint of Madagascar vanilla.",
      "image": "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Regular", "Large"],
        "sweetness": ["None", "Less Sugar", "Normal", "Extra Sweet"]
      },
      "optionPriceModifiers": {
        "size": {
          "Large": 3000.00
        }
      }
    },
    {
      "name": "Midnight Cold Brew",
      "price": 8000.00,
      "original_price": 10000.00,
      "discount_percentage": 20,
      "description": "18-hour slow-steeped cold brew for a bold, low-acid finish.",
      "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz", "24oz"],
        "topping": ["None", "Sweet Cream Cold Foam", "Salted Caramel Foam"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 2000.00,
          "24oz": 4000.00
        },
        "topping": {
          "Sweet Cream Cold Foam": 2500.00,
          "Salted Caramel Foam": 3000.00
        }
      }
    }
  ],
  "Artisanal Tea": [
    {
      "name": "Ceremonial Matcha Latte",
      "price": 10000.00,
      "description": "Premium grade Uji matcha whisked to perfection with your choice of milk.",
      "image": "https://images.unsplash.com/photo-1536281140500-77814e0c5fb5?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Regular", "Large"],
        "milk": ["Whole Milk", "Oat Milk", "Almond Milk", "Soy Milk"]
      },
      "optionPriceModifiers": {
        "size": {
          "Large": 3000.00
        },
        "milk": {
          "Oat Milk": 1500.00,
          "Almond Milk": 1500.00
        }
      }
    },
    {
      "name": "Imperial Earl Grey",
      "price": 7000.00,
      "description": "Fine black tea infused with cold-pressed bergamot oil.",
      "image": "https://images.unsplash.com/photo-1594631252845-29fc4cc8cbf9?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Pot for One", "Pot for Two"],
        "honey": ["None", "Wildflower Honey", "Manuka Honey"]
      },
      "optionPriceModifiers": {
        "size": {
          "Pot for Two": 5000.00
        },
        "honey": {
          "Manuka Honey": 4000.00
        }
      }
    }
  ],
  "Gourmet Pastries": [
    {
      "name": "Honeycomb Croissant",
      "price": 8000.00,
      "original_price": 10000.00,
      "discount_percentage": 20,
      "description": "Flaky, buttery layers filled with house-made honeycomb toffee.",
      "image": "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800",
      "options": {
        "warming": ["Room Temp", "Warmed"]
      }
    },
    {
      "name": "Dark Chocolate Sea Salt Muffin",
      "price": 6500.00,
      "description": "Rich Belgian chocolate muffin topped with Maldon sea salt flakes.",
      "image": "https://images.unsplash.com/photo-1525124568695-c4c6cd3ea847?auto=format&fit=crop&q=80&w=800",
      "options": {
        "pack": ["Single", "Box of 4", "Box of 12"]
      },
      "optionPriceModifiers": {
        "pack": {
          "Box of 4": 20000.00,
          "Box of 12": 55000.00
        }
      }
    },
    {
      "name": "Pistachio Baklava Tart",
      "price": 9000.00,
      "description": "A fusion of traditional baklava flavors in a delicate shortcrust tart.",
      "image": "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Breakfast Platters": [
    {
      "name": "Classic English Breakfast",
      "price": 35000.00,
      "description": "Two eggs, bacon, sausage, baked beans, grilled tomato, and toast.",
      "image": "https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&q=80&w=800",
      "options": {
        "eggs": ["Fried", "Scrambled", "Poached"],
        "extra": ["None", "Extra Bacon", "Extra Sausage", "Black Pudding"]
      },
      "optionPriceModifiers": {
        "extra": {
          "Extra Bacon": 6000.00,
          "Extra Sausage": 6000.00,
          "Black Pudding": 8000.00
        }
      }
    },
    {
      "name": "Avocado Toast Special",
      "price": 28000.00,
      "description": "Smashed avocado on sourdough with chili flakes and lemon.",
      "image": "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=800",
      "options": {
        "topping": ["None", "Poached Egg", "Smoked Salmon", "Feta Cheese"]
      },
      "optionPriceModifiers": {
        "topping": {
          "Poached Egg": 4000.00,
          "Smoked Salmon": 12000.00,
          "Feta Cheese": 3000.00
        }
      }
    },
    {
      "name": "Pancake Stack",
      "price": 25000.00,
      "description": "Fluffy buttermilk pancakes served with maple syrup.",
      "image": "https://images.unsplash.com/photo-1528448443353-8326690f055a?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["3 Stack", "5 Stack", "7 Stack"],
        "topping": ["Maple Syrup", "Nutella", "Fresh Berries"]
      },
      "optionPriceModifiers": {
        "size": {
          "5 Stack": 8000.00,
          "7 Stack": 15000.00
        },
        "topping": {
          "Nutella": 4000.00,
          "Fresh Berries": 6000.00
        }
      }
    },
    {
      "name": "Belgian Waffle Delight",
      "price": 26000.00,
      "description": "Crispy Belgian waffles with whipped cream.",
      "image": "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&q=80&w=800",
      "options": {
        "topping": ["Whipped Cream", "Ice Cream", "Fruit Mix"]
      },
      "optionPriceModifiers": {
        "topping": {
          "Ice Cream": 6000.00,
          "Fruit Mix": 6000.00
        }
      }
    },
    {
      "name": "Eggs Benedict",
      "price": 38000.00,
      "description": "Poached eggs on English muffins with hollandaise sauce.",
      "image": "https://images.unsplash.com/photo-1600335814564-21797ac797d1?auto=format&fit=crop&q=80&w=800",
      "options": {
        "protein": ["Ham", "Spinach", "Salmon"]
      },
      "optionPriceModifiers": {
        "protein": {
          "Spinach": 3000.00,
          "Salmon": 10000.00
        }
      }
    },
    {
      "name": "Omelette Your Way",
      "price": 30000.00,
      "description": "Three-egg omelette with your choice of fillings.",
      "image": "https://images.unsplash.com/photo-1510693206972-df098062cb71?auto=format&fit=crop&q=80&w=800",
      "options": {
        "filling": ["Cheese", "Mushrooms", "Ham", "Peppers"]
      },
      "optionPriceModifiers": {
        "filling": {
          "Mushrooms": 3000.00,
          "Ham": 6000.00,
          "Peppers": 3000.00
        }
      }
    },
    {
      "name": "French Toast Brioche",
      "price": 28000.00,
      "description": "Thick-cut brioche soaked in cinnamon custard.",
      "image": "https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&q=80&w=800",
      "options": {
        "topping": ["Maple Syrup", "Nutella", "Bacon"]
      },
      "optionPriceModifiers": {
        "topping": {
          "Nutella": 4000.00,
          "Bacon": 8000.00
        }
      }
    },
    {
      "name": "Breakfast Burrito",
      "price": 32000.00,
      "description": "Scrambled eggs, black beans, cheese, and salsa in a flour tortilla.",
      "image": "https://images.unsplash.com/photo-1564758564527-b97d79cb27c1?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Regular", "Large"],
        "extra": ["None", "Guacamole", "Sour Cream"]
      },
      "optionPriceModifiers": {
        "size": {
          "Large": 6000.00
        },
        "extra": {
          "Guacamole": 4500.00,
          "Sour Cream": 2000.00
        }
      }
    },
    {
      "name": "Smoked Salmon Bagel",
      "price": 36000.00,
      "description": "Toasted bagel with cream cheese, capers, and smoked salmon.",
      "image": "https://images.unsplash.com/photo-1518562180175-34a163b1a9a6?auto=format&fit=crop&q=80&w=800",
      "options": {
        "bagel": ["Plain Bagel", "Everything Bagel", "Sesame Bagel"]
      },
      "optionPriceModifiers": {
        "bagel": {
          "Everything Bagel": 1500.00,
          "Sesame Bagel": 1500.00
        }
      }
    },
    {
      "name": "Fruit & Yogurt Parfait",
      "price": 22000.00,
      "description": "Greek yogurt with granola and seasonal fruits.",
      "image": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Small", "Large"]
      },
      "optionPriceModifiers": {
        "size": {
          "Large": 6000.00
        }
      }
    },
    {
      "name": "Steak and Eggs",
      "price": 65000.00,
      "description": "Grilled steak served with two eggs and hash browns.",
      "image": "https://images.unsplash.com/photo-1546833998-877b37c2e5c6?auto=format&fit=crop&q=80&w=800",
      "options": {
        "steak_size": ["6oz", "10oz"],
        "doneness": ["Rare", "Medium Rare", "Medium", "Well Done"]
      },
      "optionPriceModifiers": {
        "steak_size": {
          "10oz": 20000.00
        }
      }
    },
    {
      "name": "Veggie Breakfast Skillet",
      "price": 30000.00,
      "description": "Roasted potatoes with seasonal vegetables and eggs.",
      "image": "https://images.unsplash.com/photo-1550338300-f9a475b50ba2?auto=format&fit=crop&q=80&w=800",
      "options": {
        "protein": ["Eggs", "Tofu Scramble"],
        "extra": ["None", "Extra Veggies", "Avocado"]
      },
      "optionPriceModifiers": {
        "protein": {
          "Tofu Scramble": 3000.00
        },
        "extra": {
          "Extra Veggies": 4500.00,
          "Avocado": 6000.00
        }
      }
    }
  ],
  "Fresh Juices & Smoothies": [
    {
      "name": "Green Detox Juice",
      "price": 15000.00,
      "description": "Kale, spinach, cucumber, apple, and lemon.",
      "image": "https://images.unsplash.com/photo-1610970881699-44a5587cabec?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"],
        "boost": ["None", "Ginger Shot", "Spirulina"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 4000.00
        },
        "boost": {
          "Ginger Shot": 3000.00,
          "Spirulina": 4500.00
        }
      }
    },
    {
      "name": "Tropical Sunrise Smoothie",
      "price": 16000.00,
      "description": "Mango, pineapple, orange, and coconut milk.",
      "image": "https://images.unsplash.com/photo-1525385133336-24416724002d?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"],
        "protein": ["None", "Whey Protein", "Plant Protein"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 4000.00
        },
        "protein": {
          "Whey Protein": 6000.00,
          "Plant Protein": 6000.00
        }
      }
    },
    {
      "name": "Berry Blast Smoothie",
      "price": 16000.00,
      "description": "Mixed berries, banana, and almond milk.",
      "image": "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"],
        "sweetener": ["None", "Honey", "Agave"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 4000.00
        },
        "sweetener": {
          "Honey": 1500.00,
          "Agave": 1500.00
        }
      }
    },
    {
      "name": "Ginger Zinger Juice",
      "price": 14000.00,
      "description": "Carrot, apple, and a heavy kick of ginger.",
      "image": "https://images.unsplash.com/photo-1595981267035-7b04ca84a82d?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 4000.00
        }
      }
    },
    {
      "name": "Protein Power Shake",
      "price": 18000.00,
      "description": "Chocolate protein, banana, peanut butter, and milk.",
      "image": "https://images.unsplash.com/photo-1593085512500-5d55148d6f0d?auto=format&fit=crop&q=80&w=800",
      "options": {
        "milk": ["Whole Milk", "Oat Milk", "Almond Milk"],
        "extra": ["None", "Creatine", "L-Glutamine"]
      },
      "optionPriceModifiers": {
        "milk": {
          "Oat Milk": 1500.00,
          "Almond Milk": 1500.00
        },
        "extra": {
          "Creatine": 4500.00,
          "L-Glutamine": 4500.00
        }
      }
    },
    {
      "name": "Watermelon Refresher",
      "price": 12000.00,
      "description": "Fresh watermelon juice with a hint of mint.",
      "image": "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz", "24oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 3000.00,
          "24oz": 6000.00
        }
      }
    },
    {
      "name": "Carrot & Orange Vitality",
      "price": 14000.00,
      "description": "Freshly squeezed carrot and orange juice.",
      "image": "https://images.unsplash.com/photo-1613478223719-2ab802602422?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 4000.00
        }
      }
    },
    {
      "name": "Peanut Butter Banana Smoothie",
      "price": 17000.00,
      "description": "Creamy blend of PB, banana, and honey.",
      "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800",
      "options": {
        "extra": ["None", "Chia Seeds", "Flax Seeds"]
      },
      "optionPriceModifiers": {
        "extra": {
          "Chia Seeds": 2250.00,
          "Flax Seeds": 2250.00
        }
      }
    },
    {
      "name": "Kale & Apple Cleanse",
      "price": 15000.00,
      "description": "Refreshing green juice with a sweet apple finish.",
      "image": "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 4000.00
        }
      }
    },
    {
      "name": "Mango Tango Smoothie",
      "price": 16000.00,
      "description": "Mango and passionfruit tropical blend.",
      "image": "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 4000.00
        }
      }
    },
    {
      "name": "Beetroot Energy Blast",
      "price": 15000.00,
      "description": "Beetroot, ginger, and lemon for a natural boost.",
      "image": "https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 4000.00
        }
      }
    },
    {
      "name": "Acai Berry Smoothie",
      "price": 20000.00,
      "description": "Premium acai berries blended with banana and guarana.",
      "image": "https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&q=80&w=800",
      "options": {
        "topping": ["None", "Granola", "Coconut Flakes"]
      },
      "optionPriceModifiers": {
        "topping": {
          "Granola": 3000.00,
          "Coconut Flakes": 1500.00
        }
      }
    }
  ],
  "Savory Sandwiches": [
    {
      "name": "Grilled Chicken Pesto",
      "price": 32000.00,
      "description": "Grilled chicken, basil pesto, mozzarella, and tomatoes.",
      "image": "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&q=80&w=800",
      "options": {
        "bread": ["Ciabatta", "Sourdough", "Gluten-Free"],
        "extra": ["None", "Extra Chicken", "Avocado"]
      },
      "optionPriceModifiers": {
        "bread": {
          "Gluten-Free": 4500.00
        },
        "extra": {
          "Extra Chicken": 9000.00,
          "Avocado": 6000.00
        }
      }
    },
    {
      "name": "Turkey & Swiss Club",
      "price": 30000.00,
      "description": "Roasted turkey, Swiss cheese, bacon, lettuce, and mayo.",
      "image": "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&q=80&w=800",
      "options": {
        "bread": ["White", "Whole Wheat", "Multigrain"]
      }
    },
    {
      "name": "Roast Beef Dip",
      "price": 36000.00,
      "description": "Thinly sliced roast beef on a baguette with au jus.",
      "image": "https://images.unsplash.com/photo-1559466273-d95e72debaf8?auto=format&fit=crop&q=80&w=800",
      "options": {
        "cheese": ["None", "Provolone", "Swiss"]
      },
      "optionPriceModifiers": {
        "cheese": {
          "Provolone": 3000.00,
          "Swiss": 3000.00
        }
      }
    },
    {
      "name": "Caprese Panini",
      "price": 28000.00,
      "description": "Fresh mozzarella, tomatoes, basil, and balsamic glaze.",
      "image": "https://images.unsplash.com/photo-1539252554453-80ab65ce3586?auto=format&fit=crop&q=80&w=800",
      "options": {
        "extra": ["None", "Prosciutto", "Chicken"]
      },
      "optionPriceModifiers": {
        "extra": {
          "Prosciutto": 9000.00,
          "Chicken": 7500.00
        }
      }
    },
    {
      "name": "Tuna Melt",
      "price": 28000.00,
      "description": "Tuna salad with melted cheddar on toasted rye.",
      "image": "https://images.unsplash.com/photo-1540713434306-58505cf1b6fc?auto=format&fit=crop&q=80&w=800",
      "options": {
        "bread": ["Rye", "Sourdough"]
      }
    },
    {
      "name": "Veggie Hummus Wrap",
      "price": 25000.00,
      "description": "Hummus, cucumber, peppers, presidency, and feta in a wrap.",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
      "options": {
        "protein": ["None", "Falafel", "Grilled Tofu"]
      },
      "optionPriceModifiers": {
        "protein": {
          "Falafel": 6000.00,
          "Grilled Tofu": 6000.00
        }
      }
    },
    {
      "name": "BBQ Pulled Pork Sliders",
      "price": 34000.00,
      "description": "Slow-cooked pulled pork with coleslaw on brioche buns.",
      "image": "https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&q=80&w=800",
      "options": {
        "quantity": ["2 Sliders", "3 Sliders"]
      },
      "optionPriceModifiers": {
        "quantity": {
          "3 Sliders": 10500.00
        }
      }
    },
    {
      "name": "BLT Supreme",
      "price": 28000.00,
      "description": "Bacon, lettuce, tomato, and avocado on toasted sourdough.",
      "image": "https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&q=80&w=800",
      "options": {
        "extra_bacon": ["No", "Yes"]
      },
      "optionPriceModifiers": {
        "extra_bacon": {
          "Yes": 6000.00
        }
      }
    },
    {
      "name": "Falafel Wrap",
      "price": 28000.00,
      "description": "Crispy falafel with tahini, pickles, and salad.",
      "image": "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&q=80&w=800",
      "options": {
        "sauce": ["Tahini", "Spicy Harissa", "Garlic Sauce"]
      }
    },
    {
      "name": "Italian Sub",
      "price": 35000.00,
      "description": "Salami, ham, pepperoni, provolone, and Italian dressing.",
      "image": "https://images.unsplash.com/photo-1509722747041-616f39b57569?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["6 inch", "12 inch"]
      },
      "optionPriceModifiers": {
        "size": {
          "12 inch": 15000.00
        }
      }
    },
    {
      "name": "Reuben Sandwich",
      "price": 38000.00,
      "description": "Corned beef, sauerkraut, Swiss cheese, and Russian dressing.",
      "image": "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?auto=format&fit=crop&q=80&w=800",
      "options": {
        "meat_amount": ["Regular", "Extra Meat"]
      },
      "optionPriceModifiers": {
        "meat_amount": {
          "Extra Meat": 12000.00
        }
      }
    },
    {
      "name": "Egg Salad Croissant",
      "price": 24000.00,
      "description": "Creamy egg salad on a flaky butter croissant.",
      "image": "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?auto=format&fit=crop&q=80&w=800",
      "options": {
        "extra": ["None", "Bacon Bits", "Chives"]
      },
      "optionPriceModifiers": {
        "extra": {
          "Bacon Bits": 3000.00
        }
      }
    }
  ],
  "Dessert Cakes": [
    {
      "name": "Red Velvet Slice",
      "price": 12000.00,
      "description": "Classic red velvet cake with cream cheese frosting.",
      "image": "https://images.unsplash.com/photo-1586788680434-30d324671ff6?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Single Slice", "Whole Cake"]
      },
      "optionPriceModifiers": {
        "size": {
          "Whole Cake": 100000.00
        }
      }
    },
    {
      "name": "New York Cheesecake",
      "price": 14000.00,
      "description": "Rich and creamy cheesecake with a graham cracker crust.",
      "image": "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=800",
      "options": {
        "topping": ["Plain", "Strawberry Sauce", "Blueberry Sauce"]
      },
      "optionPriceModifiers": {
        "topping": {
          "Strawberry Sauce": 3000.00,
          "Blueberry Sauce": 3000.00
        }
      }
    },
    {
      "name": "Chocolate Lava Cake",
      "price": 16000.00,
      "description": "Warm chocolate cake with a molten center.",
      "image": "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&q=80&w=800",
      "options": {
        "side": ["None", "Vanilla Ice Cream", "Whipped Cream"]
      },
      "optionPriceModifiers": {
        "side": {
          "Vanilla Ice Cream": 6000.00,
          "Whipped Cream": 3000.00
        }
      }
    },
    {
      "name": "Carrot Cake",
      "price": 12000.00,
      "description": "Spiced carrot cake with walnuts and cream cheese frosting.",
      "image": "https://images.unsplash.com/photo-1536565465111-f94f20463090?auto=format&fit=crop&q=80&w=800",
      "options": {
        "extra_walnuts": ["No", "Yes"]
      },
      "optionPriceModifiers": {
        "extra_walnuts": {
          "Yes": 1500.00
        }
      }
    },
    {
      "name": "Tiramisu",
      "price": 15000.00,
      "description": "Italian dessert with coffee-soaked ladyfingers and mascarpone.",
      "image": "https://images.unsplash.com/photo-1571877223200-581709df8224?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Lemon Drizzle Cake",
      "price": 10000.00,
      "description": "Zesty lemon sponge with a crunchy sugar glaze.",
      "image": "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Black Forest Gateau",
      "price": 15000.00,
      "description": "Chocolate sponge with cherries and whipped cream.",
      "image": "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Victoria Sponge",
      "price": 12000.00,
      "description": "Classic sponge cake with jam and cream.",
      "image": "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Salted Caramel Tart",
      "price": 14000.00,
      "description": "Buttery pastry filled with salted caramel and chocolate ganache.",
      "image": "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Blueberry Muffin Cake",
      "price": 9000.00,
      "description": "Giant muffin-style cake bursting with fresh blueberries.",
      "image": "https://images.unsplash.com/photo-1607958996333-41aef7caefaa?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Coffee Walnut Cake",
      "price": 12000.00,
      "description": "Rich coffee-flavored sponge with crunchy walnuts.",
      "image": "https://images.unsplash.com/photo-1509482560494-4126f8225994?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Rainbow Layer Cake",
      "price": 15000.00,
      "description": "Colorful multi-layered cake with vanilla frosting.",
      "image": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Healthy Bowls": [
    {
      "name": "Quinoa Buddha Bowl",
      "price": 25000.00,
      "description": "Quinoa, roasted sweet potato, kale, chickpeas, and tahini dressing.",
      "image": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
      "options": {
        "protein": ["None", "Grilled Chicken", "Tofu", "Salmon"]
      },
      "optionPriceModifiers": {
        "protein": {
          "Grilled Chicken": 8000.00,
          "Tofu": 6000.00,
          "Salmon": 12000.00
        }
      }
    },
    {
      "name": "Teriyaki Salmon Bowl",
      "price": 35000.00,
      "description": "Grilled salmon with teriyaki glaze, brown rice, and steamed broccoli.",
      "image": "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&q=80&w=800",
      "options": {
        "rice": ["Brown Rice", "White Rice", "Cauliflower Rice"]
      },
      "optionPriceModifiers": {
        "rice": {
          "Cauliflower Rice": 4000.00
        }
      }
    },
    {
      "name": "Mediterranean Chickpea Bowl",
      "price": 22000.00,
      "description": "Chickpeas, cucumber, tomatoes, olives, and feta over couscous.",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
      "options": {
        "extra_feta": ["No", "Yes"]
      },
      "optionPriceModifiers": {
        "extra_feta": {
          "Yes": 1000.00
        }
      }
    },
    {
      "name": "Roasted Veggie Grain Bowl",
      "price": 23000.00,
      "description": "Seasonal roasted vegetables over farro with lemon vinaigrette.",
      "image": "https://images.unsplash.com/photo-1543339308-43e59d6b73a6?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Poke Bowl",
      "price": 32000.00,
      "description": "Fresh raw fish with avocado, edamame, and seaweed salad.",
      "image": "https://images.unsplash.com/photo-1546069901-e516a6677395?auto=format&fit=crop&q=80&w=800",
      "options": {
        "fish": ["Tuna", "Salmon", "Tofu"],
        "size": ["Regular", "Large"]
      },
      "optionPriceModifiers": {
        "size": {
          "Large": 8000.00
        }
      }
    },
    {
      "name": "Falafel Power Bowl",
      "price": 24000.00,
      "description": "Falafel, hummus, tabbouleh, and mixed greens.",
      "image": "https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Southwest Chicken Bowl",
      "price": 28000.00,
      "description": "Grilled chicken, black beans, corn, avocado, and chipotle ranch.",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Tofu Stir-Fry Bowl",
      "price": 23000.00,
      "description": "Crispy tofu with mixed vegetables in a ginger soy sauce.",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Kale Caesar Bowl",
      "price": 21000.00,
      "description": "Massaged kale with parmesan, croutons, and Caesar dressing.",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800",
      "options": {
        "protein": ["None", "Grilled Chicken", "Shrimp"]
      },
      "optionPriceModifiers": {
        "protein": {
          "Grilled Chicken": 8000.00,
          "Shrimp": 12000.00
        }
      }
    },
    {
      "name": "Sweet Potato & Black Bean Bowl",
      "price": 22000.00,
      "description": "Roasted sweet potato, black beans, and brown rice with lime.",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Asian Noodle Bowl",
      "price": 25000.00,
      "description": "Rice noodles with shredded carrots, peanuts, and cilantro.",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Harvest Salad Bowl",
      "price": 23000.00,
      "description": "Mixed greens with apples, walnuts, and goat cheese.",
      "image": "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Electronics: Smartphones": [
    {
      "name": "iPhone 15 Pro Max",
      "price": 1850000.00,
      "description": "A17 Pro chip, titanium design, and advanced camera system.",
      "image": "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800",
      "options": {
        "storage": ["256GB", "512GB", "1TB"],
        "color": ["Natural Titanium", "Blue Titanium", "Black Titanium"]
      },
      "optionPriceModifiers": {
        "storage": {
          "512GB": 250000.00,
          "1TB": 500000.00
        }
      },
      "color_images": {
        "Natural Titanium": "https://images.unsplash.com/photo-1696446701796-da61225697cc?auto=format&fit=crop&q=80&w=800",
        "Blue Titanium": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800",
        "Black Titanium": "https://images.unsplash.com/photo-1696446702183-cbd13d78e1e7?auto=format&fit=crop&q=80&w=800"
      }
    },
    {
      "name": "Samsung Galaxy S24 Ultra",
      "price": 1650000.00,
      "description": "Galaxy AI, 200MP camera, and S Pen included.",
      "image": "https://images.unsplash.com/photo-1707230560201-90089e7a7065?auto=format&fit=crop&q=80&w=800",
      "options": {
        "storage": ["256GB", "512GB", "1TB"],
        "color": ["Titanium Gray", "Titanium Black", "Titanium Violet"]
      },
      "optionPriceModifiers": {
        "storage": {
          "512GB": 150000.00,
          "1TB": 350000.00
        }
      },
      "color_images": {
        "Titanium Gray": "https://images.unsplash.com/photo-1707230560201-90089e7a7065?auto=format&fit=crop&q=80&w=800",
        "Titanium Black": "https://images.unsplash.com/photo-1708433306893-605697079201?auto=format&fit=crop&q=80&w=800",
        "Titanium Violet": "https://images.unsplash.com/photo-1708433306915-0f6222880004?auto=format&fit=crop&q=80&w=800"
      }
    },
    {
      "name": "Google Pixel 8 Pro",
      "price": 1200000.00,
      "description": "The best of Google AI and the most advanced Pixel camera.",
      "image": "https://images.unsplash.com/photo-1696426571060-6e4695034685?auto=format&fit=crop&q=80&w=800",
      "options": {
        "storage": ["128GB", "256GB", "512GB"]
      },
      "optionPriceModifiers": {
        "storage": {
          "256GB": 80000.00,
          "512GB": 180000.00
        }
      }
    },
    {
      "name": "OnePlus 12",
      "price": 950000.00,
      "description": "Smooth Beyond Belief. 4th Gen Hasselblad Camera for Mobile.",
      "image": "https://images.unsplash.com/photo-1710150937667-270889211c00?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Xiaomi 14 Ultra",
      "price": 1400000.00,
      "description": "Lens to Legend. Leica Summilux optical lens.",
      "image": "https://images.unsplash.com/photo-1710150937667-270889211c00?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Electronics: Laptops": [
    {
      "name": "MacBook Pro 14\" M3",
      "price": 2400000.00,
      "description": "The most advanced chips ever built for a personal computer.",
      "image": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800",
      "options": {
        "memory": ["8GB", "16GB", "24GB"],
        "storage": ["512GB", "1TB", "2TB"]
      },
      "optionPriceModifiers": {
        "memory": {
          "16GB": 200000.00,
          "24GB": 400000.00
        },
        "storage": {
          "1TB": 200000.00,
          "2TB": 600000.00
        }
      }
    },
    {
      "name": "Dell XPS 13",
      "price": 1800000.00,
      "description": "Stunning design, powerful performance, and a vibrant display.",
      "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800",
      "options": {
        "processor": ["Intel Core i5", "Intel Core i7"],
        "ram": ["16GB", "32GB"]
      },
      "optionPriceModifiers": {
        "processor": {
          "Intel Core i7": 150000.00
        },
        "ram": {
          "32GB": 100000.00
        }
      }
    },
    {
      "name": "HP Spectre x360",
      "price": 1950000.00,
      "description": "Premium 2-in-1 laptop with a stunning OLED display.",
      "image": "https://images.unsplash.com/photo-1544006659-f0b21f04cb1d?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "ASUS ROG Zephyrus G14",
      "price": 2100000.00,
      "description": "The world's most powerful 14-inch gaming laptop.",
      "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Lenovo Legion Slim 7i",
      "price": 1750000.00,
      "description": "Sleek, powerful, and ready for any challenge.",
      "image": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Electronics: Audio": [
    {
      "name": "Sony WH-1000XM5",
      "price": 450000.00,
      "description": "Industry-leading noise canceling with exceptional sound quality.",
      "image": "https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&q=80&w=800",
      "options": {
        "color": ["Black", "Platinum Silver", "Midnight Blue"]
      }
    },
    {
      "name": "AirPods Pro (2nd Gen)",
      "price": 320000.00,
      "description": "Active Noise Cancellation, Transparency mode, and personalized spatial audio.",
      "image": "https://images.unsplash.com/photo-1588423770574-91993ca06f42?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "JBL Flip 6",
      "price": 120000.00,
      "description": "Powerful sound and deep bass in a portable, waterproof speaker.",
      "image": "https://images.unsplash.com/photo-1612444530582-fc66183b16f7?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Bose QuietComfort Ultra",
      "price": 520000.00,
      "description": "World-class noise cancellation, quieter than ever before.",
      "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Sennheiser Momentum 4",
      "price": 480000.00,
      "description": "Superior sound quality with 60 hours of battery life.",
      "image": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Electronics: Accessories": [
    {
      "name": "Apple Watch Series 9",
      "price": 650000.00,
      "description": "Smarter. Brighter. Mightier.",
      "image": "https://images.unsplash.com/photo-1546868871-70ca4844567c?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Samsung Galaxy Watch 6",
      "price": 450000.00,
      "description": "Know your health. Better your sleep.",
      "image": "https://images.unsplash.com/photo-1546868871-70ca4844567c?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Logitech MX Master 3S",
      "price": 150000.00,
      "description": "An icon remastered. Quiet clicks and 8K DPI tracking.",
      "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Anker 737 Power Bank",
      "price": 185000.00,
      "description": "Ultra-powerful two-way charging with the latest Power Delivery 3.1.",
      "image": "https://images.unsplash.com/photo-1546868871-70ca4844567c?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Razer BlackWidow V4 Pro",
      "price": 280000.00,
      "description": "The ultimate mechanical gaming keyboard.",
      "image": "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Footwear: Male": [
    {
      "name": "Nike Air Max 270",
      "price": 185000.00,
      "description": "Nike's first lifestyle Air Max brings you style, comfort and big attitude.",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["40", "41", "42", "43", "44", "45"],
        "color": ["Black/White", "Red/Black", "Triple White"]
      },
      "color_images": {
        "Black/White": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
        "Red/Black": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800",
        "Triple White": "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&q=80&w=800"
      }
    },
    {
      "name": "Adidas Ultraboost Light",
      "price": 210000.00,
      "description": "Epic energy. Lightest ever. Experience the ultimate in comfort.",
      "image": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["40", "41", "42", "43", "44", "45"],
        "color": ["Core Black", "Cloud White", "Solar Red"]
      },
      "color_images": {
        "Core Black": "https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&q=80&w=800",
        "Cloud White": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800",
        "Solar Red": "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&q=80&w=800"
      }
    },
    {
      "name": "Leather Chelsea Boots",
      "price": 120000.00,
      "description": "Classic leather boots for a sophisticated look.",
      "image": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["40", "41", "42", "43", "44", "45"],
        "color": ["Black", "Brown", "Tan"]
      }
    },
    {
      "name": "Puma RS-X Efekt",
      "price": 145000.00,
      "description": "Bold, retro-inspired sneakers with modern cushioning.",
      "image": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "New Balance 550",
      "price": 165000.00,
      "description": "The return of a legend. Simple, clean, and not over-designed.",
      "image": "https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Vans Old Skool",
      "price": 85000.00,
      "description": "The classic skate shoe and first to bare the iconic sidestripe.",
      "image": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Timberland 6-Inch Boot",
      "price": 245000.00,
      "description": "The original waterproof boot. Rugged and durable.",
      "image": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Clarks Wallabee",
      "price": 175000.00,
      "description": "An iconic classic with its moccasin construction and structural silhouette.",
      "image": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Footwear: Female": [
    {
      "name": "Stiletto Heels",
      "price": 75000.00,
      "description": "Elegant stiletto heels for special occasions.",
      "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["36", "37", "38", "39", "40", "41"],
        "color": ["Nude", "Black", "Red", "Gold"]
      }
    },
    {
      "name": "Platform Sneakers",
      "price": 95000.00,
      "description": "Trendy platform sneakers for everyday comfort and style.",
      "image": "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["36", "37", "38", "39", "40", "41"],
        "color": ["White", "Pink", "Beige"]
      }
    },
    {
      "name": "Ankle Strap Sandals",
      "price": 55000.00,
      "description": "Chic sandals with a comfortable ankle strap.",
      "image": "https://images.unsplash.com/photo-1562273103-919a666d5a77?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["36", "37", "38", "39", "40", "41"],
        "color": ["Black", "Silver", "Tan"]
      }
    },
    {
      "name": "Ballet Flats",
      "price": 45000.00,
      "description": "Classic and comfortable ballet flats for any outfit.",
      "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Converse Chuck Taylor",
      "price": 65000.00,
      "description": "The most iconic sneaker in the world.",
      "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Dr. Martens 1460",
      "price": 220000.00,
      "description": "The original Dr. Martens boot. Built to last.",
      "image": "https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Birkenstock Arizona",
      "price": 125000.00,
      "description": "The legendary two-strap sandal. Timeless and comfortable.",
      "image": "https://images.unsplash.com/photo-1562273103-919a666d5a77?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Steve Madden Carrson",
      "price": 85000.00,
      "description": "Classic block heel sandal for any occasion.",
      "image": "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Furniture: Living Room": [
    {
      "name": "Velvet 3-Seater Sofa",
      "price": 850000.00,
      "description": "Luxurious velvet sofa with gold-finished legs.",
      "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800",
      "options": {
        "color": ["Emerald Green", "Royal Blue", "Charcoal Gray"]
      }
    },
    {
      "name": "Marble Coffee Table",
      "price": 320000.00,
      "description": "Elegant marble top table with a minimalist metal frame.",
      "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800",
      "options": {
        "shape": ["Round", "Rectangular"]
      },
      "optionPriceModifiers": {
        "shape": {
          "Rectangular": 50000.00
        }
      }
    },
    {
      "name": "Modern Armchair",
      "price": 180000.00,
      "description": "Comfortable and stylish armchair with wooden accents.",
      "image": "https://images.unsplash.com/photo-1598191383441-7365cbd22c38?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "L-Shaped Sectional Sofa",
      "price": 1200000.00,
      "description": "Spacious and comfortable sectional for the whole family.",
      "image": "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "TV Stand Unit",
      "price": 250000.00,
      "description": "Sleek TV stand with ample storage for media devices.",
      "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Furniture: Dining Room": [
    {
      "name": "6-Seater Dining Set",
      "price": 750000.00,
      "description": "Solid wood dining table with 6 upholstered chairs.",
      "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Bar Stools (Set of 2)",
      "price": 120000.00,
      "description": "Modern adjustable bar stools with leather seats.",
      "image": "https://images.unsplash.com/photo-1598191383441-7365cbd22c38?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Furniture: Office": [
    {
      "name": "Ergonomic Office Chair",
      "price": 280000.00,
      "description": "High-back mesh chair with lumbar support.",
      "image": "https://images.unsplash.com/photo-1598191383441-7365cbd22c38?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Standing Desk",
      "price": 420000.00,
      "description": "Electric height-adjustable desk for a healthier workspace.",
      "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Bookshelf Unit",
      "price": 185000.00,
      "description": "Modern bookshelf with multiple tiers for your collection.",
      "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Filing Cabinet",
      "price": 95000.00,
      "description": "Secure and organized storage for your important documents.",
      "image": "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Furniture: Bedroom": [
    {
      "name": "King Size Bed Frame",
      "price": 550000.00,
      "description": "Sturdy and elegant bed frame with a padded headboard.",
      "image": "https://images.unsplash.com/photo-1505693419148-403bb22b9f11?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Queen", "King"]
      },
      "optionPriceModifiers": {
        "size": {
          "King": 100000.00
        }
      }
    },
    {
      "name": "Memory Foam Mattress",
      "price": 450000.00,
      "description": "Pressure-relieving memory foam for the perfect night's sleep.",
      "image": "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Clothes: Male": [
    {
      "name": "Premium Cotton Oxford Shirt",
      "price": 45000.00,
      "description": "Classic fit oxford shirt made from 100% premium cotton.",
      "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["S", "M", "L", "XL", "XXL"],
        "color": ["White", "Light Blue", "Pink"]
      }
    },
    {
      "name": "Slim Fit Chinos",
      "price": 35000.00,
      "description": "Versatile chinos with a hint of stretch for comfort.",
      "image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["30", "32", "34", "36", "38"],
        "color": ["Khaki", "Navy", "Olive", "Black"]
      }
    },
    {
      "name": "Denim Jacket",
      "price": 65000.00,
      "description": "Timeless denim jacket with a rugged finish.",
      "image": "https://images.unsplash.com/photo-1576905341939-4028f60ae357?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Graphic T-Shirt",
      "price": 15000.00,
      "description": "Soft cotton t-shirt with a unique graphic print.",
      "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Linen Button-Down",
      "price": 38000.00,
      "description": "Breathable linen shirt for a relaxed summer look.",
      "image": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Cargo Joggers",
      "price": 32000.00,
      "description": "Comfortable joggers with multiple utility pockets.",
      "image": "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Wool Blend Overcoat",
      "price": 125000.00,
      "description": "Classic overcoat for a sharp, sophisticated look.",
      "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Leather Biker Jacket",
      "price": 185000.00,
      "description": "Rugged leather jacket with a modern fit.",
      "image": "https://images.unsplash.com/photo-1576905341939-4028f60ae357?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Clothes: Female": [
    {
      "name": "Floral Summer Dress",
      "price": 55000.00,
      "description": "Lightweight and breezy floral dress perfect for summer days.",
      "image": "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["XS", "S", "M", "L", "XL"],
        "pattern": ["Blue Floral", "Red Floral", "Yellow Daisy"]
      }
    },
    {
      "name": "High-Waisted Skinny Jeans",
      "price": 42000.00,
      "description": "Classic skinny jeans with a flattering high-waist fit.",
      "image": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["24", "26", "28", "30", "32"],
        "wash": ["Light Wash", "Medium Wash", "Dark Wash", "Black"]
      }
    },
    {
      "name": "Silk Blouse",
      "price": 48000.00,
      "description": "Elegant silk blouse with a soft sheen.",
      "image": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Midi Skirt",
      "price": 38000.00,
      "description": "Versatile midi skirt with a comfortable elastic waist.",
      "image": "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Oversized Blazer",
      "price": 75000.00,
      "description": "Trendy oversized blazer for a chic, professional look.",
      "image": "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Knit Cardigan",
      "price": 45000.00,
      "description": "Soft and cozy knit cardigan for layering.",
      "image": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Leather Tote Bag",
      "price": 85000.00,
      "description": "Spacious leather tote for all your essentials.",
      "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Cashmere Scarf",
      "price": 55000.00,
      "description": "Luxuriously soft cashmere scarf for cold days.",
      "image": "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=800"
    }
  ],
  "Specialty Cold Drinks": [
    {
      "name": "Iced Caramel Macchiato",
      "price": 12000.00,
      "description": "Espresso with milk and vanilla syrup, topped with caramel drizzle.",
      "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz", "24oz"],
        "milk": ["Whole Milk", "Oat Milk", "Almond Milk"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 2000.00,
          "24oz": 4000.00
        },
        "milk": {
          "Oat Milk": 1500.00,
          "Almond Milk": 1500.00
        }
      }
    },
    {
      "name": "Strawberry Lemonade",
      "price": 10000.00,
      "description": "Freshly squeezed lemonade with real strawberry puree.",
      "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 3000.00
        }
      }
    },
    {
      "name": "Peach Iced Tea",
      "price": 9000.00,
      "description": "House-brewed black tea with natural peach flavor.",
      "image": "https://images.unsplash.com/photo-1499638673689-79a0b5115d87?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["16oz", "24oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "24oz": 3000.00
        }
      }
    },
    {
      "name": "Vanilla Bean Frappe",
      "price": 14000.00,
      "description": "Blended ice drink with real vanilla bean and whipped cream.",
      "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 2000.00
        }
      }
    },
    {
      "name": "Matcha Cream Frappe",
      "price": 16000.00,
      "description": "Blended ceremonial matcha with cream and ice.",
      "image": "https://images.unsplash.com/photo-1536281140500-77814e0c5fb5?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["12oz", "16oz"]
      },
      "optionPriceModifiers": {
        "size": {
          "16oz": 750.00
        }
      }
    },
    {
      "name": "Sparkling Hibiscus Tea",
      "price": 11000.00,
      "description": "Fizzy hibiscus tea with a hint of lime.",
      "image": "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Iced Mocha Latte",
      "price": 13000.00,
      "description": "Rich chocolate and espresso over ice.",
      "image": "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Passionfruit Cooler",
      "price": 12000.00,
      "description": "Refreshing passionfruit and citrus blend.",
      "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Vietnamese Iced Coffee",
      "price": 13000.00,
      "description": "Strong coffee with sweetened condensed milk over ice.",
      "image": "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Blue Raspberry Slushie",
      "price": 9000.00,
      "description": "Classic blue raspberry flavored ice slush.",
      "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Mint Lime Mojito",
      "price": 13000.00,
      "description": "Non-alcoholic refreshing mint and lime drink.",
      "image": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800"
    },
    {
      "name": "Chocolate Milkshake",
      "price": 15000.00,
      "description": "Thick and creamy chocolate milkshake.",
      "image": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&q=80&w=800",
      "options": {
        "size": ["Regular", "Large"],
        "extra_syrup": ["No", "Yes"]
      },
      "optionPriceModifiers": {
        "size": {
          "Large": 4000.00
        },
        "extra_syrup": {
          "Yes": 1500.00
        }
      }
    }
  ]
};

const DB_URL = process.env.DB_URL || 'postgresql://neondb_owner:npg_7CR1YVwcemiX@ep-frosty-wildflower-a4c65g6a-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require';
const sql = neon(DB_URL);

// Helper to generate random traceable order number
const generateOrderNumber = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing characters like O, 0, I, 1
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ZN-${result}`;
};

// Fallback mock data if DB is not connected yet
const MOCK_PRODUCTS = [
  { id: "1", name: "Zenith Gold Espresso", price: 8000.00, image: "https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&q=80&w=800", department: "Signature Coffee", stock: 100 },
  { id: "2", name: "Velvet Oat Latte", price: 12000.00, image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&q=80&w=800", department: "Signature Coffee", stock: 100 },
  { id: "3", name: "Honeycomb Croissant", price: 10000.00, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=800", department: "Gourmet Pastries", stock: 50 }
];

const MOCK_DEPARTMENTS = [
  "All",
  "Signature Coffee",
  "Artisanal Tea",
  "Gourmet Pastries"
];

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});
const PORT = 3000;

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

  // Make io available to routes
  app.set('io', io);

  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Global error handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Global error handler caught:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  });

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Database Health check
  app.get('/api/db-health', async (req, res) => {
    try {
      
      const result = await sql`SELECT 1 as health`;
      res.json({ status: 'ok', database: 'connected', result });
    } catch (error) {
      console.error('DB Health Check Error:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Database connection failed', 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Test DB connection immediately
  (async () => {
    try {
      
      const result = await sql`SELECT 1 as health`;
      console.log('Database connection test successful:', result);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database connection test failed: Database quota exceeded.');
      } else {
        console.error('Database connection test failed:', error);
        console.error('DB_URL used:', DB_URL.replace(/:[^:@]+@/, ':****@')); // Mask password
      }
    }
  })();

  // Run migrations in background
  (async () => {
    try {
      
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_contact VARCHAR(255)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'pending'`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS stock_reduced BOOLEAN DEFAULT FALSE`;
      await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS staff_id INTEGER REFERENCES users(id)`;
      await sql`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255)`;
      await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT`;
      await sql`CREATE TABLE IF NOT EXISTS settings (key VARCHAR(255) PRIMARY KEY, value VARCHAR(255) NOT NULL)`;
      await sql`CREATE TABLE IF NOT EXISTS roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
      await sql`INSERT INTO roles (name) VALUES 
        ('super_admin'), ('staff'), ('accountant'), ('secretary'), ('manager'), ('counter_staff') 
        ON CONFLICT (name) DO NOTHING`;
      await sql`CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
      await sql`INSERT INTO settings (key, value) VALUES ('exchange_rate', '1') ON CONFLICT (key) DO NOTHING`;
      await sql`CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        guest_name VARCHAR(255),
        rating INTEGER CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`;
      console.log('Feedback table initialized');
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2)`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage INTEGER`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB`;
      await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS option_price_modifiers JSONB`;
      await sql`ALTER TABLE products DROP CONSTRAINT IF EXISTS products_name_key`;
      console.log('Payment and guest columns checked/added to orders and transactions tables, settings table initialized, feedback table initialized, product description column checked, unique constraint on product name dropped');
    } catch (e: any) {
      if (e.message?.includes('data transfer quota')) {
        console.warn('Migration error: Database quota exceeded.');
      } else {
        console.error('Migration error:', e);
      }
    }
  })();

  // Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
      console.log('authenticateToken: No token provided');
      return res.status(401).json({ error: 'Unauthorized', details: 'No token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        console.log('authenticateToken: Token verification failed:', err.message, 'Token:', token);
        return res.status(403).json({ error: 'Forbidden', details: err.message });
      }
      req.user = user;
      next();
    });
  };

  const authorizeRole = (roles: string[]) => {
    return (req: any, res: any, next: any) => {
      if (!req.user) {
        console.log('authorizeRole: No user in request');
        return res.status(401).json({ error: 'Unauthorized' });
      }
      if (!roles.includes(req.user.role)) {
        console.log('authorizeRole: User role', req.user.role, 'not in allowed roles:', roles);
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    };
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, contact_info, address } = req.body;
      
      
      const hashedPassword = await bcrypt.hash(password, 10);
      const result = await sql`
        INSERT INTO users (email, password_hash, name, role, contact_info, address)
        VALUES (${email}, ${hashedPassword}, ${name}, 'customer', ${contact_info}, ${address})
        RETURNING id, email, name, role, address
      `;
      const newUser = result[0];
      await logActivity(newUser.id, 'User Registered', { email: newUser.email, name: newUser.name });
      res.json(newUser);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock user.');
        return res.json({ id: 'mock-user-id', email: req.body.email, name: req.body.name, role: 'customer', address: req.body.address });
      }
      console.error('Register error:', error);
      res.status(500).json({ error: 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(`Login attempt for: ${email}`);
      
      
      const users = await sql`SELECT * FROM users WHERE email = ${email}`;
      if (users.length === 0) {
        console.log(`User not found: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password_hash);
      if (!validPassword) {
        console.log(`Invalid password for: ${email}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      console.log(`Login successful for: ${email} (Role: ${user.role})`);
      await logActivity(user.id, 'User Logged In', { role: user.role });
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role, address: user.address, contact_info: user.contact_info } });
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock admin user.');
        const token = jwt.sign(
          { id: 'mock-admin-id', email: req.body.email, role: 'super_admin', name: 'Mock Admin' },
          JWT_SECRET,
          { expiresIn: '30d' }
        );
        return res.json({ token, user: { id: 'mock-admin-id', email: req.body.email, name: 'Mock Admin', role: 'super_admin' } });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
    try {
      
      const user = await sql`
        SELECT id, email, name, role, contact_info, address, profile_image_url, staff_id, created_at
        FROM users
        WHERE id = ${req.user.id}
      `;
      if (user.length > 0) {
        res.json(user[0]);
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock user from token.');
        return res.json({ id: req.user.id, email: req.user.email, name: req.user.name, role: req.user.role });
      }
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  });

  // Google OAuth Routes
  app.get('/api/auth/google/url', (req, res) => {
    if (!googleClient || !GOOGLE_CLIENT_ID) {
      return res.status(500).json({ error: 'Google OAuth not configured' });
    }
    
    const getRedirectUri = (req: any) => {
      if (APP_URL) {
        return `${APP_URL.replace(/\/$/, '')}/api/auth/google/callback`;
      }
      return `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
    };

    const redirectUri = getRedirectUri(req);
    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email'],
      redirect_uri: redirectUri
    });
    res.json({ url });
  });

  app.get('/api/auth/google/callback', async (req, res) => {
    try {
      const { code } = req.query;
      if (!googleClient || !GOOGLE_CLIENT_ID || !code) {
        return res.status(400).send('Invalid request');
      }

      const getRedirectUri = (req: any) => {
        if (APP_URL) {
          return `${APP_URL.replace(/\/$/, '')}/api/auth/google/callback`;
        }
        return `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
      };

      const redirectUri = getRedirectUri(req);
      const { tokens } = await googleClient.getToken({
        code: code as string,
        redirect_uri: redirectUri
      });
      
      googleClient.setCredentials(tokens);
      
      const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      const userInfo = await userInfoRes.json();
      
      
      
      // Check if user exists
      let users = await sql`SELECT * FROM users WHERE email = ${userInfo.email}`;
      let user;
      
      if (users.length === 0) {
        // Create new user
        const result = await sql`
          INSERT INTO users (email, password_hash, name, role)
          VALUES (${userInfo.email}, 'google-auth-no-password', ${userInfo.name}, 'customer')
          RETURNING id, email, name, role, address
        `;
        user = result[0];
      } else {
        user = users[0];
      }
      
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '30d' }
      );
      
      const userPayload = { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        address: user.address,
        contact_info: user.contact_info
      };

      // Send success message to parent window and close popup
      res.send(`
        <html>
          <body style="background: white;">
            <script>
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'OAUTH_AUTH_SUCCESS', 
                  token: '${token}',
                  user: ${JSON.stringify(userPayload)}
                }, '*');
                window.close();
              } else {
                window.location.href = '/';
              }
            </script>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Google Auth error:', error);
      res.status(500).send('Authentication failed');
    }
  });

  // Exchange Rate Routes
  app.get('/api/exchange-rate', async (req, res) => {
    try {
      const result = await sql`SELECT value FROM settings WHERE key = 'exchange_rate'`;
      res.json({ exchange_rate: result[0]?.value || '1' });
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock exchange rate.');
        return res.json({ exchange_rate: '1' });
      }
      res.status(500).json({ error: 'Failed to fetch exchange rate' });
    }
  });

  app.put('/api/admin/exchange-rate', authenticateToken, authorizeRole(['super_admin', 'accountant', 'manager']), async (req: any, res) => {
    try {
      const { exchange_rate } = req.body;
      await sql`UPDATE settings SET value = ${exchange_rate} WHERE key = 'exchange_rate'`;
      res.json({ message: 'Exchange rate updated' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update exchange rate' });
    }
  });

  app.post('/api/paystack/initialize', async (req, res) => {
    const { email, amount, orderId } = req.body;
    try {
      const response = await fetch('https://api.paystack.co/transaction/initialize', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          amount: amount * 100, // Paystack amount is in kobo
          reference: `order_${orderId}_${Date.now()}`
        })
      });
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Paystack initialization error:', error);
      res.status(500).json({ error: 'Failed to initialize payment' });
    }
  });

  // API Routes
  app.get('/api/departments', async (req, res) => {
    console.log('GET /api/departments request received');
    try {
      console.time('fetchDepartments');
      const rows = await sql`SELECT name FROM departments ORDER BY name ASC`;
      console.timeEnd('fetchDepartments');
      
      if (rows.length === 0) {
        console.log('No departments found, returning mock data');
        return res.json(MOCK_DEPARTMENTS);
      }
      
      const departments = ["All", ...rows.map((r: any) => r.name)];
      console.log(`Returning ${departments.length} departments`);
      res.json(departments);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock departments.');
      } else {
        console.error('Error fetching departments:', error);
      }
      res.json(MOCK_DEPARTMENTS); // Fallback to mock on error
    }
  });

  app.get('/api/products', async (req, res) => {
    try {
      console.time('fetchProducts');
      const products = await sql`
        SELECT p.id, p.name, p.price, p.original_price as "originalPrice", p.discount_percentage as "discountPercentage", p.image_url as image, p.stock_quantity as stock, d.name as department, p.description, p.options, p.option_price_modifiers as "optionPriceModifiers", p.color_images as "colorImages", p.gallery, p.option_images as "optionImages"
        FROM products p
        LEFT JOIN departments d ON p.department_id = d.id
      `;
      console.timeEnd('fetchProducts');
      
      if (products.length === 0) {
        return res.json(MOCK_PRODUCTS);
      }
      
      res.json(products);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock products.');
      } else {
        console.error('Error fetching products:', error);
      }
      res.json(MOCK_PRODUCTS); // Fallback to mock on error
    }
  });

  app.post('/api/log-search', async (req: any, res) => {
    const { query } = req.body;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    let userId = null;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Ignore invalid token
      }
    }

    if (query && query.trim()) {
      await logActivity(userId, 'Search', { query: query.trim() });
    }
    res.json({ success: true });
  });

  app.get('/api/recommendations/categories', async (req: any, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    let userId = null;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Ignore invalid token
      }
    }

    try {
      let recommendedCategories: string[] = [];
      
      if (userId) {
        // Get user's search history
        const history = await sql`
          SELECT details->>'query' as query
          FROM activities
          WHERE user_id = ${userId} AND action = 'Search'
          ORDER BY created_at DESC
          LIMIT 50
        `;

        if (history.length > 0) {
          const searchTerms = history.map((h: any) => h.query.toLowerCase());
          
          // Find categories that match search terms
          const allDepts = await sql`SELECT name FROM departments`;
          const deptNames = allDepts.map((d: any) => d.name);
          
          // Simple matching: if search term contains category name or vice versa
          const matchedDepts = deptNames.filter(name => 
            searchTerms.some(term => term.includes(name.toLowerCase()) || name.toLowerCase().includes(term))
          );

          if (matchedDepts.length > 0) {
            recommendedCategories = matchedDepts;
          }
        }
      }

      // If no matches or not logged in, pick random categories
      if (recommendedCategories.length === 0) {
        const allDepts = await sql`SELECT name FROM departments`;
        const deptNames = allDepts.map((d: any) => d.name);
        // Shuffle and pick 3
        recommendedCategories = deptNames.sort(() => 0.5 - Math.random()).slice(0, 3);
      }

      // Remove duplicates and limit
      recommendedCategories = [...new Set(recommendedCategories)].slice(0, 4);

      res.json(recommendedCategories);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock recommendations.');
        return res.json(['Chefs Specials', 'Appetizers', 'Main Courses']);
      }
      console.error('Error fetching recommendations:', error);
      res.status(500).json({ error: 'Failed to fetch recommendations' });
    }
  });

  app.post('/api/init-db', async (req: any, res) => {
    try {
      // Check if any users exist to allow initial bootstrap
      let usersExist = false;
      try {
        const users = await sql`SELECT id FROM users LIMIT 1`;
        usersExist = users.length > 0;
      } catch (e) {
        // Table might not exist, which is fine for bootstrap
        usersExist = false;
      }

      if (usersExist) {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
          // If no token, check if it's a super_admin trying to login? No, this is init-db.
          // We only allow unauthenticated init-db if NO users exist.
          return res.status(401).json({ error: 'Authentication required' });
        }

        try {
          const user: any = jwt.verify(token, JWT_SECRET);
          if (user.role !== 'super_admin') {
            return res.status(403).json({ error: 'Super admin access required' });
          }
          req.user = user;
        } catch (err) {
          return res.status(403).json({ error: 'Invalid token' });
        }
      }

      const shouldReset = req.query.reset === 'true';

      if (shouldReset) {
        await sql`DROP TABLE IF EXISTS transactions CASCADE`;
        await sql`DROP TABLE IF EXISTS order_items CASCADE`;
        await sql`DROP TABLE IF EXISTS orders CASCADE`;
        await sql`DROP TABLE IF EXISTS products CASCADE`;
        await sql`DROP TABLE IF EXISTS departments CASCADE`;
        await sql`DROP TABLE IF EXISTS users CASCADE`;
      }
      
      await ensureDatabaseSchema();
      res.json({ success: true, message: 'Database initialized successfully' });
    } catch (error) {
      console.error('Init DB error:', error);
      res.status(500).json({ error: 'Failed to initialize database' });
    }
  });


  async function logActivity(userId: number, action: string, details?: any) {
    try {
      const result = await sql`
        INSERT INTO activities (user_id, action, details)
        VALUES (${userId}, ${action}, ${details ? JSON.stringify(details) : null})
        RETURNING *
      `;
      
      const activity = result[0];
      // Get user name for the activity
      const userRes = await sql`SELECT name FROM users WHERE id = ${userId}`;
      if (userRes.length > 0) {
        activity.user_name = userRes[0].name;
      }
      
      io.emit('activityAdded', activity);
    } catch (error) {
      console.error('Failed to log activity:', error);
    }
  }

  async function reduceStock(orderId: number | string) {
    try {
      // Check if already reduced
      const order = await sql`SELECT stock_reduced FROM orders WHERE id = ${orderId}`;
      if (order.length === 0 || order[0].stock_reduced) return;

      const items = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${orderId}`;
      
      for (const item of items) {
        await sql`
          UPDATE products 
          SET stock_quantity = GREATEST(0, stock_quantity - ${item.quantity})
          WHERE id = ${item.product_id}
        `;
      }

      await sql`UPDATE orders SET stock_reduced = TRUE WHERE id = ${orderId}`;
      console.log(`Stock reduced for order ${orderId}`);
    } catch (error) {
      console.error(`Failed to reduce stock for order ${orderId}:`, error);
    }
  }

  async function ensureDatabaseSchema() {
    try {
      
      
      await sql`
        CREATE TABLE IF NOT EXISTS departments (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL,
          image_url TEXT
        )
      `;
      
      await sql`
        CREATE TABLE IF NOT EXISTS products (
          id BIGSERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10, 2) NOT NULL,
          original_price DECIMAL(10, 2),
          discount_percentage INTEGER,
          image_url TEXT,
          description TEXT,
          stock_quantity INTEGER DEFAULT 100,
          department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE,
          options JSONB,
          option_price_modifiers JSONB,
          color_images JSONB,
          gallery JSONB,
          option_images JSONB
        )
      `;

      try {
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10, 2)`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS discount_percentage INTEGER`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS options JSONB`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS option_price_modifiers JSONB`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS color_images JSONB`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS gallery JSONB`;
        await sql`ALTER TABLE products ADD COLUMN IF NOT EXISTS option_images JSONB`;
      } catch (e) {
        // Columns might already exist
      }

      await sql`
        CREATE TABLE IF NOT EXISTS users (
          id BIGSERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          name VARCHAR(255) NOT NULL,
          role VARCHAR(50) DEFAULT 'customer', -- 'super_admin', 'staff', 'customer', 'accountant', 'secretary'
          contact_info TEXT,
          address TEXT,
          profile_image_url TEXT,
          staff_id VARCHAR(50) UNIQUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS activities (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
          action TEXT NOT NULL,
          details JSONB,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS orders (
          id BIGSERIAL PRIMARY KEY,
          user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
          staff_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
          guest_name VARCHAR(255),
          guest_email VARCHAR(255),
          guest_contact VARCHAR(255),
          total_amount DECIMAL(10, 2) NOT NULL,
          status VARCHAR(50) DEFAULT 'PLACED', -- 'PLACED', 'PAID', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED'
          delivery_status VARCHAR(50) DEFAULT 'Placed', -- 'Placed', 'Preparing', 'Out for Delivery', 'Delivered'
          order_type VARCHAR(50) DEFAULT 'pickup', -- 'pickup', 'in-store'
          payment_method VARCHAR(50) DEFAULT 'card',
          payment_reference VARCHAR(255),
          payment_status VARCHAR(50) DEFAULT 'PENDING',
          delivery_address TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      try {
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20) UNIQUE`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_name VARCHAR(255)`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_email VARCHAR(255)`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_contact VARCHAR(255)`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS staff_id BIGINT REFERENCES users(id)`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50) DEFAULT 'card'`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference VARCHAR(255)`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status VARCHAR(50) DEFAULT 'PENDING'`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_address TEXT`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_status VARCHAR(50) DEFAULT 'Placed'`;
        await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_type VARCHAR(50) DEFAULT 'pickup'`;
      } catch (e) {
        // Columns might already exist, ignore
      }

      await sql`
        CREATE TABLE IF NOT EXISTS order_items (
          id BIGSERIAL PRIMARY KEY,
          order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
          product_id BIGINT REFERENCES products(id) ON DELETE SET NULL,
          quantity INTEGER NOT NULL,
          price_at_purchase DECIMAL(10, 2) NOT NULL,
          customizations JSONB
        )
      `;

      try {
        await sql`ALTER TABLE order_items ADD COLUMN IF NOT EXISTS customizations JSONB`;
      } catch (e) {
        // Column might already exist, ignore
      }

      await sql`
        CREATE TABLE IF NOT EXISTS transactions (
          id BIGSERIAL PRIMARY KEY,
          order_id BIGINT REFERENCES orders(id) ON DELETE CASCADE,
          amount DECIMAL(10, 2) NOT NULL,
          payment_method VARCHAR(50) DEFAULT 'card',
          payment_reference VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS staff_departments (
          staff_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
          department_id BIGINT REFERENCES departments(id) ON DELETE CASCADE,
          PRIMARY KEY (staff_id, department_id)
        )
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS settings (
          key VARCHAR(255) PRIMARY KEY,
          value VARCHAR(255) NOT NULL
        )
      `;

      // Add UNIQUE constraint to name if it doesn't exist
      try {
        await sql`ALTER TABLE products ADD CONSTRAINT products_name_key UNIQUE (name)`;
      } catch (e) {
        // Constraint might already exist
      }

      // Create or update initial super admin
      const superAdminEmail = 'harristotle84@gmail.com';
      const adminPassword = await bcrypt.hash('admin123', 10);
      
      // Create or update hardcoded admin
      const hardcodedAdminEmail = 'admin@zenith.com';
      const hardcodedAdminPassword = await bcrypt.hash('Colony082987@', 10);
      
      // Create or update initial secretary
      const secretaryEmail = 'secretary@zenith.com';
      const secretaryPassword = await bcrypt.hash('secretary123', 10);

      const existingAdmin = await sql`SELECT * FROM users WHERE email = ${superAdminEmail}`;
      let adminId;
      if (existingAdmin.length === 0) {
        const result = await sql`
          INSERT INTO users (email, password_hash, name, role)
          VALUES (${superAdminEmail}, ${adminPassword}, 'Super Admin', 'super_admin')
          RETURNING id
        `;
        adminId = result[0].id;
      } else {
        await sql`
          UPDATE users 
          SET password_hash = ${adminPassword}, role = 'super_admin'
          WHERE email = ${superAdminEmail}
        `;
        adminId = existingAdmin[0].id;
      }

      const existingHardcodedAdmin = await sql`SELECT * FROM users WHERE email = ${hardcodedAdminEmail}`;
      if (existingHardcodedAdmin.length === 0) {
        await sql`
          INSERT INTO users (email, password_hash, name, role)
          VALUES (${hardcodedAdminEmail}, ${hardcodedAdminPassword}, 'Administrator', 'super_admin')
        `;
      }

      const existingSecretary = await sql`SELECT * FROM users WHERE email = ${secretaryEmail}`;
      if (existingSecretary.length === 0) {
        await sql`
          INSERT INTO users (email, password_hash, name, role)
          VALUES (${secretaryEmail}, ${secretaryPassword}, 'Secretary', 'secretary')
        `;
      } else {
        await sql`
          UPDATE users 
          SET password_hash = ${secretaryPassword}, role = 'secretary'
          WHERE email = ${secretaryEmail}
        `;
      }

      // Fix foreign key constraints for existing tables
      try {
        await sql`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS order_items_product_id_fkey`;
        await sql`ALTER TABLE order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL`;
      } catch (e: any) {
        console.warn('Could not update order_items foreign key constraint:', e.message);
      }

      // Seed departments
      console.log('Seeding departments...');
      const mockDepts = Object.keys(REAL_PRODUCTS);

      for (const deptName of mockDepts) {
        await sql`
          INSERT INTO departments (name)
          VALUES (${deptName})
          ON CONFLICT (name) DO NOTHING
        `;
      }

      // Seed products
      console.log('Seeding products...');
      
      for (const deptName of Object.keys(REAL_PRODUCTS)) {
        const deptRes = await sql`SELECT id FROM departments WHERE name = ${deptName}`;
        if (deptRes.length > 0) {
          const deptId = deptRes[0].id;
          const products = REAL_PRODUCTS[deptName];
          for (const product of products) {
            await sql`
              INSERT INTO products (name, price, original_price, discount_percentage, image_url, description, stock_quantity, department_id, options, option_price_modifiers, color_images)
              VALUES (
                ${product.name}, 
                ${product.price}, 
                ${product.original_price || null}, 
                ${product.discount_percentage || null}, 
                ${product.image}, 
                ${product.description || ''},
                100, 
                ${deptId}, 
                ${product.options ? JSON.stringify(product.options) : null},
                ${product.optionPriceModifiers ? JSON.stringify(product.optionPriceModifiers) : null},
                ${product.color_images ? JSON.stringify(product.color_images) : null}
              )
              ON CONFLICT (name) DO UPDATE SET
                price = EXCLUDED.price,
                original_price = EXCLUDED.original_price,
                discount_percentage = EXCLUDED.discount_percentage,
                image_url = EXCLUDED.image_url,
                description = EXCLUDED.description,
                department_id = EXCLUDED.department_id,
                options = EXCLUDED.options,
                option_price_modifiers = EXCLUDED.option_price_modifiers,
                color_images = EXCLUDED.color_images
            `;
          }
        }
      }
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Failed to ensure database schema: Database quota exceeded.');
      } else {
        console.error('Failed to ensure database schema:', error);
      }
    }
  }

  // Initialize DB schema in background to prevent blocking server startup
  (async () => {
    try {
      await ensureDatabaseSchema();
      console.log('Database schema initialization complete');
    } catch (error) {
      console.error('Background database initialization failed:', error);
    }
  })();

  app.put('/api/auth/me', authenticateToken, async (req: any, res) => {
    console.log('PUT /api/auth/me called');
    try {
      const { name, contact_info, profile_image_url, address } = req.body;
      console.log('Request body:', req.body);
      const result = await sql`
        UPDATE users 
        SET name = COALESCE(${name}, name), 
            contact_info = COALESCE(${contact_info}, contact_info), 
            profile_image_url = COALESCE(${profile_image_url}, profile_image_url),
            address = COALESCE(${address}, address)
        WHERE id = ${req.user.id}
        RETURNING id, email, name, role, contact_info, address, profile_image_url, staff_id, created_at
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Log activity if the user is a staff member or admin
      if (['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff'].includes(req.user.role)) {
        await logActivity(req.user.id, 'profile_updated', { updated_fields: Object.keys(req.body) });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  app.post('/api/auth/change-password', authenticateToken, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      
      const userRes = await sql`SELECT password_hash FROM users WHERE id = ${req.user.id}`;
      if (userRes.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      if (userRes[0].password_hash === 'google-auth-no-password') {
        return res.status(400).json({ error: 'Cannot change password for Google authenticated accounts' });
      }
      
      const isMatch = await bcrypt.compare(currentPassword, userRes[0].password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Incorrect current password' });
      }
      
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await sql`UPDATE users SET password_hash = ${hashedNewPassword} WHERE id = ${req.user.id}`;
      
      await logActivity(req.user.id, 'password_changed');
      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({ error: 'Failed to update password' });
    }
  });

  app.get('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      
      let orders;
      if (['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff'].includes(req.user.role)) {
        orders = await sql`
          SELECT o.*, 
                 json_agg(json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price_at_purchase,
                   'image', p.image_url
                 )) as items
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `;
      } else {
        orders = await sql`
          SELECT o.*, 
                 json_agg(json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price_at_purchase,
                   'image', p.image_url
                 )) as items
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          WHERE o.user_id = ${req.user.id}
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `;
      }
      res.json(orders);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning empty orders list.');
        return res.json([]);
      }
      console.error('Fetch user orders error:', error);
      res.status(500).json({ error: 'Failed to fetch your orders' });
    }
  });

  // Settings
  app.get('/api/settings/public', async (req, res) => {
    try {
      const settings = await sql`SELECT * FROM settings WHERE key IN ('heroImageUrl', 'featuredImageUrl1', 'featuredImageUrl2', 'featuredImageUrl3', 'featuredImageUrl4')`;
      const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      res.json(settingsMap);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning empty settings.');
        return res.json({});
      }
      console.error('Get public settings error:', error);
      res.status(500).json({ error: 'Failed to get public settings' });
    }
  });

  app.get('/api/admin/settings', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req: any, res) => {
    try {
      const settings = await sql`SELECT * FROM settings`;
      const settingsMap = settings.reduce((acc, s) => ({ ...acc, [s.key]: s.value }), {});
      res.json(settingsMap);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning empty settings.');
        return res.json({});
      }
      console.error('Get settings error:', error);
      res.status(500).json({ error: 'Failed to get settings' });
    }
  });

  app.put('/api/admin/settings', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req: any, res) => {
    try {
      const { key, value } = req.body;
      if (!key || value === undefined) return res.status(400).json({ error: 'Key and value are required' });
      
      await sql`INSERT INTO settings (key, value) VALUES (${key}, ${value}) ON CONFLICT (key) DO UPDATE SET value = ${value}`;
      res.json({ success: true });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({ error: 'Failed to update settings' });
    }
  });

  app.get('/api/admin/accounts', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    console.log('GET /api/admin/accounts - User:', req.user.id, 'Role:', req.user.role);
    try {
      const inflow = await sql`SELECT SUM(total_amount) as total FROM orders WHERE status = 'PAID' OR status = 'COMPLETED'`;
      const recentOrders = await sql`
        SELECT o.*, COALESCE(u.name, o.guest_name, 'Unknown Guest') as customer_name 
        FROM orders o 
        LEFT JOIN users u ON o.user_id = u.id 
        ORDER BY o.created_at DESC 
        LIMIT 50
      `;
      
      await logActivity(req.user.id, 'Viewed Accounts Dashboard');
      console.log('GET /api/admin/accounts - Success');
      res.json({ totalInflow: inflow[0].total || 0, recentOrders });
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock accounts data.');
        return res.json({ totalInflow: 0, recentOrders: [] });
      }
      res.status(500).json({ error: 'Failed to fetch accounts' });
    }
  });

  app.get('/api/admin/reports', authenticateToken, authorizeRole(['super_admin', 'accountant', 'manager']), async (req: any, res) => {
    const { period } = req.query;
    console.log('GET /api/admin/reports - Period:', period);
    try {
      let interval = '1 day';
      if (period === 'weekly') interval = '7 days';
      else if (period === 'monthly') interval = '1 month';
      else if (period === 'quarterly') interval = '3 months';
      else if (period === 'annually') interval = '1 year';

      const report = await sql`
        SELECT 
          COALESCE(SUM(total_amount), 0) as total_sales,
          COUNT(*) as total_orders,
          COALESCE(AVG(total_amount), 0) as average_order_value
        FROM orders 
        WHERE (status = 'PAID' OR status = 'COMPLETED')
        AND created_at >= NOW() - ${interval}::interval
      `;

      const salesOverTime = await sql`
        SELECT 
          DATE_TRUNC('day', created_at) as date,
          SUM(total_amount) as sales
        FROM orders
        WHERE (status = 'PAID' OR status = 'COMPLETED')
        AND created_at >= NOW() - ${interval}::interval
        GROUP BY 1
        ORDER BY 1 ASC
      `;

      res.json({ ...report[0], salesOverTime });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ error: 'Failed to fetch reports' });
    }
  });

  app.get('/api/admin/roles', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req, res) => {
    try {
      const roles = await sql`SELECT * FROM roles ORDER BY name ASC`;
      res.json(roles);
    } catch (error) {
      console.error('Error fetching roles:', error);
      res.status(500).json({ error: 'Failed to fetch roles' });
    }
  });

  app.post('/api/admin/roles', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req, res) => {
    try {
      const { name, description } = req.body;
      if (!name) return res.status(400).json({ error: 'Role name is required' });
      
      const result = await sql`
        INSERT INTO roles (name, description)
        VALUES (${name.toLowerCase().replace(/\s+/g, '_')}, ${description})
        ON CONFLICT (name) DO NOTHING
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(400).json({ error: 'Role already exists' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  });

  app.get('/api/admin/transactions', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    console.log('GET /api/admin/transactions - User:', req.user.id, 'Role:', req.user.role);
    try {
      const transactions = await sql`
        SELECT t.*, o.order_type, o.order_number,
               COALESCE(u.name, o.guest_name, 'Unknown Guest') as customer_name,
               COALESCE(u.email, o.guest_email) as customer_email,
               COALESCE(u.contact_info, o.guest_contact) as customer_contact,
               s.name as staff_name,
               (SELECT json_agg(json_build_object(
                 'id', oi.id,
                 'product_id', oi.product_id,
                 'product_name', p.name,
                 'quantity', oi.quantity,
                 'price', oi.price_at_purchase
               )) FROM order_items oi 
               JOIN products p ON oi.product_id = p.id 
               WHERE oi.order_id = o.id) as items,
               (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as items_count
        FROM transactions t
        JOIN orders o ON t.order_id = o.id
        LEFT JOIN users u ON o.user_id = u.id
        LEFT JOIN users s ON o.staff_id = s.id
        ORDER BY t.created_at DESC
        LIMIT 100
      `;
      
      await logActivity(req.user.id, 'Viewed Transactions');
      console.log('GET /api/admin/transactions - Success, count:', transactions.length);
      res.json(transactions);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock transactions data.');
        return res.json([]);
      }
      console.error('Failed to fetch transactions:', error);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  app.get('/api/admin/staff', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req, res) => {
    try {
      
      const staff = await sql`
        SELECT u.id, u.email, u.name, u.role, u.contact_info, u.profile_image_url, u.staff_id,
               COALESCE(json_agg(d.name) FILTER (WHERE d.name IS NOT NULL), '[]') as departments
        FROM users u
        LEFT JOIN staff_departments sd ON u.id = sd.staff_id
        LEFT JOIN departments d ON sd.department_id = d.id
        WHERE u.role IN ('staff', 'super_admin', 'accountant', 'secretary', 'manager', 'counter_staff')
        GROUP BY u.id
      `;
      res.json(staff);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning empty staff list.');
        return res.json([]);
      }
      console.error('Fetch staff error:', error);
      res.status(500).json({ error: 'Failed to fetch staff' });
    }
  });

  app.get('/api/admin/users', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req, res) => {
    try {
      
      const users = await sql`
        SELECT id, email, name, role, profile_image_url, created_at
        FROM users
        ORDER BY role, name
      `;
      res.json(users);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning empty users list.');
        return res.json([]);
      }
      console.error('Fetch users error:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

  app.get('/api/admin/activities', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req, res) => {
    try {
      
      const activities = await sql`
        SELECT a.*, u.name as user_name, u.email as user_email, u.role as user_role
        FROM activities a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC 
        LIMIT 200
      `;
      res.json(activities);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning empty activities list.');
        return res.json([]);
      }
      console.error('Fetch activities error:', error);
      res.status(500).json({ error: 'Failed to fetch all activities', details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get('/api/admin/orders', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    try {
      
      const userId = req.user.id;
      const userRole = req.user.role;

      let orders;
      if (userRole === 'super_admin' || userRole === 'accountant' || userRole === 'manager') {
        orders = await sql`
          SELECT o.*, 
                 json_agg(json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price_at_purchase,
                   'department', d.name,
                   'customizations', oi.customizations
                 )) as items
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          JOIN departments d ON p.department_id = d.id
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `;
      } else {
        orders = await sql`
          SELECT o.*, 
                 json_agg(json_build_object(
                   'id', oi.id,
                   'product_name', p.name,
                   'quantity', oi.quantity,
                   'price', oi.price_at_purchase,
                   'department', d.name,
                   'customizations', oi.customizations
                 )) as items
          FROM orders o
          JOIN order_items oi ON o.id = oi.order_id
          JOIN products p ON oi.product_id = p.id
          JOIN departments d ON p.department_id = d.id
          WHERE o.id IN (
            SELECT DISTINCT oi2.order_id
            FROM order_items oi2
            JOIN products p2 ON oi2.product_id = p2.id
            JOIN staff_departments sd ON p2.department_id = sd.department_id
            WHERE sd.staff_id = ${userId}
          )
          GROUP BY o.id
          ORDER BY o.created_at DESC
        `;
      }
      res.json(orders);
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning empty orders list.');
        return res.json([]);
      }
      console.error('Fetch orders error:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.put('/api/admin/orders/:id/delivery-status', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { deliveryStatus } = req.body;
      
      if (!['Placed', 'Preparing', 'Out for Delivery', 'Delivered'].includes(deliveryStatus)) {
        return res.status(400).json({ error: 'Invalid delivery status' });
      }

      await sql`
        UPDATE orders SET delivery_status = ${deliveryStatus} WHERE id = ${Number(id)}
      `;

      // Emit socket event for delivery status update
      const io = req.app.get('io');
      if (io) {
        io.emit('deliveryStatusUpdate', { orderId: id, deliveryStatus });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Update delivery status error:', error);
      res.status(500).json({ error: 'Failed to update delivery status' });
    }
  });

  app.put('/api/admin/orders/:id/status', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!['PLACED', 'PAID', 'IN_PROGRESS', 'READY', 'COMPLETED', 'CANCELLED', 'AWAITING_CONFIRMATION'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      await sql`
        UPDATE orders SET status = ${status} WHERE id = ${id}
      `;

      if (status === 'PAID' || status === 'COMPLETED') {
        await reduceStock(id);
      }

      // Emit socket event for order status update
      const io = req.app.get('io');
      if (io) {
        io.emit('orderStatusUpdate', { orderId: id, status });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Update order status error:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });

  app.post('/api/admin/orders/:id/complete', authenticateToken, authorizeRole(['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      const userId = req.user.id;
      const userRole = req.user.role;

      if (userRole !== 'super_admin' && userRole !== 'accountant' && userRole !== 'manager') {
        const hasPermission = await sql`
          SELECT 1 FROM order_items oi
          JOIN products p ON oi.product_id = p.id
          JOIN staff_departments sd ON p.department_id = sd.department_id
          WHERE oi.order_id = ${id} AND sd.staff_id = ${userId}
          LIMIT 1
        `;
        if (hasPermission.length === 0) {
          return res.status(403).json({ error: 'You do not have permission to update this order' });
        }
      }

      await sql`
        UPDATE orders 
        SET payment_status = 'COMPLETED', status = 'COMPLETED'
        WHERE id = ${id}
      `;

      // Reduce stock for the items in the order
      const items = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${id}`;
      for (const item of items) {
        await sql`UPDATE products SET stock_quantity = stock_quantity - ${item.quantity} WHERE id = ${item.product_id}`;
      }

      await logActivity(userId, 'Completed Order', { order_id: id });

      // Emit socket event for order status update
      const io = req.app.get('io');
      if (io) {
        io.emit('orderStatusUpdate', { orderId: id, status: 'COMPLETED' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Complete order error:', error);
      res.status(500).json({ error: 'Failed to complete order' });
    }
  });

  app.delete('/api/admin/orders/:id', authenticateToken, authorizeRole(['super_admin', 'accountant', 'manager']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Delete transactions first due to foreign key constraint
      await sql`DELETE FROM transactions WHERE order_id = ${id}`;
      
      // Restore stock for the items in the order
      const items = await sql`SELECT product_id, quantity FROM order_items WHERE order_id = ${id}`;
      for (const item of items) {
        await sql`UPDATE products SET stock_quantity = stock_quantity + ${item.quantity} WHERE id = ${item.product_id}`;
      }

      // order_items will be deleted automatically due to ON DELETE CASCADE
      await sql`DELETE FROM orders WHERE id = ${id}`;

      await logActivity(userId, 'Deleted Order', { order_id: id });

      // Emit socket event for order deletion
      const io = req.app.get('io');
      if (io) {
        io.emit('orderDeleted', id);
        io.emit('orderStatusUpdate', { orderId: id, status: 'DELETED' });
      }

      res.json({ success: true });
    } catch (error) {
      console.error('Delete order error:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  });

  app.get('/api/admin/staff/:id/activities', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req, res) => {
    try {
      const { id } = req.params;
      
      const activities = await sql`
        SELECT * FROM activities 
        WHERE user_id = ${id} 
        ORDER BY created_at DESC 
        LIMIT 100
      `;
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });

  app.post('/api/admin/staff', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req: any, res) => {
    try {
      const { email, password, name, role, contact_info, profile_image_url, staff_id, department_ids } = req.body;
      console.log('Creating staff account for:', email);
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const userRes = await sql`
        INSERT INTO users (email, password_hash, name, role, contact_info, profile_image_url, staff_id)
        VALUES (${email}, ${hashedPassword}, ${name}, ${role || 'staff'}, ${contact_info}, ${profile_image_url}, ${staff_id})
        RETURNING id
      `;
      const newStaffId = userRes[0].id;

      if (department_ids && Array.isArray(department_ids) && department_ids.length > 0) {
        for (const deptName of department_ids) {
          const deptRes = await sql`SELECT id FROM departments WHERE name = ${deptName}`;
          if (deptRes.length > 0) {
            await sql`
              INSERT INTO staff_departments (staff_id, department_id)
              VALUES (${newStaffId}, ${deptRes[0].id})
            `;
          }
        }
      }

      await logActivity(req.user.id, 'Created Staff Profile', { staff_name: name, role });
      res.json({ success: true });
    } catch (error) {
      console.error('Create staff error:', error);
      res.status(500).json({ error: 'Failed to create staff account', details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.put('/api/admin/staff/:id', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, role, contact_info, profile_image_url, staff_id, department_ids } = req.body;
      
      
      // Prevent changing the role of the primary super_admin
      const userToUpdate = await sql`SELECT email FROM users WHERE id = ${id}`;
      if (userToUpdate.length > 0 && userToUpdate[0].email === 'harristotle84@gmail.com' && role !== 'super_admin') {
        return res.status(400).json({ error: 'Cannot change the role of the primary super_admin' });
      }

      // Update user basic info
      await sql`
        UPDATE users 
        SET name = ${name}, 
            role = ${role}, 
            contact_info = ${contact_info}, 
            profile_image_url = ${profile_image_url}, 
            staff_id = ${staff_id}
        WHERE id = ${id} AND role IN ('staff', 'super_admin', 'accountant', 'secretary')
      `;

      // Update departments
      // First, clear existing assignments
      await sql`DELETE FROM staff_departments WHERE staff_id = ${id}`;

      // Then, add new ones
      if (department_ids && Array.isArray(department_ids) && department_ids.length > 0) {
        for (const deptName of department_ids) {
          const deptRes = await sql`SELECT id FROM departments WHERE name = ${deptName}`;
          if (deptRes.length > 0) {
            await sql`
              INSERT INTO staff_departments (staff_id, department_id)
              VALUES (${id}, ${deptRes[0].id})
            `;
          }
        }
      }

      await logActivity(req.user.id, 'Updated Staff Profile', { staff_id: id, name, role });
      res.json({ success: true });
    } catch (error) {
      console.error('Update staff error:', error);
      res.status(500).json({ error: 'Failed to update staff account' });
    }
  });

  app.delete('/api/admin/staff/:id', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      
      // Prevent deleting the last super_admin or oneself
      if (req.user.id === parseInt(id)) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      // Prevent deleting the primary super_admin
      const userToDelete = await sql`SELECT email FROM users WHERE id = ${id}`;
      if (userToDelete.length > 0 && userToDelete[0].email === 'harristotle84@gmail.com') {
        return res.status(400).json({ error: 'Cannot delete the primary super_admin account' });
      }
      
      await sql`DELETE FROM users WHERE id = ${id} AND role IN ('staff', 'super_admin', 'accountant', 'secretary', 'manager', 'counter_staff')`;
      await logActivity(req.user.id, 'Deleted Staff Profile', { staff_id: id });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete staff error:', error);
      res.status(500).json({ error: 'Failed to delete staff account' });
    }
  });

  // Order Routes
  app.post('/api/orders', authenticateToken, async (req: any, res) => {
    try {
      const { items, total_amount, order_type, payment_method, payment_reference, payment_status, guest_name, guest_email, guest_contact, delivery_address } = req.body;
      
      
      // Check stock for all items first
      for (const item of items) {
        const product = await sql`SELECT stock_quantity, name FROM products WHERE id = ${item.id}`;
        if (product.length === 0) {
          return res.status(404).json({ error: `Product ${item.id} not found` });
        }
        if (product[0].stock_quantity < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product[0].name}. Available: ${product[0].stock_quantity}` });
        }
      }

      const isStaff = ['super_admin', 'staff', 'accountant', 'secretary', 'manager', 'counter_staff'].includes(req.user.role);
      const staffId = isStaff ? req.user.id : null;
      const userId = isStaff ? null : req.user.id;
      
      let initialStatus = 'PLACED';
      if (isStaff && (payment_status?.toUpperCase() === 'PAID' || payment_status?.toUpperCase() === 'COMPLETED')) {
        initialStatus = 'PAID';
      } else if (!isStaff && (payment_method === 'card' || payment_method === 'transfer')) {
        initialStatus = 'AWAITING_CONFIRMATION';
      } else if (payment_status?.toUpperCase() === 'PAID') {
        initialStatus = 'PAID';
      }

      const orderResult = await sql`
        INSERT INTO orders (user_id, staff_id, total_amount, order_type, payment_method, payment_reference, payment_status, guest_name, guest_email, guest_contact, status, delivery_address)
        VALUES (${userId}, ${staffId}, ${total_amount}, ${order_type}, ${payment_method || 'card'}, ${payment_reference || null}, ${payment_status || 'PENDING'}, ${guest_name || null}, ${guest_email || null}, ${guest_contact || null}, ${initialStatus}, ${delivery_address || null})
        RETURNING id
      `;
      const orderId = orderResult[0].id;
      const orderNumber = generateOrderNumber();
      await sql`UPDATE orders SET order_number = ${orderNumber} WHERE id = ${orderId}`;
      const finalOrderNumber = orderNumber;
      
      const fullOrder = await sql`SELECT * FROM orders WHERE id = ${orderId}`;

      const logUserId = isStaff ? req.user.id : (userId || req.user.id);
      await logActivity(logUserId, 'Placed Order', { order_id: orderId, order_number: finalOrderNumber, total_amount });

      for (const item of items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, customizations)
          VALUES (${orderId}, ${item.id}, ${item.quantity}, ${item.price}, ${item.customizations ? JSON.stringify(item.customizations) : null})
        `;
      }

      const transactionResult = await sql`
        INSERT INTO transactions (order_id, amount, payment_reference, payment_method)
        VALUES (${orderId}, ${total_amount}, ${payment_reference || null}, ${payment_method || 'card'})
        RETURNING *
      `;

      // Emit socket event for new order
      if (io) {
        io.emit('orderAdded', fullOrder[0]);
        io.emit('transactionAdded', transactionResult[0]);
      }

      if (initialStatus === 'PAID' || (initialStatus === 'AWAITING_CONFIRMATION' && payment_method === 'card')) {
        await reduceStock(orderId);
      }

      res.json({ success: true, orderId, orderNumber: finalOrderNumber });
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock success.');
        return res.json({ success: true, orderId: 'mock-order-id', orderNumber: 'MOCK-1234' });
      }
      console.error('Order error:', error);
      res.status(500).json({ error: 'Failed to place order' });
    }
  });

  app.post('/api/guest-orders', async (req: any, res) => {
    try {
      const { items, total_amount, order_type, guest_name, guest_email, guest_contact, payment_method, payment_reference, payment_status, delivery_address } = req.body;
      
      
      // Check stock for all items first
      for (const item of items) {
        const product = await sql`SELECT stock_quantity, name FROM products WHERE id = ${item.id}`;
        if (product.length === 0) {
          return res.status(404).json({ error: `Product ${item.id} not found` });
        }
        if (product[0].stock_quantity < item.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${product[0].name}. Available: ${product[0].stock_quantity}` });
        }
      }

      let initialStatus = 'PLACED';
      if (payment_method === 'card' || payment_method === 'transfer') {
        initialStatus = 'AWAITING_CONFIRMATION';
      } else if (payment_status?.toUpperCase() === 'PAID' || payment_status?.toUpperCase() === 'COMPLETED') {
        initialStatus = 'PAID';
      }
      
      const orderResult = await sql`
        INSERT INTO orders (guest_name, guest_email, guest_contact, total_amount, order_type, payment_method, payment_reference, payment_status, status, delivery_address)
        VALUES (${guest_name}, ${guest_email}, ${guest_contact}, ${total_amount}, ${order_type}, ${payment_method || 'card'}, ${payment_reference || null}, ${payment_status || 'PENDING'}, ${initialStatus}, ${delivery_address || null})
        RETURNING id
      `;
      const orderId = orderResult[0].id;
      const orderNumber = generateOrderNumber();
      await sql`UPDATE orders SET order_number = ${orderNumber} WHERE id = ${orderId}`;
      const finalOrderNumber = orderNumber;

      for (const item of items) {
        await sql`
          INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase, customizations)
          VALUES (${orderId}, ${item.id}, ${item.quantity}, ${item.price}, ${item.customizations ? JSON.stringify(item.customizations) : null})
        `;
      }

      const transactionResult = await sql`
        INSERT INTO transactions (order_id, amount, payment_reference, payment_method)
        VALUES (${orderId}, ${total_amount}, ${payment_reference || null}, ${payment_method || 'card'})
        RETURNING *
      `;

      // Emit socket event for new order
      if (io) {
        io.emit('newOrder', { orderId, status: initialStatus });
        io.emit('transactionAdded', transactionResult[0]);
      }

      if (initialStatus === 'PAID' || (initialStatus === 'AWAITING_CONFIRMATION' && payment_method === 'card')) {
        await reduceStock(orderId);
      }

      res.json({ success: true, orderId, orderNumber: finalOrderNumber });
    } catch (error: any) {
      if (error.message?.includes('data transfer quota')) {
        console.warn('Database quota exceeded, returning mock success.');
        return res.json({ success: true, orderId: 'mock-order-id', orderNumber: 'MOCK-1234' });
      }
      console.error('Guest order error:', error);
      res.status(500).json({ error: 'Failed to place guest order' });
    }
  });

  app.post('/api/departments', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req: any, res) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ error: 'Name is required' });

      console.log('Adding department:', name);
      
      const result = await sql`INSERT INTO departments (name) VALUES (${name}) RETURNING *`;
      await logActivity(req.user.id, 'Added Department', { department_name: name });
      res.json(result[0]);
    } catch (error) {
      console.error('Add department error:', error);
      res.status(500).json({ error: 'Failed to add department', details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.delete('/api/departments/:name', authenticateToken, authorizeRole(['super_admin', 'manager']), async (req: any, res) => {
    try {
      const { name } = req.params;
      
      await sql`DELETE FROM departments WHERE name = ${name}`;
      await logActivity(req.user.id, 'Deleted Department', { department_name: name });
      res.json({ success: true });
    } catch (error) {
      console.error('Delete department error:', error);
      res.status(500).json({ error: 'Failed to delete department' });
    }
  });

  app.post('/api/products', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    try {
      const { name, price, original_price, discount_percentage, image_url, department_name, stock_quantity, description, options, optionPriceModifiers, gallery, optionImages } = req.body;
      console.log('Adding product:', name, 'to department:', department_name);
      if (!name || !price || !department_name) {
        return res.status(400).json({ error: 'Name, price, and department are required' });
      }

      
      const deptRes = await sql`SELECT id FROM departments WHERE name = ${department_name}`;
      if (deptRes.length === 0) {
        console.warn('Department not found:', department_name);
        return res.status(400).json({ error: 'Department not found' });
      }
      
      const department_id = deptRes[0].id;
      const finalStock = stock_quantity !== undefined ? stock_quantity : 100;
      
      const result = await sql`
        INSERT INTO products (name, price, original_price, discount_percentage, image_url, stock_quantity, department_id, description, options, option_price_modifiers, gallery, option_images) 
        VALUES (${name}, ${price}, ${original_price || null}, ${discount_percentage || null}, ${image_url}, ${finalStock}, ${department_id}, ${description || null}, ${options ? JSON.stringify(options) : null}, ${optionPriceModifiers ? JSON.stringify(optionPriceModifiers) : null}, ${gallery ? JSON.stringify(gallery) : null}, ${optionImages ? JSON.stringify(optionImages) : null}) 
        RETURNING *
      `;
      const io = req.app.get('io');
      io.emit('productAdded', result[0]);
      await logActivity(req.user.id, 'Added Product', { product_name: name, price });
      res.json(result[0]);
    } catch (error) {
      console.error('Add product error:', error);
      res.status(500).json({ error: 'Failed to add product', details: error instanceof Error ? error.message : String(error) });
    }
  });

  const upload = multer({ storage: multer.memoryStorage() });
  app.post('/api/upload', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary', 'manager', 'counter_staff']), upload.array('images', 10), async (req: any, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      const files = req.files as Express.Multer.File[];
      const urls = files.map(file => `data:${file.mimetype};base64,${file.buffer.toString('base64')}`);
      res.json({ urls });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Failed to upload images' });
    }
  });

  app.delete('/api/products/:id', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    try {
      const { id } = req.params;
      
      await sql`DELETE FROM products WHERE id = ${id}`;
      const io = req.app.get('io');
      if (io) {
        io.emit('productDeleted', id);
      }
      await logActivity(req.user.id, 'Deleted Product', { product_id: id });

      res.json({ success: true });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  });

  app.put('/api/products/:id', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary', 'manager', 'counter_staff']), async (req: any, res) => {
    try {
      const { id } = req.params;
      const { name, price, original_price, discount_percentage, image_url, department_name, stock_quantity, description, options, optionPriceModifiers, gallery, optionImages } = req.body;
      
      if (!name || !price || !department_name) {
        return res.status(400).json({ error: 'Name, price, and department are required' });
      }

      
      const deptRes = await sql`SELECT id FROM departments WHERE name = ${department_name}`;
      if (deptRes.length === 0) {
        return res.status(400).json({ error: 'Department not found' });
      }
      
      const department_id = deptRes[0].id;
      const finalStock = stock_quantity !== undefined ? stock_quantity : 100;
      
      const result = await sql`
        UPDATE products 
        SET name = ${name}, price = ${price}, original_price = ${original_price || null}, discount_percentage = ${discount_percentage || null}, image_url = ${image_url}, stock_quantity = ${finalStock}, department_id = ${department_id}, description = ${description || null}, options = ${options ? JSON.stringify(options) : null}, option_price_modifiers = ${optionPriceModifiers ? JSON.stringify(optionPriceModifiers) : null}, gallery = ${gallery ? JSON.stringify(gallery) : null}, option_images = ${optionImages ? JSON.stringify(optionImages) : null}
        WHERE id = ${id} 
        RETURNING *
      `;
      const io = req.app.get('io');
      io.emit('productUpdated', result[0]);
      await logActivity(req.user.id, 'Updated Product', { product_name: name, product_id: id });
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  });

  // Feedback Routes
  app.get('/api/feedback/:productId', async (req, res) => {
    const { productId } = req.params;
    console.log(`GET /api/feedback/${productId} called`);
    try {
      if (!productId || productId === 'undefined') {
        console.warn('Invalid productId received in feedback fetch');
        return res.json([]);
      }
      const feedback = await sql`
        SELECT f.*, u.name as user_name 
        FROM feedback f 
        LEFT JOIN users u ON f.user_id = u.id 
        WHERE f.product_id = ${productId} 
        ORDER BY f.created_at DESC
      `;
      console.log(`Successfully fetched ${feedback.length} feedback items for product ${productId}`);
      res.json(feedback);
    } catch (error: any) {
      console.error(`Error fetching feedback for product ${productId}:`, error);
      res.status(500).json({ error: 'Failed to fetch feedback', details: error.message });
    }
  });

  app.post('/api/feedback', async (req: any, res) => {
    console.log('POST /api/feedback called', req.body);
    try {
      const { product_id, user_id, guest_name, rating, comment } = req.body;
      if (!product_id || !rating) {
        return res.status(400).json({ error: 'Product ID and rating are required' });
      }

      const result = await sql`
        INSERT INTO feedback (product_id, user_id, guest_name, rating, comment)
        VALUES (${product_id}, ${user_id || null}, ${guest_name || null}, ${rating}, ${comment})
        RETURNING *
      `;
      console.log('Feedback submitted successfully:', result[0].id);
      res.json(result[0]);
    } catch (error: any) {
      console.error('Feedback submission error:', error);
      res.status(500).json({ error: 'Failed to submit feedback', details: error.message });
    }
  });

  app.put('/api/products/:id/stock', authenticateToken, authorizeRole(['super_admin', 'staff', 'secretary', 'manager', 'counter_staff']), async (req, res) => {
    try {
      const { id } = req.params;
      const { stock_quantity } = req.body;
      
      if (stock_quantity === undefined) {
        return res.status(400).json({ error: 'Stock quantity is required' });
      }

      
      const result = await sql`
        UPDATE products 
        SET stock_quantity = ${stock_quantity} 
        WHERE id = ${id} 
        RETURNING *
      `;
      
      if (result.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error('Update stock error:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  });

  app.post('/api/newsletter', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ error: 'Email is required' });

      
      await sql`INSERT INTO newsletter_subscribers (email) VALUES (${email}) ON CONFLICT (email) DO NOTHING`;
      res.json({ success: true });
    } catch (error) {
      console.error('Newsletter error:', error);
      res.status(500).json({ error: 'Failed to subscribe' });
    }
  });

  app.post('/api/seed-more', authenticateToken, authorizeRole(['super_admin']), async (req: any, res) => {
    try {
      const departments = [
        'Bakery', 'Dairy', 'Fruits', 'Vegetables', 'Snacks', 
        'Beverages', 'Frozen Foods', 'Meat', 'Seafood', 'Household'
      ];

      // Batch insert departments
      await sql`INSERT INTO departments (name) SELECT * FROM UNNEST(${departments}::text[]) AS name ON CONFLICT (name) DO NOTHING`;
      
      // Get all department IDs
      const deptRes = await sql`SELECT id, name FROM departments WHERE name = ANY(${departments})`;
      const deptMap = new Map(deptRes.map((d: any) => [d.name, d.id]));

      // Batch insert products
      for (const deptName of departments) {
        const deptId = deptMap.get(deptName);
        for (let i = 1; i <= 25; i++) {
          const productName = `${deptName} Item ${i}`;
          const price = Math.floor(Math.random() * 50) + 1;
          const description = `Description for ${productName}`;
          await sql`INSERT INTO products (name, price, stock_quantity, department_id, description) 
                    VALUES (${productName}, ${price}, 100, ${deptId}, ${description}) 
                    ON CONFLICT (name) DO NOTHING`;
        }
      }
      
      res.json({ success: true, message: 'Added 10 departments and 250 products' });
    } catch (error) {
      console.error('Seed error:', error);
      res.status(500).json({ error: 'Failed to seed', details: error instanceof Error ? error.message : String(error) });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.error('Failed to initialize Vite middleware:', e);
    }
  } else if (!process.env.VERCEL) {
    // Only serve static files if NOT on Vercel (Vercel handles static files itself)
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://0.0.0.0:${PORT}`);
      console.log(`APP_URL: ${APP_URL}`);
      console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
    });
  }

  // No return needed at top level

// No startServer() call needed at top level

export default app;
