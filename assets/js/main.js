(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (!header || !toggle || !nav) return;

  const setMenuState = (isOpen) => {
    header.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "メニューを閉じる" : "メニューを開く",
    );
  };

  toggle.addEventListener("click", () => {
    setMenuState(!header.classList.contains("is-open"));
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.classList.contains("is-open")) {
      setMenuState(false);
      toggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) setMenuState(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) setMenuState(false);
  });
})();

(() => {
  const slider = document.querySelector(".detail-works-slider");
  if (!slider) return;

  const viewport = slider.querySelector(".detail-works-viewport");
  const cards = Array.from(slider.querySelectorAll(".detail-work-card"));
  const previous = slider.querySelector(".detail-works-arrow--left");
  const next = slider.querySelector(".detail-works-arrow--right");

  if (!viewport || !previous || !next || cards.length === 0) return;

  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const dots = document.createElement("div");
  dots.className = "detail-works-dots";
  dots.setAttribute("aria-label", "作品スライドを選択");
  slider.appendChild(dots);

  let currentIndex = 0;
  let scrollTimer = 0;

  const getCardLeft = (card) =>
    Math.max(
      0,
      card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2,
    );

  const updateState = () => {
    cards.forEach((card, index) => {
      card.classList.toggle("is-active", index === currentIndex);
    });
    dotButtons.forEach((dot, index) => {
      const active = index === currentIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
  };

  const goTo = (index, behavior = reduceMotion ? "auto" : "smooth") => {
    currentIndex = (index + cards.length) % cards.length;
    viewport.scrollTo({
      left: getCardLeft(cards[currentIndex]),
      behavior,
    });
    updateState();
  };

  const dotButtons = cards.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "detail-works-dot";
    dot.setAttribute("aria-label", `作品スライド${index + 1}を表示`);
    dot.setAttribute("aria-pressed", "false");
    dot.addEventListener("click", () => goTo(index));
    dots.appendChild(dot);
    return dot;
  });

  previous.addEventListener("click", () => goTo(currentIndex - 1));
  next.addEventListener("click", () => goTo(currentIndex + 1));

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goTo(currentIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goTo(currentIndex + 1);
    }
  });

  viewport.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => {
        currentIndex = cards.reduce((closest, card, index) => {
          const currentDistance = Math.abs(
            viewport.scrollLeft - getCardLeft(card),
          );
          const closestDistance = Math.abs(
            viewport.scrollLeft - getCardLeft(cards[closest]),
          );
          return currentDistance < closestDistance ? index : closest;
        }, 0);
        updateState();
      }, 100);
    },
    { passive: true },
  );

  window.addEventListener("resize", () => goTo(currentIndex, "auto"));
  window.requestAnimationFrame(() => goTo(0, "auto"));
})();
