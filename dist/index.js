#!/usr/bin/env ts-node
import { Command } from "commander";
import { Subscriber } from "zeromq";
import * as path from "path";
import { fileURLToPath } from "url";
import { LaneLoader } from "./LaneLoader.js";
import { CheckerRegistry } from "./CheckerRegistry.js";
import { StoplichtenChecker } from "./checkers/StoplichtenChecker.js";
import { SensorenRijbaanChecker } from "./checkers/SensorenRijbaanChecker.js";
import { TijdChecker } from "./checkers/TijdChecker.js";
import { SensorSpeciaalChecker } from "./checkers/SensorSpeciaalChecker.js";
import { SensorBrugChecker } from "./checkers/SensorBrugChecker.js";
import { VoorrangsVoertuigChecker } from "./checkers/VoorrangsVoertuigChecker.js";
// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Main async function
async function main() {
    const program = new Command();
    // Define CLI program metadata
    program
        .name("zmq-tester")
        .description("Tester voor ZeroMQ berichten")
        .version("0.1.0");
    // Define the 'test' command and its options
    program
        .command("test")
        .option("--controller <ip>", "IP-adres van controller (poort 5555)", "127.0.0.1")
        .option("--simulator <ip>", "IP-adres van simulator (poort 5556)", "127.0.0.1")
        .action(async (opts) => {
        // Construct full ZeroMQ addresses
        const controllerAddress = `tcp://${opts.controller}:5555`;
        const simulatorAddress = `tcp://${opts.simulator}:5556`;
        // Load expected lane configuration from JSON
        const loader = new LaneLoader(path.resolve(__dirname, "../lanes.json"));
        const expectedLanes = loader.getExpectedLanes();
        // Track last received messages by topic to detect duplicates
        const lastMessages = new Map();
        // Register topic-specific checkers
        const registry = new CheckerRegistry();
        registry.register("stoplichten", new StoplichtenChecker(expectedLanes));
        registry.register("sensoren_rijbaan", new SensorenRijbaanChecker(expectedLanes));
        registry.register("tijd", new TijdChecker());
        registry.register("sensoren_speciaal", new SensorSpeciaalChecker());
        registry.register("sensoren_bruggen", new SensorBrugChecker());
        registry.register("voorrangsvoertuig", new VoorrangsVoertuigChecker());
        // Create and connect subscriber socket
        const sock = new Subscriber();
        sock.connect(controllerAddress);
        sock.connect(simulatorAddress);
        console.log(`Verbonden met controller op ${controllerAddress}`);
        console.log(`Verbonden met simulator op ${simulatorAddress}`);
        // Subscribe to all registered topics
        registry.topics().forEach((topic) => sock.subscribe(topic));
        console.log("Abonneert op topics:", registry.topics().join(", "));
        let lastTimeReal = 0;
        let hasReceivedTime = false;
        // Periodic check to ensure time messages are received regularly
        setInterval(() => {
            if (!hasReceivedTime)
                return;
            const delta = Date.now() - lastTimeReal;
            if (delta > 1000) {
                console.warn(`[simulator][tijd] Waarschuwing: geen tijdbericht ontvangen in ${delta}ms`);
            }
        }, 500);
        // Listen for incoming messages from subscribed topics
        for await (const [topicBuf, msgBuf] of sock) {
            const topic = topicBuf.toString();
            const payload = msgBuf.toString();
            let parsed;
            // Try to parse the JSON message
            try {
                parsed = JSON.parse(payload);
            }
            catch (err) {
                console.error(`[${topic}] Ongeldige JSON: ${err.message}`);
                continue;
            }
            // Update time tracking when a time message is received
            if (topic === "tijd") {
                hasReceivedTime = true;
                lastTimeReal = Date.now();
            }
            // Retrieve checker for the given topic
            const checker = registry.get(topic);
            if (!checker) {
                console.warn(`[onbekend] Bericht ontvangen op niet-bestaand topic "${topic}"`);
                continue;
            }
            // Validate message using the appropriate checker
            const { success, errors } = checker.check(parsed);
            const source = topic === "stoplichten" ? "controller" : "simulator";
            // Print result of validation
            if (success) {
                console.log(`[${source}][${topic}] Alles correct`);
            }
            else {
                console.error(`[${source}][${topic}] Fouten:`);
                errors.forEach((e) => console.error(" -", e));
            }
        }
    });
    // Run the CLI program
    await program.parseAsync(process.argv);
}
// Start the main function and catch top-level errors
main().catch((err) => console.error(err));
