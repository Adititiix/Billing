// Madurai Mess POS System JavaScript

// Menu Items Data with Session Availability
const menuItems = [
    // Morning Session Items
    { id: 1, name: "Idli", price: 15, category: "Breakfast", description: "Steamed rice cakes (2 pieces)", sessions: ["morning", "afternoon", "night"] },
    { id: 2, name: "Dosa", price: 25, category: "Breakfast", description: "Crispy rice crepe", sessions: ["morning", "afternoon", "night"] },
    { id: 3, name: "Vada", price: 20, category: "Breakfast", description: "Deep fried lentil donuts (2 pieces)", sessions: ["morning", "afternoon"] },
    { id: 4, name: "Upma", price: 18, category: "Breakfast", description: "Semolina breakfast dish", sessions: ["morning"] },
    { id: 5, name: "Pongal", price: 22, category: "Breakfast", description: "Rice and lentil dish", sessions: ["morning"] },
    { id: 6, name: "Poori", price: 20, category: "Breakfast", description: "Deep fried bread (3 pieces)", sessions: ["morning", "afternoon"] },
    { id: 7, name: "Rava Dosa", price: 30, category: "Breakfast", description: "Crispy semolina crepe", sessions: ["morning", "afternoon"] },

    // Afternoon Session Items
    { id: 8, name: "Sambar Rice", price: 35, category: "Lunch", description: "Rice with lentil curry", sessions: ["afternoon", "night"] },
    { id: 9, name: "Curd Rice", price: 30, category: "Lunch", description: "Rice with yogurt", sessions: ["afternoon", "night"] },
    { id: 10, name: "Rasam Rice", price: 32, category: "Lunch", description: "Rice with tangy soup", sessions: ["afternoon", "night"] },
    { id: 11, name: "Vegetable Rice", price: 40, category: "Lunch", description: "Mixed vegetable rice", sessions: ["afternoon", "night"] },
    { id: 12, name: "Lemon Rice", price: 28, category: "Lunch", description: "Tangy lemon flavored rice", sessions: ["afternoon", "night"] },
    { id: 13, name: "Meals", price: 60, category: "Lunch", description: "Complete South Indian thali", sessions: ["afternoon"] },
    { id: 14, name: "Biryani", price: 80, category: "Lunch", description: "Aromatic rice with spices", sessions: ["afternoon", "night"] },

    // Night Session Items
    { id: 15, name: "Chapati", price: 8, category: "Dinner", description: "Indian flatbread (1 piece)", sessions: ["night"] },
    { id: 16, name: "Parotta", price: 12, category: "Dinner", description: "Layered flatbread (1 piece)", sessions: ["night"] },
    { id: 17, name: "Chicken Curry", price: 80, category: "Dinner", description: "Spicy chicken curry", sessions: ["afternoon", "night"] },
    { id: 18, name: "Mutton Curry", price: 120, category: "Dinner", description: "Traditional mutton curry", sessions: ["afternoon", "night"] },
    { id: 19, name: "Fish Curry", price: 90, category: "Dinner", description: "South Indian fish curry", sessions: ["afternoon", "night"] },
    { id: 20, name: "Vegetable Curry", price: 45, category: "Dinner", description: "Mixed vegetable curry", sessions: ["night"] },
    { id: 21, name: "Dal Fry", price: 35, category: "Dinner", description: "Spiced lentil curry", sessions: ["night"] },

    // Beverages (Available all sessions)
    { id: 22, name: "Filter Coffee", price: 15, category: "Beverages", description: "Traditional South Indian coffee", sessions: ["morning", "afternoon", "night"] },
    { id: 23, name: "Tea", price: 10, category: "Beverages", description: "Indian masala tea", sessions: ["morning", "afternoon", "night"] },
    { id: 24, name: "Buttermilk", price: 12, category: "Beverages", description: "Spiced yogurt drink", sessions: ["afternoon", "night"] },
    { id: 25, name: "Fresh Lime", price: 15, category: "Beverages", description: "Fresh lime water", sessions: ["afternoon", "night"] },

    // Desserts
    { id: 26, name: "Payasam", price: 25, category: "Desserts", description: "Traditional sweet pudding", sessions: ["afternoon", "night"] },
    { id: 27, name: "Halwa", price: 30, category: "Desserts", description: "Sweet semolina dessert", sessions: ["afternoon", "night"] },
    { id: 28, name: "Gulab Jamun", price: 20, category: "Desserts", description: "Sweet milk dumplings (2 pieces)", sessions: ["afternoon", "night"] }
];

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

let orders = JSON.parse(localStorage.getItem('madurai_mess_orders') || '[]');

// Utility Functions
function generateBillNumber() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.getTime().toString().slice(-4);
    return `MM${date}${time}`;
}

function formatCurrency(amount) {
    return `₹ ${amount.toFixed(0)}`;
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
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

    return num.toString(); // For very large numbers
}

// Date utility functions for reports
function getWeekRange(date) {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
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

function calculatePeriodStats(orders) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const cashPayments = orders.reduce((sum, order) => sum + (order.cashPayment || 0), 0);
    const onlinePayments = orders.reduce((sum, order) => sum + (order.onlinePayment || 0), 0);

    // Session breakdown
    const sessionStats = {
        morning: orders.filter(o => o.session === 'morning').length,
        afternoon: orders.filter(o => o.session === 'afternoon').length,
        night: orders.filter(o => o.session === 'night').length
    };

    // Order type breakdown
    const orderTypeStats = {
        dineIn: orders.filter(o => o.orderType === 'dine-in').length,
        parcel: orders.filter(o => o.orderType === 'parcel').length
    };

    // Top items
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

    searchInput.addEventListener('input', function() {
        const query = this.value.trim().toLowerCase();

        if (query.length === 0) {
            searchResults.classList.add('hidden');
            return;
        }

        // Filter items by current session and search query
        const filteredItems = menuItems.filter(item =>
            item.sessions.includes(currentOrder.session) &&
            (item.name.toLowerCase().includes(query) ||
             item.category.toLowerCase().includes(query) ||
             item.description.toLowerCase().includes(query))
        );

        if (filteredItems.length > 0) {
            searchResults.innerHTML = filteredItems.map(item => `
                <div class="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer" onclick="addItemToOrder(${item.id})">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-900">${item.name}</h4>
                            <p class="text-sm text-gray-600">${item.description}</p>
                            <div class="flex items-center space-x-2 mt-1">
                                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">${item.category}</span>
                                <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">${currentOrder.session}</span>
                            </div>
                        </div>
                        <div class="text-right ml-4">
                            <span class="text-lg font-bold text-orange-600">${formatCurrency(item.price)}</span>
                            <div class="text-xs text-gray-500 mt-1">Click to add</div>
                        </div>
                    </div>
                </div>
            `).join('');
            searchResults.classList.remove('hidden');
        } else {
            searchResults.innerHTML = `<div class="p-3 text-gray-500 text-center">No items found for ${currentOrder.session} session</div>`;
            searchResults.classList.remove('hidden');
        }
    });
}

// Function to show available items for current session
function showSessionItems() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');

    // Show all items available for current session
    const sessionItems = menuItems.filter(item => item.sessions.includes(currentOrder.session));

    if (sessionItems.length > 0) {
        searchResults.innerHTML = `
            <div class="mb-3 p-2 bg-orange-50 border border-orange-200 rounded">
                <h4 class="font-medium text-orange-800 capitalize">${currentOrder.session} Session Menu (${sessionItems.length} items)</h4>
            </div>
            ${sessionItems.map(item => `
                <div class="p-3 border border-gray-200 rounded-lg mb-2 hover:bg-gray-50 cursor-pointer" onclick="addItemToOrder(${item.id})">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="font-medium text-gray-900">${item.name}</h4>
                            <p class="text-sm text-gray-600">${item.description}</p>
                            <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">${item.category}</span>
                        </div>
                        <div class="text-right ml-4">
                            <span class="text-lg font-bold text-orange-600">${formatCurrency(item.price)}</span>
                            <div class="text-xs text-gray-500 mt-1">Click to add</div>
                        </div>
                    </div>
                </div>
            `).join('')}
        `;
        searchResults.classList.remove('hidden');
    }
}

// Order management
function addItemToOrder(itemId) {
    const item = menuItems.find(i => i.id === itemId);
    const existingItem = currentOrder.items.find(i => i.id === itemId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        currentOrder.items.push({ ...item, quantity: 1 });
    }
    
    updateOrderDisplay();
    
    // Clear search
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').classList.add('hidden');
}

function removeItemFromOrder(itemId) {
    currentOrder.items = currentOrder.items.filter(item => item.id !== itemId);
    updateOrderDisplay();
}

function updateItemQuantity(itemId, change) {
    const item = currentOrder.items.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeItemFromOrder(itemId);
        } else {
            updateOrderDisplay();
        }
    }
}

function updateOrderDisplay() {
    const orderItemsContainer = document.getElementById('orderItems');
    const totalItemsElement = document.getElementById('totalItems');
    const totalAmountElement = document.getElementById('totalAmount');
    const amountInWordsContainer = document.getElementById('amountInWordsContainer');
    const amountInWordsElement = document.getElementById('amountInWords');
    const proceedPaymentBtn = document.getElementById('proceedPaymentBtn');
    const clearOrderBtn = document.getElementById('clearOrderBtn');
    
    if (currentOrder.items.length === 0) {
        orderItemsContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i data-lucide="shopping-bag" class="h-12 w-12 mx-auto mb-3 text-gray-300"></i>
                <p>No items added yet</p>
                <p class="text-sm">Search and add items to start building the order</p>
            </div>
        `;
        totalItemsElement.textContent = '0';
        totalAmountElement.textContent = '₹ 0';
        amountInWordsContainer.classList.add('hidden');
        proceedPaymentBtn.disabled = true;
        proceedPaymentBtn.className = 'w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-gray-300 text-gray-500 cursor-not-allowed';
        clearOrderBtn.classList.add('hidden');
    } else {
        orderItemsContainer.innerHTML = currentOrder.items.map(item => `
            <div class="flex justify-between items-center py-3 border-b border-gray-200 last:border-b-0">
                <div class="flex-1">
                    <h4 class="font-medium text-gray-900">${item.name}</h4>
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
        
        const totalItems = currentOrder.items.reduce((sum, item) => sum + item.quantity, 0);
        const totalAmount = currentOrder.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        currentOrder.subtotal = totalAmount;
        currentOrder.total = totalAmount;
        
        totalItemsElement.textContent = totalItems;
        totalAmountElement.textContent = formatCurrency(totalAmount);
        
        if (totalAmount > 0) {
            amountInWordsElement.textContent = numberToWords(totalAmount) + ' Rupees Only';
            amountInWordsContainer.classList.remove('hidden');
        }
        
        proceedPaymentBtn.disabled = false;
        proceedPaymentBtn.className = 'w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 bg-orange-600 hover:bg-orange-700 text-white';
        clearOrderBtn.classList.remove('hidden');
    }
    
    // Re-initialize Lucide icons for dynamically added content
    lucide.createIcons();
}

function clearOrder() {
    currentOrder.items = [];
    updateOrderDisplay();
}

// Session and order type management
function initializeSessionButtons() {
    const sessionButtons = document.querySelectorAll('.session-btn');
    sessionButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            sessionButtons.forEach(b => {
                b.classList.remove('session-btn-active');
                b.classList.add('session-btn-inactive');
            });
            this.classList.remove('session-btn-inactive');
            this.classList.add('session-btn-active');
            currentOrder.session = this.dataset.session;

            // Clear search and show session items
            document.getElementById('searchInput').value = '';
            document.getElementById('searchResults').classList.add('hidden');

            // Show available items for selected session
            showSessionItems();

            // Update session info display
            updateSessionInfo();
        });
    });
}

function updateSessionInfo() {
    const sessionItems = menuItems.filter(item => item.sessions.includes(currentOrder.session));
    const sessionCount = sessionItems.length;

    // Update search placeholder
    const searchInput = document.getElementById('searchInput');
    searchInput.placeholder = `Search ${sessionCount} items available for ${currentOrder.session} session...`;
}

function initializeOrderTypeButtons() {
    const dineInBtn = document.getElementById('dineInBtn');
    const parcelBtn = document.getElementById('parcelBtn');
    
    dineInBtn.addEventListener('click', function() {
        dineInBtn.className = 'flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-orange-600 bg-orange-50 text-orange-700';
        parcelBtn.className = 'flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-gray-300 hover:border-gray-400';
        currentOrder.orderType = 'dine-in';
    });
    
    parcelBtn.addEventListener('click', function() {
        parcelBtn.className = 'flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-orange-600 bg-orange-50 text-orange-700';
        dineInBtn.className = 'flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-gray-300 hover:border-gray-400';
        currentOrder.orderType = 'parcel';
    });
}

// Navigation
function initializeNavigation() {
    const orderBtn = document.getElementById('orderBtn');
    const reportsBtn = document.getElementById('reportsBtn');
    const orderInterface = document.getElementById('orderInterface');
    const reportsInterface = document.getElementById('reportsInterface');
    
    orderBtn.addEventListener('click', function() {
        orderInterface.classList.remove('hidden');
        reportsInterface.classList.add('hidden');
        
        orderBtn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-orange-600 text-white';
        reportsBtn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
    });
    
    reportsBtn.addEventListener('click', function() {
        reportsInterface.classList.remove('hidden');
        orderInterface.classList.add('hidden');
        
        reportsBtn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-orange-600 text-white';
        orderBtn.className = 'flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors duration-200 bg-gray-200 text-gray-700 hover:bg-gray-300';
        
        loadReports();
    });
}

// Payment functionality
function initializePayment() {
    const proceedPaymentBtn = document.getElementById('proceedPaymentBtn');
    const paymentModal = document.getElementById('paymentModal');
    const closePaymentModal = document.getElementById('closePaymentModal');
    const clearOrderBtn = document.getElementById('clearOrderBtn');

    proceedPaymentBtn.addEventListener('click', function() {
        if (currentOrder.items.length === 0) return;

        // Update customer info
        currentOrder.customerName = document.getElementById('customerName').value;
        currentOrder.customerPhone = document.getElementById('customerPhone').value;
        currentOrder.billNo = generateBillNumber();
        currentOrder.timestamp = new Date().toISOString();

        showPaymentModal();
    });

    closePaymentModal.addEventListener('click', function() {
        paymentModal.classList.add('hidden');
    });

    clearOrderBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear the current order?')) {
            clearOrder();
        }
    });
}

function showPaymentModal() {
    const paymentModal = document.getElementById('paymentModal');
    const paymentContent = document.getElementById('paymentContent');

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

    cashOnlyBtn.addEventListener('click', function() {
        paymentMethod = 'cash';
        updatePaymentMethodButtons('cash');
        splitPaymentDetails.classList.add('hidden');
    });

    onlineOnlyBtn.addEventListener('click', function() {
        paymentMethod = 'online';
        updatePaymentMethodButtons('online');
        splitPaymentDetails.classList.add('hidden');
    });

    splitPaymentBtn.addEventListener('click', function() {
        paymentMethod = 'split';
        updatePaymentMethodButtons('split');
        splitPaymentDetails.classList.remove('hidden');
        initializeSplitPayment();
    });

    completePaymentBtn.addEventListener('click', function() {
        completePayment(paymentMethod);
    });
}

function updatePaymentMethodButtons(selectedMethod) {
    const buttons = ['cashOnlyBtn', 'onlineOnlyBtn', 'splitPaymentBtn'];
    buttons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        btn.classList.remove('border-green-600', 'bg-green-50', 'text-green-700');
        btn.classList.add('border-gray-300', 'text-gray-700');
    });

    const selectedBtn = document.getElementById(selectedMethod === 'cash' ? 'cashOnlyBtn' :
                                              selectedMethod === 'online' ? 'onlineOnlyBtn' : 'splitPaymentBtn');
    selectedBtn.classList.remove('border-gray-300', 'text-gray-700');
    selectedBtn.classList.add('border-green-600', 'bg-green-50', 'text-green-700');
}

function initializeSplitPayment() {
    const onlineAmountInput = document.getElementById('onlineAmount');
    const cashAmountInput = document.getElementById('cashAmount');
    const remainingAmountSpan = document.getElementById('remainingAmount');

    function updateRemaining() {
        const onlineAmount = parseFloat(onlineAmountInput.value) || 0;
        const cashAmount = parseFloat(cashAmountInput.value) || 0;
        const total = onlineAmount + cashAmount;
        const remaining = currentOrder.total - total;

        remainingAmountSpan.textContent = formatCurrency(remaining);
        remainingAmountSpan.className = remaining === 0 ? 'font-medium text-green-600' :
                                       remaining < 0 ? 'font-medium text-red-600' : 'font-medium';
    }

    onlineAmountInput.addEventListener('input', function() {
        const onlineAmount = parseFloat(this.value) || 0;
        cashAmountInput.value = Math.max(0, currentOrder.total - onlineAmount);
        updateRemaining();
    });

    cashAmountInput.addEventListener('input', function() {
        const cashAmount = parseFloat(this.value) || 0;
        onlineAmountInput.value = Math.max(0, currentOrder.total - cashAmount);
        updateRemaining();
    });
}

function completePayment(paymentMethod) {
    let onlinePayment = 0;
    let cashPayment = 0;

    if (paymentMethod === 'cash') {
        cashPayment = currentOrder.total;
    } else if (paymentMethod === 'online') {
        onlinePayment = currentOrder.total;
    } else if (paymentMethod === 'split') {
        onlinePayment = parseFloat(document.getElementById('onlineAmount').value) || 0;
        cashPayment = parseFloat(document.getElementById('cashAmount').value) || 0;

        if (onlinePayment + cashPayment !== currentOrder.total) {
            alert('Payment amounts do not match the total. Please check and try again.');
            return;
        }
    }

    // Complete the order
    const completedOrder = {
        ...currentOrder,
        onlinePayment,
        cashPayment,
        paymentMethod,
        completedAt: new Date().toISOString()
    };

    // Save to localStorage
    orders.unshift(completedOrder);
    localStorage.setItem('madurai_mess_orders', JSON.stringify(orders));

    // Show receipt
    showReceipt(completedOrder);

    // Reset current order
    resetOrder();

    // Close payment modal
    document.getElementById('paymentModal').classList.add('hidden');
}

// Receipt functionality
function showReceipt(order) {
    const receiptWindow = window.open('', '_blank', 'width=400,height=600');
    const receiptHTML = generateReceiptHTML(order);

    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();

    // Auto-print after a short delay
    setTimeout(() => {
        receiptWindow.print();
    }, 500);
}

function generateReceiptHTML(order) {
    const itemsHTML = order.items.map(item => `
        <tr>
            <td style="padding: 4px 0; border-bottom: 1px dotted #ccc;">${item.name}</td>
            <td style="padding: 4px 0; border-bottom: 1px dotted #ccc; text-align: center;">${item.quantity}</td>
            <td style="padding: 4px 0; border-bottom: 1px dotted #ccc; text-align: right;">${formatCurrency(item.price)}</td>
            <td style="padding: 4px 0; border-bottom: 1px dotted #ccc; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
        </tr>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Receipt - ${order.billNo}</title>
            <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 20px; }
                .receipt { max-width: 300px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 18px; font-weight: bold; }
                .header p { margin: 2px 0; font-size: 10px; }
                .divider { border-top: 1px dashed #000; margin: 10px 0; }
                .info-row { display: flex; justify-content: space-between; margin: 2px 0; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { padding: 4px 0; font-size: 11px; }
                th { border-bottom: 1px solid #000; font-weight: bold; }
                .total-row { border-top: 1px solid #000; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 10px; }
                @media print {
                    body { margin: 0; padding: 10px; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h1>MADURAI MESS</h1>
                    <p>MEALS and MEMORIES are made here</p>
                    <p>Contact: +91 98765 43210</p>
                </div>

                <div class="divider"></div>

                <div class="info-row">
                    <span>Bill No:</span>
                    <span>${order.billNo}</span>
                </div>
                <div class="info-row">
                    <span>Date:</span>
                    <span>${formatDate(order.timestamp)}</span>
                </div>
                <div class="info-row">
                    <span>Session:</span>
                    <span>${order.session.charAt(0).toUpperCase() + order.session.slice(1)}</span>
                </div>
                <div class="info-row">
                    <span>Order Type:</span>
                    <span>${order.orderType.replace('-', ' ').toUpperCase()}</span>
                </div>
                ${order.customerName ? `<div class="info-row"><span>Customer:</span><span>${order.customerName}</span></div>` : ''}
                ${order.customerPhone ? `<div class="info-row"><span>Phone:</span><span>${order.customerPhone}</span></div>` : ''}

                <div class="divider"></div>

                <table>
                    <thead>
                        <tr>
                            <th style="text-align: left;">Item</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Rate</th>
                            <th style="text-align: right;">Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${itemsHTML}
                        <tr class="total-row">
                            <td colspan="3" style="padding: 8px 0; text-align: right; font-weight: bold;">TOTAL:</td>
                            <td style="padding: 8px 0; text-align: right; font-weight: bold;">${formatCurrency(order.total)}</td>
                        </tr>
                    </tbody>
                </table>

                <div class="divider"></div>

                <div style="margin: 10px 0;">
                    <div style="font-weight: bold; margin-bottom: 5px;">Payment Details:</div>
                    ${order.cashPayment > 0 ? `<div class="info-row"><span>Cash:</span><span>${formatCurrency(order.cashPayment)}</span></div>` : ''}
                    ${order.onlinePayment > 0 ? `<div class="info-row"><span>Online:</span><span>${formatCurrency(order.onlinePayment)}</span></div>` : ''}
                </div>

                <div class="divider"></div>

                <div class="footer">
                    <p>Thank you for visiting Madurai Mess!</p>
                    <p>Visit us again for authentic South Indian cuisine</p>
                    <p style="margin-top: 10px;">*** HAVE A GREAT DAY ***</p>
                </div>
            </div>
        </body>
        </html>
    `;
}

// Enhanced Reports functionality with analytics
function loadReports() {
    const reportsInterface = document.getElementById('reportsInterface');

    // Get current date and calculate periods
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const thisWeek = getWeekRange(today);
    const thisMonth = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0');
    const thisYear = today.getFullYear().toString();

    // Calculate comprehensive statistics
    const todayOrders = orders.filter(order => order.timestamp && order.timestamp.startsWith(todayStr));
    const weekOrders = orders.filter(order => order.timestamp && isDateInRange(order.timestamp, thisWeek.start, thisWeek.end));
    const monthOrders = orders.filter(order => order.timestamp && order.timestamp.startsWith(thisMonth));
    const yearOrders = orders.filter(order => order.timestamp && order.timestamp.startsWith(thisYear));

    const stats = {
        today: calculatePeriodStats(todayOrders),
        week: calculatePeriodStats(weekOrders),
        month: calculatePeriodStats(monthOrders),
        year: calculatePeriodStats(yearOrders)
    };

    reportsInterface.innerHTML = `
        <div class="space-y-6">
            <!-- Period Selection -->
            <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
                <div class="flex flex-wrap gap-2 mb-4">
                    <button onclick="showPeriodStats('today')" id="todayBtn" class="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium">Today</button>
                    <button onclick="showPeriodStats('week')" id="weekBtn" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">This Week</button>
                    <button onclick="showPeriodStats('month')" id="monthBtn" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">This Month</button>
                    <button onclick="showPeriodStats('year')" id="yearBtn" class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300">This Year</button>
                </div>
                <div id="periodStatsContainer">
                    <!-- Period stats will be loaded here -->
                </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <!-- Recent Orders -->
            <div class="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold text-gray-900">Recent Orders</h3>
                    <button onclick="exportReports()" class="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
                        Export Data
                    </button>
                </div>

                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bill No</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Session</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${orders.slice(0, 20).map(order => `
                                <tr>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${order.billNo}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatDate(order.timestamp)}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.customerName || 'Walk-in'}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">${order.session}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${order.items.reduce((sum, item) => sum + item.quantity, 0)} items</td>
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
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                ${orders.length === 0 ? '<p class="text-center text-gray-500 py-8">No orders found</p>' : ''}
            </div>
        </div>
    `;

    // Store stats globally for chart functions
    window.reportStats = stats;

    // Initialize with today's stats
    showPeriodStats('today');

    // Re-initialize Lucide icons
    lucide.createIcons();
}

// Period statistics display
function showPeriodStats(period) {
    const stats = window.reportStats[period];
    const container = document.getElementById('periodStatsContainer');

    // Update button states
    ['today', 'week', 'month', 'year'].forEach(p => {
        const btn = document.getElementById(p + 'Btn');
        if (p === period) {
            btn.className = 'px-4 py-2 bg-orange-600 text-white rounded-lg font-medium';
        } else {
            btn.className = 'px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300';
        }
    });

    const periodName = period.charAt(0).toUpperCase() + period.slice(1);

    container.innerHTML = `
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div class="bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm">${periodName} Orders</p>
                        <p class="text-3xl font-bold">${stats.totalOrders}</p>
                    </div>
                    <i data-lucide="shopping-cart" class="h-8 w-8 text-blue-200"></i>
                </div>
            </div>

            <div class="bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm">${periodName} Revenue</p>
                        <p class="text-3xl font-bold">${formatCurrency(stats.totalRevenue)}</p>
                    </div>
                    <i data-lucide="indian-rupee" class="h-8 w-8 text-green-200"></i>
                </div>
            </div>

            <div class="bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-purple-100 text-sm">Average Order</p>
                        <p class="text-3xl font-bold">${formatCurrency(stats.averageOrderValue)}</p>
                    </div>
                    <i data-lucide="trending-up" class="h-8 w-8 text-purple-200"></i>
                </div>
            </div>

            <div class="bg-gradient-to-r from-orange-500 to-orange-600 p-6 rounded-lg text-white">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-orange-100 text-sm">Top Item</p>
                        <p class="text-lg font-bold">${stats.topItems[0]?.name || 'No data'}</p>
                        <p class="text-orange-200 text-sm">${stats.topItems[0]?.count || 0} sold</p>
                    </div>
                    <i data-lucide="star" class="h-8 w-8 text-orange-200"></i>
                </div>
            </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Session Breakdown</h4>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Morning:</span>
                        <span class="font-medium">${stats.sessionStats.morning} orders</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Afternoon:</span>
                        <span class="font-medium">${stats.sessionStats.afternoon} orders</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Night:</span>
                        <span class="font-medium">${stats.sessionStats.night} orders</span>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Order Types</h4>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Dine-In:</span>
                        <span class="font-medium">${stats.orderTypeStats.dineIn} orders</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Parcel:</span>
                        <span class="font-medium">${stats.orderTypeStats.parcel} orders</span>
                    </div>
                </div>
            </div>

            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-3">Payment Methods</h4>
                <div class="space-y-2">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Cash:</span>
                        <span class="font-medium">${formatCurrency(stats.cashPayments)}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Online:</span>
                        <span class="font-medium">${formatCurrency(stats.onlinePayments)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Update charts
    updateCharts(period);

    // Re-initialize Lucide icons
    lucide.createIcons();
}

// Chart management
let charts = {};

function updateCharts(period) {
    const stats = window.reportStats[period];

    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });

    // Revenue trend chart
    createRevenueChart(period);

    // Session distribution chart
    createSessionChart(stats);

    // Payment methods chart
    createPaymentChart(stats);

    // Top items chart
    createTopItemsChart(stats);
}

function createRevenueChart(period) {
    const ctx = document.getElementById('revenueChart').getContext('2d');

    // Generate sample data for the last 7 days/weeks/months based on period
    const labels = [];
    const data = [];

    if (period === 'today') {
        // Last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }));

            const dayOrders = orders.filter(order =>
                order.timestamp && order.timestamp.startsWith(date.toISOString().split('T')[0])
            );
            data.push(dayOrders.reduce((sum, order) => sum + order.total, 0));
        }
    } else if (period === 'week') {
        // Last 4 weeks
        for (let i = 3; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - (i * 7));
            labels.push(`Week ${date.getDate()}`);

            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const weekOrders = orders.filter(order => {
                if (!order.timestamp) return false;
                const orderDate = new Date(order.timestamp);
                return orderDate >= weekStart && orderDate <= weekEnd;
            });
            data.push(weekOrders.reduce((sum, order) => sum + order.total, 0));
        }
    } else {
        // Last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            labels.push(date.toLocaleDateString('en-IN', { month: 'short' }));

            const monthStr = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
            const monthOrders = orders.filter(order =>
                order.timestamp && order.timestamp.startsWith(monthStr)
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

function createSessionChart(stats) {
    const ctx = document.getElementById('sessionChart').getContext('2d');

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

function createPaymentChart(stats) {
    const ctx = document.getElementById('paymentChart').getContext('2d');

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

function createTopItemsChart(stats) {
    const ctx = document.getElementById('topItemsChart').getContext('2d');

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

function generateCSVReport() {
    const headers = ['Bill No', 'Date', 'Time', 'Customer Name', 'Phone', 'Session', 'Order Type', 'Items', 'Total Amount', 'Cash Payment', 'Online Payment', 'Payment Method'];

    const rows = orders.map(order => {
        const date = new Date(order.timestamp);
        const itemsList = order.items.map(item => `${item.name} (${item.quantity})`).join('; ');

        return [
            order.billNo,
            date.toLocaleDateString('en-IN'),
            date.toLocaleTimeString('en-IN'),
            order.customerName || '',
            order.customerPhone || '',
            order.session,
            order.orderType,
            itemsList,
            order.total,
            order.cashPayment || 0,
            order.onlinePayment || 0,
            order.paymentMethod || 'cash'
        ];
    });

    const csvContent = [headers, ...rows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

    return csvContent;
}

// Order reset functionality
function resetOrder() {
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

    // Clear form fields
    document.getElementById('billNo').value = '';
    document.getElementById('customerName').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('searchInput').value = '';
    document.getElementById('searchResults').classList.add('hidden');

    // Reset session buttons
    document.querySelectorAll('.session-btn').forEach(btn => {
        btn.classList.remove('session-btn-active');
        btn.classList.add('session-btn-inactive');
    });
    document.querySelector('[data-session="morning"]').classList.remove('session-btn-inactive');
    document.querySelector('[data-session="morning"]').classList.add('session-btn-active');

    // Reset order type buttons
    const dineInBtn = document.getElementById('dineInBtn');
    const parcelBtn = document.getElementById('parcelBtn');
    dineInBtn.className = 'flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-orange-600 bg-orange-50 text-orange-700';
    parcelBtn.className = 'flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 border-2 border-gray-300 hover:border-gray-400';

    updateOrderDisplay();
}

// Initialize application
function initializeApp() {
    // Set initial bill number
    document.getElementById('billNo').value = generateBillNumber();

    // Initialize all components
    initializeSearch();
    initializeSessionButtons();
    initializeOrderTypeButtons();
    initializeNavigation();
    initializePayment();

    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);

    // Initialize order display
    updateOrderDisplay();

    // Initialize session info
    updateSessionInfo();
    showSessionItems();

    console.log('Madurai Mess POS System initialized successfully!');
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});
