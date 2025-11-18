async function loadCards() {
  try {
    const res = await fetch("./cards.json");
    if (!res.ok) throw new Error(`Error cargando cards.json: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error("No se pudo cargar cards.json:", e);
    return [];
  }
}

function weightedRandom(cards) {
  const totalWeight = cards.reduce((s, c) => s + (c.weight || 0), 0);
  let random = Math.random() * totalWeight;
  for (let card of cards) {
    random -= (card.weight || 0);
    if (random <= 0) return card;
  }
  return null;
}

function rarityClass(rarity) {
  if (!rarity) return "common";
  const r = rarity.toString().trim().toLowerCase();
  if (r === "sir") return "sir";
  if (r === "sfa") return "sfa";
  if (r === "sur") return "sur";
  if (r.includes("ultra")) return "ultra";
  if (r.includes("rare")) return "rare";
  return "common";
}

async function setup() {
  const cards = await loadCards();
  if (!cards.length) return;

  const drawOneBtn = document.getElementById("draw-one");
  const drawFiveBtn = document.getElementById("draw-five");
  const drawTenBtn = document.getElementById("draw-ten");
  const resultsDiv = document.getElementById("results");

  function renderDrawn(drawn) {
    resultsDiv.innerHTML = "";

    // Añadimos todas las cartas primero
    drawn.forEach(card => {
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
    });

    // Luego aplicamos la animación de flip con retraso
    document.querySelectorAll(".card").forEach((card, i) => {
      setTimeout(() => card.classList.add("flipped"), 200 + i * 180);
    });
  }

  function draw(n) {
    const drawn = [];
    const pool = [...cards]; // hacemos copia para no repetir si quieres

    for (let i = 0; i < n; i++) {
      const c = weightedRandom(pool);
      if (!c) break;
      drawn.push(c);
      // opcional: eliminar c del pool si no quieres repetidos
      // pool.splice(pool.indexOf(c), 1);
    }

    renderDrawn(drawn);

    // Scroll automático al final
    resultsDiv.scrollIntoView({ behavior: "smooth", block: "end" });
  }

  drawOneBtn?.addEventListener("click", () => draw(1));
  drawFiveBtn?.addEventListener("click", () => draw(5));
  drawTenBtn?.addEventListener("click", () => draw(10));
}

setup();
