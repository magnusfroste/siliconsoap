
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/5e4ce2a1-1193-492c-b8df-1a7d6fe9df28

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/5e4ce2a1-1193-492c-b8df-1a7d6fe9df28) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Airtable Setup Instructions

To correctly set up your Airtable for this portfolio application, follow these steps:

1. Create an Airtable account if you don't have one
2. Create a new base (or use an existing one)
3. Create a table called "Projects" with the following fields:
   - **title** (Single line text)
   - **description** (Long text)
   - **image** (Attachment)
   - **demoLink** (URL)
   - **order** (Number) - Used to customize the display order of projects

4. Create a table called "Messages" with the following fields:
   - **Name** (Single line text)
   - **Email** (Email)
   - **Message** (Long text)
   - **Date** (Date/Time)

5. Create a table called "Expertise" with the following fields:
   - **title** (Single line text)
   - **description** (Long text)
   - **icon** (Single line text - must be one of: Lightbulb, Building, LineChart, Rocket, Layers, Users)

6. Create a table called "AboutMe" with the following fields:
   - **name** (Single line text) - Your full name
   - **introText** (Long text)
   - **additionalText** (Long text)
   - **skill1Title** (Single line text)
   - **skill1Description** (Long text)
   - **skill1Icon** (Single line text - must be one of: Monitor, Rocket, Brain, Lightbulb, Building, LineChart, Layers, Users)
   - **skill2Title** (Single line text)
   - **skill2Description** (Long text)
   - **skill2Icon** (Single line text - must be one of: Monitor, Rocket, Brain, Lightbulb, Building, LineChart, Layers, Users)
   - **skill3Title** (Single line text)
   - **skill3Description** (Long text)
   - **skill3Icon** (Single line text - must be one of: Monitor, Rocket, Brain, Lightbulb, Building, LineChart, Layers, Users)

7. Create a table called "FeaturedIn" with the following fields:
   - **title** (Single line text)
   - **description** (Long text)
   - **image** (Attachment)

8. Create a table called "Hero" with the following fields:
   - **name** (Single line text) - Your full name
   - **tagline** (Single line text) - Your professional tagline
   - **feature1** (Single line text) - First feature title
   - **feature1Icon** (Single line text) - Icon for first feature (must be one of: Rocket, BarChart, Brain, Lightbulb, Building, LineChart, Layers, Users)
   - **feature2** (Single line text) - Second feature title
   - **feature2Icon** (Single line text) - Icon for second feature
   - **feature3** (Single line text) - Third feature title
   - **feature3Icon** (Single line text) - Icon for third feature

9. Create a table called "Statistics" with the following fields:
   - **Type** (Single line text) - Event type ("page_visit" or "demo_click")
   - **Page** (Single line text) - The page that was visited
   - **Project** (Single line text) - The project title for demo clicks
   - **Timestamp** (Date/Time) - When the event occurred
   - **UserAgent** (Long text) - The user's browser information
   - **Referrer** (Single line text) - Where the visitor came from

10. Create a Personal Access Token (PAT):
    - Go to your Airtable account settings
    - Navigate to "Developer Hub" or "Personal Access Tokens"
    - Create a new token with appropriate scopes (data.records:read and data.records:write)
    - Copy the token (it starts with "pat...")

11. Get your Base ID from the URL when viewing your base (it starts with "app...")

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/5e4ce2a1-1193-492c-b8df-1a7d6fe9df28) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
