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
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
async function main() {
    const program = new Command();
    program
        .name("zmq-tester")
        .description("Tester voor ZeroMQ berichten")
        .version("0.1.0");
    program
        .command("test")
        .option("--controller <ip>", "IP-adres van controller (poort 5555)", "127.0.0.1")
        .option("--simulator <ip>", "IP-adres van simulator (poort 5556)", "127.0.0.1")
        .action(async (opts) => {
        // Voeg tcp:// en poort toe
        const controllerAddress = `tcp://${opts.controller}:5555`;
        const simulatorAddress = `tcp://${opts.simulator}:5556`;
        const loader = new LaneLoader(path.resolve(__dirname, "../lanes.json"));
        const expectedLanes = loader.getExpectedLanes();
        const lastMessages = new Map();
        const registry = new CheckerRegistry();
        registry.register("stoplichten", new StoplichtenChecker(expectedLanes));
        registry.register("sensoren_rijbaan", new SensorenRijbaanChecker(expectedLanes));
        registry.register("tijd", new TijdChecker());
        registry.register("sensoren_speciaal", new SensorSpeciaalChecker());
        registry.register("sensoren_bruggen", new SensorBrugChecker());
        registry.register("voorrangsvoertuig", new VoorrangsVoertuigChecker());
        const sock = new Subscriber();
        sock.connect(controllerAddress);
        sock.connect(simulatorAddress);
        console.log(`Verbonden met controller op ${controllerAddress}`);
        console.log(`Verbonden met simulator op ${simulatorAddress}`);
        registry.topics().forEach((topic) => sock.subscribe(topic));
        console.log("Abonneert op topics:", registry.topics().join(", "));
        let lastTimeReal = 0;
        let hasReceivedTime = false;
        setInterval(() => {
            if (!hasReceivedTime)
                return;
            const delta = Date.now() - lastTimeReal;
            if (delta > 1000) {
                console.warn(`[simulator][tijd] Waarschuwing: geen tijdbericht ontvangen in ${delta}ms`);
            }
        }, 500);
        for await (const [topicBuf, msgBuf] of sock) {
            const topic = topicBuf.toString();
            const payload = msgBuf.toString();
            let parsed;
            try {
                parsed = JSON.parse(payload);
            }
            catch (err) {
                console.error(`[${topic}] Ongeldige JSON: ${err.message}`);
                continue;
            }
            if (topic === "tijd") {
                hasReceivedTime = true;
                lastTimeReal = Date.now();
            }
            const checker = registry.get(topic);
            if (!checker) {
                console.warn(`[onbekend] Bericht ontvangen op niet-bestaand topic "${topic}"`);
                continue;
            }
            const msgString = JSON.stringify(parsed);
            const previousMsg = lastMessages.get(topic);
            if (previousMsg === msgString) {
                console.warn(`[${topic}] Waarschuwing: bericht is identiek aan het vorige bericht op hetzelfde topic.`);
            }
            else {
                lastMessages.set(topic, msgString);
            }
            const { success, errors } = checker.check(parsed);
            const source = topic === "stoplichten" ? "controller" : "simulator";
            if (success) {
                console.log(`[${source}][${topic}] Alles correct`);
            }
            else {
                console.error(`[${source}][${topic}] Fouten:`);
                errors.forEach((e) => console.error(" -", e));
            }
        }
    });
    await program.parseAsync(process.argv);
}
main().catch((err) => console.error(err));
