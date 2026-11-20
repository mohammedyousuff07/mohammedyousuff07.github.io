(() => {
  const root = document.documentElement;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const progressBar = document.getElementById('scroll-progress');
  const projectProgress = document.getElementById('project-progress');
  const projects = document.getElementById('projects');
  const projectStage = document.querySelector('.project-sticky');
  const projectViewport = document.querySelector('.project-viewport');
  const projectTrack = document.getElementById('project-track');
  const nav = document.getElementById('main-nav');
  const navLinks = [...document.querySelectorAll('[data-nav]')];
  const mobileMenu = document.getElementById('menu-toggle');
  const themeToggle = document.getElementById('theme-toggle');
  const yearSelect = document.getElementById('activity-year');
  const contributionGrid = document.getElementById('contribution-grid');
  const monthLabels = document.getElementById('month-labels');
  const activityState = document.getElementById('activity-state');
  const activityFallback = document.getElementById('activity-fallback');
  const currentYear = new Date().getFullYear();
  let projectTravel = 0;
  let scrollFrame = 0;

  document.getElementById('year').textContent = currentYear;
  [...yearSelect.options].forEach(option => { option.value = option.textContent; });
  const savedTheme = localStorage.getItem('m_yousuf_theme');
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
  updateThemeButton();

  themeToggle.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('m_yousuf_theme', root.dataset.theme);
    document.querySelector('meta[name="theme-color"]').content = root.dataset.theme === 'dark' ? '#0d1110' : '#f4f6f3';
    updateThemeButton();
  });
  function updateThemeButton() {
    const light = root.dataset.theme === 'light';
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    themeToggle.title = light ? 'Switch to dark theme' : 'Switch to light theme';
    themeToggle.firstElementChild.textContent = light ? '☾' : '☼';
  }

  mobileMenu.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    mobileMenu.setAttribute('aria-expanded', String(open));
    mobileMenu.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    mobileMenu.firstElementChild.textContent = open ? '×' : '☰';
  });
  navLinks.forEach(link => link.addEventListener('click', () => {
    nav.classList.remove('open');
    mobileMenu.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-label', 'Open navigation menu');
    mobileMenu.firstElementChild.textContent = '☰';
  }));

  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: .12, rootMargin: '0px 0px -4% 0px' });
    document.querySelectorAll('.reveal,.project-card').forEach(item => revealObserver.observe(item));
  } else {
    document.querySelectorAll('.reveal,.project-card').forEach(item => item.classList.add('is-visible'));
  }

  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('active', link.dataset.nav === entry.target.id));
      });
    }, { rootMargin: '-34% 0px -58% 0px', threshold: 0 });
    document.querySelectorAll('[data-section]').forEach(section => sectionObserver.observe(section));
  }

  const mobile = window.matchMedia('(max-width: 620px)');
  function measureProjects() {
    if (!projectTrack || !projects) return;
    projectTravel = Math.max(0, projectTrack.scrollWidth - projectViewport.clientWidth);
    if (mobile.matches || reducedMotion.matches) {
      projects.style.height = '';
      projectTrack.style.transform = '';
      return;
    }
    const style = getComputedStyle(projects);
    const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const naturalHeight = projectStage.offsetHeight + padding;
    projects.style.height = `${Math.max(naturalHeight, window.innerHeight) + projectTravel}px`;
  }
  function updateScroll() {
    scrollFrame = 0;
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.transform = `scaleX(${maxScroll > 0 ? scrollY / maxScroll : 0})`;
    if (!mobile.matches && !reducedMotion.matches && projectTravel > 0) {
      const topOffset = parseFloat(getComputedStyle(projectStage).top) || 0;
      const start = projects.offsetTop - topOffset;
      const end = projects.offsetTop + projects.offsetHeight - window.innerHeight;
      const p = Math.max(0, Math.min(1, (scrollY - start) / Math.max(1, end - start)));
      projectTrack.style.transform = `translate3d(${-projectTravel * p}px,0,0)`;
      projectProgress.style.transform = `scaleX(${Math.max(.04,p)})`;
    } else if (mobile.matches) {
      const max = projectViewport.scrollWidth - projectViewport.clientWidth;
      projectProgress.style.transform = `scaleX(${max > 0 ? Math.max(.04,projectViewport.scrollLeft / max) : 1})`;
    } else {
      projectProgress.style.transform = 'scaleX(1)';
    }
    if (!reducedMotion.matches) {
      const ratio = Math.min(1, scrollY / Math.max(1, window.innerHeight));
      const hero = document.querySelector('.hero');
      hero.style.setProperty('--grid-offset', `${ratio * 18}px`);
      hero.style.setProperty('--glow-offset', `${ratio * 34}px`);
    }
  }
  const onScroll = () => { if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll); };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => { measureProjects(); onScroll(); }, { passive: true });
  projectViewport.addEventListener('scroll', onScroll, { passive: true });
  if ('ResizeObserver' in window) new ResizeObserver(() => { measureProjects(); onScroll(); }).observe(projectTrack);
  measureProjects();
  updateScroll();

  const isoDate = date => date.toISOString().slice(0,10);
  const getApiData = async year => {
    const response = await fetch(`https://github-contributions-api.jogruber.de/v4/mohammedyousuff07?y=${year}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('Activity request failed');
    return response.json();
  };
  const groupByDate = list => new Map((list || []).map(day => [day.date, Number(day.count) || 0]));
  function countCurrentStreak(map) {
    const today = new Date();
    today.setUTCHours(0,0,0,0);
    if (!(map.get(isoDate(today)) > 0)) today.setUTCDate(today.getUTCDate() - 1);
    let count = 0;
    while (map.get(isoDate(today)) > 0) { count++; today.setUTCDate(today.getUTCDate() - 1); }
    return count;
  }
  function countLongestStreak(days) {
    let best = 0, run = 0, previous = null;
    for (const day of days) {
      const date = new Date(`${day.date}T00:00:00Z`);
      if (!(Number(day.count) > 0)) { run = 0; previous = date; continue; }
      if (previous && (date - previous) / 86400000 === 1) run++;
      else run = 1;
      best = Math.max(best, run);
      previous = date;
    }
    return best;
  }
  function drawCalendar(year, days) {
    contributionGrid.replaceChildren();
    monthLabels.replaceChildren();
    const countByDate = groupByDate(days);
    const jan1 = new Date(Date.UTC(year,0,1));
    const pad = jan1.getUTCDay();
    const dayCount = (Date.UTC(year + 1,0,1) - Date.UTC(year,0,1)) / 86400000;
    const weekCount = Math.ceil((pad + dayCount) / 7);
    for (let month = 0; month < 12; month++) {
      const firstDay = Math.floor((pad + (Date.UTC(year,month,1) - Date.UTC(year,0,1)) / 86400000) / 7);
      const label = document.createElement('span');
      label.textContent = new Date(Date.UTC(year,month,1)).toLocaleString('en',{month:'short',timeZone:'UTC'});
      label.style.left = `${firstDay / weekCount * 100}%`;
      monthLabels.append(label);
    }
    for (let week = 0; week < weekCount; week++) {
      for (let weekday = 0; weekday < 7; weekday++) {
        const dayIndex = week * 7 + weekday - pad;
        const cell = document.createElement('span');
        if (dayIndex < 0 || dayIndex >= dayCount) {
          cell.className = 'calendar-cell empty';
          cell.setAttribute('aria-hidden','true');
        } else {
          const date = new Date(Date.UTC(year,0,1 + dayIndex));
          const key = isoDate(date);
          const count = countByDate.get(key) || 0;
          const level = count === 0 ? 0 : Math.min(4, Number((days || []).find(d => d.date === key)?.level) || (count > 8 ? 4 : count > 4 ? 3 : count > 1 ? 2 : 1));
          cell.className = 'calendar-cell';
          cell.dataset.level = String(level);
          cell.title = `${count} contribution${count === 1 ? '' : 's'} on ${key}`;
          cell.setAttribute('aria-label',cell.title);
        }
        contributionGrid.append(cell);
      }
    }
    contributionGrid.setAttribute('aria-label',`${year} GitHub contribution calendar`);
  }
  function setActivityState(text, status = 'ready') {
    activityState.lastChild.textContent = ` ${text}`;
    activityState.dataset.status = status;
  }
  async function loadActivity(year) {
    activityFallback.hidden = true;
    setActivityState('LOADING PUBLIC ACTIVITY','loading');
    try {
      const [yearData, currentData] = await Promise.all([getApiData(year), year === currentYear ? Promise.resolve(null) : getApiData(currentYear)]);
      const days = (yearData.contributions || []).filter(day => day.date.startsWith(String(year)));
      const selectedMap = groupByDate(days);
      const currentDays = currentData ? currentData.contributions || [] : days;
      const currentMap = groupByDate(currentDays);
      const total = yearData.total?.[year] ?? days.reduce((sum, day) => sum + (Number(day.count) || 0), 0);
      document.getElementById('total-contributions').textContent = Number(total).toLocaleString();
      document.getElementById('active-days').textContent = days.filter(day => Number(day.count) > 0).length.toLocaleString();
      document.getElementById('current-streak').textContent = countCurrentStreak(currentMap).toLocaleString();
      document.getElementById('longest-streak').textContent = countLongestStreak(days).toLocaleString();
      drawCalendar(year, days);
      setActivityState('SYNCED FROM PUBLIC GITHUB','ready');
    } catch (error) {
      ['total-contributions','active-days','current-streak','longest-streak'].forEach(id => document.getElementById(id).textContent = '—');
      contributionGrid.replaceChildren();
      monthLabels.replaceChildren();
      setActivityState('PUBLIC DATA UNAVAILABLE','error');
      activityFallback.hidden = false;
    }
  }
  yearSelect.value = String(currentYear);
  yearSelect.addEventListener('change', () => loadActivity(Number(yearSelect.value)));
  loadActivity(Number(yearSelect.value));

  document.getElementById('contact-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const message = String(form.get('message') || '').trim();
    const subject = encodeURIComponent(`Portfolio inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\nFrom: ${name}\nEmail: ${email}`);
    window.location.href = `mailto:mohammedyousuf2310t@gmail.com?subject=${subject}&body=${body}`;
  });
})();
