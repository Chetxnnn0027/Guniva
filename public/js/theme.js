(() => {
  const toggleBtn = document.getElementById("theme-toggle");
  const themeIcon = document.getElementById("theme-icon");

  function syncIcon(theme) {
    if (!themeIcon) return;
    if (theme === "dark") {
      themeIcon.classList.remove("fa-moon");
      themeIcon.classList.add("fa-sun");
    } else {
      themeIcon.classList.remove("fa-sun");
      themeIcon.classList.add("fa-moon");
    }
  }

  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  syncIcon(currentTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      const active = document.documentElement.getAttribute("data-theme") || "light";
      const nextTheme = active === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", nextTheme);
      localStorage.setItem("guniva-theme", nextTheme);
      syncIcon(nextTheme);
    });
  }
})();
