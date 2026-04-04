// lib/adminData.js
// ─── Central mock data store for hackathon demo ───────────────────────────────
// Swap these with real DB calls (Prisma, Mongoose, etc.) later

export const STATS = {
  totalMatches: 1248,
  matchDelta: "+18%",
  activeInfluencers: 342,
  influencerDelta: "+6%",
  shopsOnboarded: 187,
  shopDelta: "+11%",
  gmv: "₹4.2L",
  gmvDelta: "-2%",
};

export const INFLUENCERS = [
  { id: "inf_01", name: "Priya Sharma",   handle: "@priyasharma",   niche: "Fashion",  followers: "128K", matchRate: "74%", status: "active",  joined: "Jan 2024" },
  { id: "inf_02", name: "Arjun Mehta",    handle: "@arjunmehta",    niche: "Fitness",  followers: "89K",  matchRate: "61%", status: "active",  joined: "Feb 2024" },
  { id: "inf_03", name: "Sneha Kapoor",   handle: "@snehakapoor",   niche: "Beauty",   followers: "210K", matchRate: "82%", status: "active",  joined: "Dec 2023" },
  { id: "inf_04", name: "Rahul Verma",    handle: "@rahulverma",    niche: "Tech",     followers: "55K",  matchRate: "48%", status: "pending", joined: "Mar 2024" },
  { id: "inf_05", name: "Ankita Joshi",   handle: "@ankitajoshi",   niche: "Food",     followers: "175K", matchRate: "78%", status: "active",  joined: "Nov 2023" },
  { id: "inf_06", name: "Kabir Singh",    handle: "@kabirsingh",    niche: "Fashion",  followers: "92K",  matchRate: "65%", status: "banned",  joined: "Jan 2024" },
  { id: "inf_07", name: "Meera Pillai",   handle: "@meerapillai",   niche: "Wellness", followers: "67K",  matchRate: "59%", status: "active",  joined: "Mar 2024" },
  { id: "inf_08", name: "Rohan Gupta",    handle: "@rohangupta",    niche: "Travel",   followers: "143K", matchRate: "70%", status: "active",  joined: "Oct 2023" },
];

export const SHOPS = [
  { id: "shp_01", name: "Zara India",       category: "Fashion",   city: "Mumbai",    plan: "Pro",   offers: 24, status: "active",  joined: "Dec 2023" },
  { id: "shp_02", name: "Nykaa Beauty",     category: "Beauty",    city: "Bangalore", plan: "Pro",   offers: 31, status: "active",  joined: "Nov 2023" },
  { id: "shp_03", name: "FoodBox Co.",      category: "Food",      city: "Delhi",     plan: "Basic", offers: 8,  status: "active",  joined: "Feb 2024" },
  { id: "shp_04", name: "GymNation",        category: "Fitness",   city: "Pune",      plan: "Basic", offers: 5,  status: "pending", joined: "Mar 2024" },
  { id: "shp_05", name: "TechBazaar",       category: "Tech",      city: "Hyderabad", plan: "Pro",   offers: 12, status: "active",  joined: "Jan 2024" },
  { id: "shp_06", name: "Mango Fashion",    category: "Fashion",   city: "Chennai",   plan: "Pro",   offers: 18, status: "active",  joined: "Jan 2024" },
  { id: "shp_07", name: "WellnessFirst",    category: "Wellness",  city: "Kolkata",   plan: "Basic", offers: 3,  status: "pending", joined: "Mar 2024" },
  { id: "shp_08", name: "Travel Gear Co.", category: "Travel",    city: "Goa",       plan: "Basic", offers: 6,  status: "active",  joined: "Feb 2024" },
];

export const MATCHES = [
  { id: "mtch_001", influencer: "Priya Sharma",  shop: "Zara India",    category: "Fashion", offer: "₹15,000", status: "active",    date: "Apr 01, 2024" },
  { id: "mtch_002", influencer: "Sneha Kapoor",  shop: "Nykaa Beauty",  category: "Beauty",  offer: "₹22,000", status: "active",    date: "Mar 30, 2024" },
  { id: "mtch_003", influencer: "Ankita Joshi",  shop: "FoodBox Co.",   category: "Food",    offer: "₹9,500",  status: "pending",   date: "Mar 29, 2024" },
  { id: "mtch_004", influencer: "Arjun Mehta",   shop: "GymNation",     category: "Fitness", offer: "₹8,000",  status: "pending",   date: "Mar 28, 2024" },
  { id: "mtch_005", influencer: "Rohan Gupta",   shop: "Travel Gear Co.", category: "Travel", offer: "₹12,500", status: "completed", date: "Mar 25, 2024" },
  { id: "mtch_006", influencer: "Meera Pillai",  shop: "WellnessFirst", category: "Wellness", offer: "₹7,000", status: "active",    date: "Mar 24, 2024" },
  { id: "mtch_007", influencer: "Rahul Verma",   shop: "TechBazaar",    category: "Tech",    offer: "₹18,000", status: "pending",   date: "Mar 22, 2024" },
  { id: "mtch_008", influencer: "Priya Sharma",  shop: "Mango Fashion", category: "Fashion", offer: "₹20,000", status: "completed", date: "Mar 20, 2024" },
];

export const OFFERS = [
  { id: "off_01", shop: "Zara India",    title: "Summer Collection Collab", budget: "₹15,000", niche: "Fashion", applicants: 8,  status: "open",   deadline: "Apr 15" },
  { id: "off_02", shop: "Nykaa Beauty",  title: "Skincare Line Launch",     budget: "₹22,000", niche: "Beauty",  applicants: 14, status: "open",   deadline: "Apr 10" },
  { id: "off_03", shop: "FoodBox Co.",   title: "Healthy Meal Promo",       budget: "₹9,500",  niche: "Food",    applicants: 5,  status: "review", deadline: "Apr 08" },
  { id: "off_04", shop: "GymNation",     title: "Fitness Challenge Series", budget: "₹8,000",  niche: "Fitness", applicants: 3,  status: "open",   deadline: "Apr 20" },
  { id: "off_05", shop: "TechBazaar",    title: "Gadget Unboxing Series",   budget: "₹18,000", niche: "Tech",    applicants: 6,  status: "review", deadline: "Apr 12" },
];

export const ACTIVITY = [
  { type: "match",  text: "New match: Priya Sharma ↔ Zara India",           time: "2 min ago" },
  { type: "offer",  text: "Nykaa Beauty posted a new ₹22K offer",           time: "14 min ago" },
  { type: "signup", text: "New shop onboarded: WellnessFirst (Kolkata)",     time: "1 hr ago" },
  { type: "match",  text: "Match completed: Rohan Gupta ↔ Travel Gear Co.", time: "2 hr ago" },
  { type: "flag",   text: "Report flagged: @kabirsingh — under review",      time: "3 hr ago" },
  { type: "signup", text: "New influencer joined: Meera Pillai (Wellness)",  time: "5 hr ago" },
];

export const WEEKLY_MATCHES = [
  { week: "W1", count: 98 },
  { week: "W2", count: 134 },
  { week: "W3", count: 112 },
  { week: "W4", count: 167 },
  { week: "W5", count: 145 },
  { week: "W6", count: 189 },
  { week: "W7", count: 202 },
  { week: "W8", count: 221 },
];