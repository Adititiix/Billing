// Madurai Mess POS System JavaScript

// Application State
let currentOrder = {
    billNo: '',
    customerName: '',
    customerPhone: '',
    session: 'morning',
    orderType: 'dine-in',
    items: [],
    subtotal: 0,
    total: 0,
    timestamp: null
};

// This variable will hold orders fetched for reports
let allOrdersForReports = [];

// --- Firebase Functions for Data Operations ---

/**
 * Fetches menu items from the Firestore 'menuItems' collection.
 * Populates the global 'fetchedMenuItems' array.
 */
async function fetchMenuItemsFromFirestore() {
    try {
        if (!window.db) {
            console.error("Firebase DB not initialized. Cannot fetch menu items.");
            return;
        }
        const menuItemsRef = window.collection(window.db, "menuItems");
        const q = window.query(menuItemsRef, window.orderBy("id", "asc"));
        const querySnapshot = await window.getDocs(q);
        const items = [];
        querySnapshot.forEach((doc) => {
            items.push(doc.data());
        });
        window.fetchedMenuItems = items;
        console.log("Menu items fetched from Firestore:", window.fetchedMenuItems);
    } catch (error) {
        console.error("Error fetching menu items from Firestore:", error);
        window.showCustomAlert("Failed to load menu items. Please check your internet connection or try again later.");
        window.fetchedMenuItems = [];
    }
}

/**
 * Saves a completed order to the Firestore 'orders' collection.
 * @param {object} orderData - The order object to save.
 * @returns {boolean} True if save was successful, false otherwise.
 */
async function saveOrderToFirestore(orderData) {
    try {
        const ordersCollectionRef = window.collection(window.db, "orders");
        const docRef = await window.addDoc(ordersCollectionRef, orderData);
        console.log("Order successfully saved to Firestore with ID: ", docRef.id);
        return true;
    } catch (e) {
        console.error("Error adding order to Firestore: ", e);
        window.showCustomAlert("Failed to save order. Please try again.");
        return false;
    }
}

/**
 * Fetches orders from Firestore for reporting purposes based on date range and session.
 * @param {string} startDate - ISO string for the start date.
 * @param {string} endDate - ISO string for the end date.
 * @param {string} sessionFilter - 'morning', 'afternoon', 'night', or 'all'.
 * @returns {Array} An array of filtered order data.
 */
async function fetchOrdersForReports(startDate, endDate, sessionFilter = 'all') {
    try {
        let ordersRef = window.collection(window.db, "orders");
        let q = window.query(
            ordersRef,
            window.orderBy("completedAt", "desc")
        );

        if (startDate && endDate) {
            q = window.query(q,
                window.where("completedAt", ">=", startDate),
                window.where("completedAt", "<=", endDate)
            );
        }
        if (sessionFilter !== 'all') {
            q = window.query(q, window.where("session", "==", sessionFilter));
        }

        const querySnapshot = await window.getDocs(q);
        const ordersData = [];
        querySnapshot.forEach((doc) => {
            ordersData.push(doc.data());
        });
        window.allOrdersForReports = ordersData;
        return ordersData;
    } catch (error) {
        console.error("Error fetching orders for reports:", error);
        return [];
    }
}

// --- End Firebase Functions ---


// --- Utility Functions ---

/**
 * Generates a bill number based on current date and a daily sequential counter from Firestore.
 * Uses Firestore transactions for atomic increment.
 * Stores the generated bill number in sessionStorage until the order is completed.
 * @returns {Promise<string>} A promise that resolves to the generated bill number.
 */
async function generateBillNumber() {
    const storedBillNo = sessionStorage.getItem('currentBillNo');
    if (storedBillNo && currentOrder.items.length > 0) { // Only reuse if order already has items
        return storedBillNo;
    }

    const now = new Date();
    const datePart = now.toLocaleDateString('en-GB').split('/').reverse().join('');
    const todayDateKey = now.toLocaleDateString('en-GB').replace(/\//g, '');

    try {
        const billCounterRef = window.doc(window.db, "billCounters", todayDateKey);
        let newCounterValue = 0;

        await window.runTransaction(window.db, async (transaction) => {
            const docSnapshot = await transaction.get(billCounterRef);
            if (docSnapshot.exists()) {
                newCounterValue = docSnapshot.data().counter + 1;
                transaction.update(billCounterRef, { counter: newCounterValue });
            } else {
                newCounterValue = 1;
                transaction.set(billCounterRef, { counter: newCounterValue });
            }
        });

        const generatedBillNo = `${todayDateKey}${newCounterValue}`;
        sessionStorage.setItem('currentBillNo', generatedBillNo); // Store in session storage
        return generatedBillNo;
    } catch (error) {
        console.error("Error generating bill number with Firestore counter:", error);
        window.showCustomAlert("Failed to generate bill number. Please try again.");
        const time = now.getTime().toString().slice(-6);
        const fallbackBillNo = `${todayDateKey}${time}`;
        sessionStorage.setItem('currentBillNo', fallbackBillNo); // Store fallback
        return fallbackBillNo;
    }
}


function formatCurrency(amount) {
    return `₹ ${amount.toFixed(0)}`;
}

function formatDate(date) {
    const d = new Date(date);
    if (isNaN(d.getTime())) {
        return 'Invalid Date';
    }
    return d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function updateDateTime() {
    const now = new Date();
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('currentTime').textContent = now.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

function numberToWords(num) {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    if (num < 1000000000) return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');

    return num.toString();
}

// Date utility functions for reports
function getWeekRange(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { start: start.toISOString(), end: end.toISOString() };
}

function isDateInRange(dateStr, startStr, endStr) {
    const date = new Date(dateStr);
    const start = new Date(startStr);
    const end = new Date(endStr);
    return date >= start && date <= end;
}

/**
 * Calculates statistics for a given array of orders.
 * @param {Array} orders - The array of order objects.
 * @returns {object} Statistics for the orders.
 */
function calculatePeriodStats(orders) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const cashPayments = orders.reduce((sum, order) => sum + (order.cashPayment || 0), 0);
    const onlinePayments = orders.reduce((sum, order) => sum + (order.onlinePayment || 0), 0);

    const sessionStats = {
        morning: orders.filter(o => o.session === 'morning').length,
        afternoon: orders.filter(o => o.session === 'afternoon').length,
        night: orders.filter(o => o.session === 'night').length
    };

    const orderTypeStats = {
        dineIn: orders.filter(o => o.orderType === 'dine-in').length,
        parcel: orders.filter(o => o.orderType === 'parcel').length
    };

    const itemCounts = {};
    orders.forEach(order => {
        order.items.forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
    });

    const topItems = Object.entries(itemCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    return {
        totalOrders,
        totalRevenue,
        cashPayments,
        onlinePayments,
        sessionStats,
        orderTypeStats,
        topItems,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
    };
}

// Search functionality with session filtering
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();

            if (query.length === 0) {
                searchResults.innerHTML = `<div class="text-center py-8 text-gray-500">
                                                <i data-lucide="soup" class="h-12 w-12 mx-auto mb-3 text-gray-300"></i>
                                                <p>Select a session or search for items</p>
                                            </div>`;
                lucide.createIcons();
                return;
            }

            const filteredItems = window.fetchedMenuItems.filter(item =>
                Array.isArray(item.sessions) && item.sessions.includes(currentOrder.session) &&
                (item.name.toLowerCase().startsWith(query) ||
                 item.category.toLowerCase().startsWith(query) ||
                 (item.description && item.description.toLowerCase().startsWith(query)))
            );

            if (filteredItems.length > 0) {
                searchResults.innerHTML = filteredItems.map(item => `
                    <div class="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer" onclick="addItemToOrder(${item.id})">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center flex-1">
                                ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover mr-4" onerror="this.onerror=null;this.src='https://placehold.co/64x64/cccccc/333333?text=No+Image';">` : `<img src="https://placehold.co/64x64/cccccc/333333?text=No+Image" alt="No Image" class="w-16 h-16 rounded-lg object-cover mr-4">`}
                                <div>
                                    <h4 class="font-medium text-gray-900">${item.name}</h4>
                                    <p class="text-sm text-gray-600">${item.description || ''}</p>
                                    <div class="flex items-center space-x-2 mt-1">
                                        <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${item.category}</span>
                                        <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${currentOrder.session}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="text-right ml-4">
                                <span class="text-lg font-bold text-orange-600">${formatCurrency(item.price)}</span>
                                <div class="text-xs text-gray-500 mt-1">Click to add</div>
                            </div>
                        </div>
                    </div>
                `).join('');
                lucide.createIcons();
            } else {
                searchResults.innerHTML = `<div class="p-3 text-gray-500 text-center">No items found for "${query}" in ${currentOrder.session} session.</div>`;
            }
        });
    }
}

// Function to show available items for current session
function showSessionItems() {
    const searchResults = document.getElementById('searchResults');
    
    if (!searchResults) return;

    if (!window.fetchedMenuItems || window.fetchedMenuItems.length === 0) {
        searchResults.innerHTML = `<div class="p-3 text-gray-500 text-center">Menu items are not loaded yet. Please wait or refresh.</div>`;
        lucide.createIcons();
        return;
    }

    const sessionMenuItems = window.fetchedMenuItems.filter(item => {
        return Array.isArray(item.sessions) && item.sessions.includes(currentOrder.session);
    }); 

    if (sessionMenuItems.length > 0) {
        searchResults.innerHTML = `
            <div class="mb-3 p-2 bg-orange-50 border border-orange-200 rounded">
                <h4 class="font-medium text-orange-800 capitalize">${currentOrder.session} Session Menu (${sessionMenuItems.length} items)</h4>
            </div>
            ${sessionMenuItems.map(item => `
                <div class="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer" onclick="addItemToOrder(${item.id})">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center flex-1">
                            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover mr-4" onerror="this.onerror=null;this.src='https://placehold.co/64x64/cccccc/333333?text=No+Image';">` : `<img src="https://placehold.co/64x64/cccccc/333333?text=No+Image" alt="No Image" class="w-16 h-16 rounded-lg object-cover mr-4">`}
                            <div>
                                <h4 class="font-medium text-gray-900">${item.name}</h4>
                                <p class="text-sm text-gray-600">${item.description || ''}</p>
                                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">${item.category}</span>
                            </div>
                        </div>
                        <div class="text-right ml-4">
                            <span class="text-lg font-bold text-orange-600">${formatCurrency(item.price)}</span>
                            <div class="text-xs text-gray-500 mt-1">Click to add</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
        lucide.createIcons();
    } else {
        searchResults.innerHTML = `<div class="p-3 text-gray-500 text-center">No items found for ${currentOrder.session} session.</div>`;
    }
}

// Order management
function addItemToOrder(itemId) {
    const item = window.fetchedMenuItems.find(i => i.id === itemId); 
    
    if (!item) {
        console.error(`Item with ID ${itemId} not found in fetched menu.`);
        window.showCustomAlert(`Item with ID ${itemId} not found.`);
        return;
    }

    if (item.customizationOptions && item.customizationOptions.length > 0) {
        showItemCustomizationModal(item);
        return; 
    } else {
        const existingItem = currentOrder.items.find(i => i.id === itemId && (!i.selectedCustomizations || i.selectedCustomizations.length === 0));
        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.totalPrice = existingItem.price * existingItem.quantity;
        } else {
            currentOrder.items.push({ ...item, quantity: 1, selectedCustomizations: [], totalPrice: item.price });
        }
    }
    
    updateOrderDisplay();
    
    // Clear search on desktop, but keep menu visible on mobile
    if (window.innerWidth >= 768) { // Desktop
        document.getElementById('searchInput').value = '';
        document.getElementById('searchResults').innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i data-lucide="soup" class="h-12 w-12 mx-auto mb-3 text-gray-300"></i>
                <p>Select a session or search for items</p>
            </div>
        `;
    }
    
    // On mobile, just update the cart button, don't hide the menu page
    if (window.innerWidth < 768) {
        // The menu (mobileMenuPage or allMenuPage) should remain visible.
        // We just need to ensure the cart button updates.
        // If the cart modal is already open, update its display.
        if (!document.getElementById('mobileCartModal').classList.contains('hidden')) {
            updateOrderDisplay(); // Re-render cart items if modal is open
        }
    }
    lucide.createIcons(); 
}


function removeItemFromOrder(itemId) {
    currentOrder.items = currentOrder.items.filter(item => item.id !== itemId);
    updateOrderDisplay();
}

function updateItemQuantity(itemId, change) {
    const item = currentOrder.items.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        let itemTotal = item.price * item.quantity;
        if (item.selectedCustomizations) {
            item.selectedCustomizations.forEach(custom => {
                itemTotal += custom.price;
            });
        }
        item.totalPrice = itemTotal;

        if (item.quantity <= 0) {
            removeItemFromOrder(itemId);
        } else {
            updateOrderDisplay();
        }
    }
}

function updateOrderDisplay() {
    const isMobile = window.innerWidth < 768;
    const orderItemsContainer = isMobile ? document.getElementById('mobileOrderItems') : document.getElementById('orderItems');
    const totalItemsElement = isMobile ? document.getElementById('mobileTotalItems') : document.getElementById('totalItems');
    const totalAmountElement = isMobile ? document.getElementById('mobileTotalAmount') : document.getElementById('totalAmount');
    const proceedPaymentBtn = isMobile ? document.getElementById('mobileProceedPaymentBtn') : document.getElementById('proceedPaymentBtn');

    const amountInWordsContainer = document.getElementById('amountInWordsContainer');
    const amountInWordsElement = document.getElementById('amountInWords');
    const clearOrderBtn = document.getElementById('clearOrderBtn');

    const mobileCartButtonContainer = document.getElementById('mobileCartButtonContainer');
    const mobileCartItemCount = document.getElementById('mobileCartItemCount');
    const mobileCartTotalAmount = document.getElementById('mobileCartTotalAmount');

    const totalItems = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);
    let totalAmount = 0;
    currentOrder.items.forEach(item => {
        let itemTotal = item.price * item.quantity;
        if (item.selectedCustomizations) {
            item.selectedCustomizations.forEach(custom => {
                itemTotal += custom.price;
            });
        }
        totalAmount += itemTotal;
    });

    currentOrder.subtotal = totalAmount;
    currentOrder.total = totalAmount;

    if (totalItems === 0) {
        if (isMobile) {
            mobileCartButtonContainer.classList.add('hidden');
            orderItemsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i data-lucide="shopping-bag" class="h-12 w-12 mx-auto mb-3 text-gray-300"></i>
                    <p>Your cart is empty</p>
                </div>
            `;
        } else {
            orderItemsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <i data-lucide="shopping-bag" class="h-12 w-12 mx-auto mb-3 text-gray-300"></i>
                    <p>No items added yet</p>
                </div>
            `;
            if (amountInWordsContainer) amountInWordsContainer.classList.add('hidden');
            if (clearOrderBtn) clearOrderBtn.classList.add('hidden');
        }
        if (totalItemsElement) totalItemsElement.textContent = '0';
        if (totalAmountElement) totalAmountElement.textContent = '₹ 0';
        if (proceedPaymentBtn) {
            proceedPaymentBtn.disabled = true;
            proceedPaymentBtn.className = 'w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-gray-300 text-gray-500 cursor-not-allowed';
        }
    } else {
        const itemHtml = currentOrder.items.map(item => `
            <div class="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${item.name}</h4>
                    ${item.selectedCustomizations && item.selectedCustomizations.length > 0 ? 
                        `<p class="text-xs text-gray-500">(${item.selectedCustomizations.map(c => c.label || c.name).join(', ')})</p>` : ''}
                    <p class="text-sm text-gray-600">${formatCurrency(item.price)} each</p>
                </div>
                <div class="flex items-center space-x-3">
                    <button onclick="updateItemQuantity(${item.id}, -1)" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium">-</button>
                    <span class="w-8 text-center font-medium">${item.quantity}</span>
                    <button onclick="updateItemQuantity(${item.id}, 1)" class="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-medium">+</button>
                    <button onclick="removeItemFromOrder(${item.id})" class="ml-2 text-red-600 hover:text-red-800 text-sm font-medium">Remove</button>
                </div>
            </div>
        `).join('');
        if (orderItemsContainer) orderItemsContainer.innerHTML = itemHtml;

        if (totalItemsElement) totalItemsElement.textContent = totalItems;
        if (totalAmountElement) totalAmountElement.textContent = formatCurrency(totalAmount);
        
        if (proceedPaymentBtn) {
            proceedPaymentBtn.disabled = false;
            proceedPaymentBtn.className = isMobile ?
                'w-full flex items-center justify-center space-x-2 py-4 px-4 rounded-lg font-bold transition-all duration-200 bg-orange-600 hover:bg-orange-700 text-white' :
                'w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-orange-600 hover:bg-orange-700 text-white';
        }

        if (isMobile) {
            if (mobileCartButtonContainer) mobileCartButtonContainer.classList.remove('hidden');
            if (mobileCartItemCount) mobileCartItemCount.textContent = `${totalItems} Item${totalItems > 1 ? 's' : ''}`;
            if (mobileCartTotalAmount) mobileCartTotalAmount.textContent = formatCurrency(totalAmount);
        } else {
            if (amountInWordsContainer) {
                if (totalAmount > 0) {
                    amountInWordsElement.textContent = numberToWords(totalAmount) + ' Rupees Only';
                    amountInWordsContainer.classList.remove('hidden');
                } else {
                    amountInWordsContainer.classList.add('hidden');
                }
            }
            if (clearOrderBtn) clearOrderBtn.classList.remove('hidden');
        }
    }
    lucide.createIcons();
}

// Item Customization Modal
function showItemCustomizationModal(item) {
    const modal = document.getElementById('itemCustomizationModal');
    const content = document.getElementById('itemCustomizationContent');

    let tempSelectedCustomizations = [];

    let modalHtml = `
        <div class="flex items-center space-x-4 mb-4">
            ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover" onerror="this.onerror=null;this.src='https://placehold.co/64x64/cccccc/333333?text=No+Image';">` : `<img src="https://placehold.co/64x64/cccccc/333333?text=No+Image" alt="No Image" class="w-16 h-16 rounded-lg object-cover">`}
            <div>
                <h3 class="text-xl font-bold text-gray-900">${item.name}</h3>
                <p class="text-sm text-gray-600">${item.description}</p>
                <p class="text-lg font-semibold text-orange-600 mt-1">Base Price: ${formatCurrency(item.price)}</p>
            </div>
        </div>
        <div class="space-y-4" id="customizationOptionsContainer">
            <!-- Customization options will be rendered here -->
        </div>
        <div class="mt-6 flex justify-between items-center border-t pt-4">
            <span class="text-xl font-bold text-gray-900">Total: <span id="customizationTotalPrice">${formatCurrency(item.price)}</span></span>
            <button id="addCustomizedItemBtn" class="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg">
                Add to Order
            </button>
        </div>
    `;
    if (content) content.innerHTML = modalHtml;

    const optionsContainer = document.getElementById('customizationOptionsContainer');
    const customizationTotalPriceSpan = document.getElementById('customizationTotalPrice');
    let currentCustomizationPrice = item.price;

    function updateCustomizationTotal() {
        currentCustomizationPrice = item.price;
        tempSelectedCustomizations.forEach(custom => {
            currentCustomizationPrice += custom.price;
        });
        if (customizationTotalPriceSpan) customizationTotalPriceSpan.textContent = formatCurrency(currentCustomizationPrice);
    }

    let optionsHtml = '';
    item.customizationOptions.forEach(option => {
        if (option.type === 'heading') {
            optionsHtml += `<h4 class="font-semibold text-gray-800 mt-4 mb-2">${option.name}</h4>`;
        } else if (option.type === 'checkbox') {
            optionsHtml += `
                <label class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0 cursor-pointer">
                    <span class="text-gray-700">${option.name}</span>
                    <div class="flex items-center space-x-2">
                        <input type="checkbox" data-name="${option.name}" data-price="${option.price}" class="form-checkbox h-5 w-5 text-orange-600 rounded focus:ring-orange-500">
                        <span class="text-sm text-gray-500">${option.price === 0 ? 'Free' : formatCurrency(option.price)}</span>
                    </div>
                </label>
            `;
        } else if (option.type === 'radio' && option.options) {
            optionsHtml += `
                <div class="mb-3">
                    <h4 class="font-semibold text-gray-800 mb-2">${option.name}</h4>
                    ${option.options.map((radioOption, index) => {
                        return `
                            <label class="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0 cursor-pointer">
                                <span class="text-gray-700">${radioOption.label}</span>
                                <div class="flex items-center space-x-2">
                                    <input type="radio" name="radio-${item.id}-${option.name.replace(/\s/g, '-')}" value="${radioOption.label}" data-name="${option.name}" data-label="${radioOption.label}" data-price="${radioOption.price}" class="form-radio h-5 w-5 text-orange-600 focus:ring-orange-500" ${index === 0 ? 'checked' : ''}>
                                    <span class="text-sm text-gray-500">${radioOption.price === 0 ? 'Free' : formatCurrency(radioOption.price)}</span>
                                </div>
                            </label>
                        `;
                    }).join('')}
                </div>
            `;
            const defaultRadioOption = option.options[0];
            tempSelectedCustomizations.push({
                name: option.name,
                label: defaultRadioOption.label,
                price: defaultRadioOption.price,
                type: 'radio'
            });
        }
    });
    if (optionsContainer) optionsContainer.innerHTML = optionsHtml;

    if (optionsContainer) {
        optionsContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const custom = { name: this.dataset.name, price: parseFloat(this.dataset.price), type: 'checkbox' };
                if (this.checked) {
                    tempSelectedCustomizations.push(custom);
                } else {
                    tempSelectedCustomizations = tempSelectedCustomizations.filter(c => c.name !== custom.name);
                }
                updateCustomizationTotal();
            });
        });

        optionsContainer.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', function() {
                tempSelectedCustomizations = tempSelectedCustomizations.filter(c => c.name !== this.dataset.name);
                tempSelectedCustomizations.push({
                    name: this.dataset.name,
                    label: this.dataset.label,
                    price: parseFloat(this.dataset.price),
                    type: 'radio'
                });
                updateCustomizationTotal();
            });
        });
    }

    updateCustomizationTotal();

    const addCustomizedItemBtn = document.getElementById('addCustomizedItemBtn');
    if (addCustomizedItemBtn) {
        addCustomizedItemBtn.onclick = () => {
            currentOrder.items.push({
                ...item,
                quantity: 1,
                selectedCustomizations: [...tempSelectedCustomizations],
                totalPrice: currentCustomizationPrice
            });
            updateOrderDisplay();
            if (modal) modal.classList.add('hidden');
            // Do NOT hide mobileMenuPage or allMenuPage here. The user wants them to stay visible.
        };
    }

    const closeCustomizationModal = document.getElementById('closeCustomizationModal');
    if (closeCustomizationModal) {
        closeCustomizationModal.onclick = () => {
            if (modal) modal.classList.add('hidden');
        };
    }

    if (modal) modal.classList.remove('hidden');
    lucide.createIcons();
}


// Session and order type management
function initializeSessionButtons() {
    const sessionButtons = document.querySelectorAll('.session-btn');
    const orderInterface = document.getElementById('orderInterface');
    const mobileMenuPage = document.getElementById('mobileMenuPage');
    const mobileMenuPageTitle = document.getElementById('mobileMenuPageTitle');
    const backToOrderBtn = document.getElementById('backToOrderBtn');

    sessionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sessionButtons.forEach(b => {
                b.classList.remove('session-btn-active');
                b.classList.add('session-btn-inactive');
            });
            this.classList.remove('session-btn-inactive');
            this.classList.add('session-btn-active');
            currentOrder.session = this.dataset.session;

            if (window.innerWidth < 768) {
                if (orderInterface) orderInterface.classList.add('hidden');
                if (mobileMenuPage) mobileMenuPage.classList.remove('hidden');
                if (mobileMenuPageTitle) mobileMenuPageTitle.textContent = `${this.dataset.session} Session Menu`;
                renderMobileSessionMenu(currentOrder.session);
            } else {
                document.getElementById('searchInput').value = '';
                showSessionItems();
            }
            updateSessionInfo();
        });
    });

    if (backToOrderBtn) {
        backToOrderBtn.addEventListener('click', () => {
            if (mobileMenuPage) mobileMenuPage.classList.add('hidden');
            if (document.getElementById('allMenuPage')) document.getElementById('allMenuPage').classList.add('hidden');
            if (orderInterface) orderInterface.classList.remove('hidden');
            showSessionItems();
            document.getElementById('searchInput').value = '';
        });
    }

    const viewCartBtn = document.getElementById('viewCartBtn');
    if (viewCartBtn) {
        viewCartBtn.addEventListener('click', showMobileCartModal);
    }
    const closeMobileCartModal = document.getElementById('closeMobileCartModal');
    if (closeMobileCartModal) {
        closeMobileCartModal.addEventListener('click', () => {
            document.getElementById('mobileCartModal').classList.add('hidden');
        });
    }
}

// Renders menu items for the mobile session page
function renderMobileSessionMenu(session) {
    const mobileMenuItemsContainer = document.getElementById('mobileMenuItemsContainer');
    if (!mobileMenuItemsContainer) return;

    const sessionMenuItems = window.fetchedMenuItems.filter(item => Array.isArray(item.sessions) && item.sessions.includes(session));

    if (sessionMenuItems.length > 0) {
        mobileMenuItemsContainer.innerHTML = sessionMenuItems.map(item => `
            <div class="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer" onclick="addItemToOrder(${item.id})">
                <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1">
                        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover mr-4" onerror="this.onerror=null;this.src='https://placehold.co/64x64/cccccc/333333?text=No+Image';">` : `<img src="https://placehold.co/64x64/cccccc/333333?text=No+Image" alt="No Image" class="w-16 h-16 rounded-lg object-cover mr-4">`}
                        <div>
                            <h4 class="font-medium text-gray-900">${item.name}</h4>
                            <p class="text-sm text-gray-600">${item.description || ''}</p>
                            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">${item.category}</span>
                        </div>
                    </div>
                    <div class="text-right ml-4">
                        <span class="text-lg font-bold text-orange-600">${formatCurrency(item.price)}</span>
                        <div class="text-xs text-gray-500 mt-1">Tap to add</div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        mobileMenuItemsContainer.innerHTML = `<div class="p-3 text-gray-500 text-center">No items found for ${session} session.</div>`;
    }
    lucide.createIcons();
}

// Function to show ALL menu items (for the "Full Menu" page)
function showAllMenuItems() {
    const allMenuItemsContainer = document.getElementById('allMenuItemsContainer');
    const allMenuSearchInput = document.getElementById('allMenuSearchInput');

    if (!allMenuItemsContainer || !allMenuSearchInput) return;

    if (!window.fetchedMenuItems || window.fetchedMenuItems.length === 0) {
        allMenuItemsContainer.innerHTML = `<div class="p-3 text-gray-500 text-center">Menu items are not loaded yet. Please wait or refresh.</div>`;
        lucide.createIcons();
        return;
    }

    renderAllMenuItems(window.fetchedMenuItems);

    if (!allMenuSearchInput._hasEventListener) { // Prevent adding multiple listeners
        allMenuSearchInput.addEventListener('input', function() {
            const query = this.value.trim().toLowerCase();
            const filteredItems = window.fetchedMenuItems.filter(item => 
                item.name.toLowerCase().includes(query) ||
                item.category.toLowerCase().includes(query) ||
                (item.description && item.description.toLowerCase().includes(query))
            );
            renderAllMenuItems(filteredItems);
        });
        allMenuSearchInput._hasEventListener = true; // Mark as having listener
    }
}

// Helper function to render items into the all menu container
function renderAllMenuItems(itemsToRender) {
    const allMenuItemsContainer = document.getElementById('allMenuItemsContainer');
    if (!allMenuItemsContainer) return;

    if (itemsToRender.length > 0) {
        allMenuItemsContainer.innerHTML = itemsToRender.map(item => `
            <div class="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer" onclick="addItemToOrder(${item.id})">
                <div class="flex items-center justify-between">
                    <div class="flex items-center flex-1">
                        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" class="w-16 h-16 rounded-lg object-cover mr-4" onerror="this.onerror=null;this.src='https://placehold.co/64x64/cccccc/333333?text=No+Image';">` : `<img src="https://placehold.co/64x64/cccccc/333333?text=No+Image" alt="No Image" class="w-16 h-16 rounded-lg object-cover mr-4">`}
                        <div>
                            <h4 class="font-medium text-gray-900">${item.name}</h4>
                            <p class="text-sm text-gray-600">${item.description || ''}</p>
                            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">${item.category}</span>
                            <span class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded mt-1 ml-1">
                                ${item.sessions && item.sessions.length > 0 ? item.sessions.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ') : 'N/A'}
                            </span>
                        </div>
                    </div>
                    <div class="text-right ml-4">
                        <span class="text-lg font-bold text-orange-600">${formatCurrency(item.price)}</span>
                        <div class="text-xs text-gray-500 mt-1">Click to add</div>
                    </div>
                </div>
            </div>
        `).join('');
    } else {
        allMenuItemsContainer.innerHTML = `<div class="p-3 text-gray-500 text-center">No items found.</div>`;
    }
    lucide.createIcons();
}


// Function to show the mobile cart modal
function showMobileCartModal() {
    const mobileCartModal = document.getElementById('mobileCartModal');
    if (mobileCartModal) {
        mobileCartModal.classList.remove('hidden');
        updateOrderDisplay();
    }
}


function updateSessionInfo() {
    const sessionItems = window.fetchedMenuItems.filter(item => Array.isArray(item.sessions) && item.sessions.includes(currentOrder.session));
    const sessionCount = sessionItems.length;

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.placeholder = `Search ${sessionCount} items available for ${currentOrder.session} session...`;
    }
}

function initializeOrderTypeButtons() {
    const dineInBtn = document.getElementById('dineInBtn');
    const parcelBtn = document.getElementById('parcelBtn');
    
    if (dineInBtn) {
        dineInBtn.addEventListener('click', function() {
            dineInBtn.className = 'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-orange-600 bg-orange-50 text-orange-700';
            if (parcelBtn) parcelBtn.className = 'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-gray-300 hover:border-gray-400';
            currentOrder.orderType = 'dine-in';
        });
    }
    
    if (parcelBtn) {
        parcelBtn.addEventListener('click', function() {
            parcelBtn.className = 'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-orange-600 bg-orange-50 text-orange-700';
            if (dineInBtn) dineInBtn.className = 'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-gray-300 hover:border-gray-400';
            currentOrder.orderType = 'parcel';
        });
    }
}

// Navigation
function initializeNavigation() {
    const orderBtn = document.getElementById('orderBtn');
    const reportsBtn = document.getElementById('reportsBtn');
    const allMenuBtn = document.getElementById('allMenuBtn');
    const mobileNavReports = document.getElementById('mobileNavReports');
    const mobileNavMenu = document.getElementById('mobileNavMenu');
    const mobileNavAllMenu = document.getElementById('mobileNavAllMenu');
    const backToOrderFromAllMenuBtn = document.getElementById('backToOrderFromAllMenuBtn');

    const orderInterface = document.getElementById('orderInterface');
    const reportsInterface = document.getElementById('reportsInterface');
    const mobileMenuPage = document.getElementById('mobileMenuPage');
    const allMenuPage = document.getElementById('allMenuPage');

    const hideAllInterfaces = () => {
        if (orderInterface) orderInterface.classList.add('hidden');
        if (reportsInterface) reportsInterface.classList.add('hidden');
        if (mobileMenuPage) mobileMenuPage.classList.add('hidden');
        if (allMenuPage) allMenuPage.classList.add('hidden');
    };

    const resetNavButtons = () => {
        [orderBtn, reportsBtn, allMenuBtn].forEach(btn => {
            if (btn) btn.className = 'w-full flex items-center space-x-2 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
        });
    };

    if (orderBtn) {
        orderBtn.addEventListener('click', function() {
            hideAllInterfaces();
            if (orderInterface) orderInterface.classList.remove('hidden');
            resetNavButtons();
            this.className = 'w-full flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-orange-600 text-white';
            localStorage.setItem('lastPage', 'order');
        });
    }
    
    if (reportsBtn) {
        reportsBtn.addEventListener('click', async function() {
            hideAllInterfaces();
            showAdminLoginModal(); // This will handle showing reportsInterface on success
            resetNavButtons();
            this.className = 'w-full flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-orange-600 text-white';
            localStorage.setItem('lastPage', 'reports');
        });
    }

    if (allMenuBtn) {
        allMenuBtn.addEventListener('click', () => {
            hideAllInterfaces();
            if (allMenuPage) allMenuPage.classList.remove('hidden');
            showAllMenuItems();
            resetNavButtons();
            this.className = 'w-full flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-orange-600 text-white';
            localStorage.setItem('lastPage', 'allMenu');
        });
    }

    // Mobile Navigation
    if (mobileNavReports) {
        mobileNavReports.addEventListener('click', () => {
            hideAllInterfaces();
            showAdminLoginModal();
        });
    }
    
    if (mobileNavMenu) {
        mobileNavMenu.addEventListener('click', () => {
            hideAllInterfaces();
            if (orderInterface) orderInterface.classList.remove('hidden');
        });
    }

    if (mobileNavAllMenu) {
        mobileNavAllMenu.addEventListener('click', () => {
            hideAllInterfaces();
            if (allMenuPage) allMenuPage.classList.remove('hidden');
            showAllMenuItems();
        });
    }

    if (backToOrderFromAllMenuBtn) {
        backToOrderFromAllMenuBtn.addEventListener('click', () => {
            if (allMenuPage) allMenuPage.classList.add('hidden');
            if (orderInterface) orderInterface.classList.remove('hidden');
            showSessionItems();
            document.getElementById('searchInput').value = '';
        });
    }
    // Mobile back button for session menu page
    const mobileBackToOrderBtn = document.getElementById('backToOrderBtn');
    if (mobileBackToOrderBtn) {
        mobileBackToOrderBtn.addEventListener('click', () => {
            if (mobileMenuPage) mobileMenuPage.classList.add('hidden');
            if (orderInterface) orderInterface.classList.remove('hidden');
            showSessionItems();
            document.getElementById('searchInput').value = '';
        });
    }
}

// Payment functionality
function initializePayment() {
    const proceedPaymentBtn = document.getElementById('proceedPaymentBtn');
    const mobileProceedPaymentBtn = document.getElementById('mobileProceedPaymentBtn');
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const clearOrderBtn = document.getElementById('clearOrderBtn');

    const handleProceedPayment = async () => {
        if (currentOrder.items.length === 0) return;
        currentOrder.customerName = document.getElementById('customerName')?.value || '';
        currentOrder.customerPhone = document.getElementById('customerPhone')?.value || '';
        currentOrder.billNo = await generateBillNumber(); // Ensure bill number is generated/reused
        const billNoInput = document.getElementById('billNo');
        if (billNoInput) billNoInput.value = currentOrder.billNo;
        currentOrder.timestamp = new Date().toISOString();
        showPaymentModal();
    };

    if (proceedPaymentBtn) {
        proceedPaymentBtn.addEventListener('click', handleProceedPayment);
    }
    
    if (mobileProceedPaymentBtn) {
        mobileProceedPaymentBtn.addEventListener('click', handleProceedPayment);
    }

    if (closePaymentModal) {
        closePaymentModal.addEventListener('click', function() {
            if (paymentModal) paymentModal.classList.add('hidden');
        });
    }

    if (clearOrderBtn) {
        clearOrderBtn.addEventListener('click', clearOrder);
    }
}

function showPaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    const paymentContent = document.getElementById('paymentContent');

    if (!paymentContent || !paymentModal) return;

    paymentContent.innerHTML = `
        <div class="space-y-6">
            <!-- Order Summary -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-3">Order Summary</h3>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span>Bill No:</span>
                        <span class="font-medium">${currentOrder.billNo}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Session:</span>
                        <span class="font-medium capitalize">${currentOrder.session}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Order Type:</span>
                        <span class="font-medium capitalize">${currentOrder.orderType.replace('-', ' ')}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Total Items:</span>
                        <span class="font-medium">${currentOrder.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                    </div>
                    <div class="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total Amount:</span>
                        <span class="text-orange-600">${formatCurrency(currentOrder.total)}</span>
                    </div>
                </div>
            </div>

            <!-- Payment Method -->
            <div>
                <h3 class="font-semibold text-gray-900 mb-3">Payment Method</h3>
                <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                        <button id="cashOnlyBtn" class="p-3 border-2 border-green-600 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors">
                            💵 Cash Only
                        </button>
                        <button id="onlineOnlyBtn" class="p-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors">
                            💳 Online Only
                        </button>
                    </div>
                    <button id="splitPaymentBtn" class="w-full p-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors">
                        🔄 Split Payment
                    </button>
                </div>
            </div>

            <!-- Split Payment Details (Hidden by default) -->
            <div id="splitPaymentDetails" class="hidden space-y-4">
                <h4 class="font-medium text-gray-900">Split Payment Details</h4>
                <div class="space-y-3">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Online Payment Amount</label>
                        <input type="number" id="onlineAmount" min="0" max="${currentOrder.total}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">Cash Payment Amount</label>
                        <input type="number" id="cashAmount" min="0" max="${currentOrder.total}" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500">
                    </div>
                    <div class="text-sm text-gray-600">
                        <span>Remaining: </span>
                        <span id="remainingAmount" class="font-medium">₹ ${currentOrder.total}</span>
                    </div>
                </div>
            </div>

            <!-- Complete Payment Button -->
            <button id="completePaymentBtn" class="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                Complete Payment & Generate Receipt
            </button>
        </div>
    `;

    paymentModal.classList.remove('hidden');
    initializePaymentMethods();
}

function initializePaymentMethods() {
    const cashOnlyBtn = document.getElementById('cashOnlyBtn');
    const onlineOnlyBtn = document.getElementById('onlineOnlyBtn');
    const splitPaymentBtn = document.getElementById('splitPaymentBtn');
    const splitPaymentDetails = document.getElementById('splitPaymentDetails');
    const completePaymentBtn = document.getElementById('completePaymentBtn');

    let paymentMethod = 'cash';

    if (cashOnlyBtn) cashOnlyBtn.addEventListener('click', function() {
        paymentMethod = 'cash';
        updatePaymentMethodButtons('cash');
        if (splitPaymentDetails) splitPaymentDetails.classList.add('hidden');
    });

    if (onlineOnlyBtn) onlineOnlyBtn.addEventListener('click', function() {
        paymentMethod = 'online';
        updatePaymentMethodButtons('online');
        if (splitPaymentDetails) splitPaymentDetails.classList.add('hidden');
    });

    if (splitPaymentBtn) splitPaymentBtn.addEventListener('click', function() {
        paymentMethod = 'split';
        updatePaymentMethodButtons('split');
        if (splitPaymentDetails) splitPaymentDetails.classList.remove('hidden');
        initializeSplitPayment();
    });

    if (completePaymentBtn) completePaymentBtn.addEventListener('click', function() {
        completePayment(paymentMethod);
    });
}

function updatePaymentMethodButtons(selectedMethod) {
    const buttons = ['cashOnlyBtn', 'onlineOnlyBtn', 'splitPaymentBtn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.classList.remove('border-green-600', 'bg-green-50', 'text-green-700');
            btn.classList.add('border-gray-300', 'text-gray-700');
        }
    });

    const selectedBtn = document.getElementById(selectedMethod === 'cash' ? 'cashOnlyBtn' :
                                             selectedMethod === 'online' ? 'onlineOnlyBtn' : 'splitPaymentBtn');
    if (selectedBtn) {
        selectedBtn.classList.remove('border-gray-300', 'text-gray-700');
        selectedBtn.classList.add('border-green-600', 'bg-green-50', 'text-green-700');
    }
}

function initializeSplitPayment() {
    const onlineAmountInput = document.getElementById('onlineAmount');
    const cashAmountInput = document.getElementById('cashAmount');
    const remainingAmountSpan = document.getElementById('remainingAmount');

    function updateRemaining() {
        const onlineAmount = parseFloat(onlineAmountInput?.value) || 0;
        const cashAmount = parseFloat(cashAmountInput?.value) || 0;
        const total = onlineAmount + cashAmount;
        const remaining = currentOrder.total - total;

        if (remainingAmountSpan) {
            remainingAmountSpan.textContent = formatCurrency(remaining);
            remainingAmountSpan.className = remaining === 0 ? 'font-medium text-green-600' :
                                           remaining < 0 ? 'font-medium text-red-600' : 'font-medium';
        }
    }

    if (onlineAmountInput) onlineAmountInput.addEventListener('input', function() {
        const onlineAmount = parseFloat(this.value) || 0;
        if (cashAmountInput) cashAmountInput.value = Math.max(0, currentOrder.total - onlineAmount);
        updateRemaining();
    });

    if (cashAmountInput) cashAmountInput.addEventListener('input', function() {
        const cashAmount = parseFloat(this.value) || 0;
        if (onlineAmountInput) onlineAmountInput.value = Math.max(0, currentOrder.total - cashAmount);
        updateRemaining();
    });

    if (onlineAmountInput) onlineAmountInput.value = 0;
    if (cashAmountInput) cashAmountInput.value = currentOrder.total;
    updateRemaining();
}

async function completePayment(paymentMethod) {
    let onlinePayment = 0;
    let cashPayment = 0;

    if (paymentMethod === 'cash') {
        cashPayment = currentOrder.total;
    } else if (paymentMethod === 'online') {
        onlinePayment = currentOrder.total;
    } else if (paymentMethod === 'split') {
        onlinePayment = parseFloat(document.getElementById('onlineAmount')?.value) || 0;
        cashPayment = parseFloat(document.getElementById('cashAmount')?.value) || 0;

        if (onlinePayment + cashPayment !== currentOrder.total) {
            window.showCustomAlert('Payment amounts do not match the total. Please check and try again.');
            return;
        }
    }

    const completedOrder = {
        ...currentOrder,
        onlinePayment,
        cashPayment,
        paymentMethod,
        completedAt: new Date().toISOString()
    };

    const success = await saveOrderToFirestore(completedOrder);

    if (!success) {
        return;
    }

    showReceipt(completedOrder);

    clearOrder();
    sessionStorage.removeItem('currentBillNo'); // Clear bill number on successful completion

    document.getElementById('paymentModal')?.classList.add('hidden');
}

// Receipt functionality
function showReceipt(order) {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    const receiptHTML = generateReceiptHTML(order);

    if (receiptWindow) {
        receiptWindow.document.write(receiptHTML);
        receiptWindow.document.close();

        setTimeout(() => {
            receiptWindow.print();
        }, 500);
    } else {
        window.showCustomAlert("Please allow pop-ups to view the receipt.");
    }
}

function generateReceiptHTML(order) {
    const itemsHTML = order.items.map(item => `
        <tr>
            <td style="padding: 4px 0; border-bottom: 1px dotted #ccc;">
                ${item.name}
                ${item.selectedCustomizations && item.selectedCustomizations.length > 0 ? 
                    `<br><small>(${item.selectedCustomizations.map(c => c.label || c.name).join(', ')})</small>` : ''}
            </td>
            <td style="padding: 4px 0; border-bottom: 1px dotted #ccc; text-align: center;">${item.quantity}</td>
            <td style="padding: 4px 0; border-bottom: 1px dotted #ccc; text-align: right;">${formatCurrency(item.price)}</td>
            <td style="padding: 4px 0; border-bottom: 1px dotted #ccc; text-align: right;">${formatCurrency(item.totalPrice || (item.price * item.quantity))}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.billNo}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    font-size: 10px;
                    line-height: 1.4;
                    color: #333;
                    margin: 0;
                    padding: 20px;
                    max-width: 300px;
                    margin: auto;
                    box-sizing: border-box;
                }
                .header, .footer {
                    text-align: center;
                    margin-bottom: 15px;
                }
                .header h1 {
                    font-size: 1.8em;
                    margin: 5px 0;
                    color: #e54a00;
                }
                .header p {
                    font-size: 0.9em;
                    margin: 2px 0;
                    color: #666;
                }
                .divider {
                    border-top: 1px dashed #aaa;
                    margin: 15px 0;
                }
                .info-table, .items-table, .summary-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 10px;
                }
                .info-table td, .summary-table td {
                    padding: 4px 0;
                    vertical-align: top;
                }
                .items-table th, .items-table td {
                    text-align: left;
                    padding: 4px 0;
                    border-bottom: 1px dashed #ccc;
                }
                .items-table th:nth-child(2), .items-table td:nth-child(2) { text-align: center; }
                .items-table th:nth-child(3), .items-table td:nth-child(3) { text-align: right; }
                .items-table th:nth-child(4), .items-table td:nth-child(4) { text-align: right; }
                .text-right { text-align: right; }
                .text-center { text-align: center; }
                .font-bold { font-weight: bold; }
                .text-lg { font-size: 1.1em; }
                .total-line {
                    border-top: 2px solid #333;
                    font-weight: bold;
                    padding-top: 5px !important;
                }
                @media print {
                    body {
                        margin: 0;
                        padding: 0;
                    }
                    @page {
                        margin: 0;
                    }
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>MADURAI MESS</h1>
                <p>123, Main Road, Madurai - 625001</p>
                <p>Mob: +91 98765 43210</p>
            </div>
            <div class="divider"></div>
            <table class="info-table">
                <tr>
                    <td>Bill No:</td>
                    <td class="text-right">${order.billNo}</td>
                </tr>
                <tr>
                    <td>Date:</td>
                    <td class="text-right">${new Date(order.completedAt).toLocaleDateString('en-IN')}</td>
                </tr>
                <tr>
                    <td>Time:</td>
                    <td class="text-right">${new Date(order.completedAt).toLocaleTimeString('en-IN')}</td>
                </tr>
                ${order.orderType === 'dine-in' ? `
                <tr>
                    <td>Order Type:</td>
                    <td class="text-right">Dine-In</td>
                </tr>
                ` : `
                <tr>
                    <td>Order Type:</td>
                    <td class="text-right">Parcel</td>
                </tr>
                `}
                ${order.customerName ? `
                <tr>
                    <td>Customer:</td>
                    <td class="text-right">${order.customerName}</td>
                </tr>` : ''}
                ${order.customerPhone ? `
                <tr>
                    <td>Phone:</td>
                    <td class="text-right">${order.customerPhone}</td>
                </tr>` : ''}
            </table>
            <div class="divider"></div>
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th class="text-center">QTY</th>
                        <th class="text-right">Price</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHTML}
                </tbody>
            </table>
            <div class="divider"></div>
            <table class="summary-table">
                <tr>
                    <td>No. of Items:</td>
                    <td class="text-right font-bold">${order.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                </tr>
                <tr class="total-line">
                    <td class="text-lg">Total Amount:</td>
                    <td class="text-lg text-right font-bold">${formatCurrency(order.total)}</td>
                </tr>
                <tr>
                    <td colspan="2" style="padding-top: 5px;">
                        <div class="font-bold">Amount in Words:</div>
                        <div>${numberToWords(order.total)} Rupees Only</div>
                    </td>
                </tr>
                ${order.onlinePayment > 0 ? `
                <tr>
                    <td>Online Paid:</td>
                    <td class="text-right">${formatCurrency(order.onlinePayment)}</td>
                </tr>` : ''}
                ${order.cashPayment > 0 ? `
                <tr>
                    <td>Cash Paid:</td>
                    <td class="text-right">${formatCurrency(order.cashPayment)}</td>
                </tr>` : ''}
            </table>
            <div class="divider"></div>
            <div class="footer">
                <p>Thank you for your visit!</p>
                <p style="font-size:0.8em; color:#888;">Powered by Madurai Mess POS</p>
            </div>
        </body>
        </html>
    `;
}

// Enhanced Reports functionality with analytics
async function loadReports() {
    const reportsContentDiv = document.getElementById('reportsContent');
    const reportsInterface = document.getElementById('reportsInterface');
    if (!reportsContentDiv || !reportsInterface) {
        console.error("Reports content container or interface not found.");
        return;
    }

    if (!window.isAdminLoggedIn) {
        showAdminLoginModal();
        reportsInterface.classList.add('hidden');
        return;
    }

    reportsContentDiv.innerHTML = '<div class="text-center py-8 text-gray-500">Loading reports data...</div>';

    await fetchOrdersForReports(null, null, 'all');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const thisWeek = getWeekRange(today);
    const thisMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    const thisYear = today.getFullYear().toString();

    const todayOrders = allOrdersForReports.filter(order => order.completedAt && order.completedAt.startsWith(todayStr));
    const weekOrders = allOrdersForReports.filter(order => order.completedAt && isDateInRange(order.completedAt, thisWeek.start, thisWeek.end));
    const monthOrders = allOrdersForReports.filter(order => order.completedAt && order.completedAt.startsWith(thisMonth));
    const yearOrders = allOrdersForReports.filter(order => order.completedAt && order.completedAt.startsWith(thisYear));

    const stats = {
        today: calculatePeriodStats(todayOrders),
        week: calculatePeriodStats(weekOrders),
        month: calculatePeriodStats(monthOrders),
        year: calculatePeriodStats(yearOrders),
        filtered: null
    };

    window.reportStats = stats;

    renderReportChartsAndTable();

    showPeriodStats('today');

    renderDailyItemSales(todayOrders);

    lucide.createIcons();
}

/**
 * Updates the summary cards with the given statistics.
 * @param {object} stats - The statistics object for the current period.
 */
function updateAnalyticsSummaryCards(stats) {
    document.getElementById('summaryTotalOrders').textContent = stats.totalOrders;
    document.getElementById('summaryTotalRevenue').textContent = formatCurrency(stats.totalRevenue);
    document.getElementById('summaryAverageOrder').textContent = formatCurrency(stats.averageOrderValue);
    document.getElementById('summaryTopItemName').textContent = stats.topItems[0]?.name || 'No data';
    document.getElementById('summaryTopItemCount').textContent = `${stats.topItems[0]?.count || 0} sold`;

    document.getElementById('sessionMorningOrders').textContent = `${stats.sessionStats.morning} orders`;
    document.getElementById('sessionAfternoonOrders').textContent = `${stats.sessionStats.afternoon} orders`;
    document.getElementById('sessionNightOrders').textContent = `${stats.sessionStats.night} orders`;

    document.getElementById('orderTypeDineIn').textContent = `${stats.orderTypeStats.dineIn} orders`;
    document.getElementById('orderTypeParcel').textContent = `${stats.orderTypeStats.parcel} orders`;

    document.getElementById('paymentCash').textContent = formatCurrency(stats.cashPayments);
    document.getElementById('paymentOnline').textContent = formatCurrency(stats.onlinePayments);
}


/**
 * Renders the structure for charts and the detailed sales table.
 * This function should be called once when reports interface is loaded.
 */
function renderReportChartsAndTable() {
    const reportsContentDiv = document.getElementById('reportsContent');
    if (!reportsContentDiv) return;

    const initialStats = window.reportStats.today || calculatePeriodStats([]);

    reportsContentDiv.innerHTML = `
        <div class="space-y-6">
            <!-- Analytics Dashboard Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-blue-100 text-sm">Total Orders</p>
                            <p class="text-3xl font-bold" id="summaryTotalOrders">${initialStats.totalOrders}</p>
                        </div>
                        <i data-lucide="shopping-cart" class="h-8 w-8 text-blue-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-green-100 text-sm">Total Revenue</p>
                            <p class="text-3xl font-bold" id="summaryTotalRevenue">${formatCurrency(initialStats.totalRevenue)}</p>
                        </div>
                        <i data-lucide="indian-rupee" class="h-8 w-8 text-green-200"></i>
                    </div>
                </div>

                <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                    <div>
                        <p class="text-purple-100 text-sm">Average Order</p>
                        <p class="text-3xl font-bold" id="summaryAverageOrder">${formatCurrency(initialStats.averageOrderValue)}</p>
                    </div>
                    <i data-lucide="trending-up" class="h-8 w-8 text-purple-200"></i>
                </div>

                <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                    <div>
                        <p class="text-orange-100 text-sm">Top Item</p>
                        <p class="text-lg font-bold" id="summaryTopItemName">${initialStats.topItems[0]?.name || 'No data'}</p>
                        <p class="text-orange-200 text-sm" id="summaryTopItemCount">${initialStats.topItems[0]?.count || 0} sold</p>
                    </div>
                    <i data-lucide="star" class="h-8 w-8 text-orange-200"></i>
                </div>
            </div>

            <!-- Detailed Breakdown Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3">Session Breakdown</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Morning:</span>
                            <span class="font-medium" id="sessionMorningOrders">${initialStats.sessionStats.morning} orders</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Afternoon:</span>
                            <span class="font-medium" id="sessionAfternoonOrders">${initialStats.sessionStats.afternoon} orders</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Night:</span>
                            <span class="font-medium" id="sessionNightOrders">${initialStats.sessionStats.night} orders</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3">Order Types</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Dine-In:</span>
                            <span class="font-medium" id="orderTypeDineIn">${initialStats.orderTypeStats.dineIn} orders</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Parcel:</span>
                            <span class="font-medium" id="orderTypeParcel">${initialStats.orderTypeStats.parcel} orders</span>
                        </div>
                    </div>
                </div>

                <div class="bg-gray-50 p-4 rounded-lg">
                    <h4 class="font-semibold text-gray-900 mb-3">Payment Methods</h4>
                    <div class="space-y-2">
                        <div class="flex justify-between">
                            <span class="text-gray-600">Cash:</span>
                            <span class="font-medium" id="paymentCash">${formatCurrency(initialStats.cashPayments)}</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-gray-600">Online:</span>
                            <span class="font-medium" id="paymentOnline">${formatCurrency(initialStats.onlinePayments)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                <!-- Revenue Chart -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
                    <canvas id="revenueChart" width="400" height="200"></canvas>
                </div>

                <!-- Session Distribution -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Session Distribution</h3>
                    <canvas id="sessionChart" width="400" height="200"></canvas>
                </div>

                <!-- Payment Methods -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                    <canvas id="paymentChart" width="400" height="200"></canvas>
                </div>

                <!-- Top Items -->
                <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Selling Items</h3>
                    <canvas id="topItemsChart" width="400" height="200"></canvas>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
    
    const scrollToRecentOrdersBtn = document.getElementById('scrollToRecentOrdersBtn');
    if (scrollToRecentOrdersBtn) {
        scrollToRecentOrdersBtn.addEventListener('click', () => {
            const detailedSalesTable = document.getElementById('detailedSalesTable');
            if (detailedSalesTable) {
                detailedSalesTable.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    const reportPeriod = document.getElementById('reportPeriod');
    const reportSessionFilter = document.getElementById('reportSessionFilter');
    const generateReportBtn = document.getElementById('generateReportBtn');
    const customStartDate = document.getElementById('customStartDate');
    const customEndDate = document.getElementById('customEndDate');

    if (reportPeriod) reportPeriod.addEventListener('change', filterReportsByPeriod);
    if (reportSessionFilter) reportSessionFilter.addEventListener('change', filterReportsByPeriod);
    if (generateReportBtn) generateReportBtn.addEventListener('click', filterReportsByPeriod);
    if (customStartDate) customStartDate.addEventListener('change', filterReportsByPeriod);
    if (customEndDate) customEndDate.addEventListener('change', filterReportsByPeriod);
}

/**
 * Handles updating the UI with stats for a given period.
 * @param {string} period - The period ('today', 'week', 'month', 'year', 'filtered')
 */
function showPeriodStats(period) {
    const stats = window.reportStats[period];
    if (stats) {
        updateAnalyticsSummaryCards(stats);
        updateCharts(period);
    } else {
        console.warn(`No stats available for period: ${period}`);
    }
}


/**
 * Filters and renders reports based on selected period and session.
 */
async function filterReportsByPeriod() {
    const period = document.getElementById('reportPeriod')?.value;
    const sessionFilter = document.getElementById('reportSessionFilter')?.value;
    const customDateRangeDiv = document.getElementById('customDateRange');
    const customStartDateInput = document.getElementById('customStartDate');
    const customEndDateInput = document.getElementById('customEndDate');

    let startDate = null;
    let endDate = null;

    if (period === 'custom') {
        if (customDateRangeDiv) customDateRangeDiv.classList.remove('hidden');
        startDate = customStartDateInput?.value ? new Date(customStartDateInput.value).toISOString() : null;
        endDate = customEndDateInput?.value ? new Date(customEndDateInput.value).toISOString() : null;
    } else {
        if (customDateRangeDiv) customDateRangeDiv.classList.add('hidden');
        const today = new Date();
        if (period === 'today') {
            startDate = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            endDate = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        } else if (period === 'week') {
            const range = getWeekRange(today);
            startDate = range.start;
            endDate = range.end;
        } else if (period === 'month') {
            const start = new Date(today.getFullYear(), today.getMonth(), 1);
            const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
            startDate = start.toISOString();
            endDate = end.toISOString();
        } else if (period === 'year') {
            const start = new Date(today.getFullYear(), 0, 1);
            const end = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999);
            startDate = start.toISOString();
            endDate = end.toISOString();
        }
    }

    const filteredOrders = await fetchOrdersForReports(startDate, endDate, sessionFilter);
    const stats = calculatePeriodStats(filteredOrders);

    window.reportStats.filtered = stats;

    updateAnalyticsSummaryCards(stats);
    updateCharts('filtered');
    renderReportTable(filteredOrders);
    renderDailyItemSales(filteredOrders);
}


// Chart management
let charts = {};

/**
 * Updates all charts based on the selected period's statistics.
 * @param {string} period - 'today', 'week', 'month', 'year', or 'filtered'
 */
function updateCharts(period) {
    const stats = window.reportStats[period];

    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });

    createRevenueChart(period);
    createSessionChart(stats);
    createPaymentChart(stats);
    createTopItemsChart(stats);
}

/**
 * Creates or updates the Revenue Trend chart.
 * @param {string} period - The selected period ('today', 'week', 'month', 'year')
 */
function createRevenueChart(period) {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;

    const labels = [];
    const data = [];

    if (period === 'today') {
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));
            const dayStr = date.toISOString().split('T')[0];
            const dayOrders = allOrdersForReports.filter(order => order.completedAt && order.completedAt.startsWith(dayStr));
            data.push(dayOrders.reduce((sum, order) => sum + order.total, 0));
        }
    } else if (period === 'week') {
        for (let i = 3; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7));
            labels.push(`Week ${date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}`);

            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1));
            weekStart.setHours(0,0,0,0);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            weekEnd.setHours(23,59,59,999);

            const weekOrders = allOrdersForReports.filter(order => {
                if (!order.completedAt) return false;
                const orderDate = new Date(order.completedAt);
                return orderDate >= weekStart && orderDate <= weekEnd;
            });
            data.push(weekOrders.reduce((sum, order) => sum + order.total, 0));
        }
    } else if (period === 'month' || period === 'year' || period === 'filtered') {
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }));

            const monthStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
            const monthOrders = allOrdersForReports.filter(order =>
                order.completedAt && order.completedAt.startsWith(monthStr)
            );
            data.push(monthOrders.reduce((sum, order) => sum + order.total, 0));
        }
    }

    charts.revenue = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Revenue',
                data: data,
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Creates or updates the Session Distribution chart.
 * @param {object} stats - The statistics object for the current period.
 */
function createSessionChart(stats) {
    const ctx = document.getElementById('sessionChart')?.getContext('2d');
    if (!ctx) return;

    charts.session = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Morning', 'Afternoon', 'Night'],
            datasets: [{
                data: [stats.sessionStats.morning, stats.sessionStats.afternoon, stats.sessionStats.night],
                backgroundColor: ['#fbbf24', '#f59e0b', '#d97706'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

/**
 * Creates or updates the Payment Methods chart.
 * @param {object} stats - The statistics object for the current period.
 */
function createPaymentChart(stats) {
    const ctx = document.getElementById('paymentChart')?.getContext('2d');
    if (!ctx) return;

    charts.payment = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Cash', 'Online'],
            datasets: [{
                data: [stats.cashPayments, stats.onlinePayments],
                backgroundColor: ['#10b981', '#3b82f6'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ₹' + context.parsed;
                        }
                    }
                }
            }
        }
    });
}

/**
 * Creates or updates the Top Selling Items chart.
 * @param {object} stats - The statistics object for the current period.
 */
function createTopItemsChart(stats) {
    const ctx = document.getElementById('topItemsChart')?.getContext('2d');
    if (!ctx) return;

    const labels = stats.topItems.map(item => item.name);
    const data = stats.topItems.map(item => item.count);

    charts.topItems = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Quantity Sold',
                data: data,
                backgroundColor: '#f59e0b',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

// Export functionality
function exportReports() {
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');

    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `madurai_mess_report_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

/**
 * Generates a CSV report from the 'allOrdersForReports' data.
 * @returns {string} The CSV formatted string.
 */
function generateCSVReport() {
    const headers = ['Bill No', 'Date', 'Time', 'Customer Name', 'Phone', 'Session', 'Order Type', 'Total Items', 'Total Amount', 'Cash Payment', 'Online Payment', 'Payment Method'];

    const rows = allOrdersForReports.map(order => {
        const date = new Date(order.completedAt);
        const totalItemsInOrder = order.items.reduce((sum, item) => sum + item.quantity, 0);

        return [
            order.billNo,
            date.toLocaleDateString('en-IN'),
            date.toLocaleTimeString('en-IN'),
            order.customerName || '',
            order.customerPhone || '',
            order.session,
            order.orderType,
            totalItemsInOrder,
            order.total,
            order.cashPayment || 0,
            order.onlinePayment || 0,
            order.paymentMethod || 'cash'
        ];
    });

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`.replace(/"null"/g, '""').replace(/"undefined"/g, '""')).join(','))
            .join('\n');

    return csvContent;
}

/**
 * Renders the detailed sales data table.
 * @param {Array} orders - The array of order objects to display.
 */
function renderReportTable(orders) {
    const reportTableBody = document.getElementById('reportTableBody');
    const noOrdersMessage = document.getElementById('noOrdersMessage');

    if (!reportTableBody || !noOrdersMessage) return;

    if (orders.length === 0) {
        reportTableBody.innerHTML = '';
        noOrdersMessage.classList.remove('hidden');
    } else {
        noOrdersMessage.classList.add('hidden');
        reportTableBody.innerHTML = orders.map(order => {
            const totalItemsInOrder = order.items.reduce((sum, item) => sum + item.quantity, 0);
            return `
                <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.billNo}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(order.completedAt)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customerName || 'Walk-in'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${order.session}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${totalItemsInOrder}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${formatCurrency(order.total)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.cashPayment > 0 && order.onlinePayment > 0 ? 'Split' :
                          order.cashPayment > 0 ? 'Cash' : 'Online'}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onclick="showReceipt(${JSON.stringify(order).replace(/"/g, '&quot;')})" class="text-orange-600 hover:text-orange-900">
                            View Receipt
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }
    lucide.createIcons();
}

/**
 * Renders the total items sold breakdown for the selected period.
 * @param {Array} orders - The array of order objects for the current report period.
 */
function renderDailyItemSales(orders) {
    const dailyItemSalesContainer = document.getElementById('dailyItemSalesContainer');
    if (!dailyItemSalesContainer) return;

    const itemSales = {};

    orders.forEach(order => {
        order.items.forEach(item => {
            const itemName = item.name;
            const session = order.session;

            if (!itemSales[itemName]) {
                itemSales[itemName] = { total: 0, morning: 0, afternoon: 0, night: 0 };
            }
            itemSales[itemName].total += item.quantity;
            if (itemSales[itemName][session] !== undefined) {
                itemSales[itemName][session] += item.quantity;
            }
        });
    });

    const sortedItems = Object.entries(itemSales).sort(([, dataA], [, dataB]) => dataB.total - dataA.total);

    if (sortedItems.length === 0) {
        dailyItemSalesContainer.innerHTML = '<p class="text-gray-500 text-center">No item sales data available for the selected period.</p>';
    } else {
        dailyItemSalesContainer.innerHTML = sortedItems.map(([itemName, data]) => `
            <div class="border border-gray-200 rounded-lg p-3 bg-white">
                <h4 class="font-semibold text-gray-900 text-lg mb-2">${itemName}</h4>
                <div class="flex justify-between items-center text-gray-700 mb-1">
                    <span>Total Sold:</span>
                    <span class="font-medium text-orange-600">${data.total} nos</span>
                </div>
                <div class="text-sm text-gray-600 space-y-1">
                    <div class="flex justify-between">
                        <span>Morning:</span>
                        <span>${data.morning} nos</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Afternoon:</span>
                        <span>${data.afternoon} nos</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Night:</span>
                        <span>${data.night} nos</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}


// Order reset functionality
function clearOrder() {
    currentOrder = {
        billNo: '',
        customerName: '',
        customerPhone: '',
        session: 'morning',
        orderType: 'dine-in',
        items: [],
        subtotal: 0,
        total: 0,
        timestamp: null
    };

    generateBillNumber().then(newBillNo => {
        currentOrder.billNo = newBillNo;
        const billNoInput = document.getElementById('billNo');
        if (billNoInput) {
            billNoInput.value = currentOrder.billNo;
        }
    }).catch(error => {
        console.error("Error generating bill number on clear order:", error);
        const billNoInput = document.getElementById('billNo');
        if (billNoInput) {
            billNoInput.value = "ERROR";
        }
    });

    const customerNameInput = document.getElementById('customerName');
    if (customerNameInput && (!window.auth.currentUser || window.auth.currentUser.isAnonymous)) {
        customerNameInput.value = '';
    }
    const customerPhoneInput = document.getElementById('customerPhone');
    if (customerPhoneInput) {
        customerPhoneInput.value = '';
    }
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    if (searchInput) {
        searchInput.value = '';
    }
    if (searchResults) {
        searchResults.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i data-lucide="soup" class="h-12 w-12 mx-auto mb-3 text-gray-300"></i>
                <p>Select a session or search for items</p>
            </div>
        `;
    }
    lucide.createIcons();

    document.querySelectorAll('.session-btn').forEach(btn => {
        btn.classList.remove('session-btn-active');
        btn.classList.add('session-btn-inactive');
    });
    const morningSessionBtn = document.querySelector('[data-session="morning"]');
    if (morningSessionBtn) {
        morningSessionBtn.classList.remove('session-btn-inactive');
        morningSessionBtn.classList.add('session-btn-active');
        morningSessionBtn.click();
    }

    const dineInBtn = document.getElementById('dineInBtn');
    const parcelBtn = document.getElementById('parcelBtn');
    if (dineInBtn && parcelBtn) {
        dineInBtn.className = 'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-orange-600 bg-orange-50 text-orange-700';
        parcelBtn.className = 'flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-gray-300 hover:border-gray-400';
    }

    updateOrderDisplay();
}

// Initialize application
async function startPosSystem() {
    console.log("Firebase is ready. User ID:", window.userId);

    // Initialize bill number, prioritizing session storage
    const storedBillNo = sessionStorage.getItem('currentBillNo');
    if (storedBillNo) {
        currentOrder.billNo = storedBillNo;
    } else {
        currentOrder.billNo = await generateBillNumber();
    }
    const billNoInput = document.getElementById('billNo');
    if (billNoInput) {
        billNoInput.value = currentOrder.billNo;
    }

    await fetchMenuItemsFromFirestore();

    initializeSearch();
    initializeSessionButtons();
    initializeOrderTypeButtons();
    initializeNavigation();
    initializePayment();

    updateDateTime();
    setInterval(updateDateTime, 1000);

    updateOrderDisplay();

    const defaultSessionButton = document.querySelector('[data-session="morning"]');
    if (defaultSessionButton) {
        defaultSessionButton.click();
    } else {
        showSessionItems();
        updateSessionInfo();
    }

    lucide.createIcons();

    initializeAuthModals();

    // Handle initial page load visibility based on localStorage
    const orderInterface = document.getElementById('orderInterface');
    const reportsInterface = document.getElementById('reportsInterface');
    const allMenuPage = document.getElementById('allMenuPage');
    const lastPage = localStorage.getItem('lastPage') || 'order';

    // Hide all main interfaces first
    if (orderInterface) orderInterface.classList.add('hidden');
    if (reportsInterface) reportsInterface.classList.add('hidden');
    if (allMenuPage) allMenuPage.classList.add('hidden');

    // Show the appropriate interface
    if (lastPage === 'reports' && window.isAdminLoggedIn) {
        if (reportsInterface) reportsInterface.classList.remove('hidden');
        await loadReports();
    } else if (lastPage === 'allMenu') {
        if (allMenuPage) allMenuPage.classList.remove('hidden');
        showAllMenuItems();
    } else { // Default to 'order' page
        if (orderInterface) orderInterface.classList.remove('hidden');
    }

    // Ensure desktop nav buttons are correctly highlighted on load
    const desktopOrderBtn = document.getElementById('orderBtn');
    const desktopReportsBtn = document.getElementById('reportsBtn');
    const desktopAllMenuBtn = document.getElementById('allMenuBtn');

    if (desktopOrderBtn && desktopReportsBtn && desktopAllMenuBtn) {
        desktopOrderBtn.className = 'w-full flex items-center space-x-2 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
        desktopReportsBtn.className = 'w-full flex items-center space-x-2 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
        desktopAllMenuBtn.className = 'w-full flex items-center space-x-2 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';

        if (lastPage === 'order') {
            desktopOrderBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            desktopOrderBtn.classList.add('bg-orange-600', 'text-white');
        } else if (lastPage === 'reports') {
            desktopReportsBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            desktopReportsBtn.classList.add('bg-orange-600', 'text-white');
        } else if (lastPage === 'allMenu') {
            desktopAllMenuBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            desktopAllMenuBtn.classList.add('bg-orange-600', 'text-white');
        }
    }
}

// Expose startPosSystem globally so index.html can call it
window.startPosSystem = startPosSystem;

// --- User Authentication Modals ---
let isSignUpMode = false;

function initializeAuthModals() {
    const userAuthModal = document.getElementById('userAuthModal');
    const closeUserAuthModal = document.getElementById('closeUserAuthModal');
    const authEmail = document.getElementById('authEmail');
    const authPassword = document.getElementById('authPassword');
    const authName = document.getElementById('authNameInput');
    const authPhone = document.getElementById('authPhoneInput');
    const authAge = document.getElementById('authAgeInput');
    const authPrimaryBtn = document.getElementById('authPrimaryBtn');
    const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');
    const userAuthModalTitle = document.getElementById('userAuthModalTitle');
    const toggleAuthPasswordBtn = document.getElementById('toggleAuthPassword');

    if (closeUserAuthModal) closeUserAuthModal.onclick = () => { if (userAuthModal) userAuthModal.classList.add('hidden'); };
    if (toggleAuthModeBtn) toggleAuthModeBtn.onclick = () => toggleAuthMode();
    if (authPrimaryBtn) authPrimaryBtn.onclick = handleAuthAction;

    if (toggleAuthPasswordBtn && authPassword) {
        toggleAuthPasswordBtn.addEventListener('click', () => {
            if (authPassword.type === 'password') {
                authPassword.type = 'text';
                toggleAuthPasswordBtn.innerHTML = '<i data-lucide="eye-off" class="h-5 w-5"></i>';
            } else {
                authPassword.type = 'password';
                toggleAuthPasswordBtn.innerHTML = '<i data-lucide="eye" class="h-5 w-5"></i>';
            }
            lucide.createIcons();
        });
    }

    if (authPassword) {
        authPassword.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleAuthAction();
            }
        });
    }
    if (authEmail) {
        authEmail.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (isSignUpMode) {
                    if (authPassword) authPassword.focus();
                } else {
                    handleAuthAction();
                }
            }
        });
    }
    if (authName) {
        authName.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (authPhone) authPhone.focus();
            }
        });
    }
    if (authPhone) {
        authPhone.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (authAge) authAge.focus();
            }
        });
    }
    if (authAge) {
        authAge.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                handleAuthAction();
            }
        });
    }

    toggleAuthMode(false);
}

window.showUserAuthModal = (mode = 'login') => {
    const userAuthModal = document.getElementById('userAuthModal');
    if (userAuthModal) {
        userAuthModal.classList.remove('hidden');
        toggleAuthMode(mode === 'signup');
    }
};

function toggleAuthMode(toSignUp = null) {
    const authNameContainer = document.getElementById('authName');
    const authPhoneContainer = document.getElementById('authPhone');
    const authAgeContainer = document.getElementById('authAge');
    const authPrimaryBtn = document.getElementById('authPrimaryBtn');
    const toggleAuthModeBtn = document.getElementById('toggleAuthModeBtn');
    const userAuthModalTitle = document.getElementById('userAuthModalTitle');
    const authPassword = document.getElementById('authPassword');
    const toggleAuthPasswordBtn = document.getElementById('toggleAuthPassword');

    if (toSignUp !== null) {
        isSignUpMode = toSignUp;
    } else {
        isSignUpMode = !isSignUpMode;
    }

    if (userAuthModalTitle) userAuthModalTitle.textContent = isSignUpMode ? 'Sign Up' : 'Login';
    if (authNameContainer) authNameContainer.classList[isSignUpMode ? 'remove' : 'add']('hidden');
    if (authPhoneContainer) authPhoneContainer.classList[isSignUpMode ? 'remove' : 'add']('hidden');
    if (authAgeContainer) authAgeContainer.classList[isSignUpMode ? 'remove' : 'add']('hidden');
    if (authPrimaryBtn) authPrimaryBtn.textContent = isSignUpMode ? 'Sign Up' : 'Login';
    if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = isSignUpMode ? 'Already have an account? Login' : "Don't have an account? Sign Up";
    
    const authEmail = document.getElementById('authEmail');
    const authNameInput = document.getElementById('authNameInput');
    const authPhoneInput = document.getElementById('authPhoneInput');
    const authAgeInput = document.getElementById('authAgeInput');

    if (authEmail) authEmail.value = '';
    if (authPassword) authPassword.value = '';
    if (authNameInput) authNameInput.value = '';
    if (authPhoneInput) authPhoneInput.value = '';
    if (authAgeInput) authAgeInput.value = '';
    
    if (authPassword) authPassword.type = 'password';
    if (toggleAuthPasswordBtn) {
        toggleAuthPasswordBtn.innerHTML = '<i data-lucide="eye" class="h-5 w-5"></i>';
    }
    lucide.createIcons();
}

async function handleAuthAction() {
    const email = document.getElementById('authEmail')?.value;
    const password = document.getElementById('authPassword')?.value;
    const name = document.getElementById('authNameInput')?.value;
    const phone = document.getElementById('authPhoneInput')?.value;
    const age = document.getElementById('authAgeInput')?.value;

    if (!email || !password) {
        window.showCustomAlert("Email and password are required.");
        return;
    }

    if (isSignUpMode) {
        if (!name || !phone) {
            window.showCustomAlert("Name and Phone Number are required for Sign Up.");
            return;
        }
        try {
            const userCredential = await window.createUserWithEmailAndPassword(window.auth, email, password);
            const user = userCredential.user;
            await window.setDoc(window.doc(window.db, "users", user.uid), {
                name: name,
                phone: phone,
                email: email,
                age: age || null,
                createdAt: new Date().toISOString()
            });
            window.showCustomAlert("Sign Up successful! You are now logged in.");
            const userAuthModal = document.getElementById('userAuthModal');
            if (userAuthModal) {
                userAuthModal.classList.add('hidden');
            }
        } catch (error) {
            console.error("Sign Up error:", error);
            window.showCustomAlert(`Sign Up failed: ${error.message}`);
        }
    } else {
        try {
            await window.signInWithEmailAndPassword(window.auth, email, password);
            window.showCustomAlert("Login successful!");
            const userAuthModal = document.getElementById('userAuthModal');
            if (userAuthModal) {
                userAuthModal.classList.add('hidden');
            }
        } catch (error) {
            console.error("Login error:", error);
            window.showCustomAlert(`Login failed: ${error.message}`);
        }
    }
}


// --- Admin Login Modal ---
function showAdminLoginModal() {
    const adminLoginModal = document.getElementById('adminLoginModal');
    const closeAdminLoginModal = document.getElementById('closeAdminLoginModal');
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminPasswordInput = document.getElementById('adminPassword');
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    const toggleAdminPasswordBtn = document.getElementById('toggleAdminPassword');

    if (adminUsernameInput) adminUsernameInput.value = '';
    if (adminPasswordInput) adminPasswordInput.value = '';
    
    if (adminPasswordInput) adminPasswordInput.type = 'password';
    if (toggleAdminPasswordBtn) {
        toggleAdminPasswordBtn.innerHTML = '<i data-lucide="eye" class="h-5 w-5"></i>';
    }
    lucide.createIcons();

    if (closeAdminLoginModal) closeAdminLoginModal.onclick = () => {
        if (adminLoginModal) adminLoginModal.classList.add('hidden');
        // If user closes admin login, revert to order page
        document.getElementById('orderInterface')?.classList.remove('hidden');
        document.getElementById('reportsInterface')?.classList.add('hidden');
        document.getElementById('mobileMenuPage')?.classList.add('hidden');
        document.getElementById('allMenuPage')?.classList.add('hidden');
        localStorage.setItem('lastPage', 'order');
        // Reset desktop nav button highlight
        const desktopOrderBtn = document.getElementById('orderBtn');
        const desktopReportsBtn = document.getElementById('reportsBtn');
        const desktopAllMenuBtn = document.getElementById('allMenuBtn');
        if (desktopOrderBtn && desktopReportsBtn && desktopAllMenuBtn) {
            desktopOrderBtn.classList.remove('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            desktopOrderBtn.classList.add('bg-orange-600', 'text-white');
            desktopReportsBtn.classList.remove('bg-orange-600', 'text-white');
            desktopReportsBtn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
            desktopAllMenuBtn.classList.remove('bg-orange-600', 'text-white');
            desktopAllMenuBtn.classList.add('bg-gray-200', 'text-gray-700', 'hover:bg-gray-300');
        }
    };
    if (adminLoginBtn) adminLoginBtn.onclick = adminLogin;

    if (toggleAdminPasswordBtn && adminPasswordInput) {
        toggleAdminPasswordBtn.addEventListener('click', () => {
            if (adminPasswordInput.type === 'password') {
                adminPasswordInput.type = 'text';
                toggleAdminPasswordBtn.innerHTML = '<i data-lucide="eye-off" class="h-5 w-5"></i>';
            } else {
                adminPasswordInput.type = 'password';
                toggleAdminPasswordBtn.innerHTML = '<i data-lucide="eye" class="h-5 w-5"></i>';
            }
            lucide.createIcons();
        });
    }

    if (adminPasswordInput) {
        adminPasswordInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                adminLogin();
            }
        });
    }
    if (adminUsernameInput) {
        adminUsernameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                if (adminPasswordInput) {
                    adminPasswordInput.focus();
                }
            }
        });
    }

    if (adminLoginModal) adminLoginModal.classList.remove('hidden');
    // Ensure all other main interfaces are hidden when admin login is shown
    document.getElementById('orderInterface')?.classList.add('hidden');
    document.getElementById('reportsInterface')?.classList.add('hidden');
    document.getElementById('mobileMenuPage')?.classList.add('hidden');
    document.getElementById('allMenuPage')?.classList.add('hidden');
}

async function adminLogin() {
    const adminUsernameInput = document.getElementById('adminUsername');
    const adminPasswordInput = document.getElementById('adminPassword');
    
    const adminUsername = adminUsernameInput ? adminUsernameInput.value : '';
    const adminPassword = adminPasswordInput ? adminPasswordInput.value : '';
    
    const adminLoginModal = document.getElementById('adminLoginModal');
    const reportsInterface = document.getElementById('reportsInterface');
    const orderInterface = document.getElementById('orderInterface');
    const allMenuPage = document.getElementById('allMenuPage');

    const CORRECT_USERNAME = "admin";
    const CORRECT_PASSWORD = "admin123";

    if (adminUsername === CORRECT_USERNAME && adminPassword === CORRECT_PASSWORD) {
        window.isAdminLoggedIn = true;
        window.showCustomAlert("Admin login successful!");
        if (adminLoginModal) adminLoginModal.classList.add('hidden');
        if (reportsInterface) reportsInterface.classList.remove('hidden');
        if (orderInterface) orderInterface.classList.add('hidden'); // Hide order interface after login
        if (allMenuPage) allMenuPage.classList.add('hidden');
        await loadReports();
    } else {
        window.showCustomAlert("Invalid admin credentials.");
        window.isAdminLoggedIn = false;
    }
}
