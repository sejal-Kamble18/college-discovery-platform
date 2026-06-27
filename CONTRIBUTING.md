# 🤝 Contributing to College Discovery Platform

Welcome! Thank you for your interest in contributing to the **College Discovery Platform**. Whether you're fixing bugs, improving documentation, enhancing the UI, or adding new features, your contribution is appreciated.

Please read this guide before getting started.

---

# 📋 Prerequisites

Before you begin, make sure you have the following installed:

- Git
- Node.js (v18 or later)
- npm
- VS Code (Recommended)
- GitHub Account
- Firebase Account (for local development only)

---

# 🍴 Step 1: Fork the Repository

Click the **Fork** button in the top-right corner of this repository.

This creates your own copy of the project under your GitHub account.

---

# 📥 Step 2: Clone Your Fork

Replace `<your-github-username>` with your GitHub username.

```bash
git clone https://github.com/<your-github-username>/college-discovery-platform.git
```

Move into the project directory.

```bash
cd college-discovery-platform
```

---

# 🔗 Step 3: Add the Original Repository as Upstream

This allows you to keep your fork updated.

```bash
git remote add upstream https://github.com/sejal-Kamble18/college-discovery-platform.git
```

Verify:

```bash
git remote -v
```

You should see both **origin** and **upstream**.

---

# 📦 Step 4: Install Dependencies

```bash
npm install
```

---

# 🔥 Step 5: Set Up Firebase

This project uses **Firebase Authentication** and **Cloud Firestore**.

For security reasons, contributors **must create their own Firebase project** for local development.

### Create a Firebase Project

1. Visit https://console.firebase.google.com/
2. Create a new Firebase project.
3. Register a **Web App**.
4. Enable **Authentication**.
5. Create a **Cloud Firestore** database.
6. Go to **Project Settings → General → Your Apps**.
7. Copy your Firebase configuration.

> **Why create your own Firebase project?**
>
> Contributors should never have access to the maintainer's production Firebase project.
> Using your own Firebase project keeps production data safe while allowing you to develop and test locally.

---

# 🔐 Step 6: Create Environment Variables

Create a file named:

```text
.env.local
```

inside the project root.

Add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_PROJECT.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_PROJECT.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
```

> **Important**
>
> - Never commit `.env.local`
> - Never share Firebase credentials
> - `.env.local` is already ignored by `.gitignore`

---

# ▶️ Step 7: Run the Project

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 🐞 Step 8: Find or Create an Issue

Before starting work:

- Check if an issue already exists.
- Comment on the issue to let others know you're working on it.
- If no issue exists, create one first.

---

# 🌿 Step 9: Create a New Branch

Always create a new branch before making changes.

```bash
git checkout -b feature/your-feature-name
```

Examples:

```bash
git checkout -b fix/navbar-ui
```

```bash
git checkout -b feature/add-college-filter
```

```bash
git checkout -b docs/update-readme
```

---

# 💻 Step 10: Make Your Changes

Please:

- Keep changes focused on one issue.
- Follow the existing project structure.
- Write clean, readable code.
- Avoid unnecessary formatting changes.

---

# ✅ Step 11: Test Your Changes

Before committing:

- Run the project successfully.
- Verify your feature works.
- Ensure there are no console errors.
- Confirm existing functionality is not broken.

---

# 💾 Step 12: Commit Your Changes

Stage your files.

```bash
git add .
```

Commit using a meaningful message.

```bash
git commit -m "feat: add college search filter"
```

Recommended commit prefixes:

- feat
- fix
- docs
- refactor
- style
- chore

---

# 🚀 Step 13: Push Your Branch

```bash
git push origin feature/your-feature-name
```

---

# 🔀 Step 14: Create a Pull Request

Go to your fork on GitHub.

Click **Compare & Pull Request**.

Your Pull Request should include:

- Clear title
- Description of changes
- Screenshots (if UI changes)
- Related Issue

Example:

```text
Closes #12
```

---

# 🤖 Pull Request Review

Every Pull Request is reviewed before merging.

This repository uses **CodeRabbit** for automated AI code reviews.

Please resolve important CodeRabbit suggestions before requesting a maintainer review.

Maintainers may request additional changes before approving a Pull Request.

---

# 📌 Contribution Guidelines

- One feature or bug fix per Pull Request.
- Keep Pull Requests focused and small.
- Follow the existing folder structure.
- Write meaningful commit messages.
- Update documentation if required.
- Do **not** commit:
  - `.env.local`
  - API keys
  - Firebase credentials
  - Secrets
  - Build files

---

# 🐛 Reporting Bugs

When creating a bug report, include:

- Description
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)

---

# 💡 Suggesting Features

Before creating a feature request:

- Search existing Issues.
- Explain the problem.
- Describe your proposed solution.
- Add mockups if applicable.

---

# ❤️ Thank You

Thank you for contributing to the **College Discovery Platform**.

Every contribution helps make the project better for everyone.

Happy Coding! 🚀