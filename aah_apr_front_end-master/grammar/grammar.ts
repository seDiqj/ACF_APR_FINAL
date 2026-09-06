

const Terminals = {
  KEY: ["A-Z", "0-9", "F1-F12"],
  MODIFIER: ["Ctrl", "Shift", "Alt"],
  ARROW: ["->", "<-", "<->"],
  OR: ["|"],
  PLUS: ["+"],
  AND: ["&"],
};

const NonTerminals = {
  EXPERSSION: [
    "KEY",
    "KEY ARROW EXPERSSION",
    "KEY PLUS EXPERSSION",
    "KEY AND EXPERSSION",
    "MODIFIER ARROW EXPERSSION",
    "MODIFIER PLUS EXPERSSION",
    "MODIFIER AND EXPERSSION",
    "MODIFIER OR EXPERSSION",
  ],
  GROUP: ["( EXPERSSION )"],
};

const grammar = {
  SHORTCUT: ["KEY", "GROUP", "EXPERSSION"],
};
