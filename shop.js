// Product catalog
// type: 'fruit' are regular purchasable items
// type: 'freebie' are automatically managed bonus items (not sold separately)
const PRODUCTS = {
  apple: { name: "Apple", emoji: "🍏", type: "fruit" },
  banana: { name: "Banana", emoji: "🍌", type: "fruit" },
  lemon: { name: "Lemon", emoji: "🍋", type: "fruit" },
  // Automatically added: 1 x pack per 3 fruits (each pack contains 5 skewers)
  skewers: {
    name: "Wooden Skewers (5 pack) - FREE",
    emoji: "🍢",
    type: "freebie",
  },
};

const FREEBIE_ID = "skewers";
const FRUIT_IDS = Object.keys(PRODUCTS).filter(
  (id) => PRODUCTS[id].type === "fruit"
);

// Ensure the number of free skewer packs matches the number of fruits in basket
function normalizeBasketFreebies(rawBasket) {
  const basket = Array.isArray(rawBasket) ? rawBasket.slice() : [];
  // Count fruit items only
  const fruitCount = basket.filter((id) => FRUIT_IDS.includes(id)).length;
  const desiredPacks = Math.floor(fruitCount / 3);
  const currentPacks = basket.filter((id) => id === FREEBIE_ID).length;

  if (currentPacks === desiredPacks) return basket; // already in sync

  // Remove all existing freebie entries
  const cleaned = basket.filter((id) => id !== FREEBIE_ID);
  // Add the correct number of freebie packs
  for (let i = 0; i < desiredPacks; i++) cleaned.push(FREEBIE_ID);
  return cleaned;
}

function getBasket() {
  try {
    const basket = localStorage.getItem("basket");
    if (!basket) return [];
    const parsed = JSON.parse(basket);
    const normalized = normalizeBasketFreebies(parsed);
    // Persist normalization so other views remain consistent
    localStorage.setItem("basket", JSON.stringify(normalized));
    return Array.isArray(normalized) ? normalized : [];
  } catch (error) {
    console.warn("Error parsing basket from localStorage:", error);
    return [];
  }
}

function addToBasket(product) {
  const basket = getBasket();
  // Prevent manually adding freebies; they are managed automatically
  if (product !== FREEBIE_ID) {
    basket.push(product);
  }
  const normalized = normalizeBasketFreebies(basket);
  localStorage.setItem("basket", JSON.stringify(normalized));
}

function clearBasket() {
  localStorage.removeItem("basket");
}

function renderBasket() {
  const basket = getBasket();
  const basketList = document.getElementById("basketList");
  const cartButtonsRow = document.querySelector(".cart-buttons-row");
  if (!basketList) return;
  basketList.innerHTML = "";
  if (basket.length === 0) {
    basketList.innerHTML = "<li>No products in basket.</li>";
    if (cartButtonsRow) cartButtonsRow.style.display = "none";
    return;
  }
  basket.forEach((product) => {
    const item = PRODUCTS[product];
    if (item) {
      const li = document.createElement("li");
      li.innerHTML = `<span class='basket-emoji'>${item.emoji}</span> <span>${item.name}</span>`;
      basketList.appendChild(li);
    }
  });
  if (cartButtonsRow) cartButtonsRow.style.display = "flex";
}

function renderBasketIndicator() {
  const basket = getBasket();
  let indicator = document.querySelector(".basket-indicator");
  if (!indicator) {
    const basketLink = document.querySelector(".basket-link");
    if (!basketLink) return;
    indicator = document.createElement("span");
    indicator.className = "basket-indicator";
    basketLink.appendChild(indicator);
  }
  if (basket.length > 0) {
    indicator.textContent = basket.length;
    indicator.style.display = "flex";
  } else {
    indicator.style.display = "none";
  }
}

// Call this on page load and after basket changes
if (document.readyState !== "loading") {
  renderBasketIndicator();
} else {
  document.addEventListener("DOMContentLoaded", renderBasketIndicator);
}

// Patch basket functions to update indicator
const origAddToBasket = window.addToBasket;
window.addToBasket = function (product) {
  origAddToBasket(product);
  renderBasketIndicator();
};
const origClearBasket = window.clearBasket;
window.clearBasket = function () {
  origClearBasket();
  renderBasketIndicator();
};
