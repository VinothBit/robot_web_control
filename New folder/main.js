document.addEventListener("DOMContentLoaded", function () {
    const modeToggle = document.getElementById("mode-toggle");
    const links = document.querySelectorAll("nav a");

    modeToggle.addEventListener("click", function () {
        document.body.classList.toggle("light-mode");
        document.body.classList.toggle("dark-mode");
        this.textContent = document.body.classList.contains("light-mode") ? "☀️ Light Mode" : "🌙 Dark Mode";
    });

    links.forEach(link => {
        link.addEventListener("click", function () {
            const sectionId = this.getAttribute("data-section");
            document.querySelectorAll("main section").forEach(section => section.classList.add("hidden"));
            document.getElementById(sectionId).classList.remove("hidden");
        });
    });
});
