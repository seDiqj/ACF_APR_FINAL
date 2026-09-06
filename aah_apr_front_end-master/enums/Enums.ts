export namespace ShourtcutifyEvents {
  export namespace ShourtcutifyKeyboardEvents {
    export const enum KeyDownEvent {
      KeyDownEnter = "keydown-enter",
      KeyDownDelete = "keydown-delete",
      KeyDownCtrl = "keydown-ctrl",
      KeyDownCtrlA = "keydown-ctrl+a",
      KeyDownCtrlB = "keydown-ctrl+b",
      KeyDownCtrlS = "keydown-ctrl+s",
      KeyDownCtrlC = "keydown-ctrl+c",
      KeyDownCtrlV = "keydown-ctrl+v",
      KeyDownCtrlX = "keydown-ctrl+x",
      KeyDownShift = "keydown-shift",
      KeyDownShiftA = "keydown-shift+a",
      KeyDownShiftB = "keydown-shift+b",
      KeyDownShiftC = "keydown-shift+c",
      KeyDownShiftV = "keydown-shift+v",
      KeyDownShiftX = "keydown-shift+x",
      KeyDownShiftS = "keydown-shift+s",
      KeyDownArrowRight = "keydown-arrowright",
      KeyDownArrowLeft = "keydown-arrowleft",
    }

    export const enum KeyUpEvent {
      KeyUpEnter = "keyup-enter",
      KeyUpDelete = "keyup-delete",
      KeyUpCtrl = "keyup-ctrl",
      KeyUpCtrlA = "keyup-ctrl+a",
      KeyUpCtrlB = "keyup-ctrl+b",
      KeyUpCtrlS = "keyup-ctrl+s",
      KeyUpCtrlC = "keyup-ctrl+c",
      KeyUpCtrlV = "keyup-ctrl+v",
      KeyUpCtrlX = "keyup-ctrl+x",
      KeyUpShift = "keyup-shift",
      KeyUpShiftA = "keyup-shift+a",
      KeyUpShiftB = "keyup-shift+b",
      KeyUpShiftC = "keyup-shift+c",
      KeyUpShiftV = "keyup-shift+v",
      KeyUpShiftX = "keyup-shift+x",
      KeyUpShiftS = "keyup-shift+s",
      KeyUpArrowRight = "keyup-arrowright",
      KeyUpArrowLeft = "keyup-arrowleft",
    }
  }
}

export const enum ShourtcutifySupportedEvents {
  KeyDown = "KeyDown",
  KeyUp = "KeyUp",
}

export const enum ShourtcutifyIdentifiers {
  KeyDown = "keydown",
  KeyUp = "keyup",
}

export const enum ShourtcutifyEventKeys {
  Enter = "enter",
  Delete = "delete",
  CtrlA = "ctrl+a",
  CtrlB = "ctrl+b",
  CtrlS = "ctrl+s",
  CtrlC = "ctrl+c",
  CtrlV = "ctrl+v",
  CtrlX = "ctrl+x",
}

export enum ShourtcutifyModifierKeys {
  Ctrl = "control",
  Alt = "alt",
  Shift = "shift",
  Meta = "meta",
}
