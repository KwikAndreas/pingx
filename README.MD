#PingX - Enhanced Ping Command with Colors 🌈

PingX is an enhancement to the traditional ping command, featuring attractive and informative color styling.

## ✨ Features

- **Responsive Color Styling**: Response time is displayed in different colors based on speed

- 🟢 **Green**: < 50ms (Very Fast)
- 🟡 **Yellow**: 50-100ms (Normal)
- 🟠 **Orange**: 100-200ms (Somewhat Slow)
- 🔴 **Red**: > 200ms (Slow)

- **ASCII Banner**: Attractive display when the application starts
- **Timestamp**: Each response is accompanied by a timestamp
- **Detailed Statistics**: Displays complete statistics after the ping is complete
- **Cross-Platform**: Works on Windows, Linux, and macOS

## 🚀 Installation

### Global Installation

``` bash
npm install -g .
```

### Local Installation for Development

``` bash
npm install
```

## 📋 Dependencies

This package requires:

- `chalk`: To set terminal colors
- `commander`: To parse command-line arguments

## 💻 Usage

### Basic Usage

``` bash
#Ping once
pingx google.com

# Ping a specific number of times
pingx 8.8.8.8 -c 4

# Ping with a custom interval (in ms)
pingx 1.1.1.1 -c 5 -i 2000

# Ping with a custom timeout (in seconds)
pingx example.com -c 3 -t 10

# Combination of all options
pingx 8.8.8.8 -c 5 -i 1500 -t 5

# Ping with speed test
pingx google.com -c 3 -S

# Ping with all options including speed test
pingx 8.8.8.8 -c 3 -t 2 -s
```

### Command Options

- `-c, --count <number>`: Number of packets to send
- `-i, --interval <ms>`: Interval between packets (minimum 100ms)
- `-t, --timeout <seconds>`: Timeout for each ping in seconds (default: 4)
- `-s, --speed`: Run a simple download and upload speed measurement after displaying ping statistics
- `--help`: Display help
- `--version`: Display version

### Sample Output

On success:

```
[14:30:15] ● Reply from 8.8.8.8: bytes=32 time=45ms TTL=114
```

On Time Timeout:

```
[14:30:16] ● Request timed out.
```

With speed test (-s):

```
─ ... Mbps
─ ...
```

## 🎨 Color Code

Response time is displayed in different colors:

- **< 50ms**: 🟢 Green (Excellent)
- **50-100ms**: 🟡 Yellow (Good)
- **100-200ms**: 🟠 Orange (Fair)
- **> 200ms**: 🔴 Red (Poor)

## 📊 Statistics

After the ping is complete, PingX will display:

- Number of packets sent and received
- Percentage packet loss
- Minimum, maximum, and average response times

### 🚀 Speed ​​Test (-s Option)

When using the `-s` option, PingX will perform a simple internet speed measurement after displaying the ping statistics:

- **Download Speed**: Downloads a 1MB test file from httpbin.org
- **Upload Speed**: Uploads 512KB of test data to httpbin.org
- **Results in Mbps**: Displayed in an easy-to-read format

**Note**: The speed test uses an HTTP endpoint to avoid SSL certificate issues and provide more consistent results.

## 🛠 Development

### Testing

``` bash
npm test
```

### Manual Testing

``` bash
node pingx.js google.com -c 3
```

## 📝 Platform Support

- ✅ Windows (using `ping -n`)
- ✅ Linux (using `ping -c`)
- ✅ macOS (using `ping -c`)

## 🤝 Contributing

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing-feature'`)
4. Push to branch (`git push origin-feature/amazing-feature`)
5. Create a Pull Request

## 📄 License

MIT License - see the LICENSE file for full details.

## 🔗 Reference

Taking reference to the traditional ping command, which displays output like:

```
Reply from 8.8.8.8: bytes=32 time=882ms TTL=114
```

or

```
Request timed out.
```

PingX is an enhancement of the ping command that now includes color styling and additional features for a better experience.