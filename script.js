const spots = [
  {
    name: 'Amber (Amer) Fort',
    area: 'Amer',
    vibe: ['History', 'Views'],
    duration: '2–3 hrs',
    best: 'Sunrise',
    notes: 'Ride early to beat crowds; combine with Panna Meena stepwell.',
  },
  {
    name: 'Jaigarh Fort',
    area: 'Amer',
    vibe: ['History', 'Views'],
    duration: '1–1.5 hrs',
    best: 'Morning',
    notes: 'Walkable from Amber via tunnel or short drive uphill.',
  },
  {
    name: 'Panna Meena ka Kund',
    area: 'Amer',
    vibe: ['Photo stop'],
    duration: '20 mins',
    best: 'Morning',
    notes: 'Stop before Amber; quick symmetric-stepwell photo.',
  },
  {
    name: 'City Palace',
    area: 'Old City',
    vibe: ['Culture', 'Architecture'],
    duration: '1.5 hrs',
    best: 'Morning',
    notes: 'Buy composite ticket; museum rooms and courtyards.',
  },
  {
    name: 'Jantar Mantar',
    area: 'Old City',
    vibe: ['Science', 'Culture'],
    duration: '45 mins',
    best: 'Morning',
    notes: 'UNESCO observatory right beside City Palace.',
  },
  {
    name: 'Hawa Mahal',
    area: 'Old City',
    vibe: ['Architecture', 'Photo stop'],
    duration: '30–45 mins',
    best: 'Evening',
    notes: 'Golden hour photos from café rooftops opposite the façade.',
  },
  {
    name: 'Bapu Bazaar & Johari Bazaar',
    area: 'Old City',
    vibe: ['Shopping', 'Food'],
    duration: 'Flexible',
    best: 'Evening',
    notes: 'Textiles, jewelry, and street eats—carry cash and bargain kindly.',
  },
  {
    name: 'Albert Hall Museum',
    area: 'Central',
    vibe: ['Museum', 'Culture'],
    duration: '1 hr',
    best: 'Evening',
    notes: 'Wrap with a sunset stroll at the adjacent lawns.',
  },
  {
    name: 'Nahargarh Fort',
    area: 'Aravalli Ridge',
    vibe: ['Views', 'History'],
    duration: '1.5 hrs',
    best: 'Sunset',
    notes: 'Panoramic city views; arrive before dusk for café seating.',
  },
  {
    name: 'Patrika Gate',
    area: 'Jawahar Circle',
    vibe: ['Photo stop', 'Architecture'],
    duration: '20 mins',
    best: 'Sunrise',
    notes: 'Arrive early for empty colorful arches.',
  },
  {
    name: 'Galta Ji (Monkey Temple)',
    area: 'Outskirts',
    vibe: ['Spiritual', 'Photo stop'],
    duration: '1 hr',
    best: 'Morning',
    notes: 'Carry water; gentle climb with langurs along the path.',
  },
  {
    name: 'Spice Court',
    area: 'Civil Lines',
    vibe: ['Food'],
    duration: 'Dinner',
    best: 'Evening',
    notes: 'Laal Maas, Jungli Maas, and classic Rajasthani thalis.',
  },
  {
    name: 'Tapri Central',
    area: 'C-Scheme',
    vibe: ['Food', 'Views'],
    duration: 'Tea break',
    best: 'Evening',
    notes: 'Rooftop chai stop between museums and shopping.',
  },
  {
    name: 'LMB & Bapu Bazaar eats',
    area: 'Old City',
    vibe: ['Food', 'Shopping'],
    duration: 'Snack',
    best: 'Afternoon',
    notes: 'Grab pyaaz kachori, ghewar, and continue through the bazaars.',
  },
];

const filterOptions = ['History', 'Views', 'Culture', 'Architecture', 'Photo stop', 'Shopping', 'Food', 'Museum', 'Science', 'Spiritual'];
const dayParts = ['Sunrise', 'Morning', 'Afternoon', 'Evening', 'Sunset'];

const state = {
  filters: new Set(),
  daypart: new Set(),
  search: '',
  plan: [],
};

const filtersContainer = document.getElementById('filters');
const daypartContainer = document.getElementById('daypart');
const resultsContainer = document.getElementById('results');
const planContainer = document.getElementById('plan');
const countLabel = document.getElementById('count');
const summary = document.getElementById('summary');
const searchInput = document.getElementById('search');

function renderFilters() {
  filtersContainer.innerHTML = '';
  filterOptions.forEach((opt) => {
    const button = document.createElement('button');
    button.textContent = opt;
    button.classList.toggle('active', state.filters.has(opt));
    button.addEventListener('click', () => toggleFilter(opt));
    filtersContainer.appendChild(button);
  });
}

function renderDayparts() {
  daypartContainer.innerHTML = '';
  dayParts.forEach((opt) => {
    const button = document.createElement('button');
    button.textContent = opt;
    button.classList.toggle('active', state.daypart.has(opt));
    button.addEventListener('click', () => toggleDaypart(opt));
    daypartContainer.appendChild(button);
  });
}

function toggleFilter(opt) {
  if (state.filters.has(opt)) {
    state.filters.delete(opt);
  } else {
    state.filters.add(opt);
  }
  renderFilters();
  renderResults();
}

function toggleDaypart(opt) {
  if (state.daypart.has(opt)) {
    state.daypart.delete(opt);
  } else {
    state.daypart.add(opt);
  }
  renderDayparts();
  renderResults();
}

function matchesFilters(spot) {
  const matchesVibe = state.filters.size === 0 || [...state.filters].every((f) => spot.vibe.includes(f));
  const matchesDaypart = state.daypart.size === 0 || state.daypart.has(spot.best);
  const matchesSearch = spot.name.toLowerCase().includes(state.search.toLowerCase());
  return matchesVibe && matchesDaypart && matchesSearch;
}

function renderResults() {
  const filtered = spots.filter(matchesFilters);
  countLabel.textContent = `${filtered.length} spot${filtered.length === 1 ? '' : 's'} match your filters`;
  resultsContainer.innerHTML = '';

  filtered.forEach((spot) => {
    const card = document.createElement('article');
    card.className = 'result-card';
    if (state.plan.find((p) => p.name === spot.name)) {
      card.classList.add('selected');
    }
    card.addEventListener('click', () => togglePlan(spot));

    const title = document.createElement('h4');
    title.textContent = spot.name;

    const meta = document.createElement('p');
    meta.textContent = `${spot.area} • ${spot.duration} • best: ${spot.best}`;

    const tags = document.createElement('div');
    tags.className = 'tag-row';
    spot.vibe.forEach((v) => {
      const tag = document.createElement('span');
      tag.className = 'tag';
      tag.textContent = v;
      tags.appendChild(tag);
    });

    const note = document.createElement('p');
    note.textContent = spot.notes;

    card.appendChild(title);
    card.appendChild(meta);
    card.appendChild(tags);
    card.appendChild(note);

    resultsContainer.appendChild(card);
  });
}

function togglePlan(spot) {
  const exists = state.plan.find((p) => p.name === spot.name);
  if (exists) {
    state.plan = state.plan.filter((p) => p.name !== spot.name);
  } else {
    state.plan = sortPlan([...state.plan, spot]);
  }
  renderResults();
  renderPlan();
}

function sortPlan(plan) {
  const areaPriority = ['Amer', 'Outskirts', 'Aravalli Ridge', 'Jawahar Circle', 'Central', 'Civil Lines', 'C-Scheme', 'Old City'];
  return plan.sort((a, b) => areaPriority.indexOf(a.area) - areaPriority.indexOf(b.area));
}

function renderPlan() {
  planContainer.innerHTML = '';
  state.plan.forEach((spot) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = spot.name;

    const sub = document.createElement('small');
    sub.textContent = `${spot.area} • ${spot.duration} • best: ${spot.best}`;

    const note = document.createElement('small');
    note.textContent = spot.notes;

    item.appendChild(title);
    item.appendChild(sub);
    item.appendChild(note);
    item.addEventListener('click', () => togglePlan(spot));
    planContainer.appendChild(item);
  });

  if (state.plan.length === 0) {
    summary.textContent = 'Add a couple of stops to see a balanced loop.';
  } else {
    const morning = state.plan.filter((p) => ['Sunrise', 'Morning'].includes(p.best)).length;
    const evening = state.plan.filter((p) => ['Evening', 'Sunset'].includes(p.best)).length;
    summary.textContent = `${state.plan.length} picks • ${morning} morning-friendly • ${evening} evening-friendly`;
  }
}

function reset() {
  state.filters = new Set();
  state.daypart = new Set();
  state.search = '';
  searchInput.value = '';
  renderFilters();
  renderDayparts();
  renderResults();
}

searchInput.addEventListener('input', (e) => {
  state.search = e.target.value;
  renderResults();
});

document.getElementById('reset').addEventListener('click', reset);

renderFilters();
renderDayparts();
renderResults();
renderPlan();
