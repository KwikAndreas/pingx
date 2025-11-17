# PingX - Enhanced Cross-Platform Ping CLI 🔵⚡

PingX is a modern, colorful, and feature-rich alternative to the traditional **ping** command.  
It provides improved readability, detailed statistics, speed test capability, and a polished CLI experience across **Windows, Linux, and macOS**.

---

## ✨ Features

### 🎨 Color-Enhanced Output  
Ping responses are displayed with dynamic colors based on latency:

| Latency         | Color  | Meaning        |
|-----------------|--------|----------------|
| **< 50ms**      | 🟢 Green  | Excellent       |
| **50–100ms**    | 🟡 Yellow | Good            |
| **100–200ms**   | 🟠 Orange | Fair            |
| **> 200ms**     | 🔴 Red    | Poor            |

### 🏷 Rich CLI Output  
- Beautiful ASCII banner  
- Timestamp for each response  
- Error detection (timeout, unreachable, etc.)

### 📊 Detailed Statistics  
At the end of execution, PingX shows:
- Packets sent/received/lost  
- Packet loss percentage  
- Minimum, maximum, and average latency  

### 🌐 Internet Speed Test (Optional `-s`)  
PingX can run a lightweight download/upload speed test after pinging:
- Downloads a 1MB test file  
- Uploads 512KB of data  
- Displays Mbps results

### 🖥 Cross-Platform  
Works with native `ping` on:
- Windows (`ping -n`)
- Linux (`ping -c`)
- macOS (`ping -c`)

---

## 🚀 Installation

### Global Installation (Recommended for CLI usage)
```sh
npm install -g @xavorus/pingx
```

### Local Installation (Development)
```sh
npm install
```

---

## 💻 Usage Examples

### Basic Ping
```sh
pingx google.com
```

### Ping a specific number of packets
```sh
pingx 8.8.8.8 -c 4
```

### Custom interval (milliseconds)
```sh
pingx 1.1.1.1 -c 5 -i 2000
```

### Custom timeout (seconds)
```sh
pingx example.com -c 3 -t 10
```

### Run with speed test
```sh
pingx google.com -c 3 -s
```

---

## ⚙️ Command Options

| Option | Description |
|--------|-------------|
| `-c, --count <num>` | Number of packets to send |
| `-i, --interval <ms>` | Delay between packets (min 100ms) |
| `-t, --timeout <sec>` | Timeout per packet (default: 4s) |
| `-s, --speed` | Run speed test after pinging |
| `--help` | Show help |
| `--version` | Show version |

---

## 📦 Sample Output

### Success
```
[14:30:15] ● Reply from 8.8.8.8: bytes=32 time=45ms TTL=114
```

### Timeout
```
[14:30:16] ● Request timed out.
```

### With Speed Test
```
Download: 28.52 Mbps
Upload:   10.31 Mbps
```

---

## 🛠 Development

### Run tests
```sh
npm test
```

### Manual test
```sh
node pingx.js google.com -c 3
```

### Install globally from source
```sh
npm run install-global
```

---

## 🤝 Contributing

1. Fork this repository  
2. Create a feature branch  
3. Commit your changes  
4. Push your branch  
5. Open a Pull Request  

---

## 📄 License
MIT License. See the LICENSE file for details.

---

## 💡 Inspiration
PingX is inspired by the traditional system ping tool—but enhanced with color, statistics, and optional speed test to improve readability and give a better CLI experience.
