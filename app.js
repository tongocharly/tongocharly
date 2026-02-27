const storageKey = "openbook-studio-v1";
const state = {
  user: null,
  goals: { dailyWords: 1200, weeklyGoal: "Écrire 1 chapitre" },
  books: [],
  selectedBookId: null,
};

const defaultCover =
  "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=900&q=80";

const el = {
  authForm: document.getElementById("auth-form"),
  emailInput: document.getElementById("email-input"),
  authStatus: document.getElementById("auth-status"),
  googleLogin: document.getElementById("google-login"),
  wattpadLogin: document.getElementById("wattpad-login"),
  goalsForm: document.getElementById("goals-form"),
  dailyWords: document.getElementById("daily-words"),
  weeklyGoal: document.getElementById("weekly-goal"),
  goalStats: document.getElementById("goal-stats"),
  newBookBtn: document.getElementById("new-book-btn"),
  bookGrid: document.getElementById("book-grid"),
  sharedGrid: document.getElementById("shared-grid"),
  bookCounter: document.getElementById("book-counter"),
  editor: document.getElementById("editor"),
  editorTitle: document.getElementById("editor-title"),
  shareBookBtn: document.getElementById("share-book-btn"),
  wattpadExportBtn: document.getElementById("wattpad-export-btn"),
  saveBookBtn: document.getElementById("save-book-btn"),
  bookTitle: document.getElementById("book-title"),
  bookCover: document.getElementById("book-cover"),
  bookDescription: document.getElementById("book-description"),
  bookCharacters: document.getElementById("book-characters"),
  bookPlot: document.getElementById("book-plot"),
  bookIdeas: document.getElementById("book-ideas"),
  bookImages: document.getElementById("book-images"),
  bookStoryboard: document.getElementById("book-storyboard"),
  bookChapters: document.getElementById("book-chapters"),
  bookWriting: document.getElementById("book-writing"),
  wordCount: document.getElementById("word-count"),
  bookTemplate: document.getElementById("book-card-template"),
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function countWords(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  const parsed = JSON.parse(saved);
  Object.assign(state, parsed);
}

function getSelectedBook() {
  return state.books.find((b) => b.id === state.selectedBookId);
}

function renderAuth() {
  el.authStatus.textContent = state.user
    ? `Connecté en tant que ${state.user.name} via ${state.user.provider}`
    : "Aucun compte connecté";
}

function renderGoals() {
  el.dailyWords.value = state.goals.dailyWords;
  el.weeklyGoal.value = state.goals.weeklyGoal;

  const totalWords = state.books.reduce((acc, b) => acc + (b.wordsToday || 0), 0);
  const progress = Math.min(100, Math.round((totalWords / (state.goals.dailyWords || 1)) * 100));

  el.goalStats.innerHTML = `
    <p><strong>Progression du jour:</strong> ${totalWords} / ${state.goals.dailyWords} mots (${progress}%)</p>
    <p><strong>Objectif semaine:</strong> ${state.goals.weeklyGoal}</p>
  `;
}

function makeCard(book, readOnly = false) {
  const node = el.bookTemplate.content.cloneNode(true);
  node.querySelector("img").src = book.cover || defaultCover;
  node.querySelector("h3").textContent = book.title || "Livre sans titre";
  node.querySelector(".meta").textContent = `${book.wordsToday || 0} mots aujourd'hui · ${book.chapters.length} chapitres`;
  node.querySelector(".description").textContent = book.description || "Ajoute une description pour ton roman.";
  const openBtn = node.querySelector(".open-btn");
  openBtn.setAttribute("aria-label", readOnly ? `Lire ${book.title}` : `Ouvrir ${book.title}`);
  if (readOnly) {
    openBtn.addEventListener("click", () => {
      alert(`Livre partagé par ${book.owner}.\n\nRésumé: ${book.description || "—"}`);
    });
  } else {
    openBtn.addEventListener("click", () => openEditor(book.id));
  }
  return node;
}

function renderBooks() {
  el.bookGrid.innerHTML = "";
  el.sharedGrid.innerHTML = "";

  const mine = state.books.filter((b) => b.owner === (state.user?.name || "local"));
  const shared = state.books.filter((b) => b.shared);

  mine.forEach((book) => el.bookGrid.appendChild(makeCard(book)));
  shared.forEach((book) => el.sharedGrid.appendChild(makeCard(book, true)));

  el.bookCounter.textContent = `${mine.length} livre(s)`;
}

function createBook() {
  const owner = state.user?.name || "local";
  const book = {
    id: uid(),
    owner,
    title: "Nouveau livre",
    cover: defaultCover,
    description: "",
    characters: "",
    plot: "",
    ideas: "",
    images: "",
    storyboard: "",
    chapters: [],
    writing: "",
    wordsToday: 0,
    shared: false,
  };
  state.books.unshift(book);
  state.selectedBookId = book.id;
  saveState();
  renderAll();
  openEditor(book.id);
}

function fillEditor(book) {
  el.editorTitle.textContent = `Édition · ${book.title || "Sans titre"}`;
  el.bookTitle.value = book.title;
  el.bookCover.value = book.cover;
  el.bookDescription.value = book.description;
  el.bookCharacters.value = book.characters;
  el.bookPlot.value = book.plot;
  el.bookIdeas.value = book.ideas;
  el.bookImages.value = book.images;
  el.bookStoryboard.value = book.storyboard;
  el.bookChapters.value = book.chapters.join("\n");
  el.bookWriting.value = book.writing;
  el.wordCount.textContent = `${book.wordsToday || 0} mots écrits aujourd'hui`;
}

function openEditor(id) {
  state.selectedBookId = id;
  const book = getSelectedBook();
  if (!book) return;
  fillEditor(book);
  el.editor.classList.remove("hidden");
}

function saveEditor() {
  const book = getSelectedBook();
  if (!book) return;
  book.title = el.bookTitle.value.trim();
  book.cover = el.bookCover.value.trim() || defaultCover;
  book.description = el.bookDescription.value.trim();
  book.characters = el.bookCharacters.value.trim();
  book.plot = el.bookPlot.value.trim();
  book.ideas = el.bookIdeas.value.trim();
  book.images = el.bookImages.value.trim();
  book.storyboard = el.bookStoryboard.value.trim();
  book.chapters = el.bookChapters.value.split("\n").map((c) => c.trim()).filter(Boolean);
  book.writing = el.bookWriting.value;
  book.wordsToday = countWords(book.writing);

  saveState();
  renderAll();
  fillEditor(book);
}

function exportWattpad() {
  const book = getSelectedBook();
  if (!book) return;

  const wattpadCompatible = {
    platform: "WattPad-ready",
    metadata: {
      title: book.title,
      description: book.description,
      characters: book.characters,
      storyboard: book.storyboard,
      cover: book.cover,
    },
    chapters: book.chapters,
    text: book.writing,
  };

  const blob = new Blob([JSON.stringify(wattpadCompatible, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${(book.title || "livre").replace(/\s+/g, "_")}_wattpad.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

function seedIfEmpty() {
  if (state.books.length) return;
  state.books = [
    {
      id: uid(),
      owner: "local",
      title: "Les Chroniques de Nébuleuse",
      cover: defaultCover,
      description: "Un récit SF centré sur une IA empathique.",
      characters: "Mila, Orion, Le Conservateur",
      plot: "Conflit entre mémoire humaine et mémoire synthétique",
      ideas: "Finale dans une bibliothèque orbitale",
      images: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564",
      storyboard: "Acte 1 découverte, Acte 2 rupture, Acte 3 renaissance",
      chapters: ["Chapitre 1: Premier signal", "Chapitre 2: Le pacte"],
      writing: "",
      wordsToday: 0,
      shared: true,
    },
  ];
}

function renderAll() {
  renderAuth();
  renderGoals();
  renderBooks();
}

el.authForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const mail = el.emailInput.value.trim();
  if (!mail) return;
  state.user = { name: mail.split("@")[0], provider: "Email" };
  saveState();
  renderAll();
});

el.googleLogin.addEventListener("click", () => {
  state.user = { name: "GoogleUser", provider: "Google" };
  saveState();
  renderAll();
});

el.wattpadLogin.addEventListener("click", () => {
  state.user = { name: "WattPadWriter", provider: "WattPad" };
  saveState();
  renderAll();
});

el.goalsForm.addEventListener("submit", (e) => {
  e.preventDefault();
  state.goals.dailyWords = Number(el.dailyWords.value) || 1200;
  state.goals.weeklyGoal = el.weeklyGoal.value.trim() || "Écrire 1 chapitre";
  saveState();
  renderGoals();
});

el.newBookBtn.addEventListener("click", createBook);
el.saveBookBtn.addEventListener("click", saveEditor);
el.shareBookBtn.addEventListener("click", () => {
  const book = getSelectedBook();
  if (!book) return;
  book.shared = !book.shared;
  saveState();
  renderBooks();
});
el.wattpadExportBtn.addEventListener("click", exportWattpad);
el.bookWriting.addEventListener("input", () => {
  const words = countWords(el.bookWriting.value);
  el.wordCount.textContent = `${words} mots écrits aujourd'hui`;
});

loadState();
seedIfEmpty();
renderAll();
