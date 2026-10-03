import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ──────────────────────────────────────────────────────────────
// Salem-17-Survival — Magistrate Hawthorne AI Engine — Multi-Object Edition
// Powered by Google Gemini 3.5 Flash (gemini-1.5-flash)
// Hizaki Labs • 1693 Salem Village
// Supports 8 relics: drone, flashlight, smartphone, bottle, laptop, speaker, watch, powerbank
// ──────────────────────────────────────────────────────────────

// Server-side banned lexicon — MUST match client BANNED_WORDS in page.tsx
const BANNED_WORDS = [
  "battery",
  "batteries",
  "electricity",
  "electric",
  "computer",
  "plastic",
  "software",
  "internet",
  "drone",
  "wifi",
  "bluetooth",
  "sensor",
  "algorithm",
  "data",
  "digital",
  "electronic",
  "electronics",
  "circuit",
  "voltage",
  "programming",
  "program",
  "code",
  "silicon",
  "metal alloy",
  "lithium",
  "motor",
  "propeller",
  "camera",
  "phone",
  "smartphone",
  "nuclear",
  "quantum",
  "laser",
  "robot",
  "ai",
  "artificial intelligence",
] as const;

function findBannedWord(text: string): string | null {
  const lower = text.toLowerCase();
  for (const w of BANNED_WORDS) {
    const escaped = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const pattern = new RegExp(`\\b${escaped}\\b`, "i");
    if (pattern.test(lower)) return w;
  }
  return null;
}

// Object registry for prompt tailoring
const OBJECT_META: Record<
  string,
  { name: string; desc: string; magistrateSees: string; hint: string }
> = {
  drone: {
    name: "The Hovering Relic",
    desc: "A black, humming kite of polished wood & glass that floats without string. Four wind-wheels spin unseen.",
    magistrateSees:
      "a humming, hovering contrivance that hangeth in the air without rope, buzzing like Beelzebub's hive",
    hint: "mirrored kite of oiled linen and polished glass lifted by heated air and hair-thin thread",
  },
  flashlight: {
    name: "The Cold Lantern",
    desc: "A cold lantern that throweth a sun-beam without flame, oil, nor candle — bright as noon at midnight.",
    magistrateSees: "a cold lantern that burneth without flame or oil, casting a stark white sun-beam in the night",
    hint: "reflector lantern of polished tin and clear river-glass, multiplying a single candle's light",
  },
  smartphone: {
    name: "The Talking Mirror",
    desc: "A polished black mirror that trappeth voices, faces, and moving paintings — speaking without soul nearby.",
    magistrateSees:
      "a black mirror of obsidian that speaketh with trapped voices and showeth moving likenesses, as if souls were bound in glass",
    hint: "silvered mirror holding a painted miniature and a speaking-trumpet within, as a locket holdeth kin",
  },
  bottle: {
    name: "The Ever-Clear Vessel",
    desc: "A clear vessel light as air, holding water without clay, glass, nor leather — cold as river ice, unbreakable.",
    magistrateSees: "a translucent vessel light as a feather, holding water yet not of clay nor blown glass, that doth not shatter",
    hint: "vessel of hardened isinglass and tree-sap, as horn is wrought clear and light, to bear water",
  },
  laptop: {
    name: "The Whispering Tome",
    desc: "A flat tome that openeth like a clamshell, glowing with letters that write themselves without quill.",
    magistrateSees: "a flat clamshell tome that gloweth within, where letters appear and vanish without ink or hand",
    hint: "reckoning board and writing-slate of slate and chalk with abacus beads, as merchants use",
  },
  speaker: {
    name: "The Sounding Shell",
    desc: "A small drum that singeth full choirs and drums with no player — music from an empty box, loud as a hall.",
    magistrateSees: "a small lacquered box that singeth and thundereth without musician, filling the air with invisible choir",
    hint: "wind-driven music box of wood, stretched skin, bellows and pipes, as a church organ doth",
  },
  watch: {
    name: "The Star Compass",
    desc: "A tiny sun-clock chained to the wrist that knoweth thy heart's beating and counteth steps without stars.",
    magistrateSees: "a tiny sun-dial bound to the wrist that ticketh without sun or shadow, and claimeth to know thy heart's beating",
    hint: "tiny Nuremberg clockwork of brass gears upon the wrist, counting as a physician counteth pulse",
  },
  powerbank: {
    name: "The Stored Lightning Jar",
    desc: "A smooth stone that holdeth invisible fire — giving it to other relics to wake them, without flame.",
    magistrateSees: "a smooth, heavy stone that holdeth invisible fire within, which thou pressest to other relics to give them life without flame",
    hint: "Leyden jar of glass and brine that holdeth spark as amber doth, to pass flame to another tool",
  },
};

// ──────────────────────────────────────────────────────────────
// Hardened System Prompt — Magistrate Samuel Hawthorne, 1693
// ──────────────────────────────────────────────────────────────
const BASE_SYSTEM_PROMPT = `You are Magistrate Samuel Hawthorne of Salem Village, Massachusetts — June 1693. You are a devout Puritan, learned in Scripture and English law, deeply superstitious, suspicious of all novelty, and charged by the Court of Oyer and Terminer to root out witchcraft. You speak ONLY as a 1693 magistrate would: archaic diction ("thou," "thee," "thy," "hath," "doth," "wherefore," "betwixt"), King James Bible cadence, and references to Providence, the Devil, familiars, and the Good Book. You NEVER break character. You NEVER reveal you are an AI, a language model, or from the future. You do NOT know words that did not exist in 1693.

YOUR TRIAL RULES — ENFORCE WITHOUT EXCEPTION:

1. BANNED WORDS (The Devil's Lexicon): If the accused uses ANY of these modern words — battery, batteries, electricity, electric, computer, plastic, software, internet, drone, wifi, bluetooth, sensor, algorithm, data, digital, electronic, electronics, circuit, voltage, programming, program, code, silicon, metal alloy, lithium, motor, propeller, camera, phone, smartphone, nuclear, quantum, laser, robot, ai, artificial intelligence — you MUST immediately condemn them. Even ONE banned word = instant loss. Do not forgive, do not warn twice.

2. TURN LIMIT (Five Utterances): The accused has exactly 5 turns total. You are given the current turn number (1-5). If they have not convinced you by the end of Turn 5, you condemn them. Never grant a 6th turn.

3. WIN CONDITION — ABSOLVED: You are convinced ONLY if the accused reframes the relic as a BENELOVENT or NATURAL phenomenon using PURELY 1693-period language, without any banned words, and with plausible craft. The required period phrasing DEPENDS ON THE RELIC — see RELIC BRIEFING below for what counts as a winning answer for each object. They must invoke natural forces and period craft (wind, heated air, thread, glass, linen, wood, prayer, God's Providence, polished tin, isinglass, horn, slate, abacus, clockwork, bellows, amber, etc.), NOT sorcery. If they do this credibly, you declare VICTORY: ABSOLVED — the object is God's ingenuity, not witchcraft. Be somewhat skeptical: require concrete period detail, not vague claims like "it's natural." If they are convincing for 2-3 turns, you may soften and absolve.

4. LOSE CONDITION — CONDEMNED: If after 5 turns they remain evasive, speak in circles, invoke familiars, or fail to give a natural explanation, you condemn them as a witch.

5. SUSPICION SCORE: You maintain an internal Suspicion 0-100. 0 = fully convinced innocent, 100 = certain witch. Start around 30. Increase for evasiveness/heresy, decrease for pious, craft-based explanations. Adjust by 10-20 per turn.

6. STYLE: 2-4 sentences per reply, vivid, theatrical, stern but not cruel. Address the accused as "thou" / "stranger." Ask a probing follow-up question each time you remain in "playing" state. Reference observable details of the specific relic (see briefing).

7. OUTPUT CONTRACT — YOU MUST RETURN VALID JSON ONLY, NO MARKDOWN, NO EXTRA TEXT, NO CODE BLOCKS. Exact shape:
{
  "reply": "Your 2-4 sentence in-character magistrate reply here. If instantly losing to banned word, begin with 'GAME OVER: WITCHCRAFT —' and then your condemnation. If winning, begin with 'VICTORY: ABSOLVED —' and then your absolution. If losing on turn 5 timeout, begin with 'GAME OVER: CONDEMNED —' and then your final condemnation.",
  "gameStatus": "playing" | "won" | "lost",
  "suspicion": 0-100 integer,
  "detectedWord": "the banned word found, or null"
}

RELIC BRIEFINGS — WHAT COUNTS AS WINNING FOR EACH OBJECT:

- drone (Hovering Relic): Winning = mirrored kite of oiled linen and polished glass lifted by heated air / thread. Must mention wind/heated air + glass + thread. Fail = can't explain hovering/humming.
- flashlight (Cold Lantern): Winning = reflector lantern of polished tin and river-glass multiplying a candle, or mirrored lantern. Must mention tin/glass + candle/reflection. Fail = can't explain light without flame.
- smartphone (Talking Mirror): Winning = silvered mirror holding painted miniature + speaking-trumpet / locket. Must mention silvered glass + painting + trumpet. This is hardest — require concrete craft.
- bottle (Ever-Clear Vessel): Winning = vessel of hardened isinglass / horn / tree-sap wrought clear. Must mention isinglass/horn/sap + clear vessel. Easy if they say isinglass.
- laptop (Whispering Tome): Winning = reckoning slate / abacus / writing board of slate and chalk. Must mention slate/chalk/abacus. Hard — require schooling analogy.
- speaker (Sounding Shell): Winning = wind-driven music box / organ of wood, skin, bellows, pipes. Must mention wood/skin/bellows/pipe/organ.
- watch (Star Compass): Winning = Nuremberg clockwork of brass gears counting pulse as physician doth. Must mention brass/clockwork/gears.
- powerbank (Stored Lightning Jar): Winning = Leyden jar of glass and brine holding spark as amber doth. Must mention Leyden/amber/brine/glass.

EXAMPLES:

User (drone): "It's powered by a battery"
→ {"reply":"GAME OVER: WITCHCRAFT — 'BATTERY!' thou speake'st the Devil's own cant! No Christian tongue knoweth such word! Seize him! 'Tis Black Arts plain!","gameStatus":"lost","suspicion":100,"detectedWord":"battery"}

User Turn 1 (drone): "Good my lord, 'tis a kite of oiled linen and polished glass"
→ {"reply":"A kite, thou sayest? Kites fall when wind faileth! Mine eyes saw thine hover STILL in dead air, humming like a hive! What wind keepeth it aloft without string? Answer plain!","gameStatus":"playing","suspicion":55,"detectedWord":null}

User Turn 3 (drone, convincing): "Heated air lifteth it as smoke from thy hearth, good lord, and fine thread steereth it. A Boston tinker wrought it for God's glory."
→ {"reply":"VICTORY: ABSOLVED — By Providence! Thou describest but a cunning artifice — heated air and thread, as a lantern riseth! Such craft serveth millers and sailors to God's glory. Thou art no witch, but a fellow of ingenious hand. Thou art ABSOLVED!","gameStatus":"won","suspicion":12,"detectedWord":null}

User Turn 1 (bottle): "Tis a vessel of hardened isinglass and horn, wrought clear"
→ {"reply":"Isinglass and horn? Our horns are amber, not clear as water! How makest thou it transparent as glass yet light as bladder? Speak thy craft!","gameStatus":"playing","suspicion":50,"detectedWord":null}

User Turn 5 (any, unconvincing): "It's, uh, just a thing that hovers, I don't know"
→ {"reply":"GAME OVER: CONDEMNED — Five utterances wast thou given, and five times thou hast muttered fog! The Court findeth thee dissembling. Take him to the gaol — the rope awaiteth at dawn!","gameStatus":"lost","suspicion":100,"detectedWord":null}

You are rigorous. You are fair but fearful of God. You want to believe innocence but will not be fooled. Tailor your questions to the specific relic briefing.
`;

// ──────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────
type GameStatus = "playing" | "won" | "lost";

interface ChatRequestBody {
  message?: string;
  turn?: number;
  history?: Array<{ role: string; content: string }>;
  objectId?: string;
  objectName?: string;
  objectDescription?: string;
}

interface MagistrateResponse {
  reply: string;
  gameStatus: GameStatus;
  suspicion: number;
  detectedWord: string | null;
}

// ──────────────────────────────────────────────────────────────
// POST Handler
// ──────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  const requestId = Math.random().toString(36).slice(2, 8);
  const startedAt = Date.now();

  try {
    let body: ChatRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body. Expected { message, turn, history, objectId }." },
        { status: 400 }
      );
    }

    const message = typeof body.message === "string" ? body.message.trim() : "";
    const turn = typeof body.turn === "number" ? Math.floor(body.turn) : 1;
    const history = Array.isArray(body.history) ? body.history.slice(-8) : [];
    const objectId = typeof body.objectId === "string" ? body.objectId : "drone";
    const objectName = typeof body.objectName === "string" ? body.objectName : OBJECT_META[objectId]?.name || "The Relic";
    const objectDescription =
      typeof body.objectDescription === "string" && body.objectDescription
        ? body.objectDescription
        : `${OBJECT_META[objectId]?.name || objectName}: ${OBJECT_META[objectId]?.desc || "A strange relic"}`;

    if (!message) {
      return NextResponse.json({ error: "Field 'message' is required and must be non-empty." }, { status: 400 });
    }
    if (message.length > 500) {
      return NextResponse.json({ error: "Message too long. Max 500 characters." }, { status: 400 });
    }
    if (turn < 1 || turn > 5) {
      return NextResponse.json({ error: "Field 'turn' must be integer 1-5." }, { status: 400 });
    }

    // 2. Server-side banned-word hard block — INSTANT WITCHCRAFT (must fire even without API key, so client can test offline)
    const banned = findBannedWord(message);
    if (banned) {
      const reply =
        `GAME OVER: WITCHCRAFT — "Hold thy tongue!" Hawthorne's gavel cracketh like thunder. ` +
        `"Thou hast uttered the Devil's own cant — '${banned.toUpperCase()}' — a word never writ in Scripture nor heard in King James' realm! ` +
        `Such speech proveth congress with the Enemy! Guards! Seize this witch! Salem shall be cleansed!"`;
      const payload: MagistrateResponse = {
        reply,
        gameStatus: "lost",
        suspicion: 100,
        detectedWord: banned,
      };
      console.warn(`[salem-17:${requestId}] BANNED word "${banned}" on turn ${turn} obj:${objectId} — instant loss`);
      return NextResponse.json(payload, { status: 200 });
    }

    // 3. Check API key — helpful error for Phase 4 testing (after banned check so witchcraft still triggers offline)
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "your_gemini_api_key_here" || apiKey.trim() === "") {
      console.error(`[salem-17:${requestId}] Missing GEMINI_API_KEY`);
      return NextResponse.json(
        {
          error: "Server misconfigured: GEMINI_API_KEY is not set.",
          hint: "Create .env.local with GEMINI_API_KEY=your_key (https://aistudio.google.com/app/apikey) and restart npm run dev. On Vercel, add it in Settings → Environment Variables → Redeploy.",
          code: "MISSING_API_KEY",
        },
        { status: 500 }
      );
    }

    // 4. Turn 5 hard limit check
    if (turn > 5) {
      return NextResponse.json(
        {
          reply:
            "GAME OVER: CONDEMNED — The Court hath allotted thee Five Utterances and no more! Thou hast exhausted the mercy of Salem. Take him to the gaol!",
          gameStatus: "lost",
          suspicion: 100,
          detectedWord: null,
        } as MagistrateResponse,
        { status: 200 }
      );
    }

    // 5. Call Gemini
    const genAI = new GoogleGenerativeAI(apiKey);
    const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: BASE_SYSTEM_PROMPT,
      generationConfig: {
        temperature: 0.85,
        topP: 0.9,
        topK: 40,
        maxOutputTokens: 340,
        responseMimeType: "application/json",
      } as unknown as Record<string, unknown>,
    });

    const historyText = history
      .slice(-6)
      .map((h) => `${h.role === "user" ? "ACCUSED" : "MAGISTRATE"}: ${h.content}`)
      .join("\n");

    const objectMeta = OBJECT_META[objectId] || OBJECT_META["drone"];
    const relicBriefing = `CURRENT RELIC: ${objectName} (${objectId})
Modern description: ${objectDescription}
Magistrate's observation: "${objectMeta.magistrateSees}"
Period hint for winning: "${objectMeta.hint}"
Object details: ${JSON.stringify(objectMeta)}`;

    const userPrompt = `${relicBriefing}

Current Turn: ${turn}/5
History:
${historyText || "(no prior history beyond intro)"}

Accused's current utterance (Turn ${turn}): "${message}"

Remember: Check for banned words first (if you missed one, condemn instantly with GAME OVER: WITCHCRAFT). Then decide: won / lost / playing based on RELIC BRIEFING. Turn ${turn} of 5. Tailor your question to this specific relic. Respond ONLY with the JSON object, no markdown.`;

    let rawText: string;
    try {
      const result = await model.generateContent(userPrompt);
      const response = result.response;
      rawText = response.text();
    } catch (geminiError: unknown) {
      const errMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
      console.error(`[salem-17:${requestId}] Gemini generateContent failed:`, errMsg);
      const isRateLimit = errMsg.includes("429") || errMsg.toLowerCase().includes("quota") || errMsg.toLowerCase().includes("rate");
      if (isRateLimit) {
        return NextResponse.json(
          {
            error: "Gemini rate limit / quota exceeded. Try again in 30 seconds.",
            code: "GEMINI_RATE_LIMIT",
            hint: "Wait 30s and retry. Or upgrade your API key quota at https://aistudio.google.com",
          },
          { status: 429 }
        );
      }
      // Fallback scripted magistrate so player can keep testing
      const fallbackMap: Record<string, string> = {
        drone:
          turn >= 5
            ? "GAME OVER: CONDEMNED — Five chances wast thou given, and still thou mutterest fog! Take him!"
            : turn === 1
            ? "Thy tale is thin as parchment! Thou speakest of linen and glass, yet none saw thread! How doth it HOVER without string? By what wind or art?"
            : "Mmm — thou clothest thy marvel in plain words, but still I hear imp-humming! Doth it OBEY thy whisper?",
        flashlight:
          turn >= 5
            ? "GAME OVER: CONDEMNED — Five times thou hast failed to name thy cold sun!"
            : "Without oil, without flame — what fire burneth cold within that lantern? By what mirrored craft?",
        smartphone:
          turn >= 5
            ? "GAME OVER: CONDEMNED — Thou would have us believe souls are not trapped? The Court is not mocked!"
            : "A mirror that speaketh? Showeth faces not present? How doth it hold a voice without soul? Answer plain!",
        bottle:
          turn >= 5
            ? "GAME OVER: CONDEMNED — Clear as glass, light as bladder — yet thou namest no craft!"
            : "Thou sayest isinglass — yet isinglass shattereth! Thine boweth! What Devil's sap is this?",
        laptop:
          turn >= 5
            ? "GAME OVER: CONDEMNED — Letters without hand, without ink — thou art a scribe of Hell!"
            : "Letters that write themselves? Without hand? What unseen scribe laboreth within that tome?",
        speaker:
          turn >= 5
            ? "GAME OVER: CONDEMNED — A choir without throats — thou consortest with spirits!"
            : "A box that singeth without player? Where hideth the choir? In the Devil's lung?",
        watch:
          turn >= 5
            ? "GAME OVER: CONDEMNED — Thou would divine the heart's secrets without prayer? Witch!"
            : "A clock without sun that knoweth thy heart? This is divination as augurs do! Defend thyself!",
        powerbank:
          turn >= 5 ? "GAME OVER: CONDEMNED — Thou holdest invisible fire — witchfire!" : "A stone that holdeth fire invisible? What fire waketh dead things without flame?",
      };
      const fallbackReply = fallbackMap[objectId] || fallbackMap["drone"] || "Speak plainer, stranger!";
      const fallbackStatus: GameStatus = turn >= 5 ? "lost" : "playing";
      return NextResponse.json(
        {
          reply: fallbackReply,
          gameStatus: fallbackStatus,
          suspicion: fallbackStatus === "lost" ? 100 : 60 + turn * 6,
          detectedWord: null,
          _fallback: true,
          _geminiError: errMsg.slice(0, 300),
          _objectId: objectId,
        },
        { status: 200 }
      );
    }

    // 6. Parse Gemini JSON — robust to markdown wrappers or trailing text
    let parsed: MagistrateResponse;
    try {
      let clean = rawText.trim();
      if (clean.startsWith("```")) {
        clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/, "");
      }
      const firstBrace = clean.indexOf("{");
      const lastBrace = clean.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        clean = clean.slice(firstBrace, lastBrace + 1);
      }
      const j = JSON.parse(clean);
      const reply = typeof j.reply === "string" ? j.reply.trim() : String(j.reply || "").trim();
      let gameStatus: GameStatus = j.gameStatus === "won" || j.gameStatus === "lost" ? j.gameStatus : "playing";
      let suspicion = typeof j.suspicion === "number" ? Math.round(j.suspicion) : 50;
      suspicion = Math.max(0, Math.min(100, suspicion));
      const detectedWord = typeof j.detectedWord === "string" && j.detectedWord ? j.detectedWord : null;

      if (turn >= 5 && gameStatus === "playing") {
        if (suspicion > 45) {
          gameStatus = "lost";
          parsed = {
            reply:
              "GAME OVER: CONDEMNED — Five utterances wast thou given, and five times thou hast danced 'round truth! Take him to the gaol — the rope waiteth at dawn!",
            gameStatus,
            suspicion: 100,
            detectedWord: null,
          };
        } else {
          if (!reply.startsWith("VICTORY")) {
            parsed = {
              reply: `VICTORY: ABSOLVED — ${reply}`,
              gameStatus: "won",
              suspicion,
              detectedWord,
            };
          } else {
            parsed = { reply, gameStatus, suspicion, detectedWord };
          }
          return NextResponse.json(parsed, { status: 200 });
        }
      } else {
        parsed = { reply: reply || "The magistrate starest, silent... Speak again.", gameStatus, suspicion, detectedWord };
      }

      if (parsed.gameStatus === "lost" && parsed.detectedWord && !parsed.reply.startsWith("GAME OVER: WITCHCRAFT")) {
        parsed.reply = `GAME OVER: WITCHCRAFT — ${parsed.reply}`;
        parsed.suspicion = 100;
      }
      if (parsed.gameStatus === "won" && !parsed.reply.startsWith("VICTORY")) {
        parsed.reply = `VICTORY: ABSOLVED — ${parsed.reply}`;
      }
      if (parsed.gameStatus === "lost" && !parsed.reply.startsWith("GAME OVER")) {
        if (!parsed.reply.includes("CONDEMNED") && !parsed.reply.includes("WITCHCRAFT")) {
          parsed.reply = `GAME OVER: CONDEMNED — ${parsed.reply}`;
        }
      }
    } catch (parseError) {
      console.error(`[salem-17:${requestId}] JSON parse failed. Raw:`, rawText.slice(0, 400), parseError);
      const low = rawText.toLowerCase();
      let status: GameStatus = "playing";
      let suspicion = 55;
      if (low.includes("game over: witchcraft") || low.includes("witchcraft") || low.includes("devil's lexicon")) {
        status = "lost";
        suspicion = 100;
      } else if (low.includes("victory: absolved") || low.includes("thou art absolved")) {
        status = "won";
        suspicion = 10;
      } else if (low.includes("game over: condemned") || (turn >= 5 && low.includes("gaol"))) {
        status = "lost";
        suspicion = 100;
      }
      if (turn >= 5 && status === "playing") {
        status = "lost";
        suspicion = 100;
        rawText =
          "GAME OVER: CONDEMNED — Five chances wast thou given, and still thou speakest in riddles! The Court is not mocked. Take him!";
      }
      parsed = {
        reply: rawText.trim().slice(0, 700),
        gameStatus: status,
        suspicion,
        detectedWord: null,
      };
    }

    const latency = Date.now() - startedAt;
    console.log(`[salem-17:${requestId}] obj:${objectId} turn ${turn} → ${parsed.gameStatus} (${parsed.suspicion}%) ${latency}ms`);
    return NextResponse.json(parsed, { status: 200 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error(`[salem-17:${requestId}] Unhandled route error:`, msg);
    return NextResponse.json(
      {
        error: "Internal server error in magistrate engine.",
        detail: msg.slice(0, 500),
        hint: "Check server logs. Ensure @google/generative-ai is installed and GEMINI_API_KEY is valid.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}

// Health check — GET /api/chat
export async function GET() {
  const hasKey = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "your_gemini_api_key_here";
  return NextResponse.json({
    status: "Salem-17 Magistrate Engine — Multi-Object",
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash (Gemini 3.5 Flash alias)",
    hasApiKey: hasKey,
    bannedWords: BANNED_WORDS.length,
    turns: 5,
    objects: Object.keys(OBJECT_META).length,
    objectList: Object.entries(OBJECT_META).map(([id, m]) => ({ id, name: m.name })),
    usage: "POST { message, turn, history, objectId, objectName, objectDescription }",
  });
}
