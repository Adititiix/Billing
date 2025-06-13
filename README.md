# Madurai Mess - Point of Sale (POS) & Reporting System

A comprehensive web-based Point of Sale system designed specifically for Madurai Mess, featuring modern UI, split payment processing, and detailed reporting capabilities.

## 🌟 Features

### Order & Billing Interface
- **Auto-generated Bill Numbers**: Unique bill numbers with date and time stamps
- **Customer Information**: Optional customer name and phone number capture
- **Session-based Ordering**: Morning, Afternoon, and Night meal sessions with session-specific menus
- **Order Types**: Dine-In and Parcel options
- **Session-Aware Menu Search**: Real-time search showing only items available for selected session
- **Cart Management**: Add, remove, and modify quantities with real-time total calculations
- **Amount in Words**: Automatic conversion of total amount to words
- **Smart Menu Display**: Automatic filtering of 28 menu items based on session availability

### Payment Processing
- **Multiple Payment Methods**:
  - Cash Only
  - Online Only (UPI/Card)
  - Split Payment (Cash + Online)
- **Split Payment Calculator**: Automatic calculation of remaining amounts
- **Payment Validation**: Ensures payment amounts match order total

### Receipt Generation
- **Professional Receipts**: Clean, printable receipt format
- **Auto-print Functionality**: Automatic printing after payment completion
- **Detailed Information**: Includes all order details, payment breakdown, and restaurant info

### Reports & Analytics
- **Advanced Dashboard**: Daily, Weekly, Monthly, and Yearly analytics with interactive charts
- **Visual Analytics**: Revenue trends, session distribution, payment methods, and top-selling items
- **Comprehensive Statistics**: Orders count, revenue, average order value, and session breakdowns
- **Interactive Charts**: Line charts, pie charts, doughnut charts, and bar charts using Chart.js
- **Period Comparison**: Switchable views between different time periods
- **Recent Orders Table**: Comprehensive view of all orders with session and payment filtering
- **Export Functionality**: Enhanced CSV export with session and analytics data
- **Real-time Updates**: Live updates of sales data and chart refreshing

## 🍽️ Session-Based Menu Items

The system includes 28 authentic South Indian menu items with session-specific availability:

### Morning Session (12 items available)
- **Breakfast**: Idli, Dosa, Vada, Upma, Pongal, Poori, Rava Dosa
- **Beverages**: Filter Coffee, Tea

### Afternoon Session (18 items available)
- **Lunch**: Sambar Rice, Curd Rice, Rasam Rice, Vegetable Rice, Lemon Rice, Meals, Biryani
- **Breakfast**: Idli, Dosa, Vada, Poori, Rava Dosa
- **Dinner**: Chicken Curry, Mutton Curry, Fish Curry
- **Beverages**: Filter Coffee, Tea, Buttermilk, Fresh Lime
- **Desserts**: Payasam, Halwa, Gulab Jamun

### Night Session (16 items available)
- **Dinner**: Chapati, Parotta, Chicken Curry, Mutton Curry, Fish Curry, Vegetable Curry, Dal Fry
- **Lunch**: Sambar Rice, Curd Rice, Rasam Rice, Vegetable Rice, Lemon Rice, Biryani
- **Beverages**: Filter Coffee, Tea, Buttermilk, Fresh Lime
- **Desserts**: Payasam, Halwa, Gulab Jamun

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server setup required - runs entirely in the browser

### Installation
1. Download the project files:
   - `index-simple.html`
   - `pos-system.js`

2. Open `index-simple.html` in your web browser

3. The system is ready to use!

## 💻 Usage

### Taking an Order
1. **Customer Info**: Enter customer name and phone (optional)
2. **Select Session**: Choose Morning, Afternoon, or Night
3. **Order Type**: Select Dine-In or Parcel
4. **Add Items**: Use the search bar to find and add menu items
5. **Review Order**: Check quantities and total in the order summary
6. **Process Payment**: Click "Proceed to Payment" and select payment method
7. **Complete**: Receipt will be generated and printed automatically

### Viewing Reports
1. Click "Reports & Receipts" in the navigation
2. View dashboard statistics and recent orders
3. Export data using the "Export Data" button
4. Click "View Receipt" for any order to reprint

### Data Storage
- All data is stored locally in the browser's localStorage
- Data persists between sessions
- Export functionality available for backup

## 🎨 Design Features

### User Interface
- **Clean, Modern Design**: Professional appearance suitable for restaurant use
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Easy-to-use interface for staff
- **Real-time Updates**: Live calculations and status updates

### Color Scheme
- **Primary**: Orange (#e45c00) - representing warmth and appetite
- **Secondary**: Gray tones for professional appearance
- **Accent Colors**: Green for success states, Red for warnings

### Typography
- **Headers**: Poppins font for modern, friendly appearance
- **Body**: Inter font for excellent readability
- **Receipt**: Courier New for traditional receipt appearance

## 📊 Technical Details

### Technologies Used
- **HTML5**: Semantic markup and modern web standards
- **CSS3**: Tailwind CSS for rapid, responsive styling
- **JavaScript**: Vanilla ES6+ for all functionality
- **Lucide Icons**: Beautiful, consistent iconography
- **Local Storage**: Browser-based data persistence

### Browser Compatibility
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

### Performance
- **Lightweight**: No external dependencies except CDN resources
- **Fast Loading**: Optimized for quick startup
- **Responsive**: Smooth interactions and real-time updates

## 🔧 Customization

### Adding Menu Items
Edit the `menuItems` array in `pos-system.js`:
```javascript
{ id: 21, name: "New Item", price: 50, category: "Category", description: "Description" }
```

### Modifying Styling
The system uses Tailwind CSS classes. Modify the HTML classes or add custom CSS for styling changes.

### Extending Functionality
The modular JavaScript structure allows easy addition of new features:
- Add new payment methods
- Implement customer loyalty programs
- Add inventory management
- Integrate with external APIs

## 📱 Mobile Support

The system is fully responsive and works well on:
- Smartphones (iOS/Android)
- Tablets (iPad, Android tablets)
- Desktop computers
- Point-of-sale terminals

## 🔒 Data Security

- All data stored locally in browser
- No external data transmission
- Export functionality for backup
- No sensitive payment data stored

## 🆘 Support

For technical support or feature requests:
1. Check the browser console for any error messages
2. Ensure JavaScript is enabled in the browser
3. Try refreshing the page if issues occur
4. Clear browser cache if problems persist

## 📈 Future Enhancements

Potential improvements for future versions:
- Cloud data synchronization
- Multi-location support
- Inventory management
- Staff management
- Advanced analytics
- Integration with payment gateways
- Customer loyalty programs

---

**Madurai Mess POS System** - Making restaurant management simple and efficient! 🍛
