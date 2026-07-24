# 📏 SSI Measure - Smart Inspection System

**SSI Measure** is a desktop-wrapped web application designed for smart quality control, weight measurement, and dimension inspection. It seamlessly connects with hardware devices (such as ESP32 and serial sensors) to capture real-time measurements, perform pass/fail (OK/NG) evaluations, and log session data into a database.

---

## ✨ Features

- 🖥️ **Native Desktop Experience**: Runs as an Electron desktop app with zero complex terminal configuration required for operators.
- 🔌 **Hardware Connection & Simulation**: Supports serial communication with hardware (ESP32 / load cells / sensors) via COM ports, as well as a built-in **MOCK (Simulation)** mode for testing.
- 🎯 **High Precision**: Live measurements displayed up to 3 decimal places for maximum accuracy.
- 📊 **Real-time Pass/Fail Logic**: Automated OK/NG determination based on defined tolerance criteria.
- 💾 **Embedded Local Database**: 100% standalone setup with a built-in SQLite database. No external database servers required!
- 📖 **User-Friendly Documentation**: Includes step-by-step guides tailored for non-technical operators.

---

## 🏗️ Tech Stack

- **Frontend**: React (Vite), TailwindCSS / Custom Styling, Lucide Icons, Socket.io-client
- **Backend**: Node.js, Express.js, Socket.io, `serialport`
- **Desktop Application**: Electron.js, Electron Builder
- **Database**: SQLite3 (Embedded Local File)

---

## 📁 Project Structure

```
SSI Measure/
├── backend/                  # Express.js backend server & SerialPort interface
│   └── server.js             # Main server logic, SQLite initialization & Socket.io handler
├── frontend/                 # React Vite frontend application
│   ├── src/                  # Components, pages, assets
│   └── index.html            # Main HTML entry point
├── firmware/                 # Microcontroller (ESP32/Arduino) code snippets
├── main.js                   # Electron main process entry point
├── Panduan_Pengoperasian_SSI_Measure.md  # Detailed Indonesian User Guide
└── package.json              # Root dependencies & Electron Builder config
```

---

## 🚀 Quick Start (For Operators)

### Launching the Application
1. Download or locate the **`SSI Measure Setup.exe`** (typically located in the `dist/` directory).
2. Double-click the installer. It will automatically install and open the application.
3. Everything is bundled inside the app! No Node.js or XAMPP installations are needed.

> 📄 For complete step-by-step instructions in Bahasa Indonesia, please refer to [Panduan Pengoperasian SSI Measure](Panduan_Pengoperasian_SSI_Measure.md).

---

## 🛠️ Development Setup

If you want to run or modify the source code:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/LeeQ23/SSI-Measure.git
   cd SSI-Measure
   ```

2. **Install dependencies**:
   ```bash
   # Install root dependencies (Electron, etc.)
   npm install

   # Install backend dependencies
   cd backend && npm install && cd ..

   # Install frontend dependencies
   cd frontend && npm install && cd ..
   ```

3. **Build Frontend**:
   ```bash
   npm run build:frontend
   ```

4. **Run Desktop App**:
   ```bash
   npm start
   ```

---

## 📄 License

Internal / Educational & Internship Project for SSI Smart Manufacturing.
