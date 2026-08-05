#!/usr/bin/env node

"use strict";

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

const configPath = path.join(rootDir, 'config', 'config.js');
const configExamplePath = path.join(rootDir, 'config', 'config-example.js');
const servedConfigPath = path.join(rootDir, 'play.pokemonshowdown.com', 'config', 'config.js');
const servedTestclientKeyPath = path.join(rootDir, 'play.pokemonshowdown.com', 'config', 'testclient-key.js');

if (!fs.existsSync(configPath)) {
	fs.copyFileSync(configExamplePath, configPath);
}

let configText = fs.readFileSync(configPath, 'utf8');

const serverConfig = {
	id: process.env.SERVER_ID || 'showdown',
	host: process.env.SERVER_HOST || 'sim3.psim.us',
	port: Number(process.env.SERVER_PORT || 443),
	httpport: Number(process.env.SERVER_HTTPPORT || 8000),
	altport: Number(process.env.SERVER_ALTPORT || 80),
	registered: String(process.env.SERVER_REGISTERED || 'true').toLowerCase() === 'true',
};

const defaultServerRegex = /Config\.defaultserver\s*=\s*\{[\s\S]*?\};/;
const defaultServerBlock = `Config.defaultserver = {\n\tid: '${serverConfig.id}',\n\thost: '${serverConfig.host}',\n\tport: ${serverConfig.port},\n\thttpport: ${serverConfig.httpport},\n\taltport: ${serverConfig.altport},\n\tregistered: ${serverConfig.registered}\n};`;

if (defaultServerRegex.test(configText)) {
	configText = configText.replace(defaultServerRegex, defaultServerBlock);
} else {
	configText += `\n\n${defaultServerBlock}\n`;
}

fs.writeFileSync(configPath, configText);

if (fs.existsSync(servedConfigPath)) {
	const servedConfigStat = fs.lstatSync(servedConfigPath);
	if (servedConfigStat.isSymbolicLink()) {
		fs.unlinkSync(servedConfigPath);
	}
}
fs.writeFileSync(servedConfigPath, configText);

const testclientKey = process.env.TESTCLIENT_KEY;
if (testclientKey) {
	const escaped = testclientKey.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
	fs.writeFileSync(servedTestclientKeyPath, `const POKEMON_SHOWDOWN_TESTCLIENT_KEY = '${escaped}';\n`);
}
