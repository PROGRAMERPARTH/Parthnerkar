# Portfolio Builder

A dynamic, interactive, and customizable professional portfolio built for AI & Data Science professionals. This application allows you to showcase your experience, generate PDF resumes on the fly, and seamlessly manage your projects, skills, and certifications directly from the UI.

## 🚀 Features

- **Dynamic Resume Generation**: Instantly generate and download a perfectly formatted PDF resume containing your latest skills and experiences using `html2pdf.js`.
- **Interactive Management**: Add, edit, or delete items in your Skills, Projects, and Certificates tabs on the fly.
- **Admin Password Authentication**: Protects the application's edit capabilities. Attempting to modify or add any data prompts a secure admin password gateway.
- **Dark/Light Mode**: Full theming support explicitly tailored to feel highly modern and premium.
- **Dynamic Animations**: Smooth, beautiful page transitions and scroll animations powered by Framer Motion.
- **Searchable Portfolios**: A built-in search functionality instantly filters your displayed projects based on tech stack or title.

## 🛠️ Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: React Icons (Ionicons)
- **PDF Generation**: html2pdf.js
- **State Management**: React Context API & `localStorage` persistence.

## ⚙️ Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/PROGRAMERPARTH/MainPortfolioWebsite.git
   cd MainPortfolioWebsite
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Configure your Environment Variables:
   Create a `.env` file in the root of the project with the following (you can also modify the existing `.env`):
   ```env
   VITE_APP_TITLE=Portfolio Builder
   VITE_APP_URL=http://localhost:5173
   
   # Admin Authentication Password (kept on the server, never in the client bundle)
   ADMIN_PASSWORD=use-a-strong-unique-password
   ```

4. Start the development server (frontend and API together):
   ```bash
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser. For a production-like run, use `npm run serve` and open [http://localhost:3000](http://localhost:3000).

## 🔒 Security
Editing actions are protected by a server-side, HTTP-only session. Set `ADMIN_PASSWORD` in the server environment; do not expose an admin secret through a `VITE_` variable. The server accepts an existing `VITE_ADMIN_PASSWORD` only as a backwards-compatible fallback, but new deployments should migrate to `ADMIN_PASSWORD`.

## 📄 License
This project is open-source and available under the MIT License.
