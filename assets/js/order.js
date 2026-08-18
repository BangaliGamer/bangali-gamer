// order.js - Handles the Order Modal, Form Logic, and WhatsApp Integration

document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("order-modal");
    const closeBtn = document.getElementById("close-modal");
    const buyButtons = document.querySelectorAll(".btn-buy");
    
    // Form Inputs
    const orderProductInput = document.getElementById("order-product");
    const orderAmountInput = document.getElementById("order-amount");
    const checkoutForm = document.getElementById("checkout-form");
    
    // Buttons
    const submitBtn = document.getElementById("submit-btn");
    const whatsappBtn = document.getElementById("whatsapp-btn");

    // 1. Open Modal and Auto-fill Data when BUY NOW is clicked
    buyButtons.forEach(button => {
        button.addEventListener("click", function() {
            const productName = this.getAttribute("data-product");
            const productPrice = this.getAttribute("data-price");

            // Fill the read-only inputs
            orderProductInput.value = productName;
            orderAmountInput.value = productPrice;

            // Reset buttons state in case modal is reopened
            submitBtn.style.display = "block";
            submitBtn.innerText = "SUBMIT ORDER";
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = "var(--primary-green)";
            submitBtn.style.cursor = "pointer";
            whatsappBtn.style.display = "none";

            // Show the modal
            modal.style.display = "block";
            document.body.style.overflow = "hidden"; // Prevent background scrolling
        });
    });

    // 2. Close Modal function
    function closeModal() {
        modal.style.display = "none";
        document.body.style.overflow = "auto"; // Enable background scrolling
        checkoutForm.reset(); // Reset form fields
    }

    // Close when 'X' is clicked
    if (closeBtn) {
        closeBtn.addEventListener("click", closeModal);
    }

    // Close when clicking outside the modal content
    window.addEventListener("click", (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // 3. Handle Form Submission to Google Sheets
    checkoutForm.addEventListener("submit", async function(e) {
        e.preventDefault(); // Prevent page reload
        
        // Change button text to show loading state
        submitBtn.innerText = "PROCESSING ORDER...";
        submitBtn.disabled = true;
        submitBtn.style.backgroundColor = "#94a3b8"; // Muted color while loading
        submitBtn.style.cursor = "not-allowed";

        // Collect data from the form
        const orderData = {
            product: document.getElementById("order-product").value,
            amount: document.getElementById("order-amount").value,
            name: document.getElementById("customer-name").value,
            email: document.getElementById("customer-email").value,
            whatsapp: document.getElementById("customer-whatsapp").value,
            paymentMethod: document.getElementById("payment-method").value,
            transactionId: document.getElementById("transaction-id").value
        };

        try {
            // Send data to Google Apps Script securely
            const response = await fetch(CONFIG.googleSheetUrl, {
                method: "POST",
                body: JSON.stringify(orderData),
                headers: {
                    "Content-Type": "text/plain;charset=utf-8",
                }
            });

            const result = await response.json();

            if (result.status === "success") {
                // Store Order ID in session for WhatsApp verification
                sessionStorage.setItem("currentOrderId", result.orderId);
                sessionStorage.setItem("currentOrderData", JSON.stringify(orderData));

                // Change UI to Success State
                submitBtn.style.display = "none"; // Hide submit button
                whatsappBtn.style.display = "block"; // Show WhatsApp button
                
                alert(`Order Placed Successfully!\n\nYour Order ID: ${result.orderId}\n\nPlease click "VERIFY VIA WHATSAPP" to complete your order.`);

            } else {
                throw new Error("Failed to place order.");
            }
        } catch (error) {
            console.error("Order Error:", error);
            alert("Something went wrong. Please try again or contact Bangali Gamer on WhatsApp.");
            
            // Restore button if error occurs
            submitBtn.innerText = "SUBMIT ORDER";
            submitBtn.disabled = false;
            submitBtn.style.backgroundColor = "var(--primary-green)";
            submitBtn.style.cursor = "pointer";
        }
    });

    // 4. WhatsApp Verification Logic
    whatsappBtn.addEventListener("click", function() {
        // Retrieve order details from session storage
        const orderId = sessionStorage.getItem("currentOrderId");
        const orderDataRaw = sessionStorage.getItem("currentOrderData");
        
        if (!orderId || !orderDataRaw) {
            alert("No recent order found. Please submit an order first.");
            return;
        }

        const orderData = JSON.parse(orderDataRaw);
        
        // Use a placeholder or the actual number from config.
        // For testing, if config is "PLACEHOLDER_WHATSAPP", we'll alert the user.
        let adminWhatsapp = CONFIG.whatsappNumber; 
        if(adminWhatsapp === "PLACEHOLDER_WHATSAPP") {
             adminWhatsapp = "8801XXXXXXXXX"; // Change this to your real number later
        }

        // Generate the formatted WhatsApp message
        const message = `Hello Bangali Gamer,
I want to verify my order.

*Order ID:* ${orderId}
*Product:* ${orderData.product}
*Amount:* ৳${orderData.amount}
*Payment Method:* ${orderData.paymentMethod}
*Transaction ID:* ${orderData.transactionId}
*Gmail:* ${orderData.email}

Please verify my payment and send me the access details.`;

        // Encode message for URL to handle spaces and special characters
        const encodedMessage = encodeURIComponent(message);
        
        // Create WhatsApp API link
        const whatsappUrl = `https://wa.me/${adminWhatsapp}?text=${encodedMessage}`;
        
        // Open WhatsApp in a new tab
        window.open(whatsappUrl, '_blank');
        
        // Finally close the modal
        closeModal();
    });
});