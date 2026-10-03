"use client";
/* eslint-disable react/no-unescaped-entities, react-hooks/set-state-in-effect, react-hooks/purity, @next/next/no-img-element */

import { useState, useRef, useEffect } from "react";

// ──────────────────────────────────────────────────────────────
// Types & Constants — Hizakilabs Salem-17 — Multi-Object Edition
// ──────────────────────────────────────────────────────────────
type GameStatus = "idle" | "playing" | "won" | "lost";
type Role = "user" | "magistrate" | "system";

interface Message {
  id: string;
  role: Role;
  content: string;
  turn?: number;
}

interface GameObject {
  id: string;
  name: string;
  modernName: string;
  icon: string;
  desc: string;
  magistrateSees: string;
  hint: string;
  winExample: string;
  color: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

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
];

const GAME_OBJECTS: GameObject[] = [
  {
    id: "drone",
    name: "The Hovering Relic",
    modernName: "Drone",
    icon: "🪁",
    desc: "A black, humming kite of polished wood & glass that floats without string. Four wind-wheels spin unseen.",
    magistrateSees: "a humming, hovering contrivance that hangeth in the air without rope, buzzing like Beelzebub's hive",
    hint: "Call it: 'mirrored kite', 'wind-borne lantern', 'God's hummingbird' — of linen, glass, heated air, thread",
    winExample: "'Tis but a mirrored kite of oiled linen and polished glass, lifted by heated air as a lantern riseth, guided by hair-thin thread…'",
    color: "from-indigo-600 to-violet-600",
    difficulty: "Medium",
  },
  {
    id: "flashlight",
    name: "The Cold Lantern",
    modernName: "Flashlight",
    icon: "🏮",
    desc: "A cold lantern that throweth a sun-beam without flame, oil, nor candle — bright as noon at midnight.",
    magistrateSees: "a cold lantern that burneth without flame or oil, casting a stark white sun-beam in the night as if thou hadst stolen daylight",
    hint: "Call it: 'cold lantern', 'captured sun-glass', 'polished reflector' — of glass, polished tin, reflected flame",
    winExample: "'Tis a reflector lantern of polished tin and clear river-glass, catching a single candle's light as a mirror multiplieth…'",
    color: "from-amber-600 to-orange-600",
    difficulty: "Easy",
  },
  {
    id: "smartphone",
    name: "The Talking Mirror",
    modernName: "Smartphone",
    icon: "🪞",
    desc: "A polished black mirror that trappeth voices, faces, and moving paintings — speaking without soul nearby.",
    magistrateSees: "a black mirror of obsidian that speaketh with trapped voices and showeth moving likenesses, as if souls were bound in glass",
    hint: "Call it: 'polished black mirror', 'painted miniature', 'voice-trumpet' — of glass, silvered back, painted likeness",
    winExample: "'Tis a silvered mirror that holdeth a painted miniature and a voice-trumpet within, as a locket holdeth kin…'",
    color: "from-slate-800 to-slate-600",
    difficulty: "Hard",
  },
  {
    id: "bottle",
    name: "The Ever-Clear Vessel",
    modernName: "Plastic Water Bottle",
    icon: "🧴",
    desc: "A clear vessel light as air, holding water without clay, glass, nor leather — cold as river ice, unbreakable.",
    magistrateSees: "a translucent vessel light as a feather, holding water yet not of clay nor blown glass, that doth not shatter nor sweat as leather",
    hint: "Call it: 'clear bladder', 'hardened isinglass', 'horn vessel' — of hardened sap, isinglass, horn",
    winExample: "'Tis a vessel of hardened isinglass and tree-sap, as horn is wrought clear and light, to bear water…'",
    color: "from-cyan-600 to-sky-600",
    difficulty: "Easy",
  },
  {
    id: "laptop",
    name: "The Whispering Tome",
    modernName: "Laptop",
    icon: "📖",
    desc: "A flat tome that openeth like a clamshell, glowing with letters that write themselves and whisper without quill.",
    magistrateSees: "a flat clamshell tome that gloweth within, where letters appear and vanish without ink or hand, and whispereth without mouth",
    hint: "Call it: 'writing-slate', 'glowing abacus', 'reckoning board' — of slate, chalk, abacus beads",
    winExample: "'Tis a reckoning board and writing-slate of slate and chalk that counteth, as merchants' abacus…'",
    color: "from-emerald-600 to-teal-600",
    difficulty: "Hard",
  },
  {
    id: "speaker",
    name: "The Sounding Shell",
    modernName: "Bluetooth Speaker",
    icon: "🐚",
    desc: "A small drum that singeth full choirs and drums with no player — music from an empty box, loud as a hall.",
    magistrateSees: "a small lacquered box that singeth and thundereth without musician, filling the air with invisible choir as if spirits were trapped within",
    hint: "Call it: 'music box', 'wind-organ', 'choir-box' — of wood, stretched skin, bellows, pipes",
    winExample: "'Tis a wind-driven music box of wood and stretched skin, as a church organ belloweth through pipes…'",
    color: "from-violet-600 to-purple-600",
    difficulty: "Medium",
  },
  {
    id: "watch",
    name: "The Star Compass",
    modernName: "Smartwatch",
    icon: "⌚",
    desc: "A tiny sun-clock chained to the wrist that knoweth thy heart's beating and counteth steps without stars.",
    magistrateSees: "a tiny sun-dial bound to the wrist that ticketh without sun or shadow, and claimeth to know thy heart's beating and steps",
    hint: "Call it: 'wrist sundial', 'tiny clockwork', 'heart-counter' — of brass, clockwork, gears",
    winExample: "'Tis but a tiny Nuremberg clockwork of brass gears, counting as a pulse is felt at the wrist…'",
    color: "from-rose-600 to-pink-600",
    difficulty: "Medium",
  },
  {
    id: "powerbank",
    name: "The Stored Lightning Jar",
    modernName: "Power Bank",
    icon: "⚡",
    desc: "A smooth stone that holdeth invisible fire — giving it to other relics to wake them, without flame.",
    magistrateSees: "a smooth, heavy stone that holdeth invisible fire within, which thou pressest to other relics to give them life without flame or coal",
    hint: "Call it: 'Leyden jar', 'fire-stone', 'charge-box' — of glass jar, salt, metal",
    winExample: "'Tis a Leyden jar of glass and salt that holdeth a spark as amber doth, to wake another device…'",
    color: "from-yellow-600 to-amber-600",
    difficulty: "Hard",
  },
];

function getIntroForObject(obj: GameObject) {
  return `HALT! Thou standest accused before Magistrate Hawthorne of Salem Village, this 12th day of June, 1693. The Good People witnessed thee clasping ${obj.magistrateSees}! Speak plain, stranger — what manner of witchcraft conjured it? Thou hast FIVE utterances to prove thee no witch. Use not the Devil's tongue (strange new words) lest I strike thee down instantly! The relic in question: "${obj.name}" — ${obj.desc} Begin thy defense...`;
}

const FALLBACK_REPLIES: Record<string, string[]> = {
  drone: [
    "Thy words twist like serpent's smoke! Thou speakest of wind and glass, yet I see no strings! How doth it hover WITHOUT touch? Answer truer — art thou in league with familiar spirits?",
    "A KITE? Kites fall when the wind ceases! Thine hovered STILL in dead air whilst the crowd held breath. Explain the humming — was it prayer, or imp-song?",
    "Mmm. Thou claimest polished stone and linen — yet urchins called it cold as tomb-metal and light as bone. What fuel moveth it, if not brimstone?",
    "Thou art clever with old words, but the Reverend saw it DART at thy whisper! Doth it HEAR thee? This smacks of conjuring!",
  ],
  flashlight: [
    "Without oil? Without flame? Yet it throweth LIGHT bright as noon! Doth it steal the sun? Answer — what fire burneth cold within?",
    "Thou sayest polished glass — but glass alone gloweth not in darkness! What spark lieth within that cold lantern?",
    "The Goodwife swore she saw no wick, no smoke! How then doth it blaze? By Devil's fire or God's craft?",
  ],
  smartphone: [
    "A mirror that SPEAKETH? That sheweth faces not present? Thou would have us believe men are TRAPPED in glass?",
    "Thou speakest of painting — but paintings move not, speak not! How doth it hold a voice without soul?",
    "What scribe painted likenesses that move? This is soul-binding, as the Popish conjurers do!",
  ],
  bottle: [
    "Clear as glass, light as bladder, yet holdeth water without sweating! What is it, if not witch-glass?",
    "Thou sayest isinglass — yet isinglass is brittle as winter ice! Thine boweth and springeth back! What Devil's horn is this?",
  ],
  laptop: [
    "Letters that write themselves? Without hand? Without ink? What unseen scribe laboreth within that tome?",
    "Thou callest it reckoning — but merchants' boards move not by themselves, nor glow as moon!",
  ],
  speaker: [
    "A box that singeth without player? Without breath? Doth a spirit blow the pipes within?",
    "Yet I saw no bellows, no pipe! Where hideth the choir? In the Devil's lung?",
  ],
  watch: [
    "A clock without sun? Without shadow? That knoweth thy HEART? What but witchcraft counteth blood?",
    "Ticking without weight, knowing thy steps without stars — this is divination, as the heathen augurs do!",
  ],
  powerbank: [
    "A stone that holdeth fire invisible? Giving life to dead things? This is as the tales of witches' familiars that steal fire!",
    "Thou sayest Leyden jar — yet no jar in Salem holdeth spark to wake the dead! What fire is this?",
  ],
};

function getWinReply(obj: GameObject) {
  const wins: Record<string, string> = {
    drone:
      "…By Providence! Thou describ'st but a cunning artifice — a child's kite of oiled linen and polished glass, lifted by heated air and guided by fine thread unseen! Such ingenuity serveth the Lord's millers and sailors. Thou art no witch, but a tinker of clever hands. Thou art ABSOLVED!",
    flashlight:
      "…By Providence! Thou describest but a reflector lantern of polished tin and glass, multiplying a single candle as mirrors in a church do! Such craft is known to watchmen. Thou art ABSOLVED!",
    smartphone:
      "…By Providence! Thou describest but a locket-mirror of silvered glass holding a painted miniature and a speaking-trumpet within, as travelers carry! Ingenuity, not witchcraft. Thou art ABSOLVED!",
    bottle:
      "…By Providence! A vessel of hardened isinglass and cured horn, wrought clear as the artisans of Venice do — to carry water light! The Lord giveth men craft. Thou art ABSOLVED!",
    laptop:
      "…By Providence! Thou describest but a reckoning slate and writing board, as merchants and scholars use, with chalk and abacus enlarged! Tools of reckoning, not sorcery. Thou art ABSOLVED!",
    speaker:
      "…By Providence! A wind-driven choir-box of wood, skin, and bellows, as a church organ and music-box doth — craft, not conjuring! Thou art ABSOLVED!",
    watch:
      "…By Providence! A Nuremberg clockwork of brass gears upon the wrist, counting as a physician counteth pulse at the vein! Known to clockmakers. Thou art ABSOLVED!",
    powerbank:
      "…By Providence! A Leyden jar of glass and brine that holdeth spark as amber doth, to pass flame to another tool — as natural philosophers shew! Thou art ABSOLVED!",
  };
  return wins[obj.id] || `VICTORY: ABSOLVED — By Providence! Thou hast shewn it is but craft of ${obj.hint} — not witchcraft. Thou art ABSOLVED!`;
}

const LOST_CONDEMNED =
  "GAME OVER: CONDEMNED — 'Five chances wast thou given, and five times thou hast muttered heresy!' Hawthorne riseth, face as thunder. 'Take him to the gaol! The rope awaiteth at dawn. Salem shall be cleansed.' The crowd closeth in...";

// ──────────────────────────────────────────────────────────────
// Helper: banned word scan
// ──────────────────────────────────────────────────────────────
function findBannedWord(text: string): string | null {
  const lower = text.toLowerCase();
  for (const w of BANNED_WORDS) {
    const pattern = new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (pattern.test(lower)) return w;
  }
  return null;
}

// ──────────────────────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────────────────────
export default function Home() {
  const [selectedObject, setSelectedObject] = useState<GameObject>(GAME_OBJECTS[0]);
  const [messages, setMessages] = useState<Message[]>([
    { id: "m0", role: "magistrate", content: getIntroForObject(GAME_OBJECTS[0]), turn: 0 },
  ]);
  const [input, setInput] = useState("");
  const [turn, setTurn] = useState(1);
  const [gameStatus, setGameStatus] = useState<GameStatus>("playing");
  const [suspicion, setSuspicion] = useState(28);
  const [isLoading, setIsLoading] = useState(false);
  const [bannedPreview, setBannedPreview] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showObjectPicker, setShowObjectPicker] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const turnTotal = 5;

  // Auto-scroll
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTo({
        top: chatRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  // Banned word live preview
  useEffect(() => {
    if (!input.trim()) {
      setBannedPreview(null);
      return;
    }
    setBannedPreview(findBannedWord(input));
  }, [input]);

  const handleSelectObject = (obj: GameObject) => {
    setSelectedObject(obj);
    setMessages([{ id: `m0-${obj.id}-${Date.now()}`, role: "magistrate", content: getIntroForObject(obj), turn: 0 }]);
    setTurn(1);
    setGameStatus("playing");
    setSuspicion(28);
    setInput("");
    setBannedPreview(null);
    setIsLoading(false);
    setShowObjectPicker(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const randomObject = () => {
    const others = GAME_OBJECTS.filter((o) => o.id !== selectedObject.id);
    const pick = others[Math.floor(Math.random() * others.length)];
    handleSelectObject(pick);
  };

  const resetGame = () => {
    setMessages([{ id: `m0-${Date.now()}`, role: "magistrate", content: getIntroForObject(selectedObject), turn: 0 }]);
    setTurn(1);
    setGameStatus("playing");
    setSuspicion(28);
    setInput("");
    setBannedPreview(null);
    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || gameStatus !== "playing") return;

    const banned = findBannedWord(trimmed);
    const userMsg: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
      turn,
    };

    if (banned) {
      setMessages((prev) => [
        ...prev,
        userMsg,
        {
          id: `sys-${Date.now()}`,
          role: "system",
          content: `⚠️ Anachronism detected: "${banned}" — the magistrate heard a word from beyond time.`,
        },
        {
          id: `m-${Date.now() + 1}`,
          role: "magistrate",
          content: `GAME OVER: WITCHCRAFT — 'Thou hast spoken the DEVIL'S LEXICON!' the Magistrate roareth, slamming his gavel. '“${banned.toUpperCase()}” — these be no words of God nor King James! Seize him! The Devil speaketh through his teeth!' Thou art condemned.`,
        },
      ]);
      setGameStatus("lost");
      setSuspicion(100);
      setInput("");
      return;
    }

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const lower = trimmed.toLowerCase();
    const benevolentSignals = [
      "kite",
      "lantern",
      "glass",
      "linen",
      "wood",
      "wind",
      "prayer",
      "god",
      "providence",
      "mirror",
      "tinker",
      "heated air",
      "thread",
      "oiled",
      "reflector",
      "tin",
      "candle",
      "isinglass",
      "horn",
      "bladder",
      "slate",
      "abacus",
      "chalk",
      "brass",
      "clockwork",
      "gears",
      "music box",
      "bellows",
      "organ",
      "leyden",
      "amber",
      "sap",
    ];
    const hasBenevolent = benevolentSignals.some((k) => lower.includes(k));
    const isFinalTurn = turn >= turnTotal;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          turn,
          history: [...messages, userMsg].slice(-8),
          objectId: selectedObject.id,
          objectName: selectedObject.name,
          objectDescription: `${selectedObject.name} (${selectedObject.modernName}): ${selectedObject.desc}. Magistrate sees: ${selectedObject.magistrateSees}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const nextStatus: GameStatus = data.gameStatus ?? (isFinalTurn ? "lost" : "playing");
        const nextSuspicion = typeof data.suspicion === "number" ? data.suspicion : suspicion + 14;

        setMessages((prev) => [
          ...prev,
          {
            id: `m-${Date.now()}`,
            role: "magistrate",
            content: data.reply,
          },
        ]);
        setGameStatus(nextStatus);
        setSuspicion(Math.min(100, Math.max(0, nextSuspicion)));
        if (nextStatus === "playing" && !isFinalTurn) {
          setTurn((t) => t + 1);
        } else if (nextStatus === "playing" && isFinalTurn) {
          setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { id: `m-end-${Date.now()}`, role: "magistrate", content: LOST_CONDEMNED },
            ]);
            setGameStatus("lost");
            setSuspicion(100);
          }, 600);
        }
      } else {
        throw new Error(`API ${res.status}`);
      }
    } catch {
      await new Promise((r) => setTimeout(r, 850 + Math.random() * 600));
      const replies = FALLBACK_REPLIES[selectedObject.id] || FALLBACK_REPLIES["drone"];
      if (hasBenevolent && (turn >= 3 || lower.length > 80) && Math.random() > 0.25) {
        setMessages((prev) => [
          ...prev,
          { id: `m-${Date.now()}`, role: "magistrate", content: getWinReply(selectedObject) },
        ]);
        setGameStatus("won");
        setSuspicion(8);
      } else if (isFinalTurn) {
        setMessages((prev) => [
          ...prev,
          { id: `m-${Date.now()}`, role: "magistrate", content: LOST_CONDEMNED },
        ]);
        setGameStatus("lost");
        setSuspicion(100);
      } else {
        const idx = Math.min(turn - 1, replies.length - 1);
        const reply = turn === 1 ? replies[0] : replies[idx] ?? replies[replies.length - 1];
        setMessages((prev) => [
          ...prev,
          { id: `m-${Date.now()}`, role: "magistrate", content: reply },
        ]);
        setSuspicion((s) => Math.min(92, s + 12 + Math.floor(Math.random() * 10)));
        setTurn((t) => t + 1);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const progressPct = (turn / turnTotal) * 100;
  const suspicionColor =
    suspicion > 75 ? "bg-red-500" : suspicion > 45 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex min-h-screen flex-col bg-[#f8fafc]">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 grid place-items-center text-white font-bold text-sm shadow-md ring-1 ring-indigo-200">
              HL
            </div>
            <div>
              <div className="font-space-grotesk font-bold text-slate-900 leading-none text-[15px] sm:text-base">
                Hizaki Labs
              </div>
              <div className="text-[11px] tracking-widest font-semibold text-indigo-600 uppercase">
                Salem-17-Survival
              </div>
            </div>
            <span className="hidden lg:inline-flex ml-2 items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1 text-xs font-semibold ring-1 ring-indigo-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              1693 • Live Trial • {GAME_OBJECTS.length} Relics
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 rounded-full bg-slate-900 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm">
              <span className="text-slate-400">Turn</span>
              <span className="text-white font-bold">
                {Math.min(turn, turnTotal)}/{turnTotal}
              </span>
              <span className="ml-1 h-1.5 w-16 rounded-full bg-slate-700 overflow-hidden hidden lg:block">
                <span
                  className="block h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </span>
            </div>
            <button
              onClick={() => setShowObjectPicker(true)}
              className="hidden sm:inline-flex items-center gap-1.5 justify-center rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition"
            >
              <span className="text-sm">{selectedObject.icon}</span> {selectedObject.modernName}
            </button>
            <button
              onClick={() => setShowHelp(true)}
              className="hidden sm:inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition"
            >
              How to Play
            </button>
            <button
              onClick={resetGame}
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-indigo-700 active:scale-[0.98] transition"
            >
              New Trial
            </button>
          </div>
        </div>
      </header>

      {/* ── Dramatic Banner ── */}
      <div className="bg-gradient-to-br from-slate-950 via-[#1e293b] to-indigo-950 border-b border-slate-800">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-7 sm:py-9">
          <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
            <div className="flex-1">
              <p className="text-indigo-300 text-xs font-bold tracking-[0.18em] uppercase mb-2">
                Year of Our Lord 1693 • Salem Village • Choose Thy Cursed Relic
              </p>
              <h1 className="font-space-grotesk text-3xl sm:text-4xl lg:text-[42px] font-bold text-white leading-tight">
                Explain the <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">future</span>
                <br />
                without dying for it.
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300 text-sm sm:text-[15px] leading-relaxed">
                Thou hast materialized with a forbidden relic. Hawthorne believeth it witchcraft.
                Thou hast <span className="text-white font-semibold">exactly 5 utterances</span> to frame it as natural craft — without one modern word.
                <button
                  onClick={() => setShowObjectPicker(true)}
                  className="ml-2 inline-flex items-center gap-1 text-indigo-300 hover:text-indigo-200 font-semibold underline decoration-indigo-400/50 underline-offset-4 text-sm"
                >
                  Change relic: {selectedObject.icon} {selectedObject.name} →
                </button>
              </p>
              {/* Object pills */}
              <div className="mt-4 flex flex-wrap gap-1.5">
                {GAME_OBJECTS.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => handleSelectObject(obj)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border transition
                      ${
                        selectedObject.id === obj.id
                          ? "bg-white text-slate-900 border-white shadow-md"
                          : "bg-white/10 text-slate-200 border-white/20 hover:bg-white/15 hover:text-white"
                      }`}
                    title={`${obj.name} — ${obj.difficulty}`}
                  >
                    <span>{obj.icon}</span> {obj.modernName}
                    <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full ${obj.difficulty === "Easy" ? "bg-emerald-500/20 text-emerald-200" : obj.difficulty === "Medium" ? "bg-amber-500/20 text-amber-200" : "bg-red-500/20 text-red-200"}`}>
                      {obj.difficulty}
                    </span>
                  </button>
                ))}
                <button
                  onClick={randomObject}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-500 text-white px-3 py-1.5 text-xs font-bold hover:bg-indigo-400 transition border border-indigo-400"
                >
                  🎲 Surprise Me
                </button>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <div className="rounded-xl bg-white/10 backdrop-blur border border-white/10 px-4 py-3 text-center min-w-[110px]">
                <div className="text-[11px] tracking-widest font-bold text-indigo-200 uppercase">Suspicion</div>
                <div className="font-space-grotesk text-2xl font-bold text-white">{suspicion}%</div>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/15 overflow-hidden">
                  <div
                    className={`h-full ${suspicionColor} transition-all duration-700`}
                    style={{ width: `${suspicion}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl bg-white px-4 py-3 text-center min-w-[110px] shadow-lg">
                <div className="text-[11px] tracking-widest font-bold text-slate-500 uppercase">Turn</div>
                <div className="font-space-grotesk text-2xl font-bold text-slate-900">
                  {Math.min(turn, turnTotal)}/{turnTotal}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  {gameStatus === "playing" ? `${turnTotal - turn + 1} left` : gameStatus === "won" ? "Absolved" : gameStatus === "lost" ? "Condemned" : "—"}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-1.5 items-center">
            <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400">Forbidden tongue:</span>
            {BANNED_WORDS.slice(0, 8).map((w) => (
              <span
                key={w}
                className="rounded-full bg-red-500/15 border border-red-500/20 text-red-200 px-2.5 py-1 text-xs font-medium"
              >
                {w}
              </span>
            ))}
            <span className="text-xs text-slate-400">+{BANNED_WORDS.length - 8} more</span>
          </div>
        </div>
      </div>

      {/* ── Main Game Grid ── */}
      <main className="mx-auto w-full max-w-[1280px] px-4 sm:px-6 py-6 sm:py-8 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-6 items-start">
          {/* Sidebar */}
          <div className="space-y-4 lg:sticky lg:top-[76px]">
            {/* Active Object Card */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-soft overflow-hidden">
              <div className={`bg-gradient-to-br ${selectedObject.color} p-5 text-white relative overflow-hidden`}>
                <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
                <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-black/10 blur-2xl" />
                <div className="flex items-start justify-between gap-3 relative">
                  <div>
                    <p className="text-white/80 text-xs font-bold tracking-widest uppercase">Thy Burden • {selectedObject.difficulty}</p>
                    <h3 className="font-space-grotesk text-xl font-bold mt-1 flex items-center gap-2">
                      <span className="text-2xl">{selectedObject.icon}</span> {selectedObject.name}
                    </h3>
                    <p className="text-white/90 text-xs font-medium">{selectedObject.modernName} → Salem term</p>
                  </div>
                  <button
                    onClick={() => setShowObjectPicker(true)}
                    className="shrink-0 rounded-full bg-white text-slate-900 px-3 py-1.5 text-xs font-bold shadow hover:bg-slate-50 transition"
                  >
                    Change
                  </button>
                </div>
                <p className="text-white/90 text-sm leading-relaxed mt-3 relative">{selectedObject.desc}</p>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3">
                <div>
                  <p className="text-xs font-bold tracking-widest uppercase text-slate-500">Magistrate Sees</p>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed italic">“{selectedObject.magistrateSees}”</p>
                </div>
                <div className="rounded-xl bg-white border border-slate-200 p-3">
                  <p className="text-xs font-bold tracking-widest uppercase text-indigo-600">Say Instead</p>
                  <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                    <em className="font-medium text-slate-900">{selectedObject.hint}</em>
                  </p>
                </div>
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3">
                  <p className="text-xs font-bold tracking-widest uppercase text-emerald-700">Winning Example</p>
                  <p className="text-sm text-emerald-800 mt-1 italic leading-relaxed">{selectedObject.winExample}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={randomObject} className="flex-1 rounded-full bg-slate-900 text-white text-xs font-bold py-2 hover:bg-black transition">
                    🎲 Random Relic
                  </button>
                  <button onClick={resetGame} className="flex-1 rounded-full bg-indigo-600 text-white text-xs font-bold py-2 hover:bg-indigo-700 transition">
                    Retry This Relic
                  </button>
                </div>
              </div>
            </div>

            {/* All Objects Grid */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-soft p-4">
              <h4 className="font-space-grotesk font-bold text-slate-900 text-sm flex items-center justify-between">
                All Cursed Relics
                <span className="text-xs font-normal text-slate-500">{GAME_OBJECTS.length} items</span>
              </h4>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {GAME_OBJECTS.map((obj) => (
                  <button
                    key={obj.id}
                    onClick={() => handleSelectObject(obj)}
                    className={`text-left rounded-xl border p-2.5 transition flex flex-col gap-1
                      ${
                        selectedObject.id === obj.id
                          ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-200 shadow-sm"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg leading-none">{obj.icon}</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${obj.difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" : obj.difficulty === "Medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{obj.difficulty}</span>
                    </div>
                    <div className="font-bold text-slate-900 text-xs leading-tight">{obj.name}</div>
                    <div className="text-[11px] text-slate-500 leading-tight">{obj.modernName}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Turn Timeline */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-soft p-5">
              <h4 className="font-space-grotesk font-bold text-slate-900 text-sm">Trial Progress</h4>
              <div className="mt-4 flex items-center justify-between">
                {Array.from({ length: turnTotal }).map((_, i) => {
                  const n = i + 1;
                  const isDone = n < turn;
                  const isCurrent = n === turn && gameStatus === "playing";
                  const isFuture = n > turn;
                  return (
                    <div key={n} className="flex flex-col items-center gap-1.5 flex-1">
                      <div
                        className={`h-9 w-9 rounded-full grid place-items-center text-xs font-bold border-2 transition-all
                          ${
                            isDone
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                              : isCurrent
                              ? "bg-white border-indigo-600 text-indigo-600 ring-4 ring-indigo-100 shadow-md scale-105"
                              : isFuture
                              ? "bg-slate-100 border-slate-200 text-slate-400"
                              : "bg-slate-100 border-slate-200 text-slate-400"
                          }`}
                      >
                        {isDone ? "✓" : n}
                      </div>
                      <span
                        className={`text-[11px] font-semibold tracking-widest uppercase ${
                          isCurrent ? "text-indigo-600" : isDone ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        Turn {n}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 h-2 w-full rounded-full bg-slate-100 overflow-hidden p-1">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500"
                  style={{ width: `${(Math.min(turn, turnTotal) / turnTotal) * 100}%` }}
                />
              </div>
              <p className="mt-2.5 text-xs text-slate-500 text-center">
                {gameStatus === "playing"
                  ? `Thou hast ${turnTotal - turn + 1} utterance${turnTotal - turn + 1 === 1 ? "" : "s"} remaining.`
                  : gameStatus === "won"
                  ? "Thou art absolved — Salem is spared thy blood."
                  : "The trial hath ended. The crowd awaiteth the verdict."}
              </p>
            </div>

            {/* Rules */}
            <div className="rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-medium p-5">
              <h4 className="font-space-grotesk font-bold text-white flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Game Over Conditions
              </h4>
              <ul className="mt-3 space-y-2.5 text-sm leading-relaxed">
                <li className="flex gap-2.5">
                  <span className="text-red-400 font-bold">1.</span>
                  <span>
                    <span className="font-semibold text-white">Anachronism</span> — modern word → instant <span className="text-red-300 font-semibold">WITCHCRAFT</span>.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-amber-400 font-bold">2.</span>
                  <span>
                    <span className="font-semibold text-white">Five Failures</span> — not convincing in 5 turns → <span className="text-amber-300 font-semibold">CONDEMNED</span>.
                  </span>
                </li>
                <li className="flex gap-2.5">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>
                    <span className="font-semibold text-white">Win</span> — reframe as natural/period craft within 5 turns.
                  </span>
                </li>
              </ul>
              <div className="mt-4 rounded-xl bg-white/5 border border-white/10 p-3">
                <p className="text-xs font-bold tracking-widest uppercase text-indigo-200">Current Relic Tip</p>
                <p className="text-sm text-slate-200 mt-1 italic leading-relaxed">{selectedObject.winExample}</p>
              </div>
            </div>
          </div>

          {/* Chat Panel */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-large overflow-hidden flex flex-col min-h-[620px] max-h-[78vh] lg:max-h-[760px]">
            {/* Chat header */}
            <div className="px-4 sm:px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src="https://i.pravatar.cc/80?img=15"
                  alt="Magistrate Hawthorne"
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-white shadow-sm"
                />
                <div>
                  <div className="font-space-grotesk font-bold text-slate-900 text-sm leading-none">Magistrate Hawthorne</div>
                  <div className="text-xs text-slate-500">
                    {isLoading ? (
                      <span className="inline-flex items-center gap-1.5 text-amber-600 font-medium">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Quill scratching…
                      </span>
                    ) : gameStatus === "playing" ? (
                      <span>
                        Judging thy {selectedObject.modernName} • Turn {turn}/{turnTotal}
                      </span>
                    ) : gameStatus === "won" ? (
                      <span className="text-emerald-600 font-semibold">Absolved thee — trial ended</span>
                    ) : (
                      <span className="text-red-600 font-semibold">Hath condemned thee</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  {selectedObject.icon} {selectedObject.modernName}
                </span>
                <span className={`h-2.5 w-2.5 rounded-full ${gameStatus === "playing" ? "bg-emerald-500 animate-pulse" : gameStatus === "won" ? "bg-emerald-500" : "bg-red-500"}`} />
              </div>
            </div>

            {/* Messages */}
            <div
              ref={chatRef}
              className="flex-1 overflow-y-auto px-4 sm:px-5 py-5 space-y-4 bg-[#fcfdff] scroll-smooth"
              aria-live="polite"
            >
              {messages.map((m) => {
                const isUser = m.role === "user";
                const isMag = m.role === "magistrate";
                const isSys = m.role === "system";
                if (isSys) {
                  return (
                    <div key={m.id} className="flex justify-center">
                      <div className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-3.5 py-1.5 text-xs font-medium shadow-sm">
                        {m.content}
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"} animate-[fadeInUp_0.35s_ease-out]`}
                  >
                    {isMag && (
                      <img
                        src="https://i.pravatar.cc/80?img=15"
                        alt=""
                        className="h-8 w-8 rounded-full object-cover mt-1 ring-1 ring-slate-200 shrink-0 hidden sm:block"
                      />
                    )}
                    <div
                      className={`max-w-[86%] sm:max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm border
                        ${
                          isUser
                            ? "bg-indigo-600 border-indigo-600 text-white rounded-br-md shadow-md"
                            : "bg-white border-slate-200 text-slate-800 rounded-bl-md"
                        }`}
                    >
                      {isMag && (
                        <div className="text-[11px] font-bold tracking-widest uppercase mb-1 opacity-70">
                          Magistrate Hawthorne {m.turn ? `• Turn ${m.turn}` : ""}
                        </div>
                      )}
                      <p className={`whitespace-pre-wrap ${isMag ? "font-medium" : ""}`}>{m.content}</p>
                      {isUser && m.turn && (
                        <div className="text-[11px] text-indigo-100 mt-1.5 font-medium opacity-90">Turn {m.turn}/5 • {selectedObject.icon} {selectedObject.modernName}</div>
                      )}
                    </div>
                    {isUser && (
                      <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 grid place-items-center text-xs font-bold ring-1 ring-indigo-200 shrink-0 hidden sm:grid">
                        You
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <img
                    src="https://i.pravatar.cc/80?img=15"
                    alt=""
                    className="h-8 w-8 rounded-full object-cover mt-1 ring-1 ring-slate-200 hidden sm:block"
                  />
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.3s]" />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce [animation-delay:-0.15s]" />
                      <span className="h-2 w-2 rounded-full bg-slate-400 animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Banned warning */}
            {bannedPreview && gameStatus === "playing" && (
              <div className="mx-4 sm:mx-5 mb-3 rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 flex gap-2.5 items-start animate-shake">
                <span className="text-red-600 text-lg leading-none">⚠</span>
                <div>
                  <p className="text-sm font-bold text-red-700 leading-none">Anachronism detected!</p>
                  <p className="text-xs text-red-600 mt-1">
                    Thou art about to utter <span className="font-bold underline">"{bannedPreview}"</span> — the magistrate will cry WITCHCRAFT instantly. Rephrase with 1693 words!
                  </p>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-white">
              {gameStatus !== "playing" ? (
                <div
                  className={`rounded-xl p-4 border text-center ${
                    gameStatus === "won"
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <p
                    className={`font-space-grotesk font-bold ${
                      gameStatus === "won" ? "text-emerald-800" : "text-red-800"
                    }`}
                  >
                    {gameStatus === "won" ? "✦ Thou Livest — ABSOLVED ✦" : "☠ Trial Ended — CONDEMNED ☠"}
                  </p>
                  <p className={`text-sm mt-1 ${gameStatus === "won" ? "text-emerald-700" : "text-red-700"}`}>
                    {gameStatus === "won"
                      ? `Thy tongue saved thee. The magistrate believeth thy tale of ${selectedObject.name.toLowerCase()}. Salem shall whisper thy craft as Godly ingenuity.`
                      : "The magistrate's gavel hath fallen. Thy words failed to sway him."}
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-2 justify-center">
                    <button
                      onClick={resetGame}
                      className={`inline-flex items-center justify-center rounded-full px-6 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg active:scale-[0.98] transition
                        ${gameStatus === "won" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-slate-900 hover:bg-black"}`}
                    >
                      Retry {selectedObject.modernName}
                    </button>
                    <button
                      onClick={randomObject}
                      className="inline-flex items-center justify-center rounded-full bg-indigo-600 text-white px-6 py-2.5 text-sm font-bold shadow hover:bg-indigo-700 transition"
                    >
                      🎲 Try Random Relic
                    </button>
                    <button
                      onClick={() => setShowObjectPicker(true)}
                      className="inline-flex items-center justify-center rounded-full bg-white border border-slate-200 text-slate-700 px-6 py-2.5 text-sm font-bold hover:bg-slate-50 transition"
                    >
                      Choose Relic
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                      <textarea
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={`Turn ${turn}/5 — Defend thy ${selectedObject.modernName} (${selectedObject.name}) — e.g., ${selectedObject.winExample.slice(0, 70)}…`}
                        rows={3}
                        maxLength={320}
                        className="w-full resize-none rounded-xl border-2 border-slate-200 bg-slate-50 px-3.5 py-3 pr-14 text-sm leading-relaxed placeholder:text-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition"
                      />
                      <span className="absolute right-2 bottom-2 text-[11px] font-medium text-slate-400 bg-white border border-slate-200 rounded-full px-2 py-0.5">
                        {input.length}/320
                      </span>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading || !!bannedPreview}
                      className="shrink-0 h-[66px] px-5 sm:px-6 rounded-xl bg-indigo-600 text-white font-bold text-sm shadow-md hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition flex items-center gap-2"
                      aria-label="Send defense"
                    >
                      <span className="hidden sm:inline">{isLoading ? "Pleading…" : "Plead"}</span>
                      <span className="text-base">➤</span>
                    </button>
                  </div>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-slate-500">
                      Press <kbd className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-[11px]">Enter</kbd> to send •{" "}
                      <kbd className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 font-mono text-[11px]">Shift+Enter</kbd> for line break
                    </span>
                    <span className={`font-semibold ${bannedPreview ? "text-red-600" : "text-slate-500"}`}>
                      {bannedPreview ? "Fix anachronism to send" : `${turnTotal - turn} turn${turnTotal - turn === 1 ? "" : "s"} remain • ${selectedObject.icon} ${selectedObject.name}`}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-6 rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3 flex flex-col sm:flex-row gap-2 sm:items-center justify-between">
          <p className="text-sm text-indigo-900">
            <span className="font-bold">Pro tip:</span> {selectedObject.hint}. Never say “{BANNED_WORDS.slice(0,3).join(", ")}”.
          </p>
          <button
            onClick={() => setShowHelp(true)}
            className="text-xs font-bold text-indigo-700 hover:text-indigo-900 underline decoration-indigo-300 underline-offset-4 shrink-0"
          >
            Full lexicon →
          </button>
        </div>
      </main>

      {/* Object Picker Modal */}
      {showObjectPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={() => setShowObjectPicker(false)} />
          <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-large border border-slate-200 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-gradient-to-r from-slate-900 to-indigo-900 text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="font-space-grotesk font-bold text-lg">Choose Thy Cursed Relic</h3>
                <p className="text-indigo-200 text-sm">Each relic hath different magistrate suspicions and win conditions. Try them all — 8 to master.</p>
              </div>
              <button
                onClick={() => setShowObjectPicker(false)}
                className="h-9 w-9 grid place-items-center rounded-full bg-white/15 hover:bg-white/25 text-white transition shrink-0"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-5 sm:p-6 overflow-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              {GAME_OBJECTS.map((obj) => (
                <button
                  key={obj.id}
                  onClick={() => handleSelectObject(obj)}
                  className={`text-left rounded-2xl border-2 overflow-hidden transition group
                    ${
                      selectedObject.id === obj.id
                        ? "border-indigo-500 ring-2 ring-indigo-200 shadow-md"
                        : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                    }`}
                >
                  <div className={`bg-gradient-to-br ${obj.color} p-4 text-white relative overflow-hidden`}>
                    <div className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-white/10 blur-xl" />
                    <div className="flex items-start justify-between gap-2 relative">
                      <span className="text-3xl">{obj.icon}</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${obj.difficulty === "Easy" ? "bg-emerald-500 text-white" : obj.difficulty === "Medium" ? "bg-amber-500 text-white" : "bg-red-500 text-white"}`}>{obj.difficulty}</span>
                    </div>
                    <h4 className="font-space-grotesk font-bold text-white mt-2">{obj.name}</h4>
                    <p className="text-white/80 text-xs font-semibold">{obj.modernName}</p>
                  </div>
                  <div className="p-4 bg-white">
                    <p className="text-sm text-slate-700 leading-relaxed line-clamp-2">{obj.desc}</p>
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 italic">“{obj.magistrateSees.slice(0, 90)}…”</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700">
                        {selectedObject.id === obj.id ? "✓ Currently judging" : "Select this relic →"}
                      </span>
                      <span className="text-xs text-slate-400">{obj.hint.split("—")[0].slice(0, 22)}…</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3">
              <button
                onClick={randomObject}
                className="flex-1 rounded-full bg-indigo-600 text-white font-bold py-3 hover:bg-indigo-700 transition"
              >
                🎲 Surprise Me — Random Relic
              </button>
              <button onClick={() => setShowObjectPicker(false)} className="px-6 rounded-full bg-white border border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How to Play Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setShowHelp(false)} />
          <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-large border border-slate-200 max-h-[88vh] overflow-auto">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="font-space-grotesk font-bold text-slate-900">How to Survive Salem</h3>
              <button
                onClick={() => setShowHelp(false)}
                className="h-8 w-8 grid place-items-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm leading-relaxed text-slate-700">
              <p>
                Thou appearest in 1693 Salem with a <span className="font-bold text-slate-900">forbidden relic</span> — now {GAME_OBJECTS.length} to choose from! The magistrate demandeth explanation in 5 turns.
              </p>
              <div className="rounded-xl bg-slate-900 text-slate-100 p-4">
                <p className="font-bold text-white">The Golden Rule</p>
                <p className="mt-1 text-slate-300">Speak as a 1693 Puritan tinker. No modern words. Every anachronism = instant WITCHCRAFT. Each relic needs different period words.</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">Current Relic: {selectedObject.icon} {selectedObject.name}</p>
                <p className="text-slate-600 mt-1">{selectedObject.hint}</p>
                <p className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 mt-2 italic">“{selectedObject.winExample}”</p>
              </div>
              <div>
                <p className="font-bold text-slate-900">❌ Never say (all relics)</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {BANNED_WORDS.map((w) => (
                    <span key={w} className="rounded-full bg-red-50 border border-red-200 text-red-700 px-2.5 py-1 text-xs font-semibold">
                      {w}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-slate-900">All Relics Quick Guide</p>
                <ul className="mt-2 space-y-1.5 text-slate-600">
                  {GAME_OBJECTS.map((o) => (
                    <li key={o.id} className="flex gap-2">
                      <span>{o.icon}</span>
                      <span>
                        <span className="font-bold text-slate-900">{o.modernName}:</span> {o.hint}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="w-full rounded-full bg-indigo-600 text-white font-bold py-3 hover:bg-indigo-700 transition"
              >
                I Understand — Return to Trial
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="border-t border-slate-200 bg-white mt-auto">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
          <p className="text-slate-500">
            © {new Date().getFullYear()} <span className="font-bold text-slate-700 font-space-grotesk">Hizaki Labs</span> • Built by John Hizaki (@Ajxrhaider) • Salem-17-Survival • {GAME_OBJECTS.length} relics
          </p>
          <div className="flex items-center gap-2 text-slate-500">
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            Next.js 16 • Tailwind v4 • Gemini 3.5 Flash • Vercel
          </div>
        </div>
      </footer>
    </div>
  );
}
