

---

# 📄 Crispy Duck (wow gemini made this markdown so nice)

A modern Next.js web application designed to digitize, store, and share physical body composition metrics. Inspired by the need to replace easily lost physical paper printouts from NTUC body scan machines, this app transforms paper data into actionable, shareable digital insights.

## ✨ Key Features

* **📷 Intelligent Scanning:** Uses advanced AI to extract data points directly from photos of physical body scan printouts.
* **📊 Interactive Dashboards:** Visualizes your fitness journey and body composition trends over time with beautiful, responsive charts.
* **🔒 Secure Cloud Storage:** Safely stores your historical scan data and profiles.
* **🤝 Easy Sharing:** Seamlessly share your progress and body scan metrics with friends or personal trainers.

---

## 🛠️ Tech Stack

| Layer | Technology Used |
| --- | --- |
| **Framework** | **Next.js** (App Router) |
| **Database & Auth** | **Supabase** |
| **AI / Document Processing** | **Google Cloud Document AI** |
| **Data Visualization** | **Tremor Charts** |
| **Styling & UI Components** | **Tailwind CSS** + **DaisyUI** |

---

## 🚀 Motivation

NTUC body scan machines provide incredibly useful health and fitness data, but they rely heavily on physical paper slips that are easy to lose and impossible to track over the long term. **Crispy Duck Vault** bridges this gap by providing a digital-first home for your fitness metrics, allowing you to track trends, ditch the paper, and keep your community motivated.

---

## 🛠️ Getting Started

### Prerequisites

* Node.js (v18+ recommended)
* A Supabase account
* Google Cloud Console access (with Document AI API enabled)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/Crispy Duck-vault.git
cd Crispy Duck-vault

```


2. Install dependencies:
```bash
npm install

```


3. Set up your environment variables (`.env.local`):
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GOOGLE_DOCUMENT_AI_CREDENTIALS=your_google_creds

```


4. Run the development server:
```bash
npm run dev

```



---

*Feel free to drop a ⭐ if you find this project useful!*
