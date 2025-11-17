#!/usr/bin/env node

const { spawn } = require("child_process");
const chalk = require("chalk");
const { Command } = require("commander");

async function speedTest() {
  const https = require("https");
  const { URL } = require("url");

  const downloadUrl = "http://httpbin.org/bytes/1048576"; 
  const downloadSizeBytesEstimate = 1 * 1024 * 1024;

  const doDownload = () =>
    new Promise((resolve, reject) => {
      const start = Date.now();
      let downloaded = 0;
      const urlObj = new URL(downloadUrl);
      const client =
        urlObj.protocol === "https:" ? require("https") : require("http");
      const req = client.get(urlObj, (res) => {
        res.on("data", (chunk) => { 
          downloaded += chunk.length;
        });
        res.on("end", () => {
          const duration = (Date.now() - start) / 1000;
          const bytes = downloaded || downloadSizeBytesEstimate;
          const mbps = (bytes * 8) / (duration * 1_000_000);
          resolve({ mbps, bytes, duration });
        });
        res.on("error", reject);
      });
      req.on("error", reject);
      // safety timeout
      req.setTimeout(15000, () => {
        req.abort();
        reject(new Error("Download timed out"));
      });
    });

  const doUpload = () =>
    new Promise((resolve, reject) => {
      const uploadSize = 512 * 1024; // 512KB
      const postData = Buffer.alloc(uploadSize, "a");
      const url = new URL("http://httpbin.org/post");
      const client =
        url.protocol === "https:" ? require("https") : require("http");
      const options = {
        method: "POST",
        hostname: url.hostname,
        path: url.pathname,
        protocol: url.protocol,
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Length": postData.length,
        },
      };

      const start = Date.now();
      const req = client.request(options, (res) => {
        res.on("data", () => {});
        res.on("end", () => {
          const duration = (Date.now() - start) / 1000;
          const mbps = (postData.length * 8) / (duration * 1_000_000);
          resolve({ mbps, bytes: postData.length, duration });
        });
      });
      req.on("error", reject);
      req.setTimeout(15000, () => {
        req.abort();
        reject(new Error("Upload timed out"));
      });
      req.write(postData);
      req.end();
    });

  const dl = await doDownload();
  const ul = await doUpload();

  return {
    download: Number.isFinite(dl.mbps) && dl.mbps > 0 ? dl.mbps : 0,
    upload: Number.isFinite(ul.mbps) && ul.mbps > 0 ? ul.mbps : 0,
  };
}
const os = require("os");

const program = new Command();

const banner = `
${chalk.cyan("┌─────────────────────────────────────────┐")}
${chalk.cyan("│")}           ${chalk.bold.magenta(
  "PingX v1.0.1"
)}             ${chalk.cyan("│")}
${chalk.cyan("│")}     ${chalk.gray(
  "Improved ping with colors"
)}      ${chalk.cyan("│")}
${chalk.cyan("└─────────────────────────────────────────┘")}
`;

function getTimeColor(timeMs) {
  if (timeMs < 50) return chalk.green;
  if (timeMs < 100) return chalk.yellow;
  if (timeMs < 200) return chalk.hex("#FFA500");
  return chalk.red; 
}

function getPingCommand(timeout) {
  const platform = os.platform();
  if (platform === "win32") {
    const args = ["-n", "1"];
    if (timeout) {
      args.push("-w", (timeout * 1000).toString()); 
    }
    return { cmd: "ping", args };
  } else {
    const args = ["-c", "1"];
    if (timeout) {
      args.push("-W", timeout.toString());
    }
    return { cmd: "ping", args };
  }
}

function parsePingOutput(output, target) {
  const lines = output.split("\n");

  for (let line of lines) {
    const windowsMatch = line.match(
      /Reply from ([\d.]+): bytes=(\d+) time=(\d+)ms TTL=(\d+)/i
    );
    if (windowsMatch) {
      return {
        success: true,
        ip: windowsMatch[1],
        bytes: parseInt(windowsMatch[2]),
        time: parseInt(windowsMatch[3]),
        ttl: parseInt(windowsMatch[4]),
      };
    }

    const unixMatch = line.match(
      /(\d+) bytes from ([\d.]+): icmp_seq=(\d+) ttl=(\d+) time=([\d.]+) ms/i
    );
    if (unixMatch) {
      return {
        success: true,
        ip: unixMatch[2],
        bytes: parseInt(unixMatch[1]),
        time: Math.round(parseFloat(unixMatch[5])),
        ttl: parseInt(unixMatch[4]),
        seq: parseInt(unixMatch[3]),
      };
    }

    if (
      line.includes("Request timed out") ||
      line.includes("Request timeout") ||
      line.includes("no answer")
    ) {
      return {
        success: false,
        timeout: true,
      };
    }

    if (
      line.includes("Destination host unreachable") ||
      line.includes("Host unreachable")
    ) {
      return {
        success: false,
        unreachable: true,
      };
    }
  }

  return {
    success: false,
    unknown: true,
    rawOutput: output,
  };
}

function displayResult(result, target, packetNum) {
  const timestamp = new Date().toLocaleTimeString();
  const prefix = chalk.gray(`[${timestamp}]`);

  if (result.success) {
    const timeColor = getTimeColor(result.time);
    const timeStr = timeColor(`${result.time}ms`);

    let statusIndicator;
    if (result.time < 50) {
      statusIndicator = chalk.green("●");
    } else if (result.time < 100) {
      statusIndicator = chalk.yellow("●");
    } else if (result.time < 200) {
      statusIndicator = chalk.hex("#FFA500")("●");
    } else {
      statusIndicator = chalk.red("●");
    }

    console.log(
      `${prefix} ${statusIndicator} ${chalk.bold("Reply from")} ${chalk.cyan(
        result.ip
      )}: ` +
        `${chalk.gray("bytes=")}${chalk.white(result.bytes)} ` +
        `${chalk.gray("time=")}${timeStr} ` +
        `${chalk.gray("TTL=")}${chalk.white(result.ttl)}`
    );
  } else if (result.timeout) {
    console.log(
      `${prefix} ${chalk.red("●")} ${chalk.red.bold("Request timed out.")}`
    );
  } else if (result.unreachable) {
    console.log(
      `${prefix} ${chalk.red("●")} ${chalk.red.bold(
        "Destination host unreachable."
      )}`
    );
  } else {
    console.log(
      `${prefix} ${chalk.red("●")} ${chalk.red.bold("Ping failed.")}`
    );
  }
}

async function pingHost(
  target,
  count = null,
  interval = 1000,
  timeout = null,
  doSpeed = false
) {
  console.log(banner);
  console.log(
    `${chalk.bold("Pinging")} ${chalk.cyan(target)} ${
      count ? `(${count} packets)` : "(continuous)"
    }${timeout ? ` with ${timeout}s timeout` : ""}...\n`
  );

  let packetsSent = 0;
  let packetsReceived = 0;
  let totalTime = 0;
  let minTime = Infinity;
  let maxTime = 0;

  const stats = {
    sent: 0,
    received: 0,
    lost: 0,
    times: [],
  };

  const performPing = () => {
    return new Promise((resolve) => {
      const { cmd, args } = getPingCommand(timeout);
      const pingProcess = spawn(cmd, [...args, target]);

      let output = "";
      let errorOutput = "";

      pingProcess.stdout.on("data", (data) => {
        output += data.toString();
      });

      pingProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pingProcess.on("close", (code) => {
        stats.sent++;
        const result = parsePingOutput(output, target);

        if (result.success) {
          stats.received++;
          stats.times.push(result.time);
          totalTime += result.time;
          minTime = Math.min(minTime, result.time);
          maxTime = Math.max(maxTime, result.time);
        }

        displayResult(result, target, stats.sent);
        resolve(result);
      });

      pingProcess.on("error", (err) => {
        console.log(`${chalk.red("Error:")} ${err.message}`);
        resolve({ success: false, error: err.message });
      });
    });
  };

  if (count) {
    for (let i = 0; i < count; i++) {
      await performPing();
      if (i < count - 1) {
        await new Promise((resolve) => setTimeout(resolve, interval));
      }
    }
  } else {
    console.log(chalk.gray("Press Ctrl+C to stop...\n"));

    const runContinuous = async () => {
      await performPing();
      setTimeout(runContinuous, interval);
    };

    process.on("SIGINT", () => {
      showStatistics(stats, target);
      process.exit(0);
    });

    runContinuous();
    return;
  }

  showStatistics(stats, target);

  if (doSpeed) {
    try {
      const speeds = await speedTest();
      console.log("\n" + chalk.cyan("─".repeat(50)));
      console.log(chalk.bold.white("Speed Test Results:"));
      console.log(
        chalk.gray(
          `  Download: ${chalk.green(speeds.download.toFixed(2))} Mbps`
        )
      );
      console.log(
        chalk.gray(`  Upload:   ${chalk.green(speeds.upload.toFixed(2))} Mbps`)
      );
      console.log(chalk.cyan("─".repeat(50)));
    } catch (err) {
      console.log(chalk.red("Speed test failed:"), err.message || err);
    }
  }
}

function showStatistics(stats, target) {
  const lossPercentage =
    stats.sent > 0
      ? (((stats.sent - stats.received) / stats.sent) * 100).toFixed(1)
      : 0;

  console.log("\n" + chalk.cyan("─".repeat(50)));
  console.log(
    chalk.bold.white("Ping Statistics for ") + chalk.cyan(target) + ":"
  );
  console.log(
    chalk.gray(
      `  Packets: Sent = ${stats.sent}, Received = ${stats.received}, Lost = ${
        stats.sent - stats.received
      } (${lossPercentage}% loss)`
    )
  );

  if (stats.times.length > 0) {
    const avgTime = (
      stats.times.reduce((a, b) => a + b, 0) / stats.times.length
    ).toFixed(1);
    const minTime = Math.min(...stats.times);
    const maxTime = Math.max(...stats.times);

    console.log(chalk.gray("Approximate round trip times in milli-seconds:"));
    console.log(
      chalk.gray(
        `  Minimum = ${getTimeColor(minTime)(
          minTime + "ms"
        )}, Maximum = ${getTimeColor(maxTime)(
          maxTime + "ms"
        )}, Average = ${getTimeColor(parseFloat(avgTime))(avgTime + "ms")}`
      )
    );
  }
  console.log(chalk.cyan("─".repeat(50)));
}

program
  .name("pingx")
  .description("An improved ping command with colorful styling")
  .version("1.0.0")
  .argument("<target>", "IP address or hostname to ping")
  .option("-c, --count <number>", "number of packets to send")
  .option(
    "-i, --interval <ms>",
    "interval between packets in milliseconds",
    "1000"
  )
  .option(
    "-t, --timeout [seconds]",
    "timeout for each ping in seconds (default: 4)",
    "4"
  )
  .option(
    "-s, --speed",
    "measure download and upload speed after ping statistics"
  )
  .action((target, options) => {
    const count = options.count ? parseInt(options.count) : null;
    const interval = parseInt(options.interval);
    let timeout;
    if (options.timeout === true) {
      timeout = 4;
    } else if (options.timeout) {
      timeout = parseInt(options.timeout);
    } else {
      timeout = 4;
    }

    if (options.count && (count <= 0 || isNaN(count))) {
      console.error(chalk.red("Error: Count must be a positive number"));
      process.exit(1);
    }

    if (isNaN(interval) || interval < 100) {
      console.error(chalk.red("Error: Interval must be at least 100ms"));
      process.exit(1);
    }

    if (isNaN(timeout) || timeout <= 0) {
      console.error(chalk.red("Error: Timeout must be a positive number"));
      process.exit(1);
    }

    pingHost(target, count, interval, timeout, options.speed);
  });

if (process.argv.length <= 2) {
  console.log(banner);
  program.help();
}

program.parse();
