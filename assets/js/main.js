// main.js - Handles global functions like Mobile Menu and Text Formatting

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. Mobile Menu Toggle Logic
    // ==========================================
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

    // ==========================================
    // 2. Auto-Format Features List (Fixing • bullets)
    // ==========================================
    // এটি ওয়েবসাইটের যেখানে যেখানে 'features-list' ক্লাস পাবে, সেগুলোকে ঠিক করে দেবে।
    const featureLists = document.querySelectorAll('.features-list');
    
    featureLists.forEach(listElement => {
        // লিস্টের ভেতরের মূল টেক্সটটুকু নেওয়া হলো
        const rawText = listElement.textContent;
        
        // লেখাগুলোকে বুলেট (•) অনুযায়ী কেটে আলাদা করা হলো
        const formattedItems = rawText.split('•')
            .map(item => item.trim()) // আশপাশের ফালতু স্পেস বাদ দেওয়া
            .filter(item => item.length > 0); // ফাঁকা লাইনগুলো বাদ দেওয়া
            
        // যদি বুলেট পাওয়া যায়, তাহলে সেগুলোকে সুন্দর <li> ট্যাগে সাজিয়ে দেওয়া
        if (formattedItems.length > 1) {
            const newHTML = formattedItems.map(item => `<li>${item}</li>`).join('');
            listElement.innerHTML = newHTML;
        }
    });
});
