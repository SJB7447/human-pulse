# Human Pulse 💓

**Human Pulse** is a Generative AI-based Interactive News Service designed to help users process the emotional weight of daily news. Instead of passively consuming information, users engage with news stories through interactive narratives, visualize their emotional reactions, and connect with a community of shared feelings.

## Key Features

### 🌟 AI Interactive Stories
- **Dynamic Narratives**: News articles are transformed into interactive text-adventure games using Google Gemini AI.
- **Choice Matters**: Users make decisions that explore different emotional perspectives of the news.
- **Visuals**: AI-generated imagery enhances immersion.

### 🌬️ Mood Ventilation
- **Breathing Sphere**: A globally accessible 3D component (using R3F) that encourages deep breathing and relaxation.
- **Emotional Balance**: Helps users "reset" after consuming heavy news content.

### 💎 Premium Subscription
- **Unlimited Access**: Free users have daily limits; Premium users get unlimited AI story generations.
- **Deep Insights**: Unlock detailed analysis of your emotional trends and receive personalized AI advice.
- **Save & Collect**: Keep a library of your most impactful story playthroughs.

### 🏘️ Community Pulse
- **Shared Emotions**: See what others are feeling about the news in real-time.
- **Opinion Feed**: A "Masonry" style feed displaying user thoughts and reactions.

## Tech Stack

- **Framework**: [Next.js 14+ (App Router)](https://nextjs.org/)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **3D Graphics**: React Three Fiber (R3F), Drei
- **AI**: Google Gemini Pro
- **Database & Auth**: Supabase
- **Payments**: Toss Payments

## Getting Started

### Prerequisites
- Node.js 18+
- A Supabase project
- A Google Gemini API Key
- A Toss Payments account (for testing)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/human-pulse.git
    cd human-pulse
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Duplicate `.env.local.example` to `.env.local` and fill in your keys:
    ```bash
    cp .env.local.example .env.local
    ```
    - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Anon Key
    - `NEXT_PUBLIC_GEMINI_API_KEY`: Google AI Studio Key
    - `NEXT_PUBLIC_TOSS_CLIENT_KEY`: Toss Payments Client Key
    - `TOSS_SECRET_KEY`: Toss Payments Secret Key

4.  **Run Development Server:**
    ```bash
    npm run dev
    ```

5.  **Access the App:**
    Open [http://localhost:3000](http://localhost:3000)

## Deployment

The project is optimized for deployment on [Vercel](https://vercel.com).
1.  Push your code to GitHub.
2.  Import the project in Vercel.
3.  Add the Environment Variables in the Vercel dashboard.
4.  Deploy!

## License

This project is for educational and portfolio purposes.
