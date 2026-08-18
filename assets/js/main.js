// main.js - Handles global functions like Mobile Menu

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mobile Menu Toggle Logic
    const menuBtn = document.getElementById("mobile-menu-btn");
    const navLinks = document.querySelector(".nav-links");

    if (menuBtn && navLinks) {
        menuBtn.addEventListener("click", () => {
            // Toggle the 'active' class on the menu
            navLinks.classList.toggle("active");
            
            // Change icon between ☰ (Menu) and ✖ (Close)
            if (navLinks.classList.contains("active")) {
                menuBtn.innerHTML = "✖";
            } else {
                menuBtn.innerHTML = "☰";
            }
        });
    }
});