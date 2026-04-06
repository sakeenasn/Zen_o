const goalForm = document.getElementById("goalForm");
const goalTitle = document.getElementById("goalTitle");
const goalCategory = document.getElementById("goalCategory");
const goalTarget = document.getElementById("goalTarget");
const goalReward = document.getElementById("goalReward");

const goalsList = document.getElementById("goalsList");
const rewardsList = document.getElementById("rewardsList");

const totalGoalsEl = document.getElementById("totalGoals");
const successCountEl = document.getElementById("successCount");
const failCountEl = document.getElementById("failCount");
const successRateEl = document.getElementById("successRate");
const progressFill = document.getElementById("progressFill");

const emptyGoals = document.getElementById("emptyGoals");
const emptyRewards = document.getElementById("emptyRewards");
const clearAllBtn = document.getElementById("clearAllBtn");

const themeSelect = document.getElementById("themeSelect");
const motivationText = document.getElementById("motivationText");

const motivationalQuotes = [
  "Chaque petit effort compte.",
  "La discipline d’aujourd’hui construit les résultats de demain.",
  "Reste régulière, pas parfaite.",
  "Un objectif atteint est une promesse tenue à toi-même.",
  "Ton évolution commence par une seule action."
];

let goals = JSON.parse(localStorage.getItem("zenoGoals")) || [];
let currentTheme = localStorage.getItem("zenoTheme") || "rose";

function saveGoals() {
  localStorage.setItem("zenoGoals", JSON.stringify(goals));
}

function saveTheme(theme) {
  localStorage.setItem("zenoTheme", theme);
}

function setRandomQuote() {
  const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
  motivationText.textContent = motivationalQuotes[randomIndex];
}

function applyTheme(theme) {
  document.body.classList.remove("theme-rose", "theme-blue", "theme-sage", "theme-beige");
  document.body.classList.add(`theme-${theme}`);
  themeSelect.value = theme;
  saveTheme(theme);
}

function updateStats() {
  const total = goals.length;
  const success = goals.filter(goal => goal.status === "success").length;
  const fail = goals.filter(goal => goal.status === "fail").length;
  const rate = total > 0 ? Math.round((success / total) * 100) : 0;

  totalGoalsEl.textContent = total;
  successCountEl.textContent = success;
  failCountEl.textContent = fail;
  successRateEl.textContent = `${rate}%`;
  progressFill.style.width = `${rate}%`;
}

function createGoalCard(goal) {
  const card = document.createElement("div");
  card.className = "goal-card";

  let statusClass = "status-pending";
  let statusText = "En attente";

  if (goal.status === "success") {
    statusClass = "status-success";
    statusText = "Réussi";
  } else if (goal.status === "fail") {
    statusClass = "status-fail";
    statusText = "Échec";
  }

  card.innerHTML = `
    <div class="goal-top">
      <div>
        <h3 class="goal-title">${escapeHtml(goal.title)}</h3>
        <span class="goal-category">${escapeHtml(goal.category)}</span>
      </div>
      <span class="goal-status ${statusClass}">${statusText}</span>
    </div>

    <div class="goal-info">
      <p><strong>Objectif :</strong> ${escapeHtml(goal.target)}</p>
      <p><strong>Récompense :</strong> ${escapeHtml(goal.reward)}</p>
    </div>

    <div class="goal-actions">
      <button class="goal-action-btn btn-success" data-action="success" data-id="${goal.id}">
        Atteint
      </button>
      <button class="goal-action-btn btn-fail" data-action="fail" data-id="${goal.id}">
        Non atteint
      </button>
      <button class="delete-btn" data-action="delete" data-id="${goal.id}">
        Supprimer
      </button>
    </div>
  `;

  return card;
}

function createRewardCard(goal) {
  const card = document.createElement("div");
  card.className = "reward-card";
  card.innerHTML = `
    <h3>${escapeHtml(goal.reward)}</h3>
    <p>Débloquée grâce à : <strong>${escapeHtml(goal.title)}</strong></p>
  `;
  return card;
}

function renderGoals() {
  goalsList.innerHTML = "";
  rewardsList.innerHTML = "";

  if (goals.length === 0) {
    goalsList.appendChild(emptyGoals);
  } else {
    goals.forEach(goal => {
      goalsList.appendChild(createGoalCard(goal));
    });
  }

  const unlockedRewards = goals.filter(goal => goal.status === "success");

  if (unlockedRewards.length === 0) {
    rewardsList.appendChild(emptyRewards);
  } else {
    unlockedRewards.forEach(goal => {
      rewardsList.appendChild(createRewardCard(goal));
    });
  }

  updateStats();
}

function addGoal(event) {
  event.preventDefault();

  const newGoal = {
    id: Date.now().toString(),
    title: goalTitle.value.trim(),
    category: goalCategory.value,
    target: goalTarget.value.trim(),
    reward: goalReward.value.trim(),
    status: "pending"
  };

  if (!newGoal.title || !newGoal.category || !newGoal.target || !newGoal.reward) {
    return;
  }

  goals.unshift(newGoal);
  saveGoals();
  renderGoals();
  goalForm.reset();
}

function handleGoalActions(event) {
  const button = event.target.closest("button");
  if (!button) return;

  const action = button.dataset.action;
  const id = button.dataset.id;
  if (!action || !id) return;

  const index = goals.findIndex(goal => goal.id === id);
  if (index === -1) return;

  if (action === "success") {
    goals[index].status = "success";
  }

  if (action === "fail") {
    goals[index].status = "fail";
  }

  if (action === "delete") {
    goals.splice(index, 1);
  }

  saveGoals();
  renderGoals();
}

function clearAllGoals() {
  const confirmed = confirm("Veux-tu vraiment supprimer tous les objectifs ?");
  if (!confirmed) return;

  goals = [];
  saveGoals();
  renderGoals();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

goalForm.addEventListener("submit", addGoal);
goalsList.addEventListener("click", handleGoalActions);
clearAllBtn.addEventListener("click", clearAllGoals);

themeSelect.addEventListener("change", (e) => {
  applyTheme(e.target.value);
});

setRandomQuote();
applyTheme(currentTheme);
renderGoals();
