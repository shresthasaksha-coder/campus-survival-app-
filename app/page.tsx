'use client';
import { useEffect, useRef, useState } from 'react';
import StudentSignInForm from './student-login-form';
import CampusIllustration from './ui/campus-illustration';
import CampusDialog from './ui/campus-dialog';
import { sendCampusApiRequest } from '../lib/send-campus-request';
import {
  ArrowRight,
  ArrowUpRight,
  ArrowLeft,
  Search,
  House,
  Bus,
  Utensils,
  BookOpen,
  CalendarDays,
  MapPin,
  Map,
  MessageCircle,
  Check,
  CheckSquare,
  Bookmark,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
  Plus,
  X,
  Menu,
  UserRound,
  LogOut,
  Settings,
  ExternalLink,
  Navigation,
  Lightbulb,
  Wifi,
  Droplets,
  Flag,
  Info,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { categories, destinations, utilitySteps, type Listing } from '../lib/campus-directory';

type User = { displayName: string; email: string; studentType: string };
type Question = {
  id: string;
  title: string;
  body: string;
  author: string;
  category: string;
  createdAt: string;
  sample?: boolean;
  replies?: number;
};
type Reply = { id: string; body: string; author: string; createdAt: string };
const icons: Record<string, typeof House> = {
  housing: House,
  transit: Bus,
  dining: Utensils,
  resources: BookOpen,
  events: CalendarDays,
  map: Map,
  utilities: CheckSquare,
  community: MessageCircle,
  safety: ShieldCheck,
};
const titles: Record<string, string> = {
  housing: 'Find a place to call home.',
  transit: 'Get where you need to go.',
  dining: 'What sounds good?',
  resources: 'Find the right support.',
  events: 'Make time for campus life.',
};
const intros: Record<string, string> = {
  housing: 'Compare options, check the source, and keep a shortlist.',
  transit: 'Find official travel information and plan your way around.',
  dining: 'Campus meals and useful places to start your search.',
  resources: 'From your next assignment to your next big decision.',
  events: 'Save something to look forward to. Events below are class examples.',
};

const formatEventDate = (s: string) =>
  new Date(s + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
const formatCommunityPostDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
function CampusBrandLogo() {
  return (
    <span className="brand-mark">
      <GraduationCap size={25} />
    </span>
  );
}

export default function CampusSurvivalPage() {
  // Page, account, and request state.
  const [route, setRoute] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [saved, setSaved] = useState<string[]>([]);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingAction, setPendingAction] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  // Search and category filters.
  const [query, setQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [results, setResults] = useState<Listing[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [modal, setModal] = useState<any>(null);
  const [formError, setFormError] = useState('');
  const [toast, setToast] = useState<{ message: string; undo?: () => void } | null>(null);
  const [utility, setUtility] = useState('electricity');
  // Community questions and the currently open thread.
  const [communityQuestions, setCommunityQuestions] = useState<Question[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  const [thread, setThread] = useState<{ question: Question; replies: Reply[] } | null>(null);
  const [communityFilter, setCommunityFilter] = useState('All');
  // The map can use a typed starting point or an optional browser location.
  const [destination, setDestination] = useState('union');
  const [origin, setOrigin] = useState('');
  const [locationMessage, setLocationMessage] = useState('');
  const [locationBusy, setLocationBusy] = useState(false);
  const [mapMode, setMapMode] = useState('map');
  const mainRef = useRef<HTMLElement>(null);
  const currentPage = route.split('/')[0];
  const selectedItem =
    currentPage === 'item' ? items.find((x) => x.id === route.slice(5)) : undefined;
  async function finishSignIn() {
    await loadStudentDashboard();
    setModal(null);
    setToast({ message: 'You’re logged in. Welcome to Campus Survival.' });
  }
  async function signOutStudent() {
    await performAccountAction('signOutStudent', async () => {
      await sendCampusApiRequest('auth/logout', {});
      setUser(null);
      setSaved([]);
      setProgress({});
      setToast({ message: 'You’ve logged out.' });
      goToPage('profile');
    });
  }
  // Fetch the signed-in profile, saved items, and checklist from the server.
  async function loadStudentDashboard() {
    setError('');
    setLoading(true);
    try {
      const d = await sendCampusApiRequest('bootstrap');
      setUser(d.user);
      setItems(d.catalog);
      setSaved(d.saved);
      setProgress(d.checklist);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }
  // Hash links switch views without reloading the whole site.
  useEffect(() => {
    const change = () => {
      setRoute(location.hash.slice(1) || 'home');
      setMenuOpen(false);
      setFilter('all');
      setError('');
      window.scrollTo({ top: 0 });
      setTimeout(() => mainRef.current?.focus({ preventScroll: true }), 50);
    };
    change();
    window.addEventListener('hashchange', change);
    loadStudentDashboard();
    return () => window.removeEventListener('hashchange', change);
  }, []);
  useEffect(() => {
    document.title =
      (currentPage === 'home'
        ? 'Your UNT starting point'
        : selectedItem?.title || currentPage.charAt(0).toUpperCase() + currentPage.slice(1)) +
      ' | Campus Survival';
  }, [currentPage, selectedItem]);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 9000);
    return () => clearTimeout(timer);
  }, [toast]);
  useEffect(() => {
    if (currentPage !== 'search') return;
    let current = true;
    setSearchLoading(true);
    sendCampusApiRequest(
      'search?q=' + encodeURIComponent(searchTerm) + '&category=' + encodeURIComponent(filter),
    )
      .then((d) => {
        if (current) setResults(d.items);
      })
      .catch((e) => {
        if (current) setError(e.message);
      })
      .finally(() => {
        if (current) setSearchLoading(false);
      });
    return () => {
      current = false;
    };
  }, [currentPage, searchTerm, filter]);
  useEffect(() => {
    if (currentPage === 'community') loadCommunityQuestions();
    if (currentPage === 'thread') loadQuestionDiscussion(route.slice(7));
  }, [route]);
  function goToPage(path: string) {
    if (location.hash === '#' + path) {
      setRoute(path);
      window.scrollTo({ top: 0 });
    } else location.hash = path;
  }
  function searchCampusResources(e: React.FormEvent) {
    e.preventDefault();
    setSearchTerm(query.trim());
    setFilter('all');
    goToPage('search');
  }
  function showDialog(value: any) {
    setFormError('');
    setModal(value);
  }
  function requireStudentAccount() {
    if (user) return true;
    showDialog({ type: 'signin' });
    return false;
  }
  async function performAccountAction(key: string, fn: () => Promise<void>) {
    setPendingAction(key);
    setError('');
    setFormError('');
    try {
      await fn();
    } catch (e) {
      setFormError((e as Error).message);
      setError((e as Error).message);
    } finally {
      setPendingAction('');
    }
  }
  // Save or remove an item, then offer a short-lived Undo action.
  async function updateSavedResource(id: string, value?: boolean) {
    if (!requireStudentAccount()) return;
    const next = value ?? !saved.includes(id);
    await performAccountAction('save-' + id, async () => {
      await sendCampusApiRequest('saves', { itemId: id, saved: next });
      setSaved((s) => (next ? [...new Set([...s, id])] : s.filter((x) => x !== id)));
      setToast({
        message: next ? 'Saved to your profile.' : 'Removed from saved items.',
        undo: () => {
          updateSavedResource(id, !next);
          setToast(null);
        },
      });
    });
  }
  async function loadCommunityQuestions() {
    setCommunityLoading(true);
    try {
      setCommunityQuestions((await sendCampusApiRequest('questions')).questions);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCommunityLoading(false);
    }
  }
  async function loadQuestionDiscussion(id: string) {
    setThread(null);
    setCommunityLoading(true);
    try {
      setThread(await sendCampusApiRequest('questions/' + encodeURIComponent(id)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setCommunityLoading(false);
    }
  }
  async function updateChecklistStep(step: string, value: boolean) {
    if (!requireStudentAccount()) return;
    await performAccountAction('step-' + step, async () => {
      await sendCampusApiRequest('checklist', { step, complete: value });
      setProgress((p) => ({ ...p, [step]: value }));
      setToast({
        message: value ? 'Step complete. Your progress is saved.' : 'Step marked incomplete.',
      });
    });
  }
  function findMyLocation() {
    if (!navigator.geolocation) {
      setLocationMessage('Location is unavailable. Enter a starting point below.');
      return;
    }
    setLocationBusy(true);
    setLocationMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setOrigin(p.coords.latitude.toFixed(5) + ',' + p.coords.longitude.toFixed(5));
        setLocationMessage('Location selected. It is shared only when you open directions.');
        setLocationBusy(false);
      },
      () => {
        setLocationMessage(
          'Location was unavailable or denied. You can enter a starting point below.',
        );
        setLocationBusy(false);
      },
      { timeout: 10000, maximumAge: 60000 },
    );
  }
  const selectedDestination = destinations.find((x) => x.id === destination)!;
  const directions =
    'https://www.google.com/maps/dir/?api=1&destination=' +
    encodeURIComponent(selectedDestination.query) +
    (origin.trim() ? '&origin=' + encodeURIComponent(origin.trim()) : '') +
    '&travelmode=walking';
  function ResourceCard({ entry }: { entry: Listing }) {
    const Icon = icons[entry.category] || BookOpen;
    const isSaved = saved.includes(entry.id);
    return (
      <article className="listing-card">
        <div className={'listing-top tone-' + entry.category}>
          <Icon size={32} strokeWidth={1.4} />
          {entry.sample && <span className="sample-label">Sample listing</span>}
          {entry.date && <span className="date-stamp">{formatEventDate(entry.date)}</span>}
        </div>
        <div className="card-body">
          <span className="eyebrow">{entry.tag}</span>
          <h3>
            <a href={'#item/' + entry.id}>{entry.title}</a>
          </h3>
          <p>{entry.summary}</p>
          <div className="card-meta">
            <MapPin size={14} />
            {entry.location}
          </div>
          <strong className="detail-line">{entry.detail}</strong>
          <div className="card-actions">
            <a className="text-link" href={'#item/' + entry.id}>
              View details <ArrowRight size={16} />
            </a>
            <button
              className={'save-button ' + (isSaved ? 'is-saved' : '')}
              disabled={pendingAction === 'save-' + entry.id}
              aria-label={(isSaved ? 'Unsave ' : 'Save ') + entry.title}
              aria-pressed={isSaved}
              onClick={() => updateSavedResource(entry.id)}
            >
              <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} />
              {pendingAction === 'save-' + entry.id ? 'Saving…' : isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>
      </article>
    );
  }
  function EmptyState({
    title,
    copy,
    children,
  }: {
    title: string;
    copy: string;
    children?: React.ReactNode;
  }) {
    return (
      <div className="empty">
        <Search size={30} />
        <h2>{title}</h2>
        <p>{copy}</p>
        {children}
      </div>
    );
  }
  const completedSteps = Object.values(progress).filter(Boolean).length;
  const currentCategory = categories.find((c) => c.id === currentPage);
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="site-header">
        <div className="header-inner">
          <a className="brand" href="#home">
            <CampusBrandLogo />
            <span>
              Campus Survival<small>YOUR UNT STARTING POINT</small>
            </span>
          </a>
          <button
            className="mobile-toggle icon-button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
          <nav className={menuOpen ? 'nav-open' : ''} aria-label="Main navigation">
            {[
              ['home', 'Home'],
              ['explore', 'Explore'],
              ['map', 'Campus map'],
              ['community', 'Community'],
            ].map(([id, label]) => (
              <a
                key={id}
                className={
                  currentPage === id ||
                  (id === 'explore' &&
                    [
                      'housing',
                      'transit',
                      'dining',
                      'resources',
                      'events',
                      'utilities',
                      'item',
                    ].includes(currentPage))
                    ? 'active'
                    : ''
                }
                aria-current={currentPage === id ? 'page' : undefined}
                href={'#' + id}
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="header-actions">
            <a className="safety-link" aria-label="Safety and help" href="#safety">
              <ShieldCheck size={17} />
              <span>Safety & help</span>
            </a>
            <a
              className="profile-button"
              aria-label={user ? 'My profile' : 'Log in'}
              href="#profile"
            >
              <UserRound size={18} />
              <span>{user ? user.displayName : 'Log in'}</span>
            </a>
          </div>
        </div>
      </header>
      <main ref={mainRef} id="main-content" tabIndex={-1}>
        {error && (
          <div className="error-banner" role="alert">
            <Info size={18} />
            <span>{error}</span>
            <button
              onClick={() =>
                currentPage === 'community'
                  ? loadCommunityQuestions()
                  : currentPage === 'thread'
                    ? loadQuestionDiscussion(route.slice(7))
                    : loadStudentDashboard()
              }
            >
              Retry
            </button>
            <button aria-label="Dismiss error" onClick={() => setError('')}>
              <X size={16} />
            </button>
          </div>
        )}
        {loading ? (
          <div className="loading-state" role="status">
            <div className="spinner" />
            <h1>Getting things ready…</h1>
            <p>Loading your campus guide.</p>
          </div>
        ) : (
          <>
            {/* Home */}
            {currentPage === 'home' && (
              <>
                <div className="welcome-line">
                  <span>
                    <span className="status-dot" /> MADE FOR STUDENT LIFE
                  </span>
                  <span>
                    Denton, Texas <MapPin size={14} />
                  </span>
                </div>
                <section className="hero">
                  <div className="hero-copy">
                    <span className="eyebrow">A LITTLE LESS LOST. A LOT MORE AT HOME.</span>
                    <h1>
                      New place.
                      <br />
                      Find your <em>starting point.</em>
                    </h1>
                    <p>
                      Housing, food, campus resources, and a little help along the way. Let’s make
                      student life easier.
                    </p>
                    <form className="search-form" onSubmit={searchCampusResources}>
                      <Search size={21} />
                      <label className="sr-only" htmlFor="home-search">
                        Search campus resources
                      </label>
                      <input
                        id="home-search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Try housing, food, or academic support"
                        maxLength={150}
                      />
                      <button className="button primary" type="submit">
                        Search <ArrowRight size={16} />
                      </button>
                    </form>
                    <div className="hero-hint">
                      Start exploring. Save your favorites when you sign in.
                    </div>
                  </div>
                  <div className="hero-art">
                    <CampusIllustration />
                    <span className="art-caption">
                      <MapPin size={13} /> A new chapter starts here.
                    </span>
                  </div>
                </section>
                <section className="section">
                  <div className="section-title">
                    <div>
                      <span className="eyebrow">THE EVERYDAY ESSENTIALS</span>
                      <h2>What do you need today?</h2>
                    </div>
                    <a className="text-link" href="#explore">
                      Explore everything <ArrowRight size={16} />
                    </a>
                  </div>
                  <div className="category-grid">
                    {categories.slice(0, 4).map((c) => {
                      const Icon = icons[c.id];
                      return (
                        <a className="category-card" key={c.id} href={'#' + c.id}>
                          <span className={'category-icon tone-' + c.id}>
                            <Icon size={25} strokeWidth={1.6} />
                          </span>
                          <h3>{c.name}</h3>
                          <p>{c.description}</p>
                          <ArrowUpRight className="corner-arrow" size={18} />
                        </a>
                      );
                    })}
                  </div>
                </section>
                <div className="home-panels">
                  <section className="movein-panel">
                    <div className="panel-icon">
                      <CheckSquare size={25} />
                    </div>
                    <div>
                      <span className="eyebrow">ONE THING AT A TIME</span>
                      <h2>Still settling in?</h2>
                      <p>Keep your utilities setup in one simple checklist.</p>
                      <a className="text-link" href="#utilities">
                        Open move-in checklist <ArrowRight size={16} />
                      </a>
                    </div>
                    <div className="progress-circle">
                      <strong>{completedSteps}</strong>
                      <span>of 12 steps</span>
                    </div>
                  </section>
                  <section className="saved-panel">
                    <Bookmark size={25} />
                    <h2>Keep the useful things.</h2>
                    <p>
                      {user
                        ? `${saved.length} saved ${saved.length === 1 ? 'item' : 'items'}, ready when you need them.`
                        : 'Your favorite places and helpful resources, all together.'}
                    </p>
                    <a className="text-link" href="#profile">
                      {user ? 'View your saved items' : 'Set up your profile'}{' '}
                      <ArrowRight size={16} />
                    </a>
                  </section>
                </div>
                <section className="section">
                  <div className="section-title">
                    <div>
                      <span className="eyebrow">GET CONNECTED</span>
                      <h2>You don’t have to figure it out alone.</h2>
                    </div>
                  </div>
                  <div className="community-callout">
                    <span className="circle-avatars">
                      <i>A</i>
                      <i>S</i>
                      <i>Y</i>
                    </span>
                    <div>
                      <h3>A question today. A helpful answer tomorrow.</h3>
                      <p>Ask other students about getting settled and campus life.</p>
                    </div>
                    <a className="button secondary" href="#community">
                      Visit Community <ArrowUpRight size={17} />
                    </a>
                  </div>
                </section>
              </>
            )}
            {/* Explore */}
            {currentPage === 'explore' && (
              <>
                <div className="page-heading">
                  <span className="eyebrow">YOUR CAMPUS, A LITTLE CLOSER</span>
                  <h1>Find your next step.</h1>
                  <p>Start with what you need. We’ll help you find your way.</p>
                </div>
                <div className="category-grid explore-grid">
                  {categories.map((c) => {
                    const Icon = icons[c.id];
                    return (
                      <a className="category-card" href={'#' + c.id} key={c.id}>
                        <span className={'category-icon tone-' + c.id}>
                          <Icon size={26} />
                        </span>
                        <h2>{c.name}</h2>
                        <p>{c.description}</p>
                        <ArrowUpRight className="corner-arrow" size={20} />
                      </a>
                    );
                  })}
                </div>
                <a className="help-banner" href="#safety">
                  <ShieldCheck />
                  <div>
                    <strong>Need help now?</strong>
                    <span>Find official campus help and safety resources.</span>
                  </div>
                  <ArrowRight />
                </a>
              </>
            )}
            {['housing', 'transit', 'dining', 'resources', 'events', 'search'].includes(
              currentPage,
            ) && (
              <>
                <a className="back-link" href="#explore">
                  <ArrowLeft size={15} /> All sections
                </a>
                <div className="page-heading">
                  <span className="eyebrow">
                    {currentCategory?.name || 'SEARCH CAMPUS SURVIVAL'}
                  </span>
                  <h1>{titles[currentPage] || 'Find something useful.'}</h1>
                  <p>
                    {intros[currentPage] ||
                      'Search housing, transit, dining, resources, and events in one place.'}
                  </p>
                </div>
                {/* Search results */}
                {currentPage === 'search' && (
                  <form className="search-form standalone" onSubmit={searchCampusResources}>
                    <Search size={20} />
                    <label className="sr-only" htmlFor="results-search">
                      Search
                    </label>
                    <input
                      id="results-search"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="What are you looking for?"
                      maxLength={150}
                    />
                    <button className="button primary">Search</button>
                  </form>
                )}
                <div className="filter-row" aria-label="Filter results">
                  {(currentPage === 'search'
                    ? ['all', 'housing', 'transit', 'dining', 'resources', 'events']
                    : currentPage === 'resources'
                      ? ['all', 'Academic', 'Health', 'Career', 'Technology', 'Safety', 'Finance']
                      : [
                          'all',
                          ...new Set(
                            items.filter((x) => x.category === currentPage).map((x) => x.tag),
                          ),
                        ]
                  ).map((f) => (
                    <button
                      key={f}
                      className={'chip ' + (filter === f ? 'selected' : '')}
                      aria-pressed={filter === f}
                      onClick={() => setFilter(f)}
                    >
                      {f === 'all'
                        ? 'All ' +
                          (currentPage === 'search'
                            ? 'results'
                            : currentPage === 'resources'
                              ? 'resources'
                              : 'options')
                        : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                  {filter !== 'all' && (
                    <button className="link-button" onClick={() => setFilter('all')}>
                      Clear filter
                    </button>
                  )}
                </div>
                {currentPage === 'search' && (
                  <p className="results-count" aria-live="polite">
                    {searchLoading
                      ? 'Searching…'
                      : `${results.length} ${results.length === 1 ? 'result' : 'results'}${searchTerm ? ' for “' + searchTerm + '”' : ''}`}
                  </p>
                )}
                {searchLoading && currentPage === 'search' ? (
                  <div className="loading-inline" role="status">
                    Searching campus resources…
                  </div>
                ) : (
                  <div className="listing-grid">
                    {(currentPage === 'search'
                      ? results
                      : items.filter(
                          (x) =>
                            x.category === currentPage && (filter === 'all' || x.tag === filter),
                        )
                    ).map((entry) => (
                      <ResourceCard key={entry.id} entry={entry} />
                    ))}
                  </div>
                )}
                {currentPage === 'search' && !searchLoading && !results.length && (
                  <EmptyState
                    title="No matches this time."
                    copy="Try a broader word or clear your category filter."
                  >
                    <button
                      className="button secondary"
                      onClick={() => {
                        setQuery('');
                        setSearchTerm('');
                        setFilter('all');
                      }}
                    >
                      Show all results
                    </button>
                  </EmptyState>
                )}
                {currentPage === 'housing' && (
                  <section className="info-panel">
                    <House size={25} />
                    <div>
                      <h2>Looking for a roommate?</h2>
                      <p>
                        Talk about rent, bills, guests, and house rules before committing. Share
                        personal contact details only when you choose.
                      </p>
                      <a
                        className="text-link"
                        href="https://housing.unt.edu/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open UNT Housing <ExternalLink size={14} />
                      </a>
                    </div>
                  </section>
                )}
                {currentPage === 'transit' && (
                  <section className="info-panel">
                    <Map size={25} />
                    <div>
                      <h2>Know your destination?</h2>
                      <p>
                        Choose a campus building and enter your starting point. Location sharing is
                        optional.
                      </p>
                      <a className="text-link" href="#map">
                        Open campus map <ArrowRight size={16} />
                      </a>
                    </div>
                  </section>
                )}
                {currentPage === 'events' && (
                  <p className="source-note">
                    <Info size={16} /> These are fictional events for the class demo.{' '}
                    <a href="https://calendar.unt.edu/" target="_blank" rel="noreferrer">
                      Find real events on UNT’s calendar <ExternalLink size={13} />
                    </a>
                  </p>
                )}
              </>
            )}
            {/* Listing details */}
            {currentPage === 'item' &&
              (selectedItem ? (
                <>
                  <a className="back-link" href={'#' + selectedItem.category}>
                    <ArrowLeft size={15} /> Back to {selectedItem.category}
                  </a>
                  <div className="page-heading">
                    <span className="eyebrow">{selectedItem.tag}</span>
                    <h1>{selectedItem.title}</h1>
                    <p>
                      <MapPin size={16} /> {selectedItem.location}
                    </p>
                  </div>
                  <div className="detail-layout">
                    <section className="white-panel">
                      <div className={'detail-art tone-' + selectedItem.category}>
                        {(() => {
                          const Icon = icons[selectedItem.category];
                          return <Icon size={65} strokeWidth={1} />;
                        })()}
                        {selectedItem.sample && (
                          <span className="badge">SAMPLE · FOR CLASS DEMONSTRATION</span>
                        )}
                      </div>
                      <h2>Good to know</h2>
                      <p>{selectedItem.description}</p>
                      <dl className="details-list">
                        <div>
                          <dt>Category</dt>
                          <dd>{selectedItem.tag}</dd>
                        </div>
                        <div>
                          <dt>{selectedItem.date ? 'When' : 'Details'}</dt>
                          <dd>
                            {selectedItem.date
                              ? formatEventDate(selectedItem.date) + ' · ' + selectedItem.detail
                              : selectedItem.detail}
                          </dd>
                        </div>
                        <div>
                          <dt>Source</dt>
                          <dd>{selectedItem.sourceName}</dd>
                        </div>
                        <div>
                          <dt>Availability</dt>
                          <dd>
                            {selectedItem.sample
                              ? 'Fictional example'
                              : 'Check the official source'}
                          </dd>
                        </div>
                      </dl>
                    </section>
                    <aside>
                      <section className="white-panel">
                        <h2>
                          {saved.includes(selectedItem.id)
                            ? 'On your shortlist.'
                            : 'Keep it for later.'}
                        </h2>
                        <p>Saved items stay together in your profile.</p>
                        <button
                          className="button primary full"
                          disabled={pendingAction === 'save-' + selectedItem.id}
                          onClick={() => updateSavedResource(selectedItem.id)}
                        >
                          <Bookmark size={18} />
                          {pendingAction === 'save-' + selectedItem.id
                            ? 'Saving…'
                            : saved.includes(selectedItem.id)
                              ? 'Remove from saved'
                              : 'Save to my profile'}
                        </button>
                        <a
                          className="button secondary full"
                          href={selectedItem.source}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open official source <ExternalLink size={16} />
                        </a>
                        {selectedItem.mapQuery && (
                          <a
                            className="text-link"
                            href={
                              'https://www.google.com/maps/search/?api=1&query=' +
                              encodeURIComponent(selectedItem.mapQuery)
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            Find on Google Maps <ArrowUpRight size={15} />
                          </a>
                        )}
                      </section>
                      <section className="gentle-panel">
                        <Info size={21} />
                        <h3>Information can change.</h3>
                        <p>Check the original source before making plans.</p>
                        <button
                          className="link-button"
                          onClick={() => {
                            if (requireStudentAccount())
                              showDialog({
                                type: 'report',
                                targetType: 'listing',
                                targetId: selectedItem.id,
                                title: selectedItem.title,
                              });
                          }}
                        >
                          Report incorrect information
                        </button>
                      </section>
                    </aside>
                  </div>
                </>
              ) : (
                <EmptyState
                  title="Listing not found."
                  copy="It may have moved. Return to Explore to find another option."
                >
                  <a className="button primary" href="#explore">
                    Explore
                  </a>
                </EmptyState>
              ))}
            {/* Campus directions */}
            {currentPage === 'map' && (
              <>
                <div className="page-heading">
                  <span className="eyebrow">A LITTLE DIRECTION</span>
                  <h1>Where are you headed?</h1>
                  <p>Pick a campus destination, then open walking directions.</p>
                </div>
                <div className="map-layout">
                  <section className="map-card">
                    <div className="map-toolbar">
                      <span>
                        <MapPin size={17} /> UNT · Denton campus
                      </span>
                      <div className="segmented">
                        <button
                          className={mapMode === 'map' ? 'selected' : ''}
                          onClick={() => setMapMode('map')}
                        >
                          Map
                        </button>
                        <button
                          className={mapMode === 'list' ? 'selected' : ''}
                          onClick={() => setMapMode('list')}
                        >
                          List
                        </button>
                      </div>
                    </div>
                    {mapMode === 'map' ? (
                      <div className="illustrated-map">
                        <svg viewBox="0 0 640 450" preserveAspectRatio="none" aria-hidden="true">
                          <rect width="640" height="450" fill="#e9eee4" />
                          <path
                            d="M0 160h640M0 300h640M120 0v450M330 0v450M505 0v450"
                            stroke="#faf9f2"
                            strokeWidth="24"
                          />
                          <path
                            d="M0 160h640M0 300h640M120 0v450M330 0v450M505 0v450"
                            stroke="#d8ded2"
                            strokeWidth="1"
                            strokeDasharray="8 8"
                          />
                          {[
                            [150, 65, 115, 62],
                            [355, 63, 115, 62],
                            [150, 195, 115, 65],
                            [356, 191, 112, 69],
                            [155, 342, 110, 64],
                            [358, 341, 110, 64],
                            [22, 203, 63, 63],
                            [540, 60, 65, 64],
                            [542, 198, 63, 64],
                          ].map((v, i) => (
                            <rect
                              key={i}
                              x={v[0]}
                              y={v[1]}
                              width={v[2]}
                              height={v[3]}
                              rx="7"
                              fill={i % 2 ? '#c6d3bf' : '#d3ddc8'}
                              stroke="#b4c3ab"
                              strokeWidth="2"
                            />
                          ))}
                          <circle cx="56" cy="80" r="28" fill="#b9cbb1" />
                          <circle cx="575" cy="373" r="26" fill="#b9cbb1" />
                        </svg>
                        {destinations.map((d, i) => (
                          <button
                            key={d.id}
                            style={{ left: d.x + '%', top: d.y + '%' }}
                            className={'map-pin ' + (destination === d.id ? 'selected' : '')}
                            aria-label={'Select ' + d.name}
                            onClick={() => setDestination(d.id)}
                          >
                            {String.fromCharCode(65 + i)}
                            <span>{d.name}</span>
                          </button>
                        ))}
                        <span className="north">N ↑</span>
                      </div>
                    ) : (
                      <div className="destination-list">
                        {destinations.map((d, i) => (
                          <button
                            key={d.id}
                            className={destination === d.id ? 'selected' : ''}
                            onClick={() => setDestination(d.id)}
                          >
                            <span className="letter">{String.fromCharCode(65 + i)}</span>
                            <span>
                              <strong>{d.name}</strong>
                              <small>{d.type}</small>
                            </span>
                            {destination === d.id && <Check size={18} />}
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="map-note">
                      Illustrative campus layout · not to scale. Actual directions open in Google
                      Maps.
                    </p>
                  </section>
                  <section className="white-panel directions-panel">
                    <h2>Plan your walk</h2>
                    <label htmlFor="destination">Destination</label>
                    <select
                      id="destination"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                    >
                      {destinations.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <label htmlFor="origin">
                      Starting point <span className="muted">(optional)</span>
                    </label>
                    <input
                      id="origin"
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="Address or campus building"
                      maxLength={200}
                    />
                    <button
                      className="button secondary full"
                      onClick={findMyLocation}
                      disabled={locationBusy}
                    >
                      <Navigation size={16} />
                      {locationBusy ? 'Finding location…' : 'Use my location'}
                    </button>
                    <p className="small" role="status">
                      {locationMessage ||
                        'You can type a starting point instead of sharing your location.'}
                    </p>
                    <a
                      className="button primary full"
                      href={directions}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open directions <ArrowUpRight size={18} />
                    </a>
                    <p className="small">
                      Opens Google Maps. Your chosen starting point is included in the link.
                    </p>
                    <a
                      className="text-link"
                      href="https://tours.unt.edu/plan-your-visit.html"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Official campus information <ExternalLink size={14} />
                    </a>
                  </section>
                </div>
              </>
            )}
            {/* Move-in checklist */}
            {currentPage === 'utilities' && (
              <>
                <div className="page-heading">
                  <span className="eyebrow">SETTLE IN, ONE STEP AT A TIME</span>
                  <h1>One less thing to forget.</h1>
                  <p>A simple checklist for getting your new place ready.</p>
                </div>
                <div className="detail-layout">
                  <section className="white-panel">
                    <div className="filter-row">
                      {['electricity', 'internet', 'water'].map((u) => (
                        <button
                          className={'chip ' + (u === utility ? 'selected' : '')}
                          key={u}
                          onClick={() => setUtility(u)}
                        >
                          {u === 'electricity' ? (
                            <Lightbulb size={17} />
                          ) : u === 'internet' ? (
                            <Wifi size={17} />
                          ) : (
                            <Droplets size={17} />
                          )}{' '}
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </button>
                      ))}
                    </div>
                    <div className="section-title">
                      <h2>{utility.charAt(0).toUpperCase() + utility.slice(1)} setup</h2>
                      <span className="small">
                        {utilitySteps.filter((s) => progress[utility + ':' + s.id]).length} of 4
                        complete
                      </span>
                    </div>
                    <progress
                      max="4"
                      value={utilitySteps.filter((s) => progress[utility + ':' + s.id]).length}
                      aria-label={utility + ' setup progress'}
                    />
                    <div className="checklist">
                      {utilitySteps.map((s) => (
                        <label
                          className={
                            'checklist-row ' + (progress[utility + ':' + s.id] ? 'complete' : '')
                          }
                          key={utility + ':' + s.id}
                        >
                          <input
                            type="checkbox"
                            checked={!!progress[utility + ':' + s.id]}
                            disabled={pendingAction === 'step-' + utility + ':' + s.id}
                            onChange={(e) => updateChecklistStep(utility + ':' + s.id, e.target.checked)}
                          />
                          <span>
                            <strong>{s.title}</strong>
                            <small>{s.description}</small>
                          </span>
                          {progress[utility + ':' + s.id] && (
                            <span className="done-label">Done</span>
                          )}
                        </label>
                      ))}
                    </div>
                    {!user && (
                      <p className="notice">
                        Sign in to save your checklist progress.{' '}
                        <button
                          className="link-button"
                          onClick={() => showDialog({ type: 'signin' })}
                        >
                          Log in
                        </button>
                      </p>
                    )}
                    {utilitySteps.every((s) => progress[utility + ':' + s.id]) && (
                      <div className="success-box">
                        <CheckCircle2 />
                        All four steps complete. Nice work!
                      </div>
                    )}
                  </section>
                  <aside>
                    <section className="gentle-panel">
                      <Lightbulb size={25} />
                      <h2>Before you choose</h2>
                      <p>
                        Ask your property manager which services are included in rent and which
                        providers serve your address.
                      </p>
                      <p>Complete setup, passwords, and payments on the provider’s own website.</p>
                      <a
                        className="text-link"
                        href="https://www.cityofdenton.com/"
                        target="_blank"
                        rel="noreferrer"
                      >
                        City of Denton information <ExternalLink size={15} />
                      </a>
                    </section>
                    <section className="white-panel">
                      <h3>Your overall progress</h3>
                      <strong className="big-number">
                        {completedSteps}
                        <span> / 12</span>
                      </strong>
                      <p className="small">
                        Steps completed across electricity, internet, and water.
                      </p>
                    </section>
                  </aside>
                </div>
              </>
            )}
            {/* Account and saved items */}
            {currentPage === 'profile' && (
              <>
                <div className="page-heading">
                  <span className="eyebrow">YOUR OWN LITTLE CORNER</span>
                  <h1>
                    {user
                      ? 'Good to see you, ' + user.displayName + '.'
                      : 'Your Campus Survival account'}
                  </h1>
                  <p>
                    {user
                      ? 'Your saved places, useful resources, and campus plans.'
                      : 'Log in or create an account to save your progress.'}
                  </p>
                </div>
                {!user ? (
                  <section className="signin-panel">
                    <StudentSignInForm onSuccess={finishSignIn} />
                  </section>
                ) : (
                  <>
                    <div className="profile-summary">
                      <div className="avatar">{user.displayName.slice(0, 1).toUpperCase()}</div>
                      <div>
                        <h2>{user.displayName}</h2>
                        <span className="badge">
                          {user.studentType === 'incoming'
                            ? 'Incoming student'
                            : 'Current UNT student'}
                        </span>
                      </div>
                      <div className="profile-stats">
                        <strong>
                          {saved.length}
                          <small>saved items</small>
                        </strong>
                        <strong>
                          {completedSteps}
                          <small>checklist steps</small>
                        </strong>
                      </div>
                      <a className="button secondary" href="#settings">
                        <Settings size={16} /> Edit profile
                      </a>
                    </div>
                    <div className="section-title">
                      <h2>Your saved items</h2>
                      <a className="text-link" href="#explore">
                        Find something new <ArrowRight size={15} />
                      </a>
                    </div>
                    <div className="filter-row">
                      {['all', 'housing', 'resources', 'dining', 'transit', 'events'].map((f) => (
                        <button
                          key={f}
                          onClick={() => setFilter(f)}
                          className={'chip ' + (filter === f ? 'selected' : '')}
                        >
                          {f === 'all' ? 'All saved' : f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                      ))}
                    </div>
                    {items.some(
                      (x) => saved.includes(x.id) && (filter === 'all' || x.category === filter),
                    ) ? (
                      <div className="listing-grid">
                        {items
                          .filter(
                            (x) =>
                              saved.includes(x.id) && (filter === 'all' || x.category === filter),
                          )
                          .map((entry) => (
                            <ResourceCard key={entry.id} entry={entry} />
                          ))}
                      </div>
                    ) : (
                      <EmptyState
                        title="A little room for your favorites."
                        copy="Save a listing or resource and it will appear here."
                      >
                        <a className="button primary" href="#explore">
                          Explore campus life
                        </a>
                      </EmptyState>
                    )}
                    <button
                      className="signout-link link-button"
                      disabled={pendingAction === 'signOutStudent'}
                      onClick={signOutStudent}
                    >
                      <LogOut size={16} />
                      {pendingAction === 'signOutStudent' ? 'Logging out…' : 'Log out'}
                    </button>
                  </>
                )}
              </>
            )}
            {/* Profile settings */}
            {currentPage === 'settings' && (
              <>
                <a href="#profile" className="back-link">
                  <ArrowLeft size={15} /> Back to profile
                </a>
                <div className="page-heading">
                  <span className="eyebrow">MAKE IT YOURS</span>
                  <h1>Profile settings</h1>
                  <p>Choose how you appear in the campus community.</p>
                </div>
                {user ? (
                  <form
                    className="white-panel settings-form"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const f = new FormData(e.currentTarget);
                      performAccountAction('profile', async () => {
                        const displayName = String(f.get('displayName')).trim();
                        const studentType = String(f.get('studentType'));
                        await sendCampusApiRequest('profile', { displayName, studentType });
                        setUser({ ...user, displayName, studentType });
                        setToast({ message: 'Your profile has been updated.' });
                      });
                    }}
                  >
                    <label htmlFor="displayName">Display name</label>
                    <input
                      id="displayName"
                      name="displayName"
                      defaultValue={user.displayName}
                      minLength={2}
                      maxLength={50}
                      required
                    />
                    <p className="small">This name appears with your questions and replies.</p>
                    <fieldset>
                      <legend>Which describes you?</legend>
                      <label className="radio-row">
                        <input
                          type="radio"
                          name="studentType"
                          value="incoming"
                          defaultChecked={user.studentType === 'incoming'}
                        />{' '}
                        Incoming student
                      </label>
                      <label className="radio-row">
                        <input
                          type="radio"
                          name="studentType"
                          value="current"
                          defaultChecked={user.studentType === 'current'}
                        />{' '}
                        Current UNT student
                      </label>
                    </fieldset>
                    <button className="button primary" disabled={pendingAction === 'profile'}>
                      {pendingAction === 'profile' ? 'Saving…' : 'Save changes'}
                    </button>
                  </form>
                ) : (
                  <button className="button primary" onClick={() => showDialog({ type: 'signin' })}>
                    Log in to edit your profile
                  </button>
                )}
              </>
            )}
            {/* Community questions */}
            {currentPage === 'community' && (
              <>
                <div className="page-heading heading-with-action">
                  <div>
                    <span className="eyebrow">STUDENTS HELPING STUDENTS</span>
                    <h1>Ask around. Help someone out.</h1>
                    <p>A place for everyday questions about campus life.</p>
                  </div>
                  <button
                    className="button primary"
                    onClick={() => {
                      if (requireStudentAccount()) showDialog({ type: 'question' });
                    }}
                  >
                    <Plus size={19} /> Ask a question
                  </button>
                </div>
                <div className="detail-layout">
                  <section>
                    <div className="filter-row">
                      {['All', 'Housing', 'Getting around', 'Campus life', 'Food', 'Other'].map(
                        (c) => (
                          <button
                            className={'chip ' + (communityFilter === c ? 'selected' : '')}
                            key={c}
                            onClick={() => setCommunityFilter(c)}
                          >
                            {c}
                          </button>
                        ),
                      )}
                    </div>
                    {communityLoading ? (
                      <p role="status">Loading the conversation…</p>
                    ) : (
                      communityQuestions
                        .filter((q) => communityFilter === 'All' || q.category === communityFilter)
                        .map((q) => (
                          <article className="question-card" key={q.id}>
                            <div className="question-avatar">{q.author[0]}</div>
                            <div className="question-content">
                              <span className="small">
                                {q.author} · {formatCommunityPostDate(q.createdAt)}
                              </span>
                              <h2>
                                <a href={'#thread/' + q.id}>{q.title}</a>
                              </h2>
                              <p>
                                {q.body.slice(0, 135)}
                                {q.body.length > 135 ? '…' : ''}
                              </p>
                              <div className="question-bottom">
                                <span className="badge">{q.category}</span>
                                {q.sample && <span className="small">Sample discussion</span>}
                                <span className="reply-count">
                                  <MessageCircle size={15} />
                                  {q.replies || 0} replies
                                </span>
                              </div>
                            </div>
                            <ChevronRight size={19} />
                          </article>
                        ))
                    )}
                    {!communityLoading &&
                      !communityQuestions.some(
                        (q) => communityFilter === 'All' || q.category === communityFilter,
                      ) && (
                        <EmptyState
                          title="Start a conversation."
                          copy="No questions in this category yet."
                        />
                      )}
                  </section>
                  <aside className="gentle-panel community-guidelines">
                    <MessageCircle size={28} />
                    <h2>A little kindness helps.</h2>
                    <p>Ask clearly. Share what helped you. Leave room for different experiences.</p>
                    <ul>
                      <li>Keep private details private.</li>
                      <li>Check important information with official sources.</li>
                      <li>Report content that needs attention.</li>
                    </ul>
                    <a className="text-link" href="#safety">
                      Need official help? <ArrowRight size={15} />
                    </a>
                  </aside>
                </div>
              </>
            )}
            {/* Question and replies */}
            {currentPage === 'thread' && (
              <>
                <a href="#community" className="back-link">
                  <ArrowLeft size={15} /> Back to Community
                </a>
                {communityLoading ? (
                  <p role="status">Loading question…</p>
                ) : (
                  thread && (
                    <div className="thread-layout">
                      <article className="white-panel thread-question">
                        <span className="badge">{thread.question.category}</span>
                        <h1>{thread.question.title}</h1>
                        <p className="small">
                          {thread.question.author} · {formatCommunityPostDate(thread.question.createdAt)}
                          {thread.question.sample ? ' · Sample discussion' : ''}
                        </p>
                        <p className="pre-wrap">{thread.question.body}</p>
                        <button
                          className="link-button muted"
                          onClick={() => {
                            if (requireStudentAccount())
                              showDialog({
                                type: 'report',
                                targetType: 'question',
                                targetId: thread.question.id,
                                title: thread.question.title,
                              });
                          }}
                        >
                          <Flag size={14} /> Report question
                        </button>
                      </article>
                      <h2 className="replies-heading">Replies ({thread.replies.length})</h2>
                      {thread.replies.map((r) => (
                        <article className="reply-card" key={r.id}>
                          <strong>{r.author}</strong>
                          <span className="small"> · {formatCommunityPostDate(r.createdAt)}</span>
                          <p className="pre-wrap">{r.body}</p>
                          <button
                            className="link-button muted"
                            onClick={() => {
                              if (requireStudentAccount())
                                showDialog({
                                  type: 'report',
                                  targetType: 'reply',
                                  targetId: r.id,
                                  title: 'Reply by ' + r.author,
                                });
                            }}
                          >
                            Report reply
                          </button>
                        </article>
                      ))}
                      {thread.replies.length === 0 && (
                        <p className="muted">No replies yet. Have something helpful to share?</p>
                      )}
                      <form
                        className="white-panel reply-form"
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!requireStudentAccount()) return;
                          const form = e.currentTarget;
                          const body = String(new FormData(form).get('body'));
                          performAccountAction('reply', async () => {
                            await sendCampusApiRequest('replies', { questionId: thread.question.id, body });
                            await loadQuestionDiscussion(thread.question.id);
                            form.reset();
                            setToast({ message: 'Your reply has been posted.' });
                          });
                        }}
                      >
                        <label htmlFor="reply-body">Your reply</label>
                        <textarea
                          id="reply-body"
                          name="body"
                          placeholder="Share something helpful…"
                          minLength={2}
                          maxLength={2000}
                          required
                          rows={4}
                        />
                        <p className="small">Be respectful and leave private information out.</p>
                        <button className="button primary" disabled={pendingAction === 'reply'}>
                          {pendingAction === 'reply'
                            ? 'Posting…'
                            : user
                              ? 'Post reply'
                              : 'Sign in to reply'}
                        </button>
                      </form>
                    </div>
                  )
                )}
              </>
            )}
            {/* Safety resources */}
            {currentPage === 'safety' && (
              <>
                <div className="page-heading">
                  <span className="eyebrow">FIND THE RIGHT HELP</span>
                  <h1>Safety & help</h1>
                  <p>Official sources, easy to reach. No sign-in required.</p>
                </div>
                <section className="emergency-panel">
                  <ShieldCheck size={32} />
                  <div>
                    <h2>Immediate danger or a life-threatening emergency?</h2>
                    <p>
                      Call 911. Campus Survival is a student guide and does not dispatch assistance.
                    </p>
                  </div>
                  <a className="button danger" href="tel:911">
                    Call 911
                  </a>
                </section>
                <div className="listing-grid">
                  {[
                    {
                      title: 'UNT Police',
                      copy: 'Official campus safety information and contact details.',
                      url: 'https://police.unt.edu/',
                    },
                    {
                      title: 'Student support',
                      copy: 'Find health, wellbeing, and other university support services.',
                      url: 'https://studentaffairs.unt.edu/',
                    },
                    {
                      title: 'Transportation help',
                      copy: 'Official campus transportation and travel resources.',
                      url: 'https://transportation.unt.edu/student.html',
                    },
                  ].map((h) => (
                    <section className="white-panel" key={h.title}>
                      <ShieldCheck className="green" size={26} />
                      <h2>{h.title}</h2>
                      <p>{h.copy}</p>
                      <a className="text-link" href={h.url} target="_blank" rel="noreferrer">
                        Open official website <ExternalLink size={15} />
                      </a>
                    </section>
                  ))}
                </div>
              </>
            )}
            {![
              'home',
              'explore',
              'housing',
              'transit',
              'dining',
              'resources',
              'events',
              'search',
              'item',
              'map',
              'utilities',
              'profile',
              'settings',
              'community',
              'thread',
              'safety',
            ].includes(currentPage) && (
              <EmptyState title="Let’s get you back on track." copy="This page could not be found.">
                <a className="button primary" href="#home">
                  Go to Home
                </a>
              </EmptyState>
            )}
          </>
        )}
      </main>
      <footer>
        <div className="footer-inner">
          <a className="brand footer-brand" href="#home">
            <GraduationCap size={22} /> Campus Survival
          </a>
          <span>Made for student life. Built by Group 7.</span>
          <a href="#safety">
            Safety & help <ArrowUpRight size={14} />
          </a>
        </div>
        <div className="footer-note">
          CSCE 3444 · Student project · Not an official UNT service. Sample listings and events are
          labeled.
        </div>
      </footer>
      {toast && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toast.message}</span>
          {toast.undo && <button onClick={toast.undo}>Undo</button>}
          <button aria-label="Dismiss notification" onClick={() => setToast(null)}>
            <X size={16} />
          </button>
        </div>
      )}
      {/* Forms shown in a dialog: login, questions, and reports. */}
      {modal && (
        <CampusDialog
          title={
            modal.type === 'signin'
              ? 'Your account'
              : modal.type === 'question'
                ? 'Ask the community'
                : 'Report an issue'
          }
          onClose={() => setModal(null)}
        >
          {modal.type === 'signin' ? (
            <StudentSignInForm onSuccess={finishSignIn} onCancel={() => setModal(null)} />
          ) : modal.type === 'question' ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                performAccountAction('question', async () => {
                  const result = await sendCampusApiRequest('questions', {
                    title: f.get('title'),
                    body: f.get('body'),
                    category: f.get('category'),
                  });
                  setModal(null);
                  goToPage('thread/' + result.id);
                  setToast({ message: 'Your question has been posted.' });
                });
              }}
            >
              <label htmlFor="q-title">Question title</label>
              <input
                autoFocus
                id="q-title"
                name="title"
                placeholder="What would you like to know?"
                minLength={5}
                maxLength={120}
                required
              />
              <label htmlFor="q-category">Category</label>
              <select id="q-category" name="category">
                {['Housing', 'Getting around', 'Campus life', 'Food', 'Other'].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
              <label htmlFor="q-body">A little more detail</label>
              <textarea
                id="q-body"
                name="body"
                placeholder="Give other students a little context…"
                minLength={10}
                maxLength={2000}
                rows={5}
                required
              />
              <p className="small">
                Posts are visible to other visitors. Leave private information out.
              </p>
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button className="button primary" disabled={pendingAction === 'question'}>
                  {pendingAction === 'question' ? 'Posting…' : 'Post question'}
                </button>
              </div>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = new FormData(e.currentTarget);
                performAccountAction('report', async () => {
                  await sendCampusApiRequest('reports', {
                    targetId: modal.targetId,
                    targetType: modal.targetType,
                    reason: f.get('reason'),
                  });
                  setModal(null);
                  setToast({
                    message: 'Your report was saved. It does not automatically remove content.',
                  });
                });
              }}
            >
              <p className="notice">
                Reporting: <strong>{modal.title}</strong>
              </p>
              <label htmlFor="reason">What needs attention?</label>
              <textarea
                autoFocus
                id="reason"
                name="reason"
                minLength={10}
                maxLength={1000}
                rows={5}
                required
                placeholder="Explain what is incorrect or concerning…"
              />
              <p className="small">
                The report is stored for the project team. This is not an emergency contact.
              </p>
              {formError && (
                <p className="form-error" role="alert">
                  {formError}
                </p>
              )}
              <div className="form-actions">
                <button type="button" className="button secondary" onClick={() => setModal(null)}>
                  Cancel
                </button>
                <button className="button primary" disabled={pendingAction === 'report'}>
                  {pendingAction === 'report' ? 'Submitting…' : 'Submit report'}
                </button>
              </div>
            </form>
          )}
        </CampusDialog>
      )}
    </>
  );
}
