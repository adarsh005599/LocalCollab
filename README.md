# 🤝 LocalCollab

**LocalCollab** is an AI-powered marketplace that connects **local businesses** with **micro-influencers** — making influencer marketing affordable, transparent, and hyper-local.

---

## 🌟 What Is This Project?

Many small businesses (restaurants, boutiques, gyms, salons, etc.) want to promote themselves through social media influencers but can't afford large agencies or celebrity influencers. On the other side, thousands of micro-influencers with engaged local audiences struggle to find paid collaboration opportunities.

**LocalCollab solves this problem** by acting as a two-sided marketplace where:
- 🏪 **Businesses** can register, set a marketing budget, and get matched with ideal influencers in their city.
- 📸 **Influencers** can list their profile, set their price per post, and discover collaboration opportunities from nearby businesses.

---

## ✨ Key Features

### For Businesses (Shops)
- ✅ Register and create a business profile
- 🔍 Search & filter influencers by **city, category, budget, and engagement rate**
- 🤖 **AI Matching** — Get a ranked list of influencers with a match score (0–100%) based on:
  - 📍 Location proximity (same area = higher score)
  - 💰 Budget compatibility
  - 🎯 Category relevance
  - 📊 Influencer engagement rate
  - ✔️ Verified profile bonus
- 💬 **Direct Messaging** — Chat with influencers directly within the platform
- 📋 **Collaboration Tracking** — View pending, accepted, and completed deals

### For Influencers
- ✅ Register and build your influencer profile (followers, avg. likes, price per post, bio)
- 📈 Auto-calculated **Engagement Rate** (`avgLikes / followers × 100`)
- 🏢 Browse and discover **Opportunities** (shops looking for influencers)
- 💬 **Direct Messaging** with interested businesses
- 🖊️ Edit your profile anytime

### Platform-Wide
- 🔐 User Authentication (Login / Sign Up) with role-based access (`shop` or `influencer`)
- 🏷️ Category support: Food, Fashion, Fitness, Beauty, Technology, Travel, Lifestyle
- 🌆 City support: Delhi, Mumbai, Bangalore, Hyderabad, Pune, Chennai

---

## 🧠 AI Matching Algorithm

The matching engine (`lib/matching.js`) scores every influencer-business pair on 4 weighted dimensions:

| Factor           | Weight | Details                                         |
|------------------|--------|-------------------------------------------------|
| 📍 Location       | 30%    | Same area = 30pts, Same city = 20pts, Other = 5pts |
| 💰 Budget         | 30%    | Price per post vs. business's marketing budget  |
| 🎯 Category       | 20%    | Exact match = 20pts, Related = 10pts            |
| 📊 Engagement     | 20%    | ≥7% = Excellent, ≥5% = Good, ≥3% = Average     |
| ✔️ Verified Bonus | +5pts  | Extra points for verified influencer profiles   |

Final score is normalized to **0–100%**.

---

## 🛠️ Tech Stack

| Technology       | Purpose                          |
|------------------|----------------------------------|
| **Next.js 14**   | React framework with App Router  |
| **React 18**     | UI component library             |
| **Tailwind CSS** | Utility-first styling            |
| **Lucide React** | Icon library                     |
| **localStorage** | Client-side data persistence     |

> 📝 This version uses `localStorage` for data storage (no backend/database required to run). It's demo-ready out of the box.

---

## 📁 Project Structure

```
NOX/
├── app/
│   ├── page.js                   # Landing / Home page
│   ├── layout.js                 # Root layout
│   ├── globals.css               # Global styles
│   ├── login/                    # Login page
│   ├── signup/                   # Sign up page (role selection)
│   ├── influencer/
│   │   ├── dashboard/            # Influencer dashboard
│   │   ├── profile/              # Influencer profile editor
│   │   ├── opportunities/        # Browse shops/opportunities
│   │   └── messages/             # Messaging system
│   └── shop/
│       ├── dashboard/            # Shop dashboard
│       ├── profile/              # Shop profile editor
│       ├── search/               # Search & filter influencers
│       └── messages/             # Messaging system
└── lib/
    ├── matching.js               # AI matching algorithm
    ├── mockData.js               # Seed data (15 influencers, 8 shops)
    ├── storage.js                # localStorage abstraction layer
    ├── initData.js               # App data initialization
    └── utils.js                  # Helpers (currency, formatting, etc.)
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18 or higher
- npm

### Installation

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd NOX

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be running at **http://localhost:3000**

### Available Scripts

| Command         | Description                      |
|-----------------|----------------------------------|
| `npm run dev`   | Start dev server (with hot reload) |
| `npm run build` | Build for production             |
| `npm run start` | Start production server          |
| `npm run lint`  | Run ESLint                       |

---

## 🗺️ App Flow

```
Landing Page (/)
    ├── Sign Up as Business  →  Shop Profile Setup  →  Shop Dashboard
    │                                                      ├── Search Influencers (AI Matched)
    │                                                      ├── Messages
    │                                                      └── Manage Profile
    │
    └── Sign Up as Influencer  →  Influencer Profile Setup  →  Influencer Dashboard
                                                                   ├── Browse Opportunities
                                                                   ├── Messages
                                                                   └── Manage Profile
```

---

## 📊 Demo Data

The app comes pre-loaded with realistic seed data:
- **15 influencers** across Delhi, Mumbai, Bangalore, Hyderabad, Pune, and Chennai
- **8 businesses** across the same cities
- **3 sample collaborations** (pending, accepted, completed)
- **Sample messages** between users

---

## 📄 License

This project is private and intended for portfolio/learning purposes.

---

*Built with ❤️ using Next.js — LocalCollab © 2024*
