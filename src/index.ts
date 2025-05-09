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

async function main(): Promise<void> {
  const program = new Command();
  program
    .name("zmq-tester")
    .description("Tester voor ZeroMQ berichten")
    .version("0.1.0");

  program
    .command("test")
    .option("-c, --controller <addr>", "Controller address", "tcp://localhost:5555")
    .option("-s, --simulator <addr>", "Simulator address", "tcp://localhost:5556")
    .action(async (opts: { controller: string; simulator: string }) => {
      const loader = new LaneLoader(path.resolve(__dirname, "../lanes.json"));
      const expectedLanes = loader.getExpectedLanes();

      const registry = new CheckerRegistry();
      registry.register("stoplichten", new StoplichtenChecker(expectedLanes));
      registry.register("sensoren_rijbaan", new SensorenRijbaanChecker(expectedLanes));
      registry.register("tijd", new TijdChecker());
      registry.register("sensoren_speciaal", new SensorSpeciaalChecker());
      registry.register("sensoren_bruggen", new SensorBrugChecker());
      registry.register("voorrangsvoertuig", new VoorrangsVoertuigChecker());

      const sock = new Subscriber();
      sock.connect(opts.controller);
      sock.connect(opts.simulator);
      console.log(`Verbonden met controller op ${opts.controller}`);
      console.log(`Verbonden met simulator op ${opts.simulator}`);

      registry.topics().forEach((topic: string) => sock.subscribe(topic));
      console.log("Abonneert op topics:", registry.topics().join(", "));

      let lastTimeReal = 0;
      let hasReceivedTime = false;

      // Interval checker om waarschuwing te geven
      setInterval(() => {
        if (!hasReceivedTime) return;
        const delta = Date.now() - lastTimeReal;
        if (delta > 1000) {
          console.warn(`[simulator][tijd] Waarschuwing: geen tijdbericht ontvangen in ${delta}ms`);
        }
      }, 500);

      for await (const [topicBuf, msgBuf] of sock) {
        const topic = topicBuf.toString();
        const payload = msgBuf.toString();
        let parsed: any;

        try {
          parsed = JSON.parse(payload);
        } catch (err: any) {
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

        const { success, errors } = checker.check(parsed);
        const source = topic === "stoplichten" ? "controller" : "simulator";

        if (success) {
          console.log(`[${source}][${topic}] Alles correct`);
        } else {
          console.error(`[${source}][${topic}] Fouten:`);
          errors.forEach((e: string) => console.error(" -", e));
        }
      }
    });

  await program.parseAsync(process.argv);
}

main().catch((err: any) => console.error(err));
