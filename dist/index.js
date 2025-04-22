#!/usr/bin/env node
import { Command } from 'commander';
import * as zmq from 'zeromq';
const program = new Command();
program
    .name('zmq-cli')
    .description('CLI voor ZeroMQ-berichten')
    .version('0.1.0');
program
    .command('send <msg>')
    .description('Stuur een ZeroMQ-request en toon de reply')
    .option('-a, --address <addr>', 'ZeroMQ adres', 'tcp://localhost:5566')
    .action(async (msg, opts) => {
    const sock = new zmq.Request();
    await sock.connect(opts.address);
    console.log(`Verbonden met ${opts.address}`);
    await sock.send(msg);
    for await (const [reply] of sock) {
        console.log('Ontvangen reply:', reply.toString());
        break;
    }
    await sock.close();
});
program.parse(process.argv);
