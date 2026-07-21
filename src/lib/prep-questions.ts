export type PrepQuestion = {
  id: string;
  prompt: string;
  whatTheyWant: string;
  example?: string;
  category: "core" | "logistics" | "bonus";
};

export const PREP_TIPS = [
  "Arrive 10–15 minutes early.",
  "Dress professionally.",
  "Bring copies of your CV.",
  "Maintain eye contact and smile.",
  "Listen carefully before answering.",
  "Use specific examples from your experience.",
  "Keep answers concise (about 1–2 minutes for most questions).",
  "Be honest if you don't know an answer—explain how you would approach finding the solution.",
  "Send a thank-you email within 24 hours after the interview if appropriate.",
] as const;

/** Classic interview questions that cover ~90% of job interviews. */
export const PREP_QUESTIONS: PrepQuestion[] = [
  {
    id: "tell-me-about-yourself",
    category: "core",
    prompt: "Tell me about yourself.",
    whatTheyWant: "A professional summary, not your life story.",
    example:
      "I have over five years of experience in finance and administration. Throughout my career, I've developed strong analytical, communication, and problem-solving skills. I'm passionate about improving processes, working in teams, and delivering quality results. I'm now looking for an opportunity where I can contribute my experience while continuing to grow professionally.",
  },
  {
    id: "why-this-company",
    category: "core",
    prompt: "Why do you want to work for our company?",
    whatTheyWant:
      "Mention the company, their reputation or values, and how your skills match.",
    example:
      "I've researched your company and I'm impressed by your reputation for innovation and employee development. I believe my skills and experience align well with this position, and I'm excited about the opportunity to contribute to your team.",
  },
  {
    id: "why-leaving",
    category: "core",
    prompt: "Why are you leaving your current job?",
    whatTheyWant:
      "Never criticize your previous employer. Focus on growth, challenges, opportunities, relocation, or a contract ending.",
    example:
      "I'm grateful for everything I've learned in my current role, but I'm looking for new challenges that will allow me to develop my skills further.",
  },
  {
    id: "strengths",
    category: "core",
    prompt: "What are your strengths?",
    whatTheyWant: "Choose strengths relevant to the job and back them with examples.",
    example:
      "One of my greatest strengths is my attention to detail. I always ensure my work is accurate and complete, which has helped reduce errors and improve efficiency.",
  },
  {
    id: "weakness",
    category: "core",
    prompt: "What is your biggest weakness?",
    whatTheyWant: "Mention a real weakness and explain how you're improving it.",
    example:
      "Earlier in my career I found it difficult to delegate tasks because I wanted everything done perfectly. I've since learned to trust my team and communicate expectations clearly.",
  },
  {
    id: "difficult-situation",
    category: "core",
    prompt: "Tell us about a difficult situation you handled.",
    whatTheyWant:
      "Use the STAR method: Situation, Task, Action, Result.",
    example:
      "A project was behind schedule due to supplier delays. I coordinated with stakeholders, found alternative suppliers, and adjusted timelines. We completed the project only one week behind schedule instead of one month.",
  },
  {
    id: "why-hire-you",
    category: "core",
    prompt: "Why should we hire you?",
    whatTheyWant:
      "Connect your qualifications, experience, and attitude to what the role needs.",
    example:
      "I have the qualifications, experience, and attitude you're looking for. I learn quickly, work well under pressure, and I'm committed to producing high-quality work. I believe I can make a positive contribution from day one.",
  },
  {
    id: "five-years",
    category: "core",
    prompt: "Where do you see yourself in five years?",
    whatTheyWant:
      "Show ambition aligned with growing inside the organisation.",
    example:
      "I'd like to have grown within the organisation, taken on greater responsibilities, and become someone the company can rely on for leadership and results.",
  },
  {
    id: "pressure",
    category: "core",
    prompt: "How do you handle pressure?",
    whatTheyWant:
      "Show organisation, prioritisation, and a solution-focused mindset.",
    example:
      "I stay organised, prioritise my workload, and focus on finding solutions rather than becoming overwhelmed. Pressure often motivates me to perform at my best.",
  },
  {
    id: "teamwork",
    category: "core",
    prompt: "Describe your teamwork experience.",
    whatTheyWant:
      "Show collaboration, communication, and respect for colleagues.",
    example:
      "I enjoy working with diverse teams, sharing ideas, and supporting colleagues. I believe strong communication and respect are essential for achieving team goals.",
  },
  {
    id: "conflict",
    category: "core",
    prompt: "Describe a conflict with a colleague.",
    whatTheyWant:
      "Listen, stay professional, and focus on solutions—not blame.",
    example:
      "I listened to their perspective, discussed the issue professionally, and focused on finding a solution rather than assigning blame. We resolved the misunderstanding and continued working effectively together.",
  },
  {
    id: "motivation",
    category: "core",
    prompt: "What motivates you?",
    whatTheyWant:
      "Be specific: solving problems, helping customers, learning, achieving targets, or making an impact.",
  },
  {
    id: "salary",
    category: "logistics",
    prompt: "What are your salary expectations?",
    whatTheyWant:
      "Stay flexible; give a researched range if pressed, and discuss the full package.",
    example:
      "I'm flexible and primarily interested in finding the right opportunity. Based on my experience and the responsibilities of the role, I'd expect a salary that's competitive and in line with the market. I'd be happy to discuss the overall compensation package.",
  },
  {
    id: "relocate",
    category: "logistics",
    prompt: "Are you willing to relocate?",
    whatTheyWant: "Answer honestly.",
  },
  {
    id: "overtime",
    category: "logistics",
    prompt: "Are you willing to work overtime?",
    whatTheyWant: "Show willingness when business needs require it.",
    example:
      "Yes, when business needs require it, I'm willing to work additional hours to ensure deadlines and objectives are met.",
  },
  {
    id: "company-knowledge",
    category: "core",
    prompt: "What do you know about our company?",
    whatTheyWant:
      "Show research: website, mission, products/services, recent news, and the role.",
  },
  {
    id: "questions-for-us",
    category: "core",
    prompt: "Do you have any questions for us?",
    whatTheyWant: "Always ask at least one thoughtful question.",
    example:
      "What does success look like in this role during the first six months? What are the biggest challenges someone in this position will face?",
  },
  {
    id: "vs-others",
    category: "bonus",
    prompt: "Why should we choose you over other candidates?",
    whatTheyWant: "Differentiate with specific strengths and fit.",
  },
  {
    id: "proud-achievement",
    category: "bonus",
    prompt: "What achievement are you most proud of?",
    whatTheyWant: "A concrete result with your role in it.",
  },
  {
    id: "mistake",
    category: "bonus",
    prompt: "Tell me about a time you made a mistake.",
    whatTheyWant: "Ownership, learning, and what you changed afterward.",
  },
  {
    id: "prioritise",
    category: "bonus",
    prompt: "How do you prioritise your work?",
    whatTheyWant: "Clear method for urgency vs importance.",
  },
  {
    id: "multiple-deadlines",
    category: "bonus",
    prompt: "How do you manage multiple deadlines?",
    whatTheyWant: "Planning, communication, and trade-offs.",
  },
  {
    id: "leadership",
    category: "bonus",
    prompt: "Describe your leadership style.",
    whatTheyWant: "How you guide others and deliver results.",
  },
  {
    id: "manager-say",
    category: "bonus",
    prompt: "What would your previous manager say about you?",
    whatTheyWant: "Honest strengths others would recognise.",
  },
  {
    id: "career-goals",
    category: "bonus",
    prompt: "What are your career goals?",
    whatTheyWant: "Direction that fits this role and company.",
  },
  {
    id: "exceeded",
    category: "bonus",
    prompt: "Tell me about a time you exceeded expectations.",
    whatTheyWant: "STAR story with a measurable outcome.",
  },
  {
    id: "difficult-customers",
    category: "bonus",
    prompt: "How do you deal with difficult customers or clients?",
    whatTheyWant: "Empathy, calm problem-solving, and resolution.",
  },
  {
    id: "organised",
    category: "bonus",
    prompt: "How do you stay organised?",
    whatTheyWant: "Practical systems you actually use.",
  },
  {
    id: "when-start",
    category: "logistics",
    prompt: "When can you start?",
    whatTheyWant: "A realistic availability answer.",
  },
];

export function formatQuestionBankForInterviewer(): string {
  const core = PREP_QUESTIONS.filter((q) => q.category === "core")
    .map((q, i) => `${i + 1}. ${q.prompt}`)
    .join("\n");
  const logistics = PREP_QUESTIONS.filter((q) => q.category === "logistics")
    .map((q) => `- ${q.prompt}`)
    .join("\n");
  const bonus = PREP_QUESTIONS.filter((q) => q.category === "bonus")
    .map((q) => `- ${q.prompt}`)
    .join("\n");

  return [
    "Core questions to cover (adapt wording to the target role):",
    core,
    "",
    "Logistics questions (ask if time allows or naturally comes up):",
    logistics,
    "",
    "Bonus themes (use for follow-ups or longer sessions):",
    bonus,
  ].join("\n");
}
