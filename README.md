# Family Investment Tracker

A modern, responsive web application for tracking family investments with multi-user support, real-time portfolio statistics, and secure local data persistence.

## 🚀 Features

### 🔐 Authentication & Security
- **Multi-user Support**: Pre-configured accounts for Self, Spouse, and Children.
- **Secure Login**: Password hashing for security.
- **Session Management**: Persistent login sessions.
- **Profile Management**: Update names, emails, avatars, and change passwords.

### 📊 Dashboard
- **Real-time Overview**: Total portfolio value, total invested, and overall gain/loss.
- **Family Overview**: Individual cards for each family member showing their specific portfolio performance.
- **Visual Indicators**: Color-coded gain/loss metrics (Green for profit, Red for loss).

### 💰 Investment Management
- **Comprehensive Tracking**: Track various asset classes including:
  - Equity & Stocks (including US Stocks)
  - Mutual Funds
  - Fixed Deposits (FD) & Recurring Deposits (RD)
  - Bonds & Government Schemes (PPF, NPS)
  - Real Estate & Gold
- **CRUD Operations**: Add, Edit, and Delete investments easily.
- **Detailed Stats**: Automatic calculation of current value, absolute return, and percentage return.

### ⚙️ Technical Highlights
- **Zero Backend**: Runs entirely in the browser using `localStorage` for data persistence.
- **Responsive Design**: Fully responsive UI that works on Desktop, Tablet, and Mobile.
- **Modern UI**: Glassmorphism design aesthetic with smooth animations and dark mode theme.
- **Data Portability**: Export and Import data functionality for backup.

## 🛠️ Installation & Usage

1. **Clone the repository**
   ```bash
   git clone https://github.com/svivekkumaran/Gravity-12.git
   cd Gravity-12
   ```

2. **Run the application**
   You can use any static file server. For example, using `npx`:
   ```bash
   npx -y serve .
   ```

3. **Open in Browser**
   Navigate to `http://localhost:3000`

## 🔑 Default Credentials

All accounts are pre-configured with the same default password:

**Password:** `password123`

| Username | Role |
|----------|------|
| `self` | Primary User |
| `spouse` | Spouse |
| `daughter1` | Child 1 |
| `daughter2` | Child 2 |
| `son` | Child 3 (Example) |

*Note: You can add more family members via the Profile page.*

## 📱 Screenshots

The application features a clean, dark-themed interface with:
- **Login Page**: Secure entry point.
- **Dashboard**: High-level summary of family wealth.
- **Member Details**: Granular view of individual investments.
- **Profile Settings**: Personalize accounts and manage security.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
