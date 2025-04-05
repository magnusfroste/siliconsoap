

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
