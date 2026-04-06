const goalForm = document.getElementById("goalForm");
const goalTitle = document.getElementById("goalTitle");
const goalCategory = document.getElementById("goalCategory");
const goalSubcategory = document.getElementById("goalSubcategory");
const customSubcategory = document.getElementById("customSubcategory");
const goalTarget = document.getElementById("goalTarget");
const goalDone = document.getElementById("goalDone");
const goalUnit = document.getElementById("goalUnit");
const goalReward = document.getElementById("goalReward");

const categorySuggestions = document.getElementById("categorySuggestions");
const rewardSuggestions = document.getElementById("rewardSuggestions");

const totalGoalsEl = document.getElementById("totalGoals");
const averageProgressEl = document.getElementById("averageProgress");
const completedGoalsEl = document.getElementById("completedGoals");
const globalRateText = document.getElementById("globalRateText");
const globalProgressBar = document.getElementById("globalProgressBar");
const categoryStats = document.getElementById("categoryStats");

const goalsList = document.getElementById("goalsList");
const rewardsList = document.getElementById("rewardsList");
const clearAllBtn = document.getElementById("clearAllBtn");
const themeSelect = document.getElementById("themeSelect");

let goals = JSON.parse(localStorage.getItem("zenoGoalsV2")) || [];
let currentTheme = localStorage.getItem("zenoThemeV2") || "academique";

const categoryData = {
  "Académique": {
    suggestions: ["Réviser 2h", "Faire 10 exercices", "Lire 20 pages", "Faire une fiche"],
    subcategories: ["Révisions", "TD", "Lecture", "Fiches", "Oral", "Devoirs"]
  },
  "Sport": {
    suggestions: ["Courir 2 km", "Faire 30 min", "10 000 pas", "Séance jambes"],
    subcategories: ["Course", "Marche", "Salle", "Abdos", "Yoga", "Étirements"]
  },
  "Santé": {
    suggestions: ["Boire 2 L d’eau", "Manger équilibré", "Atteindre 1500 kcal"],
    subcategories: ["Hydratation", "Nutrition", "Poids", "Calories"]
  },
  "Sommeil": {
    suggestions: ["Dormir 8h", "Dormir avant 23h", "Réveil sans snooze"],
    subcategories: ["Heures de sommeil", "Routine du soir", "Réveil"]
  },
  "Jeûne": {
    suggestions: ["Tenir tout le jeûne", "Éviter le grignotage", "Respecter l’horaire"],
    subcategories: ["Jeûne complet", "Discipline", "Routine"]
  },
  "Bien-être": {
    suggestions: ["10 min de méditation", "Écrire dans un journal", "Moment sans écran"],
    subcategories: ["Méditation", "Journal", "Calme", "Self-care"]
  },
  "Personnel": {
    suggestions: ["Lire 10 pages", "Ranger le bureau", "Avancer un projet perso"],
    subcategories: ["Lecture", "Organisation", "Projet perso", "Créativité"]
  }
};

const rewardIdeas = [
  "30 min de sortie",
  "Un épisode",
  "Un dessert",
  "Un café/plaisir",
  "Temps libre",
  "Acheter une petite chose",
  "Pause détente",
  "Regarder un film"
];

function saveGoals() {
  localStorage.setItem("zenoGoalsV2", JSON.stringify(goals));
}

function saveTheme(theme) {
  localStorage.setItem("zenoThemeV2", theme);
}

function applyTheme(theme) {
  document.body.classList.remove(
    "theme-academique",
    "theme-nuit",
    "theme-bureau",
    "theme-cute",
    "theme-garcon"
  );
  document.body.classList.add(`theme-${theme}`);
  themeSelect.value = theme;
  saveTheme(theme);
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function getProgressPercent(done, target) {
  if (!target || target <= 0) return 0;
  const percent = Math.round((done / target) * 100);
  return Math.max(0, Math.min(percent, 100));
}

function getProgressLabel(percent) {
  if (percent >= 100) return "Objectif atteint";
  if (percent >= 75) return "Très bon progrès";
  if (percent >= 50) return "Bonne avancée";
  if (percent > 0) return "Début encourageant";
  return "Pas encore commencé";
}

function renderCategorySuggestions(category) {
  categorySuggestions.innerHTML = "";
  goalSubcategory.innerHTML = `<option value="">Choisir ou ajouter</option>`;

  if (!categoryData[category]) return;

  categoryData[category].suggestions.forEach(item => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = item;
    chip.addEventListener("click", () => {
      goalTitle.value = item;
    });
    categorySuggestions.appendChild(chip);
  });

  categoryData[category].subcategories.forEach(sub => {
    const option = document.createElement("option");
    option.value = sub;
    option.textContent = sub;
    goalSubcategory.appendChild(option);
  });
}

function renderRewardSuggestions() {
  rewardSuggestions.innerHTML = "";
  rewardIdeas.forEach(reward => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "chip";
    chip.textContent = reward;
    chip.addEventListener("click", () => {
      goalReward.value = reward;
    });
    rewardSuggestions.appendChild(chip);
  });
}

function createGoalCard(goal) {
  const percent = getProgressPercent(goal.done, goal.target);
  const label = getProgressLabel(percent);

  const card = document.createElement("div");
  card.className = "goal-card";

  card.innerHTML = `
    <div class="goal-top">
      <div>
        <h3 class="goal-title">${escapeHtml(goal.title)}</h3>
        <div class="badges">
          <span class="badge">${escapeHtml(goal.category)}</span>
          <span class="badge">${escapeHtml(goal.subcategory || "Sans sous-catégorie")}</span>
          <span class="badge">${escapeHtml(label)}</span>
        </div>
      </div>
      <div class="goal-percent">${percent}%</div>
    </div>

    <div class="goal-body">
      <p><strong>Objectif visé :</strong> ${goal.target} ${escapeHtml(goal.unit)}</p>
      <p><strong>Réalisé :</strong> ${goal.done} ${escapeHtml(goal.unit)}</p>
      <p><strong>Récompense :</strong> ${escapeHtml(goal.reward)}</p>
    </div>

    <div class="goal-progress">
      <div class="goal-progress-top">
        <span>Progression</span>
        <span>${percent}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-value" style="width:${percent}%"></div>
      </div>
    </div>

    <div class="goal-actions">
      <button class="goal-btn update-btn" data-action="update" data-id="${goal.id}">Mettre à jour le réalisé</button>
      <button class="goal-btn complete-btn" data-action="complete" data-id="${goal.id}">Mettre à 100%</button>
      <button class="delete-btn" data-action="delete" data-id="${goal.id}">Supprimer</button>
    </div>
  `;

  return card;
}

function createRewardCard(goal) {
  const item = document.createElement("div");
  item.className = "reward-item";
  item.innerHTML = `
    <h3>${escapeHtml(goal.reward)}</h3>
    <p>Débloquée grâce à <strong>${escapeHtml(goal.title)}</strong> (${escapeHtml(goal.category)})</p>
  `;
  return item;
}

function updateStats() {
  const total = goals.length;
  const completed = goals.filter(g => getProgressPercent(g.done, g.target) >= 100).length;

  let avg = 0;
  if (total > 0) {
    avg = Math.round(
      goals.reduce((sum, goal) => sum + getProgressPercent(goal.done, goal.target), 0) / total
    );
  }

  totalGoalsEl.textContent = total;
  averageProgressEl.textContent = `${avg}%`;
  completedGoalsEl.textContent = completed;
  globalRateText.textContent = `${avg}%`;
  globalProgressBar.style.width = `${avg}%`;

  renderCategoryStats();
}

function renderCategoryStats() {
  categoryStats.innerHTML = "";

  if (goals.length === 0) {
    categoryStats.innerHTML = `<div class="empty-state">Aucune donnée par catégorie.</div>`;
    return;
  }

  const grouped = {};

  goals.forEach(goal => {
    if (!grouped[goal.category]) grouped[goal.category] = [];
    grouped[goal.category].push(goal);
  });

  Object.keys(grouped).forEach(category => {
    const items = grouped[category];
    const avg = Math.round(
      items.reduce((sum, goal) => sum + getProgressPercent(goal.done, goal.target), 0) / items.length
    );

    const line = document.createElement("div");
    line.className = "category-line";
    line.innerHTML = `
      <div class="category-line-top">
        <span>${escapeHtml(category)}</span>
        <span>${avg}%</span>
      </div>
      <div class="progress-track">
        <div class="progress-value" style="width:${avg}%"></div>
      </div>
    `;
    categoryStats.appendChild(line);
  });
}

function renderGoals() {
  goalsList.innerHTML = "";
  rewardsList.innerHTML = "";

  if (goals.length === 0) {
    goalsList.innerHTML = `<div class="empty-state">Aucun objectif pour le moment.</div>`;
  } else {
    goals.forEach(goal => {
      goalsList.appendChild(createGoalCard(goal));
    });
  }

  const unlockedRewards = goals.filter(goal => getProgressPercent(goal.done, goal.target) >= 100);

  if (unlockedRewards.length === 0) {
    rewardsList.innerHTML = `<div class="empty-state">Aucune récompense débloquée.</div>`;
  } else {
    unlockedRewards.forEach(goal => {
      rewardsList.appendChild(createRewardCard(goal));
    });
  }

  updateStats();
}

function addGoal(event) {
  event.preventDefault();

  const title = goalTitle.value.trim();
  const category = goalCategory.value;
  const selectedSub = goalSubcategory.value;
  const customSub = customSubcategory.value.trim();
  const subcategory = customSub || selectedSub;
  const target = parseFloat(goalTarget.value);
  const done = parseFloat(goalDone.value);
  const unit = goalUnit.value.trim();
  const reward = goalReward.value.trim();

  if (!title || !category || !subcategory || !unit || !reward || isNaN(target) || isNaN(done)) {
    alert("Remplis tous les champs.");
    return;
  }

  const goal = {
    id: Date.now().toString(),
    title,
    category,
    subcategory,
    target,
    done,
    unit,
    reward
  };

  goals.unshift(goal);
  saveGoals();
  renderGoals();
  goalForm.reset();
  goalSubcategory.innerHTML = `<option value="">Choisir ou ajouter</option>`;
  categorySuggestions.innerHTML = "";
}

function handleGoalActions(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) return;

  const index = goals.findIndex(goal => goal.id === id);
  if (index === -1) return;

  if (action === "delete") {
    goals.splice(index, 1);
  }

  if (action === "complete") {
    goals[index].done = goals[index].target;
  }

  if (action === "update") {
    const newValue = prompt("Entre la nouvelle valeur réalisée :", goals[index].done);
    if (newValue === null) return;
    const parsed = parseFloat(newValue);
    if (!isNaN(parsed) && parsed >= 0) {
      goals[index].done = parsed;
    }
  }

  saveGoals();
  renderGoals();
}

function clearAllGoals() {
  const confirmed = confirm("Supprimer tous les objectifs ?");
  if (!confirmed) return;

  goals = [];
  saveGoals();
  renderGoals();
}

goalCategory.addEventListener("change", (e) => {
  renderCategorySuggestions(e.target.value);
});

goalForm.addEventListener("submit", addGoal);
goalsList.addEventListener("click", handleGoalActions);
clearAllBtn.addEventListener("click", clearAllGoals);

themeSelect.addEventListener("change", (e) => {
  applyTheme(e.target.value);
});

renderRewardSuggestions();
applyTheme(currentTheme);
renderGoals();
