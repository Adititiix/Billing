# Madurai Mess POS System - API Reference

## 📚 JavaScript API Documentation

### 🏗️ Core Data Structures

#### Order Object
```javascript
const currentOrder = {
  billNo: String,           // Auto-generated bill number
  customerName: String,     // Optional customer name
  customerPhone: String,    // Optional phone number
  session: String,          // "morning" | "afternoon" | "night"
  orderType: String,        // "dine-in" | "parcel"
  items: Array,            // Array of order items
  subtotal: Number,        // Subtotal amount
  total: Number,           // Total amount
  onlinePayment: Number,   // Online payment amount
  cashPayment: Number,     // Cash payment amount
  timestamp: String        // ISO timestamp
};
```

#### Menu Item Object
```javascript
const menuItem = {
  id: Number,              // Unique identifier
  name: String,            // Item name
  price: Number,           // Price in rupees
  category: String,        // Item category
  description: String      // Item description
};
```

#### Order Item Object
```javascript
const orderItem = {
  id: Number,              // Menu item ID
  name: String,            // Item name
  price: Number,           // Unit price
  quantity: Number,        // Ordered quantity
  category: String,        // Item category
  description: String      // Item description
};
```

---

## 🔧 Utility Functions

### `generateBillNumber()`
**Purpose**: Generates unique bill numbers  
**Returns**: `String` - Format: `MM{YYYYMMDD}{TIME}`  
**Example**: `MM202412011234`

```javascript
function generateBillNumber() {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const time = now.getTime().toString().slice(-4);
  return `MM${date}${time}`;
}
```

### `formatCurrency(amount)`
**Purpose**: Formats numbers as Indian currency  
**Parameters**: `amount` (Number) - Amount to format  
**Returns**: `String` - Formatted currency string  
**Example**: `formatCurrency(150)` → `"₹ 150"`

```javascript
function formatCurrency(amount) {
  return `₹ ${amount.toFixed(0)}`;
}
```

### `formatDate(date)`
**Purpose**: Formats dates for display  
**Parameters**: `date` (String|Date) - Date to format  
**Returns**: `String` - Formatted date string  
**Example**: `"01 Dec 2024, 10:30 AM"`

```javascript
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
```

### `numberToWords(num)`
**Purpose**: Converts numbers to words  
**Parameters**: `num` (Number) - Number to convert  
**Returns**: `String` - Number in words  
**Example**: `numberToWords(150)` → `"One Hundred Fifty"`

---

## 🛒 Order Management Functions

### `addItemToOrder(itemId)`
**Purpose**: Adds item to current order  
**Parameters**: `itemId` (Number) - Menu item ID  
**Returns**: `void`  
**Side Effects**: Updates `currentOrder.items` and UI

```javascript
function addItemToOrder(itemId) {
  const item = menuItems.find(i => i.id === itemId);
  const existingItem = currentOrder.items.find(i => i.id === itemId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    currentOrder.items.push({ ...item, quantity: 1 });
  }
  
  updateOrderDisplay();
}
```

### `removeItemFromOrder(itemId)`
**Purpose**: Removes item from current order  
**Parameters**: `itemId` (Number) - Menu item ID  
**Returns**: `void`  
**Side Effects**: Updates `currentOrder.items` and UI

### `updateItemQuantity(itemId, change)`
**Purpose**: Updates item quantity in order  
**Parameters**: 
- `itemId` (Number) - Menu item ID
- `change` (Number) - Quantity change (+1 or -1)
**Returns**: `void`  
**Side Effects**: Updates quantity or removes item if quantity ≤ 0

### `updateOrderDisplay()`
**Purpose**: Refreshes order display UI  
**Returns**: `void`  
**Side Effects**: Updates DOM elements with current order state

### `clearOrder()`
**Purpose**: Clears current order  
**Returns**: `void`  
**Side Effects**: Resets `currentOrder.items` to empty array

---

## 🔍 Search Functions

### `initializeSearch()`
**Purpose**: Sets up search functionality  
**Returns**: `void`  
**Side Effects**: Adds event listeners to search input

### Search Event Handler
**Trigger**: Input event on search field  
**Functionality**: Real-time filtering of menu items  
**Display**: Shows filtered results in dropdown

```javascript
// Search implementation
searchInput.addEventListener('input', function() {
  const query = this.value.trim().toLowerCase();
  const filteredItems = menuItems.filter(item => 
    item.name.toLowerCase().includes(query) ||
    item.category.toLowerCase().includes(query) ||
    item.description.toLowerCase().includes(query)
  );
  // Display filtered results
});
```

---

## 💳 Payment Functions

### `showPaymentModal()`
**Purpose**: Displays payment modal with order summary  
**Returns**: `void`  
**Side Effects**: Shows modal, generates bill number, sets timestamp

### `initializePaymentMethods()`
**Purpose**: Sets up payment method selection  
**Returns**: `void`  
**Side Effects**: Adds event listeners for payment buttons

### `completePayment(paymentMethod)`
**Purpose**: Processes payment and completes order  
**Parameters**: `paymentMethod` (String) - "cash" | "online" | "split"  
**Returns**: `void`  
**Side Effects**: Saves order, shows receipt, resets current order

```javascript
function completePayment(paymentMethod) {
  let onlinePayment = 0;
  let cashPayment = 0;
  
  // Calculate payment amounts based on method
  if (paymentMethod === 'cash') {
    cashPayment = currentOrder.total;
  } else if (paymentMethod === 'online') {
    onlinePayment = currentOrder.total;
  } else if (paymentMethod === 'split') {
    onlinePayment = parseFloat(document.getElementById('onlineAmount').value) || 0;
    cashPayment = parseFloat(document.getElementById('cashAmount').value) || 0;
  }
  
  // Complete order processing
}
```

### `initializeSplitPayment()`
**Purpose**: Sets up split payment calculator  
**Returns**: `void`  
**Side Effects**: Adds event listeners for amount inputs

---

## 🧾 Receipt Functions

### `showReceipt(order)`
**Purpose**: Generates and displays receipt  
**Parameters**: `order` (Object) - Complete order object  
**Returns**: `void`  
**Side Effects**: Opens new window with receipt, triggers print

### `generateReceiptHTML(order)`
**Purpose**: Generates HTML for receipt  
**Parameters**: `order` (Object) - Complete order object  
**Returns**: `String` - Complete HTML document for receipt

```javascript
function generateReceiptHTML(order) {
  const itemsHTML = order.items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>${formatCurrency(item.price)}</td>
      <td>${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');
  
  return `<!DOCTYPE html>...`; // Complete HTML structure
}
```

---

## 📊 Reports Functions

### `loadReports()`
**Purpose**: Generates and displays reports interface  
**Returns**: `void`  
**Side Effects**: Updates reports UI with current data

### `exportReports()`
**Purpose**: Exports order data as CSV  
**Returns**: `void`  
**Side Effects**: Downloads CSV file with order data

### `generateCSVReport()`
**Purpose**: Generates CSV content from orders  
**Returns**: `String` - CSV formatted data

```javascript
function generateCSVReport() {
  const headers = ['Bill No', 'Date', 'Customer', 'Total', 'Payment Method'];
  const rows = orders.map(order => [
    order.billNo,
    formatDate(order.timestamp),
    order.customerName || 'Walk-in',
    order.total,
    order.paymentMethod
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(field => `"${field}"`).join(','))
    .join('\n');
}
```

---

## 🎛️ UI Control Functions

### `initializeSessionButtons()`
**Purpose**: Sets up session selection buttons  
**Returns**: `void`  
**Side Effects**: Adds click handlers for session buttons

### `initializeOrderTypeButtons()`
**Purpose**: Sets up order type selection  
**Returns**: `void`  
**Side Effects**: Adds click handlers for dine-in/parcel buttons

### `initializeNavigation()`
**Purpose**: Sets up navigation between views  
**Returns**: `void`  
**Side Effects**: Adds click handlers for navigation buttons

### `updateDateTime()`
**Purpose**: Updates date/time display  
**Returns**: `void`  
**Side Effects**: Updates DOM elements with current date/time

---

## 🔄 State Management

### Global Variables
```javascript
let currentOrder = { /* Order object */ };
let orders = []; // Array of completed orders
```

### Local Storage Functions
```javascript
// Save orders to localStorage
localStorage.setItem('madurai_mess_orders', JSON.stringify(orders));

// Load orders from localStorage
orders = JSON.parse(localStorage.getItem('madurai_mess_orders') || '[]');
```

### `resetOrder()`
**Purpose**: Resets current order to initial state  
**Returns**: `void`  
**Side Effects**: Clears form fields, resets UI state

---

## 🚀 Initialization

### `initializeApp()`
**Purpose**: Main application initialization  
**Returns**: `void`  
**Side Effects**: Sets up all components and event listeners

```javascript
function initializeApp() {
  // Set initial bill number
  document.getElementById('billNo').value = generateBillNumber();
  
  // Initialize all components
  initializeSearch();
  initializeSessionButtons();
  initializeOrderTypeButtons();
  initializeNavigation();
  initializePayment();
  
  // Start real-time updates
  updateDateTime();
  setInterval(updateDateTime, 1000);
  
  // Initialize display
  updateOrderDisplay();
}
```

### Application Startup
```javascript
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});
```

---

## 🎯 Event Handlers Summary

| Event | Element | Function | Purpose |
|-------|---------|----------|---------|
| `input` | Search field | Search handler | Real-time menu filtering |
| `click` | Add to cart | `addItemToOrder()` | Add item to order |
| `click` | Quantity +/- | `updateItemQuantity()` | Modify quantities |
| `click` | Remove item | `removeItemFromOrder()` | Remove from order |
| `click` | Session buttons | Session handler | Select meal session |
| `click` | Order type | Order type handler | Select dine-in/parcel |
| `click` | Payment button | `showPaymentModal()` | Start payment process |
| `click` | Complete payment | `completePayment()` | Finish transaction |
| `click` | Navigation | Navigation handler | Switch between views |
| `click` | Export | `exportReports()` | Download CSV data |

---

**API Version**: 1.0.0  
**Last Updated**: December 2024  
**Compatibility**: ES6+ browsers
