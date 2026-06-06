<div align="center">

# 🎓 EduDiscover

### Discover • Compare • Evaluate • Apply

A modern college discovery platform built using Next.js, React, TypeScript, Firebase, Firestore, Tailwind CSS, and Zustand to help students explore, compare, and evaluate colleges across India through a fast and intuitive user experience.

[![Live Demo](https://img.shields.io/badge/Live-Demo-000?style=for-the-badge&logo=vercel&logoColor=white)](https://college-discovery-platform-sable.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](#)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](#)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](#)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](#)

### 🌐 Live Demo

https://college-discovery-platform-sable.vercel.app/

</div>

---

# 📖 Overview

EduDiscover is a full-stack college discovery platform designed to simplify the higher education research process for students.

The platform centralizes information that is typically scattered across multiple college websites and portals. Students can search colleges, compare institutions, explore courses, evaluate placements, save colleges, and participate in community discussions from a single platform.

The project focuses on scalability, performance, accessibility, responsive design, and modern frontend engineering practices.
The platform architecture is designed to support verified college datasets and can be integrated with official education data sources.

---

# 🚀 Features

## 🔍 College Discovery

- Browse colleges across India
- Search colleges by name
- Explore institution details
- Discover colleges by category
- View rankings and ratings

## 🎯 Advanced Filtering

Filter colleges by:

- State
- Category
- College Type
- Entrance Exams
- Tuition Fees
- Ratings
- Rankings

## 🏫 Detailed College Profiles

Every college profile includes:

- College Overview
- Accreditation
- Rankings
- Fee Structure
- Courses Offered
- Eligibility Information
- Facilities
- Placement Statistics
- Student Reviews

## 📊 College Comparison

Compare multiple colleges side-by-side based on:

- Rankings
- Ratings
- Fees
- Placements
- Accreditation
- Courses
- Location

## ❤️ Saved Colleges

Users can:

- Bookmark colleges
- Create shortlists
- Revisit saved institutions

## 💬 Community Discussions

Students can:

- Ask questions
- Participate in discussions
- Share experiences
- Interact with other aspirants

## 🔐 Authentication

Secure authentication powered by Firebase:

- Email Authentication
- Google Authentication
- Persistent User Sessions

## 📈 College Predictor

Predict and explore colleges based on:

- Eligibility
- Preferences
- Academic information

---

# 🏗 System Architecture

```text
User Interface
      │
      ▼
Next.js App Router
      │
      ▼
React Components
      │
      ▼
Zustand State Management
      │
      ▼
Firebase Authentication
      │
      ▼
Firestore Database
      │
      ▼
Vercel Deployment
```

# 🛠 Technology Stack

## Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Backend Services

- Firebase Firestore
- Firebase Authentication

## State Management

- Zustand

## Deployment

- Vercel

## Version Control

- Git
- GitHub

---

# 📂 Project Structure

```bash
app/
│
├── (main)
│   ├── colleges
│   ├── compare
│   ├── discussions
│   ├── predictor
│   └── saved
│
├── auth
│   ├── login
│   └── signup
│
components/
│
├── colleges
├── compare
├── detail
├── layout
└── ui
│
lib/
│
├── firestore
├── firebase
├── store
├── utils
└── data
│
constants/
types/
public/
```

---

# ⚡ Performance & Optimization

The platform incorporates several performance-focused approaches:

- Server Side Rendering (SSR)
- Static Site Generation (SSG)
- Dynamic Routing
- Type-Safe Development
- Reusable Component Architecture
- Optimized Firestore Queries
- Responsive Design
- Efficient State Management
- Lazy Loading Strategies

---

# 📊 Project Highlights

| Feature | Status |
|----------|----------|
| Authentication | ✅ |
| College Discovery | ✅ |
| Search Functionality | ✅ |
| Advanced Filters | ✅ |
| College Profiles | ✅ |
| College Comparison | ✅ |
| Predictor Tool | ✅ |
| Discussion Forum | ✅ |
| Saved Colleges | ✅ |
| Responsive Design | ✅ |
| Firebase Integration | ✅ |
| Production Deployment | ✅ |

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/sejal-Kamble18/college-discovery-platform.git
cd college-discovery-platform
```

## Install Dependencies

```bash
npm install
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## Run Development Server

```bash
npm run dev
```

Visit:

```bash
http://localhost:3000
```

---

# 📦 Production Build

Build the project:

```bash
npm run build
```

Start production server:

```bash
npm start
```

---

# 🎯 Future Enhancements

- AI-Powered College Recommendations
- Scholarship Discovery
- Admission Timeline Tracker
- Real-Time Cutoff Analytics
- Verified Student Reviews
- Placement Analytics Dashboard
- Personalized Recommendation Engine
- College Application Tracking

---

# 👩‍💻 Developer

## Sejal Kamble

---

# ⭐ Support

If you found this project useful:

- Star the repository
- Fork the project
- Share feedback
- Contribute improvements

---

<div align="center">


Empowering students to make smarter college decisions.

</div>
