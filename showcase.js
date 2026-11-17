const showcases = document.querySelectorAll("[data-showcase]");

if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in-view");
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.22 });

  for (const showcase of showcases) observer.observe(showcase);
}
