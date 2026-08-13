document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Sections animate only as they enter the viewport; this avoids animating
  // content before a visitor can see it.
  const sections = document.querySelectorAll(".section");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    sections.forEach((section) => section.classList.add("is-visible"));
  } else {
    const sectionObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -36px" });
    sections.forEach((section, index) => {
      section.style.transitionDelay = `${Math.min(index * 55, 180)}ms`;
      sectionObserver.observe(section);
    });
  }

  // Keep in-page anchor navigation smooth without overriding external links.
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });

  // Subtle, input-originated ripple for the primary actions.
  document.querySelectorAll(".btn, .store-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      if (reduceMotion) return;
      const rect = button.getBoundingClientRect();
      const ripple = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      ripple.className = "ripple";
      ripple.style.cssText = `width:${size}px;height:${size}px;left:${event.clientX - rect.left - size / 2}px;top:${event.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    });
  });

  const modal = document.getElementById("video-modal");
  const frame = document.getElementById("video-frame");
  const closeButton = document.querySelector(".video-modal-close");
  const backdrop = document.querySelector(".video-modal-backdrop");
  let lastFocusedElement = null;

  const closeModal = () => {
    if (!modal || !frame) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    frame.src = "";
    lastFocusedElement?.focus();
  };

  const openModal = (videoId, trigger) => {
    if (!modal || !frame) return;
    lastFocusedElement = trigger;
    const params = new URLSearchParams({
      autoplay: "1", rel: "0", modestbranding: "1", playsinline: "1"
    });
    if (/^https?:$/.test(window.location.protocol)) params.set("origin", window.location.origin);
    frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    closeButton?.focus();
  };

  document.querySelectorAll(".video-card[data-video]").forEach((card) => {
    card.addEventListener("click", (event) => {
      event.preventDefault();
      openModal(card.dataset.video, card);
    });
  });
  closeButton?.addEventListener("click", closeModal);
  backdrop?.addEventListener("click", closeModal);
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
  });
});