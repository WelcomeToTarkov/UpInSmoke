"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomVoiceService = void 0;
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
class CustomVoiceService {
    Instance;
    configs;
    preAkiLoad(Instance) {
        this.Instance = Instance;
        this.configs = this.loadCombinedConfig();
    }
    postDBLoad() {
        if (this.Instance.debug) {
            console.log("Starting CustomVoiceService postDBLoad");
        }
        for (const voiceId in this.configs) {
            if (this.Instance.debug) {
                console.log("Processing voice:", voiceId);
            }
            const voiceConfig = this.configs[voiceId];
            this.processVoiceConfig(this.Instance.database, voiceConfig, voiceId);
        }
        if (this.Instance.debug) {
            console.log("Finished postDBLoad");
        }
    }
    loadCombinedConfig() {
        if (this.Instance.debug) {
            console.log("Loading combined voice config");
        }
        const configFiles = fs.readdirSync(path_1.default.join(__dirname, "../db/voices"))
            .filter(file => file.endsWith(".json"));
        const combinedConfig = {};
        configFiles.forEach(file => {
            const configPath = path_1.default.join(__dirname, "../db/voices", file);
            const configFileContents = fs.readFileSync(configPath, "utf-8");
            const config = JSON.parse(configFileContents);
            Object.assign(combinedConfig, config);
        });
        if (this.Instance.debug) {
            console.log("Combined voiceconfig:", combinedConfig);
        }
        return combinedConfig;
    }
    /**
     * Processes the voice configuration by handling the locale,
     * creating and adding the voice to the player, and adding the
     * voice to the bots.
     *
     * @param {any} database - The database object.
     * @param {any} voiceConfig - The voice configuration object.
     * @return {void}
     */
    processVoiceConfig(database, voiceConfig, voiceId) {
        if (this.Instance.debug) {
            console.log("Processing voice config:", voiceConfig);
        }
        let addVoiceToPlayer = false;
        const { sideSpecificVoice, locale } = voiceConfig;
        if (voiceConfig.addVoiceToPlayer) {
            addVoiceToPlayer = true;
        }
        if (this.Instance.debug) {
            console.log("loading voice", voiceId);
            console.log("locale", locale);
        }
        // create voice and add to player optionally
        this.createAndAddVoice(database, voiceId, addVoiceToPlayer, sideSpecificVoice);
        // Handle locale
        this.handleLocale(database, locale);
    }
    handleLocale(database, locale) {
        if (this.Instance.debug) {
            console.log("Handling locale:", locale);
        }
        for (const localeID in database.locales.global) {
            if (this.Instance.debug) {
                console.log("Processing localeID:", localeID);
            }
            try {
                if (locale[localeID]) {
                    for (const itemId in locale[localeID]) {
                        const itemName = `${itemId} Name`;
                        if (database.locales.global[localeID]) {
                            database.locales.global[localeID][itemName] = locale[localeID][itemId];
                        }
                    }
                }
                else {
                    for (const itemId in locale.en) {
                        const itemName = `${itemId} Name`;
                        if (database.locales.global[localeID]) {
                            database.locales.global[localeID][itemName] = locale.en[itemId];
                        }
                    }
                }
            }
            catch (error) {
                console.error(`Error handling locale for ${localeID}: ${error}`);
            }
        }
    }
    createAndAddVoice(database, voiceId, addVoiceToPlayer, sideSpecificVoice) {
        if (this.Instance.debug) {
            console.log("Creating and adding voice:", voiceId);
        }
        const newVoice = {
            "_id": voiceId,
            "_name": voiceId,
            "_parent": "5fc100cf95572123ae738483",
            "_type": "Item",
            "_props": {
                "Name": voiceId,
                "ShortName": voiceId,
                "Description": voiceId,
                "Side": sideSpecificVoice ?? ["Usec", "Bear"],
                "Prefab": voiceId
            }
        };
        database.templates.customization[voiceId] = newVoice;
        if (addVoiceToPlayer) {
            database.templates.character.push(voiceId);
        }
    }
    processBotVoices(database, addVoiceToBots) {
        for (const botConfig in addVoiceToBots) {
            const botDb = database.bots.types[botConfig];
            if (botDb) {
                const { addFollowingVoices, replaceDefaultOnes } = addVoiceToBots[botConfig];
                if (addFollowingVoices.length !== 0) {
                    if (replaceDefaultOnes) {
                        botDb.appearance.voice = [];
                    }
                    // Map each voice to an object with the voice and its weight
                    const weightedVoices = addFollowingVoices.map((voice) => ({ voice, weight: 1 }));
                    // Push the weighted voices into botDb.appearance.voice
                    botDb.appearance.voice.push(...weightedVoices);
                }
            }
        }
    }
}
exports.CustomVoiceService = CustomVoiceService;
//# sourceMappingURL=CustomVoiceService.js.map