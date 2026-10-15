import type { IconName } from '../components/common/IconGlyph'

export interface RoleData {
  title: string
  description: string
  icon: IconName
  features: string[]
  href: string
  color: 'violet' | 'green' | 'blue'
}

export interface FeatureData {
  title: string
  description: string
  icon: IconName
  tags: string[]
  number: string
}

export interface EvaluationData {
  title: string
  score: string
  metric: string
  value: number
  icon: IconName
  color: 'violet' | 'green' | 'blue'
}

export interface StatData {
  label: string
  value: string
  status: string
  icon: IconName
  color: 'violet' | 'green' | 'blue' | 'orange'
}

export interface FaqData {
  question: string
  answer: string
}

export interface JourneyStageData {
  label: string
  description: string
  icon: IconName
  items: string[]
}

export interface PlatformModuleData {
  title: string
  description: string
  details: string[]
  icon: IconName
  number: string
  tone: 'blue' | 'magenta' | 'neutral'
}

export type PlatformRole = 'Organization' | 'Admin' | 'Student'

export interface RolePreviewData {
  summary: string
  highlights: string[]
  stats: { label: string; value: string; change: string }[]
}

export interface ProductSlideData {
  title: string
  description: string
  visual: 'student' | 'coding' | 'lsrw' | 'analytics' | 'placement' | 'learning' | 'assessment' | 'portfolio' | 'leaderboard'
  metric: string
  metricLabel: string
}

export type EvaluationMode = 'Speaking' | 'Writing' | 'Coding'

export interface EvaluationModeData {
  title: EvaluationMode
  subtitle: string
  score: string
  icon: IconName
  details: { label: string; value: string; progress: number }[]
}

export type AnalyticsView = 'Students' | 'Departments' | 'Assessments' | 'Placement'

export const navigationItems = [
  { label: 'Home', href: '#home' },
  { label: 'Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
]

export const roleCards: RoleData[] = [
  {
    title: 'Organization',
    description: 'Manage institutions, departments, users, academic operations, and placement intelligence from one ecosystem.',
    icon: 'groups',
    features: ['Institution Management', 'Department Analytics', 'Placement Insights'],
    href: '#platform',
    color: 'violet',
  },
  {
    title: 'Admin',
    description: 'Create assessments, manage learning content, monitor students, and access powerful academic analytics.',
    icon: 'school',
    features: ['LMS & Assessments', 'Coding & LSRW', 'Reports & Analytics'],
    href: '#features',
    color: 'green',
  },
  {
    title: 'Student',
    description: 'Learn, practice, assess, code, improve communication, and track your placement readiness.',
    icon: 'person',
    features: ['Coding Lab', 'LSRW Lab', 'Portfolio & Leaderboard'],
    href: '#analytics',
    color: 'blue',
  },
]

export const featureCards: FeatureData[] = [
  {
    title: 'Learning Management',
    description: 'Empower faculty to host study guides, syllabus documents, assignments, and lesson plans. Track class attendance and assignment progress in real time.',
    icon: 'book',
    tags: ['Syllabus Hosting', 'Assignments', 'Attendance Tracker'],
    number: '01',
  },
  {
    title: 'Coding Sandbox',
    description: 'Assess coding capability in a high-performance environment with live compilation, sandbox validation, and custom test cases.',
    icon: 'code',
    tags: ['Real-time Compiler', 'Sandbox Validation', 'Custom Test Cases'],
    number: '02',
  },
  {
    title: 'AI Language Assessment',
    description: 'Automated speech evaluation and essay analysis measure grammatical precision, speaking fluency, and written coherence.',
    icon: 'language',
    tags: ['Speech Evaluation', 'Essay Analysis', 'Grammar & Fluency'],
    number: '03',
  },
  {
    title: 'Predictive Analytics & Placement',
    description: 'Monitor test performance, average marks, department outcomes, and placement readiness through interactive dashboards.',
    icon: 'analytics',
    tags: ['Dynamic Charts', 'Placement Dashboards', 'Gradebooks'],
    number: '04',
  },
]

export const assessmentIntegrations = [
  { name: 'Gemini / Groq', detail: 'AI-powered processing' },
  { name: 'JDoodle', detail: 'Coding execution' },
  { name: 'Cloudinary', detail: 'Audio response storage' },
]

export const evaluationFlows = [
  { name: 'Speaking', steps: ['Audio response', 'AI transcription', 'Language analysis', 'Score + feedback'] },
  { name: 'Writing', steps: ['Text response', 'Text analysis', 'Grammar + coherence', 'Feedback'] },
  { name: 'Coding', steps: ['Code submission', 'Code execution', 'Test validation', 'Score'] },
]

export const heroEcosystemModules = [
  { label: 'LMS', icon: 'book' },
  { label: 'Assessment', icon: 'check' },
  { label: 'Coding', icon: 'code' },
  { label: 'AI LSRW', icon: 'language' },
  { label: 'Analytics', icon: 'analytics' },
  { label: 'Placement', icon: 'work' },
] as const

export const heroStats = [
  { value: '87%', label: 'AI LSRW Score' },
  { value: '92%', label: 'Coding Progress' },
  { value: '78%', label: 'Placement Readiness' },
  { value: '#4', label: 'Department Leaderboard' },
]

export const evaluationCards: EvaluationData[] = [
  { title: 'Speaking', score: '9.2/10', metric: 'Fluency', value: 92, icon: 'language', color: 'violet' },
  { title: 'Writing', score: '8.5/10', metric: 'Grammar', value: 85, icon: 'book', color: 'green' },
  { title: 'Coding', score: '10/10', metric: 'Code Execution', value: 100, icon: 'code', color: 'blue' },
]

export const dashboardStats: StatData[] = [
  { label: 'Coding Progress', value: '92%', status: 'Excellent', icon: 'code', color: 'violet' },
  { label: 'AI LSRW Score', value: '87%', status: 'Very Good', icon: 'language', color: 'green' },
  { label: 'Leaderboard', value: '#4', status: 'In Dept', icon: 'trend', color: 'orange' },
  { label: 'Placement Readiness', value: '78%', status: 'On Track', icon: 'work', color: 'blue' },
]

export const dashboardModules = [
  'Assessments', 'Coding Lab', 'LSRW Lab', 'Games', 'Portfolio', 'Schedule', 'Leaderboard', 'Messages',
]

export const studentStats = [
  { label: 'Overall Score', value: '87%', note: '+4.2%' },
  { label: 'Tests Completed', value: '12 / 15', note: '3 remaining' },
  { label: 'Coding Score', value: '92%', note: 'Top 5%' },
  { label: 'Daily Streak', value: '08 Days', note: 'Active' },
]

export const upcomingAssessments = [
  { title: 'DSA Assessment', date: 'Tomorrow', time: '10:00 AM', color: 'violet' },
  { title: 'LSRW – Speaking', date: '14 Aug', time: '02:00 PM', color: 'green' },
  { title: 'Aptitude Test', date: '18 Aug', time: '11:30 AM', color: 'orange' },
]

export const comparisonData = {
  traditional: {
    title: 'Traditional approach',
    items: [
      'Multiple portals and log-ins',
      'Separate LMS, coding and communication tools',
      'Manual evaluation and disconnected results',
      'Static reports with limited insight',
      'Placement preparation outside academic workflows',
    ],
  },
  skiteup: {
    title: 'The SkiteUp ecosystem',
    items: [
      'One platform for the full student journey',
      'Integrated learning, assessment and coding',
      'AI evaluation across language and code',
      'Real-time analytics and placement intelligence',
      'Connected progress from classroom to career',
    ],
  },
}

export const trustAudiences = [
  { label: 'Organizations', icon: 'groups' },
  { label: 'Administrators', icon: 'school' },
  { label: 'Faculty', icon: 'person' },
  { label: 'Students', icon: 'person' },
  { label: 'Placement Teams', icon: 'work' },
] as const

export const comparisonTools = [
  { label: 'LMS', icon: 'book' },
  { label: 'Assessment', icon: 'check' },
  { label: 'Coding', icon: 'code' },
  { label: 'Communication', icon: 'language' },
  { label: 'Analytics', icon: 'analytics' },
  { label: 'Placement', icon: 'work' },
] as const

export const faqItems: FaqData[] = [
  {
    question: 'What programming languages are supported?',
    answer: 'Students can practice and complete assessments in a broad range of popular languages through the online coding sandbox. Available languages can be configured for each assessment.',
  },
  {
    question: 'How does the AI Speaking evaluation work?',
    answer: 'Students submit an audio response that is transcribed and evaluated for fluency, pronunciation, grammar, and coherence, with clear feedback to guide improvement.',
  },
  {
    question: 'Can institutions enable or disable modules?',
    answer: 'Yes. Institutions can enable the modules that fit their programs, with role-based access for organizations, administrators, faculty, and students.',
  },
  {
    question: 'Does SkiteUp provide anti-cheat capabilities?',
    answer: 'Assessment telemetry helps administrators monitor test activity and review relevant signals alongside assessment results.',
  },
  {
    question: 'How does the coding sandbox work?',
    answer: 'Students write code in a browser-based editor, select a supported language, run it against test cases and receive automated evaluation without a local development setup.',
  },
  {
    question: 'Does SkiteUp provide analytics?',
    answer: 'Yes. Organizations and administrators can review student and department performance, assessment results, coding and LSRW progress, attendance, historical trends and skill gaps.',
  },
  {
    question: 'Does SkiteUp support placement readiness tracking?',
    answer: 'Placement readiness brings academic, coding, communication and assessment performance together to help institutions follow student progress toward industry readiness.',
  },
]

export const footerLinks = [
  { label: 'Platform', href: '#platform' },
  { label: 'Features', href: '#features' },
  { label: 'Solutions', href: '#solutions' },
  { label: 'Login', href: '/login' },
]

export const studentJourney: JourneyStageData[] = [
  { label: 'Learn', description: 'Access courses, study materials, syllabus, lesson plans and assignments in one structured space.', icon: 'book', items: ['Courses', 'Study materials', 'Assignments', 'Attendance'] },
  { label: 'Practice', description: 'Build confidence through coding labs, LSRW activities and skill-based practice.', icon: 'code', items: ['Coding lab', 'LSRW activities', 'Skill practice', 'Learning games'] },
  { label: 'Assess', description: 'Take MCQ tests, coding challenges, aptitude exams and communication assessments.', icon: 'check', items: ['MCQ tests', 'Coding assessments', 'Aptitude', 'LSRW assessments'] },
  { label: 'AI evaluate', description: 'Get useful signals on speaking, writing, grammar, fluency and coding accuracy.', icon: 'ai', items: ['Speech analysis', 'Writing feedback', 'Grammar and fluency', 'Code evaluation'] },
  { label: 'Analyze', description: 'See scores, trends and skill gaps across every part of the learning journey.', icon: 'chart', items: ['Scores and trends', 'Performance insights', 'Weak areas', 'Department analytics'] },
  { label: 'Improve', description: 'Turn feedback into focused next steps and measurable progress.', icon: 'trend', items: ['Personalized feedback', 'Skill-gap practice', 'Progress tracking', 'Next steps'] },
  { label: 'Placement ready', description: 'Connect academic performance with industry-focused readiness indicators.', icon: 'work', items: ['Coding readiness', 'Communication', 'Aptitude', 'Industry readiness'] },
]

export const platformModules: PlatformModuleData[] = [
  {
    title: 'Learning Management',
    description: 'Create a structured learning environment where institutions can organize academic content, assignments and student activities in one place.',
    details: ['Courses and study guides', 'Syllabus documents and lesson plans', 'Assignments, attendance and progress tracking'],
    icon: 'book', number: '01', tone: 'blue',
  },
  {
    title: 'Assessment Platform',
    description: 'Create and conduct assessments across multiple skill areas while reducing manual evaluation effort.',
    details: ['MCQ tests and aptitude exams', 'Coding and custom examinations', 'Scheduling, automated evaluation and results'],
    icon: 'check', number: '02', tone: 'neutral',
  },
  {
    title: 'Coding Sandbox',
    description: 'Give students a real developer-like coding environment where they can write, compile, execute and validate code in real time.',
    details: ['Browser-based editor and multiple languages', 'Compilation, execution and custom test cases', 'Sandbox validation and automated evaluation'],
    icon: 'code', number: '03', tone: 'blue',
  },
  {
    title: 'AI LSRW Lab',
    description: 'Measure communication skills beyond traditional examinations with AI-powered evaluation and feedback.',
    details: ['Listening, speaking, reading and writing', 'Grammar, fluency and text analysis', 'Personalized AI feedback'],
    icon: 'language', number: '04', tone: 'magenta',
  },
  {
    title: 'AI Evaluation Engine',
    description: 'Connect AI processing and execution technologies to evaluate spoken, written and coded responses.',
    details: ['Speaking transcription and language analysis', 'Writing grammar and coherence review', 'Code execution, test validation and scoring'],
    icon: 'ai', number: '05', tone: 'magenta',
  },
  {
    title: 'Analytics & Insights',
    description: 'Understand department outcomes, student progress, historical trends, weak areas and placement readiness.',
    details: ['Student and department performance', 'Assessment, coding and LSRW analytics', 'Attendance, trends and skill-gap visibility'],
    icon: 'analytics', number: '06', tone: 'neutral',
  },
  {
    title: 'Placement Readiness',
    description: 'Connect academic progress with industry readiness and identify where every student can improve.',
    details: ['Coding, communication and aptitude skills', 'Academic and assessment performance', 'Skill gaps and readiness indicators'],
    icon: 'work', number: '07', tone: 'blue',
  },
]

export const rolePreviews: Record<PlatformRole, RolePreviewData> = {
  Organization: {
    summary: 'See the institution as a whole and connect department outcomes with student readiness.',
    highlights: ['Institution analytics', 'Department performance', 'Student progress', 'Placement readiness', 'Historical trends'],
    stats: [
      { label: 'Active learners', value: '2,840', change: '+12.8%' },
      { label: 'Departments', value: '18', change: '+2 this year' },
      { label: 'Readiness index', value: '78%', change: '+8.4%' },
    ],
  },
  Admin: {
    summary: 'Manage academic workflows, content and evaluation from one connected workspace.',
    highlights: ['User management', 'Courses and content', 'Assessments and coding tests', 'LSRW tests', 'Reports and analytics'],
    stats: [
      { label: 'Assessments live', value: '24', change: '6 scheduled' },
      { label: 'Submissions', value: '1,286', change: '+18.2%' },
      { label: 'Evaluated by AI', value: '94%', change: 'This month' },
    ],
  },
  Student: {
    summary: 'Access your complete learning journey and track the next step toward your goals.',
    highlights: ['Dashboard and assessments', 'Coding and LSRW labs', 'Games and portfolio', 'Schedule and leaderboard', 'Messages and reports'],
    stats: [
      { label: 'Overall score', value: '87%', change: '+4.2%' },
      { label: 'Tests completed', value: '12 / 15', change: '3 remaining' },
      { label: 'Coding score', value: '92%', change: 'Top 5%' },
    ],
  },
}

export const analyticsViews: Record<AnalyticsView, { label: string; value: string; change: string; bars: number[] }> = {
  Students: { label: 'Student performance', value: '87%', change: '+4.2% this term', bars: [38, 48, 45, 63, 56, 72, 68, 81, 76, 92, 87, 98] },
  Departments: { label: 'Department performance', value: '82%', change: '+6.8% this term', bars: [48, 55, 52, 69, 64, 73, 68, 82, 79, 88, 84, 96] },
  Assessments: { label: 'Assessment average', value: '84%', change: '+3.1% this term', bars: [55, 48, 62, 59, 72, 65, 78, 73, 84, 79, 92, 88] },
  Placement: { label: 'Placement readiness', value: '78%', change: '+8.4% this term', bars: [29, 37, 42, 51, 49, 60, 63, 70, 68, 81, 86, 94] },
}

export const lsrwScores = [
  { label: 'Fluency', score: '9.2', progress: 92 },
  { label: 'Grammar', score: '8.5', progress: 85 },
  { label: 'Coherence', score: '8.8', progress: 88 },
  { label: 'Overall LSRW', score: '87%', progress: 87 },
]

export const placementReadinessInputs = [
  { label: 'Academic performance', value: '84%', color: 'blue' },
  { label: 'Coding performance', value: '92%', color: 'magenta' },
  { label: 'Communication skills', value: '87%', color: 'blue' },
  { label: 'Assessment performance', value: '81%', color: 'magenta' },
]

export const studentPerformanceViews = [
  { label: 'Coding Progress', score: '92%', bars: [36, 45, 52, 48, 63, 70, 67, 76, 82, 77, 91, 96] },
  { label: 'LSRW Score', score: '87%', bars: [42, 48, 46, 59, 54, 68, 63, 78, 73, 85, 82, 91] },
  { label: 'Assessment Performance', score: '84%', bars: [51, 47, 62, 57, 70, 66, 79, 72, 86, 81, 94, 89] },
  { label: 'Placement Readiness', score: '78%', bars: [29, 37, 42, 51, 49, 60, 63, 70, 68, 81, 86, 94] },
]

export const footerGroups = [
  { title: 'Platform', links: ['Learning Management', 'Assessment Player', 'Coding Sandbox', 'AI LSRW Lab', 'Analytics & Insights', 'Placement Readiness'] },
  { title: 'Solutions', links: ['For Organizations', 'For Administrators', 'For Students'] },
  { title: 'Company', links: ['About Us', 'Contact', 'Privacy Policy'] },
]

export const heroProductSlides: ProductSlideData[] = [
  { title: 'Student Dashboard', description: 'A personal view of progress, upcoming assessments and next steps.', visual: 'student', metric: '87%', metricLabel: 'Overall score' },
  { title: 'Coding Sandbox', description: 'Write, run and validate code in a focused browser-based workspace.', visual: 'coding', metric: '10 / 10', metricLabel: 'Tests passed' },
  { title: 'AI LSRW Evaluation', description: 'Turn spoken and written responses into clear feedback students can use.', visual: 'lsrw', metric: '87%', metricLabel: 'LSRW score' },
  { title: 'Analytics Dashboard', description: 'See performance patterns across learners, departments and assessments.', visual: 'analytics', metric: '84%', metricLabel: 'Assessment average' },
  { title: 'Placement Readiness', description: 'Connect academic progress with skills that matter for the next step.', visual: 'placement', metric: '78%', metricLabel: 'Readiness index' },
]

export const featureSlides: ProductSlideData[] = [
  { title: 'Learning Management', description: 'Organize courses, study guides, syllabus, assignments and attendance in one structured learning space.', visual: 'learning', metric: '32', metricLabel: 'Active courses' },
  { title: 'Coding Sandbox', description: 'Give students a developer-like space for multi-language coding, execution and custom test cases.', visual: 'coding', metric: '10 / 10', metricLabel: 'Tests passed' },
  { title: 'AI LSRW Lab', description: 'Measure listening, speaking, reading, writing, grammar and fluency with AI feedback.', visual: 'lsrw', metric: '87%', metricLabel: 'Overall LSRW' },
  { title: 'Analytics & Insights', description: 'Spot student progress, department trends, skill gaps and placement readiness.', visual: 'analytics', metric: '78%', metricLabel: 'Ready for placement' },
]

export const studentProductSlides: ProductSlideData[] = [
  { title: 'Student Dashboard', description: 'Your progress, daily streak and next assessment at a glance.', visual: 'student', metric: '87%', metricLabel: 'Overall score' },
  { title: 'Coding Lab', description: 'Practice problems and validate solutions in the browser.', visual: 'coding', metric: '92%', metricLabel: 'Coding score' },
  { title: 'LSRW Lab', description: 'Build communication skills with instant, structured feedback.', visual: 'lsrw', metric: '87%', metricLabel: 'LSRW score' },
  { title: 'Assessment Results', description: 'Review what went well and where your next effort will count.', visual: 'assessment', metric: '12 / 15', metricLabel: 'Tests completed' },
  { title: 'Portfolio', description: 'Bring your learning activity and accomplishments into view.', visual: 'portfolio', metric: '08', metricLabel: 'Projects saved' },
  { title: 'Leaderboard', description: 'Track personal momentum and celebrate progress with your peers.', visual: 'leaderboard', metric: '#4', metricLabel: 'In department' },
]

export const evaluationModes: EvaluationModeData[] = [
  {
    title: 'Speaking', subtitle: 'Audio response · AI language analysis', score: '9.2 / 10', icon: 'language',
    details: [{ label: 'Fluency', value: '9.2', progress: 92 }, { label: 'Grammar', value: '8.5', progress: 85 }, { label: 'Confidence', value: '8.8', progress: 88 }],
  },
  {
    title: 'Writing', subtitle: 'Essay response · grammar and coherence', score: '8.8 / 10', icon: 'book',
    details: [{ label: 'Grammar', value: '8.5', progress: 85 }, { label: 'Coherence', value: '8.8', progress: 88 }, { label: 'Vocabulary', value: '8.9', progress: 89 }],
  },
  {
    title: 'Coding', subtitle: 'Code submission · execution and validation', score: '10 / 10', icon: 'code',
    details: [{ label: 'Test cases', value: '10 / 10', progress: 100 }, { label: 'Accuracy', value: '100%', progress: 100 }, { label: 'Efficiency', value: '9.4', progress: 94 }],
  },
]

export const platformTransformation = [
  { label: 'LMS', icon: 'book' },
  { label: 'Assessment', icon: 'check' },
  { label: 'Coding', icon: 'code' },
  { label: 'Communication', icon: 'language' },
  { label: 'Analytics', icon: 'analytics' },
  { label: 'Placement', icon: 'work' },
] as const