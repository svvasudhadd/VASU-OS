import { animate, motion, scroll } from "framer-motion"

// ---------- Заголовок "Kaluga Camp": буквы появляются по одной (framer-motion) ----------
// Анимация (blur/scale/opacity) и градиентная заливка (background-clip:text)
// намеренно на РАЗНЫХ вложенных элементах — .letter (обёртка) и .letter__fill
// (заливка). Если совместить оба на одном элементе, Chrome промоутит его в
// отдельный composite-слой из-за анимируемого filter/transform, и заливка
// перестаёт быть видна сквозь клип. См. комментарий в style.css.
const heroTitle = document.getElementById("hero-title");
const heroTitleWrap = document.getElementById("hero-title-wrap");

if (heroTitle) {
  const original = heroTitle.textContent.trim();
  heroTitle.textContent = "";

  original.split("").forEach((char) => {
    const wrap = document.createElement("span");

    if (char === " ") {
      wrap.className = "letter letter--space";
      wrap.innerHTML = "&nbsp;";
    } else {
      wrap.className = "letter";
      const fill = document.createElement("span");
      fill.className = "letter__fill";
      fill.textContent = char;
      wrap.appendChild(fill);
    }

    heroTitle.appendChild(wrap);
  });

  // Считаем реальное смещение каждой буквы, чтобы градиент шёл цельным
  // полотном через весь заголовок, а не начинался заново на каждой букве.
  const titleRect = heroTitle.getBoundingClientRect();
  const fills = heroTitle.querySelectorAll(".letter__fill");
  fills.forEach((fill) => {
    const fillRect = fill.getBoundingClientRect();
    const offsetX = fillRect.left - titleRect.left;
    fill.style.backgroundSize = `${titleRect.width}px 100%`;
    fill.style.backgroundPosition = `${-offsetX}px 0`;
  });

  const letters = heroTitle.querySelectorAll(".letter");
  let lastAnimation = null;

  letters.forEach((span, index) => {
    lastAnimation = animate(
      span,
      { opacity: [0, 1], filter: ["blur(20px)", "blur(0px)"], scale: [1.3, 1] },
      { duration: 1.2, delay: index * 0.07, ease: [0.34, 1.56, 0.64, 1] }
    );
  });

  if (lastAnimation) {
    lastAnimation.then(() => heroTitle.classList.add("title-glow"));
  }

  // Курсор-реактивный блик поверх заголовка
  if (heroTitleWrap) {
    heroTitleWrap.addEventListener("mousemove", (event) => {
      const rect = heroTitleWrap.getBoundingClientRect();
      const mx = ((event.clientX - rect.left) / rect.width) * 100;
      const my = ((event.clientY - rect.top) / rect.height) * 100;
      heroTitleWrap.style.setProperty("--mx", `${mx}%`);
      heroTitleWrap.style.setProperty("--my", `${my}%`);
    });
  }
}

// ---------- Слой 3: марево — медленно "дышащий" baseFrequency SVG-фильтра ----------
const hazeTurbulence = document.getElementById("haze-turbulence");

if (hazeTurbulence && window.matchMedia("(min-width: 641px)").matches) {
  let t = 0;
  setInterval(() => {
    t += 0.1;
    const fx = 0.01 + Math.sin(t) * 0.003;
    const fy = 0.02 + Math.cos(t * 0.8) * 0.004;
    hazeTurbulence.setAttribute("baseFrequency", `${fx.toFixed(4)} ${fy.toFixed(4)}`);
  }, 100);
}

// ---------- Курсор-реактивная "капля" в hero ----------
const hero = document.getElementById("hero");
const blobMain = document.getElementById("blob-main");

if (hero && blobMain) {
  hero.addEventListener("mousemove", (event) => {
    const rect = hero.getBoundingClientRect();
    const relX = (event.clientX - rect.left) / rect.width - 0.5;
    const relY = (event.clientY - rect.top) / rect.height - 0.5;
    const maxShift = 28;
    blobMain.style.transform = `translate(${relX * maxShift * 2}px, ${relY * maxShift * 2}px)`;
  });

  hero.addEventListener("mouseleave", () => {
    blobMain.style.transform = "translate(0, 0)";
  });
}

// ---------- Плавающие капли в hero: бесконечная анимация (framer-motion) ----------
// blob-main двигает курсор (см. выше) — на него навешивается transform напрямую,
// поэтому плавающая анимация идёт на его обёртку .blob-wrap--1, а не на сам
// #blob-main, иначе JS-анимация и курсор-реактивный transform перезаписывали бы
// друг друга на одном и том же элементе.
const floatingBlobs = document.querySelectorAll(".blob-wrap--1, .blob--2, .blob--3");

floatingBlobs.forEach((blob) => {
  animate(
    blob,
    { y: [-20, 20], x: [-10, 10], rotate: [-5, 5] },
    { duration: 6, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }
  );
});

// ---------- Кнопки и меню: пружинящий hover (framer-motion) ----------
const springTargets = document.querySelectorAll(".btn, .nav-chip");

springTargets.forEach((el) => {
  el.addEventListener("mouseenter", () => {
    animate(el, { scale: 1.08, y: -4 }, { type: "spring", stiffness: 400, damping: 17 });
  });
  el.addEventListener("mouseleave", () => {
    animate(el, { scale: 1, y: 0 }, { type: "spring", stiffness: 300, damping: 20 });
  });
});

// ---------- Усиление искажения стекла при наведении (Liquid Glass hover) ----------
const distortionMap = document.querySelector("#glass-distortion feDisplacementMap");
const hoverGlassEls = document.querySelectorAll("[data-hover-glass]");

if (distortionMap) {
  hoverGlassEls.forEach((el) => {
    el.addEventListener("mouseenter", () => distortionMap.setAttribute("scale", "60"));
    el.addEventListener("mouseleave", () => distortionMap.setAttribute("scale", "40"));
  });
}

// ---------- Проживание: сторителлинг-скролл (шатёр "собирается") ----------
const stayScrollSection = document.getElementById("stay");
const stayMedia = document.getElementById("stay-media");
const stayAmenityItems = document.querySelectorAll("#stay-amenities li");
const stayPrice = document.getElementById("stay-price");

if (stayScrollSection && stayMedia) {
  scroll(
    (progress) => {
      const build = Math.min(1, progress / 0.55);
      stayMedia.style.setProperty("--build", build.toFixed(3));

      stayAmenityItems.forEach((li, index) => {
        const threshold = 0.55 + index * 0.09;
        li.classList.toggle("is-active", progress >= threshold);
      });

      if (stayPrice) {
        stayPrice.classList.toggle("is-active", progress >= 0.55 + stayAmenityItems.length * 0.09);
      }
    },
    { target: stayScrollSection, offset: ["start start", "end end"] }
  );
}

// ---------- Слайдер "О лагере" ----------
const track = document.getElementById("slider-track");
const prevBtn = document.getElementById("slider-prev");
const nextBtn = document.getElementById("slider-next");
const dotsWrap = document.getElementById("slider-dots");

if (track) {
  const slides = Array.from(track.children);
  let current = 0;
  let autoplayTimer = null;

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.className = "slider__dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Слайд ${i + 1}`);
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function goTo(index) {
    current = (index + slides.length) % slides.length;
    track.style.transform = `translateX(-${current * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => goTo(current + 1), 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
  }

  prevBtn.addEventListener("click", () => {
    goTo(current - 1);
    startAutoplay();
  });

  nextBtn.addEventListener("click", () => {
    goTo(current + 1);
    startAutoplay();
  });

  goTo(0);
  startAutoplay();
}

// ---------- Появление секций при скролле (подъём + масштаб) ----------
const revealTargets = document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  revealTargets.forEach((el) => observer.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-visible"));
}

// ---------- Карточки: появление при скролле (framer-motion) ----------
const cardTargets = document.querySelectorAll(".bento-item, .whom-card, .stay-card");

if ("IntersectionObserver" in window) {
  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animate(
            entry.target,
            { opacity: [0, 1], y: [40, 0], scale: [0.95, 1] },
            { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }
          );
          cardObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  cardTargets.forEach((card) => cardObserver.observe(card));
} else {
  cardTargets.forEach((card) => {
    card.style.opacity = 1;
  });
}

// ---------- Форма брони (визуально, без реальной отправки) ----------
const bookingForm = document.getElementById("booking-form");
const bookingNote = document.getElementById("booking-note");

if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const dateIn = document.getElementById("date-in").value;
    const dateOut = document.getElementById("date-out").value;

    if (dateIn && dateOut && dateOut < dateIn) {
      bookingNote.textContent = "Дата выезда раньше даты заезда — проверьте даты.";
      return;
    }

    bookingNote.textContent = name
      ? `Спасибо, ${name}! Заявка пока не отправляется — форма визуальная.`
      : "Спасибо! Заявка пока не отправляется — форма визуальная.";

    bookingForm.reset();
  });
}
