// The initial campus directory. Sample housing and events are explicitly marked.
export type Listing = {
  id: string;
  category: string;
  title: string;
  summary: string;
  description: string;
  tag: string;
  location: string;
  detail: string;
  source: string;
  sourceName: string;
  sample?: boolean;
  date?: string;
  mapQuery?: string;
};
// Navigation categories shown on Home and Explore.
export const categories = [
  { id: 'housing', name: 'Housing', description: 'Find a place to call home.', icon: 'house' },
  { id: 'transit', name: 'Transit', description: 'Get around campus and Denton.', icon: 'bus' },
  { id: 'dining', name: 'Dining', description: 'Find your next meal.', icon: 'utensils' },
  {
    id: 'resources',
    name: 'Resources',
    description: 'A little support goes a long way.',
    icon: 'book',
  },
  { id: 'events', name: 'Events', description: 'Make time for campus life.', icon: 'calendar' },
  { id: 'map', name: 'Campus map', description: 'Find where you need to be.', icon: 'map' },
  {
    id: 'utilities',
    name: 'Move-in checklist',
    description: 'Make settling in a little easier.',
    icon: 'check',
  },
  {
    id: 'community',
    name: 'Community',
    description: 'Ask a question. Help someone out.',
    icon: 'message',
  },
];
export const catalog: Listing[] = [
  {
    id: 'housing-campus',
    category: 'housing',
    title: 'On-campus living',
    summary: 'Start with UNT Housing to explore residence halls and application information.',
    description:
      'Use the official housing website to review residence hall options, eligibility, rates and application steps. Availability and prices must be confirmed with UNT Housing.',
    tag: 'Residence halls',
    location: 'UNT campus',
    detail: 'See official rates',
    source: 'https://housing.unt.edu/',
    sourceName: 'UNT Housing',
  },
  {
    id: 'housing-north',
    category: 'housing',
    title: 'North of campus',
    summary: 'An example shared apartment for comparing housing choices.',
    description:
      'This is a fictional housing listing for the class demonstration. The example includes a shared apartment and a separate bedroom. It is not an available property or an offer. Ask an actual provider about the lease, fees and current availability.',
    tag: 'Shared apartment',
    location: 'Denton · example area',
    detail: 'Example: $750 / month',
    source: 'https://housing.unt.edu/',
    sourceName: 'UNT Housing resources',
    sample: true,
  },
  {
    id: 'housing-west',
    category: 'housing',
    title: 'West of campus',
    summary: 'An example studio to keep in your housing shortlist.',
    description:
      'This fictional studio is included to demonstrate comparing and saving more than one housing option. No property availability, location or price has been verified. Confirm all details with a real housing provider.',
    tag: 'Studio',
    location: 'Denton · example area',
    detail: 'Example: $950 / month',
    source: 'https://housing.unt.edu/',
    sourceName: 'UNT Housing resources',
    sample: true,
  },
  {
    id: 'transit-campus',
    category: 'transit',
    title: 'Campus buses & routes',
    summary: 'Find UNT transportation options and official route information.',
    description:
      'Open UNT Transportation for current bus and transportation information. This guide does not show live vehicle locations or arrival predictions. Check official service information before travelling.',
    tag: 'Campus transit',
    location: 'UNT / Denton',
    detail: 'Schedules on official site',
    source: 'https://transportation.unt.edu/student.html',
    sourceName: 'UNT Transportation',
  },
  {
    id: 'transit-parking',
    category: 'transit',
    title: 'Parking & getting to campus',
    summary: 'Find official parking maps, permits and visitor information.',
    description:
      'UNT Transportation provides parking and travel information. Review the official site for the current rules, permit choices and maps.',
    tag: 'Parking',
    location: 'UNT campus',
    detail: 'Check current permit information',
    source: 'https://transportation.unt.edu/index.html',
    sourceName: 'UNT Transportation',
  },
  {
    id: 'dining-eagle',
    category: 'dining',
    title: 'Eagle Landing',
    summary: 'Explore one of UNT’s campus dining options.',
    description:
      'Eagle Landing is listed in the official UNT dining directory. Visit UNT Dining to check current hours, menus, meal-plan information and food options before going.',
    tag: 'Campus dining',
    location: 'UNT campus',
    detail: 'Hours and prices: see source',
    source: 'https://dining.unt.edu/hours/map.html',
    sourceName: 'UNT Dining',
    mapQuery: 'Eagle Landing University of North Texas Denton',
  },
  {
    id: 'dining-greens',
    category: 'dining',
    title: 'Mean Greens Café',
    summary: 'Find this campus café in the UNT dining directory.',
    description:
      'Open the UNT Dining directory for current information about Mean Greens Café. Menus, access and opening hours can change; check the official site.',
    tag: 'Campus dining',
    location: 'UNT campus',
    detail: 'See menu and current hours',
    source: 'https://dining.unt.edu/hours/map.html',
    sourceName: 'UNT Dining',
    mapQuery: 'Mean Greens Cafe UNT Denton',
  },
  {
    id: 'dining-union',
    category: 'dining',
    title: 'University Union food options',
    summary: 'Browse the official directory for Union dining locations.',
    description:
      'The UNT dining directory lists dining options in the University Union, including Campus Chat. Check the source for current locations, hours and menus.',
    tag: 'Food court',
    location: 'University Union',
    detail: 'Prices vary by location',
    source: 'https://dining.unt.edu/hours/map.html',
    sourceName: 'UNT Dining',
    mapQuery: 'University Union UNT Denton',
  },
  {
    id: 'resource-academic',
    category: 'resources',
    title: 'Academic support',
    summary: 'Find campus resources for learning and student support.',
    description:
      'Use UNT’s official resource pages to find support and follow the relevant service links. Confirm available services and eligibility with the department.',
    tag: 'Academic',
    location: 'UNT campus / online',
    detail: 'Official resource directory',
    source: 'https://learningcenter.unt.edu/',
    sourceName: 'UNT Learning Center',
  },
  {
    id: 'resource-health',
    category: 'resources',
    title: 'Health & wellbeing',
    summary: 'Find official student health and wellbeing services.',
    description:
      'Visit the UNT student affairs website for health and wellbeing resources. Use the official service page for current contact details and appointments.',
    tag: 'Health',
    location: 'UNT student services',
    detail: 'Contact details on official site',
    source: 'https://studentaffairs.unt.edu/',
    sourceName: 'UNT Student Affairs',
  },
  {
    id: 'resource-career',
    category: 'resources',
    title: 'Career support',
    summary: 'A starting point for career services and student opportunities.',
    description:
      'Find career support through UNT’s official student resources. Service availability and appointments are managed by the university.',
    tag: 'Career',
    location: 'UNT / online',
    detail: 'Find official services',
    source: 'https://careercenter.unt.edu/',
    sourceName: 'UNT Career Center',
  },
  {
    id: 'resource-tech',
    category: 'resources',
    title: 'Technology help',
    summary: 'Find university technology support and service information.',
    description:
      'Visit UNT’s official website to find technology support. Do not share your UNT password in Campus Survival or in community posts.',
    tag: 'Technology',
    location: 'Online',
    detail: 'University support',
    source: 'https://it.unt.edu/',
    sourceName: 'UNT University Technology',
  },
  {
    id: 'resource-safety',
    category: 'resources',
    title: 'Campus safety',
    summary: 'Find official UNT Police information and campus help.',
    description:
      'Use UNT Police’s official website for current campus safety resources and contact details. In an immediate emergency, call 911. Campus Survival does not dispatch assistance.',
    tag: 'Safety',
    location: 'UNT campus',
    detail: 'Official campus help',
    source: 'https://police.unt.edu/',
    sourceName: 'UNT Police',
  },
  {
    id: 'resource-finance',
    category: 'resources',
    title: 'Financial aid resources',
    summary: 'Find official information about financial aid and scholarships.',
    description:
      'Visit UNT’s official financial aid site for current guidance, deadlines and contact information. Campus Survival does not determine eligibility or process applications.',
    tag: 'Finance',
    location: 'UNT / online',
    detail: 'Current information at source',
    source: 'https://financialaid.unt.edu/',
    sourceName: 'UNT Financial Aid',
  },
  {
    id: 'event-meetup',
    category: 'events',
    title: 'New student meetup',
    summary: 'Meet a few new faces and share your first-week questions.',
    description:
      'A fictional event used to demonstrate event details and saving. No actual event or registration is offered. Browse UNT’s official calendar for real upcoming events.',
    tag: 'Student life',
    location: 'University Union · sample location',
    detail: '4:00–5:00 PM · Central',
    date: '2026-10-22',
    source: 'https://calendar.unt.edu/',
    sourceName: 'UNT event calendar',
    sample: true,
  },
  {
    id: 'event-study',
    category: 'events',
    title: 'Study together',
    summary: 'Bring a class question and plan a productive study session.',
    description:
      'A sample event for the class project. Its date, location and description are fictional. Use the official UNT calendar to find actual events.',
    tag: 'Academic',
    location: 'Willis Library · sample location',
    detail: '3:00–4:00 PM · Central',
    date: '2026-10-23',
    source: 'https://calendar.unt.edu/',
    sourceName: 'UNT event calendar',
    sample: true,
  },
  {
    id: 'event-welcome',
    category: 'events',
    title: 'Explore campus afternoon',
    summary: 'A sample campus walk for students getting settled.',
    description:
      'This demonstration event is fictional. It lets the team show saving an event and finding it again in Profile. Check the official UNT event calendar for real activities.',
    tag: 'Student life',
    location: 'UNT campus · sample location',
    detail: '2:00–3:00 PM · Central',
    date: '2026-10-24',
    source: 'https://calendar.unt.edu/',
    sourceName: 'UNT event calendar',
    sample: true,
  },
];
// Destinations used to build the Google Maps direction link.
export const destinations = [
  {
    id: 'willis',
    name: 'Willis Library',
    type: 'Library',
    query: 'Willis Library UNT Denton Texas',
    x: 29,
    y: 54,
  },
  {
    id: 'union',
    name: 'University Union',
    type: 'Student life',
    query: 'University Union UNT Denton Texas',
    x: 63,
    y: 39,
  },
  {
    id: 'services',
    name: 'Eagle Student Services Center',
    type: 'Student services',
    query: 'Eagle Student Services Center UNT Denton Texas',
    x: 64,
    y: 68,
  },
  {
    id: 'landing',
    name: 'Eagle Landing',
    type: 'Dining',
    query: 'Eagle Landing UNT Denton Texas',
    x: 29,
    y: 25,
  },
];
// Each utility uses these same four checklist steps.
export const utilitySteps = [
  {
    id: 'provider',
    title: 'Choose a provider',
    description: 'Check which providers serve your address.',
  },
  {
    id: 'account',
    title: 'Create your provider account',
    description: 'Complete account setup on the provider’s website.',
  },
  { id: 'date', title: 'Choose your start date', description: 'Confirm when service will begin.' },
  {
    id: 'complete',
    title: 'Confirm your setup',
    description: 'Keep the confirmation and mark this step complete.',
  },
];
export const seedQuestions = [
  {
    id: 'sample-furniture',
    author: 'Alex · sample student',
    title: 'Where can I look for furniture?',
    body: 'I’m moving to Denton and looking for ideas for finding a desk and chair. What should I check before buying secondhand?',
    category: 'Housing',
    createdAt: '2026-10-18T16:00:00.000Z',
    sample: true,
  },
  {
    id: 'sample-campus',
    author: 'Sam · sample student',
    title: 'What helped you get familiar with campus?',
    body: 'I’m trying to plan my first week. Would you start by locating your classrooms or checking out student services?',
    category: 'Campus life',
    createdAt: '2026-10-18T12:00:00.000Z',
    sample: true,
  },
];
