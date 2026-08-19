// fetch-products.js - Fetches live product data from Google Sheets

document.addEventListener("DOMContentLoaded", async () => {
    const productsContainer = document.getElementById("dynamic-products-container");
    const loadingMessage = document.getElementById("loading-products");

    // Helper function to extract YouTube Video ID from any link
    function getYouTubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    try {
        // Fetch data from Google Apps Script GET request
        const response = await fetch(CONFIG.googleSheetUrl);
        const result = await response.json();

        if (result.status === "success") {
            const products = result.data;
            
            // Remove loading text
            loadingMessage.style.display = "none";
            
            // Generate HTML for each product
            products.forEach((product, index) => {
                
                // Determine if Row Reverse is needed for design (alternating layout)
                const isReverse = index % 2 !== 0 ? "row-reverse" : "";
                
                // Handle Pricing Logic
                let priceHTML = '';
                let finalPrice = product.Price;

                if (product['Discount Price'] && product['Discount Price'] !== "") {
                    finalPrice = product['Discount Price'];
                    priceHTML = `
                        <span class="price-amount">৳${product['Discount Price']}</span>
                        <span style="text-decoration: line-through; color: var(--text-muted); margin-left: 10px; font-size: 1.2rem;">৳${product.Price}</span>
                    `;
                } else {
                    priceHTML = `<span class="price-amount">৳${product.Price}</span>`;
                }

                // Default Cover Image
                const imageUrl = product['Image URL'] ? product['Image URL'] : 'https://via.placeholder.com/800x400/1e293b/10b981?text=No+Image';
                
                // Media Gallery Setup
                let mediaGalleryHTML = '';
                let hasGallery = product['Screenshot 1'] || product['Screenshot 2'] || product['Screenshot 3'] || product['Screenshot 4'] || product['Video URL'];
                let videoId = getYouTubeId(product['Video URL']);

                if (hasGallery) {
                    mediaGalleryHTML += `<div class="media-gallery" style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 10px;">`;
                    
                    // Main Cover Thumbnail (Active by default)
                    mediaGalleryHTML += `<img src="${imageUrl}" class="thumbnail active-thumb" style="width: 70px; height: 50px; object-fit: cover; border-radius: 5px; cursor: pointer; border: 2px solid var(--primary-green);" onclick="changeMainMedia(this, 'image', '${imageUrl}')" alt="Cover">`;

                    // 4 Screenshots Loop
                    for(let i=1; i<=4; i++) {
                        let ss = product[`Screenshot ${i}`];
                        if(ss && ss.trim() !== "") {
                            mediaGalleryHTML += `<img src="${ss}" class="thumbnail" style="width: 70px; height: 50px; object-fit: cover; border-radius: 5px; cursor: pointer; border: 2px solid transparent;" onclick="changeMainMedia(this, 'image', '${ss}')" alt="Screenshot ${i}">`;
                        }
                    }

                    // Video Thumbnail
                    if (videoId) {
                        let ytThumb = `https://img.youtube.com/vi/${videoId}/default.jpg`;
                        mediaGalleryHTML += `
                        <div class="thumbnail video-thumb" style="width: 70px; height: 50px; position: relative; cursor: pointer; border-radius: 5px; border: 2px solid transparent; overflow: hidden;" onclick="changeMainMedia(this, 'video', '${videoId}')">
                            <img src="${ytThumb}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.6;">
                            <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 1.2rem; font-weight: bold;">▶</span>
                        </div>`;
                    }
                    mediaGalleryHTML += `</div>`;
                }

                // Setup the Main Media Display area (Image & hidden YouTube Iframe)
                let mediaDisplayHTML = `
                    <img src="${imageUrl}" class="main-product-img" alt="${product['Product Name']}" style="width: 100%; height: 350px; object-fit: cover; border-radius: 10px; transition: 0.3s; border: 1px solid rgba(255, 255, 255, 0.1); display: block;">
                    <iframe class="main-product-video" style="width: 100%; height: 350px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.1); display: none;" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                `;

                // Create Product Section
                const productSection = document.createElement("section");
                productSection.className = "product-detail-section section-padding";
                
                productSection.innerHTML = `
                    <div class="product-container ${isReverse}">
                        <div class="product-media">
                            ${mediaDisplayHTML}
                            ${mediaGalleryHTML}
                        </div>
                        <div class="product-info">
                            <h2>${product['Product Name']}</h2>
                            <div class="product-badges">
                                <span class="badge version">${product.Version}</span>
                                <span class="badge compatibility">${product.Compatibility}</span>
                            </div>
                            <p class="product-description">${product.Description}</p>
                            
                            <h3>Main Features:</h3>
                            <!-- Here is the updated code for Number 5 Solution -->
                            <div class="preserve-text" style="color: var(--text-muted); margin-bottom: 2rem;">${product.Features}</div>

                            <div class="price-section">
                                <span class="price-label">Price:</span>
                                ${priceHTML}
                            </div>

                            <button class="btn-primary btn-buy dynamic-btn-buy" data-product="${product['Product Name']}" data-price="${finalPrice}">
                                BUY NOW
                            </button>
                        </div>
                    </div>
                `;

                productsContainer.appendChild(productSection);
                
                // Add Divider line
                if(index < products.length - 1) {
                    const divider = document.createElement("hr");
                    divider.className = "product-divider";
                    productsContainer.appendChild(divider);
                }
            });

            // Re-initialize BUY NOW buttons logic since they were added dynamically
            initializeDynamicButtons();

        } else {
            loadingMessage.innerText = "Failed to load products. Please try again later.";
        }
    } catch (error) {
        console.error("Error fetching products:", error);
        loadingMessage.innerText = "Error loading products from server.";
    }
});

// Global Function to change the main media (Image or Video)
window.changeMainMedia = function(thumbElement, type, srcOrId) {
    const mediaContainer = thumbElement.closest('.product-media');
    const mainImg = mediaContainer.querySelector('.main-product-img');
    const mainVideo = mediaContainer.querySelector('.main-product-video');
    
    if (type === 'image') {
        // Show Image, Hide Video
        mainImg.src = srcOrId;
        mainImg.style.display = 'block';
        mainVideo.style.display = 'none';
        mainVideo.src = ''; // Stop video if playing
    } else if (type === 'video') {
        // Hide Image, Show Video and Auto-play
        mainImg.style.display = 'none';
        mainVideo.style.display = 'block';
        mainVideo.src = `https://www.youtube.com/embed/${srcOrId}?autoplay=1&rel=0`;
    }
    
    // Update active border color for thumbnails
    const allThumbs = mediaContainer.querySelectorAll('.thumbnail');
    allThumbs.forEach(t => t.style.borderColor = 'transparent');
    thumbElement.style.borderColor = 'var(--primary-green)';
};

// Function to attach click events to the new dynamic BUY NOW buttons
function initializeDynamicButtons() {
    const buyButtons = document.querySelectorAll(".dynamic-btn-buy");
    const modal = document.getElementById("order-modal");
    const orderProductInput = document.getElementById("order-product");
    const orderAmountInput = document.getElementById("order-amount");
    const submitBtn = document.getElementById("submit-btn");
    const whatsappBtn = document.getElementById("whatsapp-btn");

    buyButtons.forEach(button => {
        button.addEventListener("click", function() {
            const productName = this.getAttribute("data-product");
            const productPrice = this.getAttribute("data-price");

            orderProductInput.value = productName;
            orderAmountInput.value = productPrice;

            // Reset buttons state
            submitBtn.style.display = "block";
            submitBtn.innerText = "SUBMIT ORDER";
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = "var(--primary-green)";
            whatsappBtn.style.display = "none";

            modal.style.display = "block";
            document.body.style.overflow = "hidden";
        });
    });
}
