export const profile = {
  name: "Aarav Mehta",
  username: "demo-student",
  headline: "B.Com student exploring digital marketing, analytics, and brand strategy",
  bio: "I enjoy turning messy student problems into structured projects, campaigns, and measurable outcomes. My work combines business thinking, creative storytelling, and practical execution.",
  careerGoal: "To start as a marketing analyst and grow into a brand strategy role.",
  location: "Mumbai, India",
  email: "aarav@example.com",
  linkedinUrl: "https://linkedin.com",
  githubUrl: "https://github.com",
  portfolioUrl: "https://example.com",
  completion: 78,
};

export const education = [
  {
    institutionName: "Mumbai University",
    degree: "Bachelor of Commerce",
    fieldOfStudy: "Commerce and Marketing",
    startYear: 2023,
    endYear: 2026,
    grade: "8.2 CGPA",
    description: "Focused on consumer behavior, business communication, and practical market research.",
  },
  {
    institutionName: "St. Xavier's Junior College",
    degree: "Higher Secondary Certificate",
    fieldOfStudy: "Commerce",
    startYear: 2021,
    endYear: 2023,
    grade: "86%",
    description: "Led class presentation activities and participated in commerce club events.",
  },
];

export const achievements = [
  {
    title: "Built a campus survey that improved event attendance",
    category: "Leadership",
    problem: "Student events had low attendance because topics were selected without understanding what students wanted.",
    thinking:
      "I separated the issue into interest, timing, communication, and trust. Then I created a short survey that students could complete in under two minutes.",
    execution:
      "Collected 180 responses, grouped preferences, redesigned the event theme, and coordinated WhatsApp reminders with class representatives.",
    result: "Attendance increased from 70 to 142 students in the next event.",
    metrics: "103% attendance growth",
    learning: "Students respond better when they feel the event was designed with their input.",
    skills: ["Research", "Communication", "Leadership"],
    proofLink: "https://example.com/survey-proof",
  },
  {
    title: "Created a budget tracker for classmates",
    category: "Project",
    problem: "Many students could not understand where their monthly allowance was going.",
    thinking:
      "Instead of building a complex app, I focused on the three questions students actually ask: where did I spend, what is left, and what can I reduce?",
    execution:
      "Designed a spreadsheet tracker with categories, charts, and weekly summaries. Shared it with friends and improved it from their feedback.",
    result: "Used by 24 classmates, with several reporting better weekly spending control.",
    metrics: "24 active users",
    learning: "Simple tools are adopted faster when they fit daily habits.",
    skills: ["Excel", "Problem Solving", "Data Visualization"],
    proofLink: "https://example.com/budget-tracker",
  },
  {
    title: "Won second place in a brand pitch competition",
    category: "Competition",
    problem: "The challenge was to reposition a local snack brand for college students.",
    thinking:
      "I studied how students choose snacks between lectures and built the pitch around convenience, price, and social sharing.",
    execution:
      "Prepared the positioning, sample campaign, pricing logic, and five-slide pitch deck with a small team.",
    result: "Secured second place among 18 teams.",
    metrics: "2nd place / 18 teams",
    learning: "A pitch works better when insight, message, and execution feel connected.",
    skills: ["Brand Strategy", "Presentation", "Teamwork"],
    proofLink: "https://example.com/pitch-proof",
  },
];

export const projects = [
  {
    title: "Student Budget Tracker",
    description: "A spreadsheet-based tracker that helps students monitor daily spending and weekly balance.",
    problemSolved: "Students needed a simple way to understand spending patterns.",
    tools: ["Excel", "Charts", "Google Sheets"],
    githubLink: "",
    demoLink: "https://example.com/budget-tracker",
    outcome: "Used by 24 classmates and improved after three feedback rounds.",
  },
  {
    title: "Local Cafe Social Audit",
    description: "A practical audit of a cafe's Instagram presence, content gaps, and student customer opportunities.",
    problemSolved: "The cafe had reach but low engagement from nearby college students.",
    tools: ["Instagram Analytics", "Canva", "Research"],
    githubLink: "",
    demoLink: "https://example.com/cafe-audit",
    outcome: "Created a 30-day content plan and student offer strategy.",
  },
];

export const skills = [
  { name: "Market Research", level: "Advanced", proof: "Survey achievement" },
  { name: "Excel", level: "Advanced", proof: "Budget tracker" },
  { name: "Presentation", level: "Intermediate", proof: "Brand pitch" },
  { name: "Canva", level: "Intermediate", proof: "Cafe social audit" },
  { name: "Communication", level: "Advanced", proof: "Campus event work" },
];

export const stats = {
  achievements: achievements.length,
  projects: projects.length,
  skills: skills.length,
  views: 184,
};

export const categories = [
  "Academic",
  "Project",
  "Competition",
  "Internship",
  "Leadership",
  "Volunteering",
  "Innovation",
  "Personal Growth",
];
