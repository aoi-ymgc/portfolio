const initSimpleCarousel = ({
  rootSelector,
  viewportSelector,
  trackSelector,
  cardSelector,
  leftSelector,
  rightSelector,
  dotsClass,
  dotClass,
  activeClass,
  alignMode = "start",
  enableScrollLoop = false,
}) => {
  const root = document.querySelector(rootSelector);
  const viewport = document.querySelector(viewportSelector);
  const track = document.querySelector(trackSelector);
  const left = document.querySelector(leftSelector);
  const right = document.querySelector(rightSelector);

  if (!root || !viewport || !track || !left || !right) return;

  const cards = Array.from(track.querySelectorAll(cardSelector));
  if (cards.length === 0) return;
  const loopEnabled = enableScrollLoop && cards.length > 1;

  const createLoopClone = (card) => {
    const clone = card.cloneNode(true);
    clone.classList.remove(activeClass);
    clone.setAttribute("aria-hidden", "true");
    clone
      .querySelectorAll("a, button, input, select, textarea, [tabindex]")
      .forEach((element) => {
        element.setAttribute("tabindex", "-1");
      });
    return clone;
  };

  if (loopEnabled) {
    const headClone = createLoopClone(cards[cards.length - 1]);
    const tailClone = createLoopClone(cards[0]);
    track.insertBefore(headClone, cards[0]);
    track.appendChild(tailClone);
  }

  const dots =
    root.querySelector(`.${dotsClass}`) ||
    (() => {
      const container = document.createElement("div");
      container.className = dotsClass;
      container.setAttribute("aria-label", "スライドを選択");
      root.appendChild(container);
      return container;
    })();
  dots.innerHTML = "";

  const wrapIndex = (index) => (index + cards.length) % cards.length;
  let currentIndex = 0;
  let scrollTimerId = 0;
  let resizeTimerId = 0;
  let cardTargets = [];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const getTargetLeft = (target) => {
    if (!target) return viewport.scrollLeft;
    const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    if (alignMode === "center") {
      const centeredLeft =
        target.offsetLeft - (viewport.clientWidth - target.offsetWidth) / 2;
      return clamp(centeredLeft, 0, maxLeft);
    }
    return clamp(
      target.offsetLeft - (viewport.clientWidth - target.clientWidth) / 2,
      0,
      maxLeft,
    );
  };

  const getCardLeft = (index) => getTargetLeft(cards[index]);

  const rebuildTargets = () => {
    cardTargets = cards.map((_, index) => getCardLeft(index));
  };

  const updateActive = () => {
    cards.forEach((card, index) => {
      card.classList.toggle(activeClass, index === currentIndex);
    });
    dotButtons.forEach((dot, index) => {
      const isActive = index === currentIndex;
      dot.classList.toggle(activeClass, isActive);
      dot.setAttribute("aria-pressed", isActive ? "true" : "false");
    });
  };

  const getClosestIndex = (preferredIndex = currentIndex) => {
    if (!cardTargets.length) rebuildTargets();
    const currentLeft = viewport.scrollLeft;
    let closest = currentIndex;
    let minDistance = Infinity;

    cardTargets.forEach((targetLeft, index) => {
      const distance = Math.abs(targetLeft - currentLeft);
      if (distance < minDistance) {
        minDistance = distance;
        closest = index;
        return;
      }
      if (distance !== minDistance) return;
      const currentDelta = Math.abs(closest - preferredIndex);
      const nextDelta = Math.abs(index - preferredIndex);
      if (nextDelta < currentDelta) {
        closest = index;
        return;
      }
      if (nextDelta === currentDelta && index < closest) {
        closest = index;
      }
    });

    return closest;
  };

  const alignToIndex = (index, behavior = "smooth") => {
    if (!cardTargets.length) rebuildTargets();
    currentIndex = wrapIndex(index);
    const targetLeft = cardTargets[currentIndex] ?? getCardLeft(currentIndex);
    viewport.scrollTo({ left: targetLeft, behavior });
    updateActive();
  };

  const jumpFromLoopEdge = () => {
    if (!loopEnabled || !cardTargets.length) {
      return false;
    }

    const currentLeft = viewport.scrollLeft;
    const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const edgeTolerance = 2;

    if (currentLeft <= edgeTolerance) {
      currentIndex = cards.length - 1;
      viewport.scrollTo({ left: cardTargets[currentIndex], behavior: "auto" });
      updateActive();
      return true;
    }

    if (currentLeft >= maxLeft - edgeTolerance) {
      currentIndex = 0;
      viewport.scrollTo({ left: cardTargets[currentIndex], behavior: "auto" });
      updateActive();
      return true;
    }

    return false;
  };

  const stepBy = (delta) => {
    if (!cardTargets.length) rebuildTargets();
    currentIndex = getClosestIndex(currentIndex);
    const currentLeft = cardTargets[currentIndex] ?? viewport.scrollLeft;
    let nextIndex = wrapIndex(currentIndex + delta);
    let attempts = 0;

    if (delta > 0) {
      while (attempts < cards.length - 1) {
        const nextLeft = cardTargets[nextIndex] ?? getCardLeft(nextIndex);
        if (nextLeft > currentLeft + 1 || nextIndex === 0) break;
        nextIndex = wrapIndex(nextIndex + 1);
        attempts += 1;
      }
    } else {
      while (attempts < cards.length - 1) {
        const nextLeft = cardTargets[nextIndex] ?? getCardLeft(nextIndex);
        if (nextLeft < currentLeft - 1 || nextIndex === cards.length - 1) break;
        nextIndex = wrapIndex(nextIndex - 1);
        attempts += 1;
      }
    }

    alignToIndex(nextIndex);
  };

  const dotButtons = cards.map((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = dotClass;
    dot.setAttribute("aria-label", `スライド${index + 1}`);
    dot.setAttribute("aria-pressed", "false");
    dot.addEventListener("click", () => {
      alignToIndex(index);
    });
    dots.appendChild(dot);
    return dot;
  });

  if (cards.length > 1) {
    left.addEventListener("click", () => {
      stepBy(-1);
    });

    right.addEventListener("click", () => {
      stepBy(1);
    });

    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        stepBy(-1);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        stepBy(1);
      }
    });
  }

  viewport.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimerId);
      scrollTimerId = window.setTimeout(() => {
        if (jumpFromLoopEdge()) return;
        const closest = getClosestIndex();
        if (closest === currentIndex) return;
        currentIndex = closest;
        updateActive();
      }, 80);
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    window.clearTimeout(resizeTimerId);
    resizeTimerId = window.setTimeout(() => {
      rebuildTargets();
      alignToIndex(currentIndex, "auto");
    }, 120);
  });

  window.requestAnimationFrame(() => {
    rebuildTargets();
    alignToIndex(0, "auto");
  });

  window.addEventListener("load", () => {
    rebuildTargets();
    alignToIndex(currentIndex, "auto");
  });
};

const initInfiniteWorksCarousel = () => {
  initSimpleCarousel({
    rootSelector: ".works-inner",
    viewportSelector: ".works-viewport",
    trackSelector: ".works-track",
    cardSelector: ".work-card",
    leftSelector: ".works-arrow--left",
    rightSelector: ".works-arrow--right",
    dotsClass: "works-dots",
    dotClass: "works-dot",
    activeClass: "is-active",
    alignMode: "center",
    enableScrollLoop: true,
  });
};

const initDetailWorksCarousel = () => {
  initSimpleCarousel({
    rootSelector: ".detail-works-slider",
    viewportSelector: ".detail-works-viewport",
    trackSelector: ".detail-works-track",
    cardSelector: ".detail-work-card",
    leftSelector: ".detail-works-arrow--left",
    rightSelector: ".detail-works-arrow--right",
    dotsClass: "detail-works-dots",
    dotClass: "detail-works-dot",
    activeClass: "is-active",
    alignMode: "center",
    enableScrollLoop: true,
  });
};

initInfiniteWorksCarousel();
initDetailWorksCarousel();

(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector("#site-nav");

  if (!header || !toggle || !nav) return;

  let lastScrollY = window.scrollY;
  const delta = 8;

  const showHeader = () => {
    header.classList.remove("is-hidden");
  };

  const hideHeader = () => {
    header.classList.add("is-hidden");
  };

  const setExpanded = (isOpen) => {
    toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    toggle.setAttribute(
      "aria-label",
      isOpen ? "メニューを閉じる" : "メニューを開く",
    );
  };

  const closeMenu = () => {
    header.classList.remove("is-open");
    showHeader();
    setExpanded(false);
  };

  toggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("is-open");
    if (isOpen) {
      showHeader();
    }
    setExpanded(isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });

  window.addEventListener(
    "scroll",
    () => {
      const currentScroll = window.scrollY;
      const scrollDelta = Math.abs(currentScroll - lastScrollY);

      if (header.classList.contains("is-open")) {
        lastScrollY = currentScroll;
        return;
      }

      if (scrollDelta < delta) {
        return;
      }

      if (currentScroll <= header.offsetHeight) {
        showHeader();
      } else if (currentScroll > lastScrollY) {
        hideHeader();
      } else {
        showHeader();
      }

      lastScrollY = currentScroll;
    },
    { passive: true },
  );
})();
 
