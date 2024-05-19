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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomHeadService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class CustomHeadService {
    Instance;
    preAkiLoad(Instance) {
        this.Instance = Instance;
    }
    postDBLoad() {
        const headsJsonPath = path.join(__dirname, "../db/heads");
        const jsonFiles = fs.readdirSync(headsJsonPath).filter(file => file.endsWith(".json"));
        jsonFiles.forEach(jsonFile => {
            const filePath = path.join(headsJsonPath, jsonFile);
            try {
                const headConfigs = this.readJsonFile(filePath);
                if (Array.isArray(headConfigs)) {
                    // Process array of head configurations
                    this.processHeadConfigs(headConfigs, this.Instance.database);
                }
                else if (typeof headConfigs === "object") {
                    // Process single head configuration object
                    this.processHeadConfigs([headConfigs], this.Instance.database);
                }
                else {
                    console.error(`Error processing ${jsonFile}: Invalid format.`);
                }
            }
            catch (error) {
                console.error(`Error processing ${jsonFile}:`, error);
            }
        });
    }
    readJsonFile(filePath) {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        return JSON.parse(fileContent);
    }
    processHeadConfigs(headConfigs, tables) {
        if (Array.isArray(headConfigs)) {
            headConfigs.forEach(headConfig => {
                const headSpecificConfig = this.generateHeadSpecificConfig(headConfig);
                const { _id: headId } = headSpecificConfig.head;
                this.addHeadToTemplates(headId, tables.templates, headSpecificConfig);
                this.addHeadLocale(headSpecificConfig.headlocale, tables.locales.global);
            });
        }
        else if (typeof headConfigs === "object") {
            const headSpecificConfig = this.generateHeadSpecificConfig(headConfigs);
            const { _id: headId } = headSpecificConfig.head;
            this.addHeadToTemplates(headId, tables.templates, headSpecificConfig);
            this.addHeadLocale(headSpecificConfig.headlocale, tables.locales.global);
        }
        else {
            console.error("Error processing head configurations: Invalid format.");
        }
    }
    generateHeadSpecificConfig(commonConfig) {
        const path = commonConfig.Path ? commonConfig.Path : `heads/${commonConfig.ID}.bundle`;
        return {
            config: {
                addheadtoplayer: commonConfig.AddtoPlayer
            },
            head: {
                _id: commonConfig.ID,
                _name: commonConfig.ID,
                _parent: "5cc085e214c02e000c6bea67",
                _type: "Item",
                _props: {
                    Name: commonConfig.Name,
                    ShortName: commonConfig.Shortname,
                    Description: commonConfig.Description,
                    Side: commonConfig.Side,
                    BodyPart: "Head",
                    Prefab: {
                        path: path,
                        rcid: ""
                    },
                    WatchPrefab: {
                        path: "",
                        rcid: ""
                    },
                    IntegratedArmorVest: false,
                    WatchPosition: { x: 0, y: 0, z: 0 },
                    WatchRotation: { x: 0, y: 0, z: 0 }
                }
            },
            headlocale: {
                id: commonConfig.ID,
                Name: commonConfig.Name,
                ShortName: commonConfig.Shortname,
                Description: commonConfig.Description
            }
        };
    }
    addHeadToTemplates(headId, templates, headSpecificConfig) {
        templates.customization[headId] = headSpecificConfig.head;
        if (headSpecificConfig.config.addheadtoplayer) {
            templates.character.push(headId);
        }
    }
    addHeadLocale(headlocale, globalLocales) {
        if (!headlocale)
            return;
        const { id: localeId, ...localeData } = headlocale;
        for (const locale of Object.values(globalLocales)) {
            for (const key in localeData) {
                locale[`${localeId} ${key}`] = localeData[key];
            }
        }
    }
}
exports.CustomHeadService = CustomHeadService;
//# sourceMappingURL=CustomHeadService.js.map