// Note: This example assumes a Node.js environment with fetch available (Node v18+ or via an appropriate polyfill).   
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
// If running in an older Node.js version, install a fetch polyfill (e.g. node-fetch).   
var API_KEY = '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';
// Modify or add your system prompt if needed.   
var systemPrompt = "You are a helpful assistant.";
// Define the query you want to ask, appending it to the system prompt.   
var question = "which is bigger, 9.9 or 9.11?";
function chatCompletionWithReasoning() {
    return __awaiter(this, void 0, void 0, function () {
        var url, payload, response, reader, decoder, buffer, reasoningStarted, contentStarted, _a, done, value, newlineIndex, line, data, parsed, delta;
        var _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    url = 'https://openrouter.ai/api/v1/chat/completions';
                    payload = {
                        model: 'deepseek/deepseek-r1:free',
                        messages: [
                            {
                                role: 'user',
                                content: systemPrompt + question,
                            },
                        ],
                        // Pass reasoning parameters so the API returns reasoning along with content.   
                        reasoning: {
                            max_tokens: 900,
                            exclude: false,
                        },
                        max_tokens: 1024,
                        temperature: 0.6,
                        seed: 95,
                        stream: true,
                    };
                    return [4 /*yield*/, fetch(url, {
                            method: 'POST',
                            headers: {
                                'Authorization': "Bearer ".concat(API_KEY),
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(payload),
                        })];
                case 1:
                    response = _d.sent();
                    if (!response.body) {
                        throw new Error('Response body is empty');
                    }
                    reader = response.body.getReader();
                    decoder = new TextDecoder();
                    buffer = '';
                    reasoningStarted = false;
                    contentStarted = false;
                    _d.label = 2;
                case 2:
                    _d.trys.push([2, , 6, 8]);
                    _d.label = 3;
                case 3:
                    if (!true) return [3 /*break*/, 5];
                    return [4 /*yield*/, reader.read()];
                case 4:
                    _a = _d.sent(), done = _a.done, value = _a.value;
                    if (done)
                        return [3 /*break*/, 5];
                    // Decode the chunk and add it to our buffer   
                    buffer += decoder.decode(value, { stream: true });
                    newlineIndex = void 0;
                    while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
                        line = buffer.slice(0, newlineIndex).trim();
                        buffer = buffer.slice(newlineIndex + 1);
                        // Only process lines that start with the expected "data: " prefix   
                        if (line.startsWith("data: ")) {
                            data = line.slice(6).trim();
                            if (data === "[DONE]") {
                                return [2 /*return*/];
                            }
                            try {
                                parsed = JSON.parse(data);
                                delta = (_c = (_b = parsed.choices) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.delta;
                                if (delta) {
                                    // Stream the reasoning text if present.   
                                    if (delta.reasoning) {
                                        if (!reasoningStarted) {
                                            process.stdout.write("REASONING: ");
                                            reasoningStarted = true;
                                        }
                                        process.stdout.write(delta.reasoning);
                                    }
                                    // Stream the final content answer if present.   
                                    if (delta.content) {
                                        if (!contentStarted) {
                                            process.stdout.write("\nCONTENT: ");
                                            contentStarted = true;
                                        }
                                        process.stdout.write(delta.content);
                                    }
                                }
                            }
                            catch (e) {
                                // Ignore incomplete JSON fragments or parsing errors.   
                                continue;
                            }
                        }
                    }
                    return [3 /*break*/, 3];
                case 5: return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, reader.cancel()];
                case 7:
                    _d.sent();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    });
}
chatCompletionWithReasoning().catch(function (error) {
    console.error('Error during chat streaming:', error);
});
