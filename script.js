document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Konum ikonunu örnekteki kırmızı harita pini görünümüne getir.
  const locationIconSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" aria-hidden="true">
      <rect width="256" height="256" fill="#000"/>
      <path d="M128 18c-54.7 0-99 44.3-99 99 0 66.6 77.5 117.2 92.2 126.3a12.1 12.1 0 0 0 13.6 0C149.5 234.2 227 183.6 227 117c0-54.7-44.3-99-99-99Z" fill="#ed1111"/>
      <circle cx="128" cy="117" r="53" fill="#000"/>
      <circle cx="128" cy="117" r="38" fill="#ed1111"/>
      <ellipse cx="128" cy="242" rx="67" ry="10" fill="none" stroke="#ed1111" stroke-width="7"/>
      <ellipse cx="128" cy="242" rx="42" ry="6" fill="none" stroke="#ed1111" stroke-width="5"/>
    </svg>`;
  const locationIconUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(locationIconSvg)}`;

  document.querySelectorAll(".location-chip .chip-icon").forEach((icon) => {
    if (icon.textContent.trim() === "📍") {
      const image = document.createElement("img");
      image.src = locationIconUrl;
      image.alt = "Konum";
      image.className = "location-pin-icon";
      image.setAttribute("aria-hidden", "true");
      icon.replaceWith(image);
    }
  });

  document.querySelectorAll(".location-action-icon").forEach((icon) => {
    const image = document.createElement("img");
    image.src = locationIconUrl;
    image.alt = "Konum";
    image.className = "location-action-icon";
    image.setAttribute("aria-hidden", "true");
    icon.replaceWith(image);
  });

  const locationIconStyle = document.createElement("style");
  locationIconStyle.textContent = `
    .location-pin-icon {
      width: 30px;
      height: 30px;
      flex: 0 0 30px;
      object-fit: contain;
      border-radius: 4px;
      filter: drop-shadow(0 3px 5px rgba(0,0,0,.28));
    }
    .location-action-icon {
      width: 34px;
      height: 34px;
      flex: 0 0 34px;
      object-fit: contain;
      border-radius: 4px;
      filter: drop-shadow(0 3px 5px rgba(0,0,0,.24));
    }
  `;
  document.head.appendChild(locationIconStyle);

  // Konum butonunu turkuaz temaya geçir.
  const locationButtonStyle = document.createElement("style");
  locationButtonStyle.textContent = `
    .header-actions .location-action,
    .header-actions .btn-secondary {
      background: linear-gradient(135deg, #0f766e, #14b8a6, #2dd4bf) !important;
      box-shadow: 0 8px 22px rgba(20, 184, 166, .28) !important;
      color: #fff !important;
    }
    .header-actions .location-action:hover,
    .header-actions .btn-secondary:hover {
      background: linear-gradient(135deg, #0d6b63, #0f9f91, #22cbb7) !important;
      box-shadow: 0 14px 30px rgba(20, 184, 166, .36) !important;
    }
  `;
  document.head.appendChild(locationButtonStyle);

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