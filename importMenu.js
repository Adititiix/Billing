import admin from 'firebase-admin';
import { readFileSync } from 'node:fs'; // Import readFileSync from the built-in 'fs' module
import { fileURLToPath } from 'node:url'; // To get the current directory path
import { dirname } from 'node:path'; // To construct the path reliably

// Get current directory name to build the path to serviceAccountKey.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read the service account key JSON file
const serviceAccountPath = `${__dirname}/serviceAccountKey.json`; // Assuming it's in the same directory
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const menuItems = [
    // Morning Session Items
    { id: 1, name: "Idli", price: 15, category: "Breakfast", description: "Steamed rice cakes (2 pieces)", sessions: ["morning", "afternoon", "night"] },
    { id: 2, name: "Dosa", price: 25, category: "Breakfast", description: "Crispy rice crepe", sessions: ["morning", "afternoon", "night"] },
    { id: 3, name: "Vada", price: 20, category: "Breakfast", description: "Deep fried lentil donuts (2 pieces)", sessions: ["morning", "afternoon"] },
    { id: 4, name: "Upma", price: 18, category: "Breakfast", description: "Semolina breakfast dish", sessions: ["morning"] },
    { id: 5, name: "Pongal", price: 22, category: "Breakfast", description: "Rice and lentil dish", sessions: ["morning"] },
    { id: 6, name: "Poori", price: 20, category: "Breakfast", description: "Deep fried bread (3 pieces)", sessions: ["morning", "afternoon"] },
    { id: 7, name: "Rava Dosa", price: 30, category: "Breakfast", description: "Crispy semolina crepe", sessions: ["morning", "afternoon"] },

    // Afternoon Session Items
    { id: 8, name: "Sambar Rice", price: 35, category: "Lunch", description: "Rice with lentil curry", sessions: ["afternoon", "night"] },
    { id: 9, name: "Curd Rice", price: 30, category: "Lunch", description: "Rice with yogurt", sessions: ["afternoon", "night"] },
    { id: 10, name: "Rasam Rice", price: 32, category: "Lunch", description: "Rice with tangy soup", sessions: ["afternoon", "night"] },
    { id: 11, name: "Vegetable Rice", price: 40, category: "Lunch", description: "Mixed vegetable rice", sessions: ["afternoon", "night"] },
    { id: 12, name: "Lemon Rice", price: 28, category: "Lunch", description: "Tangy lemon flavored rice", sessions: ["afternoon", "night"] },
    { id: 13, name: "Meals", price: 60, category: "Lunch", description: "Complete South Indian thali", sessions: ["afternoon"] },
    { id: 14, name: "Biryani", price: 80, category: "Lunch", description: "Aromatic rice with spices", sessions: ["afternoon", "night"] },

    // Night Session Items
    { id: 15, name: "Chapati", price: 8, category: "Dinner", description: "Indian flatbread (1 piece)", sessions: ["night"] },
    { id: 16, name: "Parotta", price: 12, category: "Dinner", description: "Layered flatbread (1 piece)", sessions: ["night"] },
    { id: 17, name: "Chicken Curry", price: 80, category: "Dinner", description: "Spicy chicken curry", sessions: ["afternoon", "night"] },
    { id: 18, name: "Mutton Curry", price: 120, category: "Dinner", description: "Traditional mutton curry", sessions: ["afternoon", "night"] },
    { id: 19, name: "Fish Curry", price: 90, category: "Dinner", description: "South Indian fish curry", sessions: ["afternoon", "night"] },
    { id: 20, name: "Vegetable Curry", price: 45, category: "Dinner", description: "Mixed vegetable curry", sessions: ["night"] },
    { id: 21, name: "Dal Fry", price: 35, category: "Dinner", description: "Spiced lentil curry", sessions: ["night"] },

    // Beverages (Available all sessions)
    { id: 22, name: "Filter Coffee", price: 15, category: "Beverages", description: "Traditional South Indian coffee", sessions: ["morning", "afternoon", "night"] },
    { id: 23, name: "Tea", price: 10, category: "Beverages", description: "Indian masala tea", sessions: ["morning", "afternoon", "night"] },
    { id: 24, name: "Buttermilk", price: 12, category: "Beverages", description: "Spiced yogurt drink", sessions: ["afternoon", "night"] },
    { id: 25, name: "Fresh Lime", price: 15, category: "Beverages", description: "Fresh lime water", sessions: ["afternoon", "night"] },

    // Desserts
    { id: 26, name: "Payasam", price: 25, category: "Desserts", description: "Traditional sweet pudding", sessions: ["afternoon", "night"] },
    { id: 27, name: "Halwa", price: 30, category: "Desserts", description: "Sweet semolina dessert", sessions: ["afternoon", "night"] },
    { id: 28, name: "Gulab Jamun", price: 20, category: "Desserts", description: "Sweet milk dumplings (2 pieces)", sessions: ["afternoon", "night"] }
];

async function uploadMenuItems() {
  console.log("Starting menu item upload...");
  const batch = db.batch();
  let count = 0;

  for (const item of menuItems) {
    const docRef = db.collection('menuItems').doc(item.id.toString());
    batch.set(docRef, item);
    count++;
  }

  try {
    await batch.commit();
    console.log(`Successfully uploaded ${count} menu items to Firestore!`);
  } catch (error) {
    console.error("Error uploading menu items:", error);
  }
  process.exit();
}

uploadMenuItems();