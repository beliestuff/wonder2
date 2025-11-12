// Simple helper to log errors visibly
function logError(msg, err) {
  console.error("CardDraw:", msg, err || "");
}

// Load cards.json
async function loadCards() {
  try {
    const res = await fetch("./cards.json"); // Make sure path is correct
    if (!res.ok) throw new Error(`Failed to fetch cards.json: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (e) {
    logError("Could not load cards.json — make sure the file exists and path is correct.", e);
    return [];
  }
}

// Weighted random selection
function weightedRandom(cards) {
  const totalWeight = cards.reduce((s, c) => s + (c.weight || 0), 0);
  if (totalWeight <= 0) return null;
  let random = Math.random() * totalWeight;
  for (let card of cards) {
    random -= (card.weight || 0);
    if (random <= 0) return card;
  }
  return null;
}

// Map card rarity to CSS class
function rarityClass(rarity) {
  if (!rarity) return "common";
  const r = rarity.toString().toLowerCase();
  if (r.includes("sir")) return "sir"; // SIR tier glow
  if (r.includes("sfa")) return "sfa"; // SFA tier glow
  if (r.includes("sur")) return "sur"; // SUR tier glow
  if (r.includes("ultra")) return "ultra"; // Ultra Rare no glow
  if (r.includes("rare")) return "rare"; // Rare no glow
  return "common";
}

async function setup() {
  const cards = await loadCards();
  if (!cards.length) {
    logError("No cards loaded. Check cards.json and the network tab.");
    document.getElementById("results").innerText = "No cards loaded — open devtools Console/Network for details.";
    return;
  }

  const drawOneBtn = document.getElementById("draw-one");
  const drawFiveBtn = document.getElementById("draw-five");
  const drawTenBtn = document.getElementById("draw-ten");
  const resultsDiv = document.getElementById("results");

  function renderDrawn(drawn) {
    resultsDiv.innerHTML = "";
    drawn.forEach((card, i) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = `card ${rarityClass(card.rarity)}`;

      // Pick a random image from card.images array
      const randomImage = card.images[Math.floor(Math.random() * card.images.length)];

      cardDiv.innerHTML = `
        <div class="card-inner">
          <div class="card-front"></div>
          <div class="card-back">
            <img src="${randomImage}" alt="${card.name}" />
            <h2>${card.name}</h2>
            <p>${card.rarity || ""}</p>
          </div>
        </div>
      `;
      resultsDiv.appendChild(cardDiv);

      // Flip animation with stagger
      setTimeout(() => cardDiv.classList.add("flipped"), 200 + i * 180);
    });
  }

  // Draw buttons
  drawOneBtn.addEventListener("click", () => {
    const c = weightedRandom(cards);
    if (!c) { logError("weightedRandom returned null"); return; }
    renderDrawn([c]);
  });

  drawFiveBtn.addEventListener("click", () => {
    const drawn = [];
    for (let i = 0; i < 5; i++) {
      const c = weightedRandom(cards);
      if (c) drawn.push(c);
    }
    renderDrawn(drawn);
  });

  drawTenBtn.addEventListener("click", () => {
    const drawn = [];
    for (let i = 0; i < 10; i++) {
      const c = weightedRandom(cards);
      if (c) drawn.push(c);
    }
    renderDrawn(drawn);
  });

  console.log("Card Draw setup complete. Cards loaded:", cards.length);
}

// Run setup after DOM content
setup().catch(e => logError("Setup failed", e));
