function logError(msg, err) {
  console.error("CardDraw:", msg, err || "");
}

async function loadCards() {
  try {
    const res = await fetch("./cards.json");
    if (!res.ok) throw new Error(`Failed to fetch cards.json: ${res.status} ${res.statusText}`);
    return await res.json();
  } catch (e) {
    logError("Could not load cards.json", e);
    return [];
  }
}

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

// Map rarity to class for glow
function rarityClass(rarity) {
  if (!rarity) return "common";
  const r = rarity.toString().trim().toLowerCase();
  if (r === "sir") return "sir";
  if (r === "sfa") return "sfa";
  if (r === "sur") return "sur";
  if (r === "ultra") return "ultra";
  if (r === "rare") return "rare";
  return "common";
}

async function setup() {
  const cards = await loadCards();
  if (!cards.length) {
    logError("No cards loaded.");
    document.getElementById("results").innerText = "No cards loaded.";
    return;
  }

  const resultsDiv = document.getElementById("results");
  const drawOneBtn = document.getElementById("draw-one");

  // Create Draw 5 and Draw 10 buttons
  const drawFiveBtn = document.createElement("button");
  drawFiveBtn.id = "draw-five";
  drawFiveBtn.innerText = "Draw 5";
  drawOneBtn.parentNode.appendChild(drawFiveBtn);

  const drawTenBtn = document.createElement("button");
  drawTenBtn.id = "draw-ten";
  drawTenBtn.innerText = "Draw 10";
  drawOneBtn.parentNode.appendChild(drawTenBtn);

  function renderDrawn(drawn) {
    resultsDiv.innerHTML = "";
    drawn.forEach((card, i) => {
      const cardDiv = document.createElement("div");
      cardDiv.className = `card ${rarityClass(card.rarity)}`;

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
      setTimeout(() => cardDiv.classList.add("flipped"), 200 + i * 180);
    });
  }

  function draw(n) {
    const drawn = [];
    for (let i = 0; i < n; i++) {
      const c = weightedRandom(cards);
      if (c) drawn.push(c);
    }
    renderDrawn(drawn);
  }

  drawOneBtn.addEventListener("click", () => draw(1));
  drawFiveBtn.addEventListener("click", () => draw(5));
  drawTenBtn.addEventListener("click", () => draw(10));

  console.log("Card Draw setup complete. Cards loaded:", cards.length);
}

setup().catch(e => logError("Setup failed", e));
