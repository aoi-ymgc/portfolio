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

(async () => {
  const slider = document.querySelector(".detail-works-slider");
  if (!slider) return;

  const viewport = slider.querySelector(".detail-works-viewport");
  const track = slider.querySelector(".detail-works-track");
  const previous = slider.querySelector(".detail-works-arrow--left");
  const next = slider.querySelector(".detail-works-arrow--right");

  if (!viewport || !track || !previous || !next) return;

  // トップのWorksを参照元にし、作品追加時の詳細ページへの転記をなくす。
  let cards;
  try {
    const indexUrl = new URL("index.html", location.href);
    const response = await fetch(indexUrl);
    if (!response.ok) throw new Error("Works could not be loaded");
    const source = new DOMParser().parseFromString(
      await response.text(),
      "text/html",
    );
    const seen = new Set([location.pathname]);
    cards = Array.from(source.querySelectorAll("#works .work-card"))
      .flatMap((work) => {
        const link = work.querySelector(".work-button");
        const thumbnail = work.querySelector(".work-thumb");
        const title = work.querySelector(".work-title");
        if (!link || !thumbnail || !title) return [];
        const url = new URL(link.getAttribute("href"), indexUrl);
        if (url.origin !== location.origin || seen.has(url.pathname)) return [];
        seen.add(url.pathname);

        const card = document.createElement("a");
        card.className = "detail-work-card";
        card.href = url.href;
        const image = document.createElement("img");
        image.src = new URL(thumbnail.getAttribute("src"), indexUrl).href;
        image.alt = "";
        image.decoding = "async";
        const label = document.createElement("p");
        label.className = "detail-work-title";
        label.textContent = title.textContent.trim();
        card.append(image, label);
        return [card];
      });
  } catch {
    // 読み込みに失敗した場合も、既存の「Works一覧へ」リンクは利用できる。
    return;
  }
  if (cards.length === 0) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const dots = document.createElement("div");
  dots.className = "detail-works-dots";
  dots.setAttribute("aria-label", "作品スライドを選択");
  slider.appendChild(dots);

  const count = cards.length;
  let renderedCards = cards;
  let currentIndex = 0;
  let looping = false;
  let moving = false;
  let targetLeft = 0;
  let pendingSteps = 0;
  let scrollTimer = 0;
  let resizeFrame = 0;
  const wrap = (index) => ((index % count) + count) % count;

  const getCardLeft = (card) =>
    card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;

  const closestIndex = () => renderedCards.reduce((closest, card, index) =>
    Math.abs(viewport.scrollLeft - getCardLeft(card)) <
    Math.abs(viewport.scrollLeft - getCardLeft(renderedCards[closest]))
      ? index : closest, 0);

  const updateState = () => {
    renderedCards.forEach((card, index) => {
      card.classList.toggle("is-active", looping && wrap(index) === currentIndex);
    });
    dotButtons.forEach((dot, index) => {
      const active = index === currentIndex;
      dot.classList.toggle("is-active", active);
      dot.setAttribute("aria-pressed", String(active));
    });
  };

  const jumpTo = (index) => {
    // 複製側と同じ見た目の中央列へ、スナップやアニメーションなしで戻す。
    viewport.style.scrollSnapType = "none";
    viewport.scrollTo({ left: getCardLeft(renderedCards[index]), behavior: "instant" });
    viewport.style.scrollSnapType = "";
  };

  const settle = () => {
    window.clearTimeout(scrollTimer);
    if (!looping) return;
    // 連打中、直前の位置補正が発生させたscrollendで次の移動を止めない。
    if (moving && Math.abs(viewport.scrollLeft - targetLeft) > 1) {
      scrollTimer = window.setTimeout(settle, 50);
      return;
    }
    const physicalIndex = closestIndex();
    currentIndex = wrap(physicalIndex);
    if (physicalIndex < count || physicalIndex >= count * 2) {
      const focused = document.activeElement === renderedCards[physicalIndex];
      jumpTo(count + currentIndex);
      if (focused) cards[currentIndex].focus({ preventScroll: true });
    }
    moving = false;
    updateState();
    if (pendingSteps) step();
  };

  const goTo = (physicalIndex) => {
    moving = true;
    currentIndex = wrap(physicalIndex);
    updateState();
    targetLeft = getCardLeft(renderedCards[physicalIndex]);
    viewport.scrollTo({
      left: targetLeft,
      behavior: reduceMotion.matches ? "instant" : "smooth",
    });
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(settle, 180);
  };

  const step = () => {
    if (!looping || moving || !pendingSteps) return;
    const direction = Math.sign(pendingSteps);
    pendingSteps -= direction;
    goTo(count + currentIndex + direction);
  };

  const move = (direction) => {
    pendingSteps += direction;
    step();
  };

  const dotButtons = cards.map((card, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = "detail-works-dot";
    dot.setAttribute("aria-label", `${card.textContent.trim()}を表示`);
    dot.setAttribute("aria-pressed", "false");
    dot.addEventListener("click", () => {
      pendingSteps = 0;
      let nearest = closestIndex();
      if (nearest < count || nearest >= count * 2) {
        nearest = count + wrap(nearest);
        jumpTo(nearest);
      }
      let distance = index - wrap(nearest);
      if (distance > count / 2) distance -= count;
      if (distance < -count / 2) distance += count;
      goTo(nearest + distance);
    });
    dots.appendChild(dot);
    return dot;
  });

  previous.addEventListener("click", () => move(-1));
  next.addEventListener("click", () => move(1));

  viewport.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    }
  });

  viewport.addEventListener(
    "scroll",
    () => {
      window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(settle, 140);
    },
    { passive: true },
  );

  viewport.addEventListener("scrollend", settle);
  ["pointerdown", "touchstart", "wheel"].forEach((eventName) => {
    viewport.addEventListener(eventName, () => {
      pendingSteps = 0;
      moving = false;
    }, { passive: true });
  });

  const buildTrack = () => {
    window.clearTimeout(scrollTimer);
    pendingSteps = 0;
    moving = false;
    track.replaceChildren(...cards);
    slider.classList.remove("is-static");
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const totalWidth = count * cards[0].offsetWidth + (count - 1) * gap;
    looping = count > 1 && totalWidth > viewport.clientWidth - 32;
    if (looping) {
      const cloneCards = () => cards.map((card) => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        clone.tabIndex = -1;
        return clone;
      });
      track.prepend(...cloneCards());
      track.append(...cloneCards());
    }
    renderedCards = Array.from(track.children);
    slider.classList.toggle("is-static", !looping);
    previous.disabled = !looping;
    next.disabled = !looping;
    dots.hidden = !looping;
    updateState();
    if (looping) jumpTo(count + currentIndex);
    else viewport.scrollLeft = 0;
  };

  slider.hidden = false;
  buildTrack();
  window.addEventListener("resize", () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(buildTrack);
  });
})();
