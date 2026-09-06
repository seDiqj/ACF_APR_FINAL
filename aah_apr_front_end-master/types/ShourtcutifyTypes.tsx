import {
  ShourtcutifyEventKeys,
  ShourtcutifyEvents,
  ShourtcutifyIdentifiers,
  ShourtcutifySupportedEvents,
} from "@/enums/Enums";

export type Key = "enter" | "delete" | "ctrl+a" | "ctrl+b";

export type ShourtcutifyEventsType = typeof ShourtcutifyEvents;

export type ShourtcutifySupportedEventsType = ShourtcutifySupportedEvents;

export type ShourtcutifyIdentifiersType = ShourtcutifyIdentifiers;

export type ShourtcutifyEventKeysType = ShourtcutifyEventKeys;

export type ShourtcutifyEventsValues<E> = E[keyof E];

export type ShourtcutifyKeysType =
  | ShourtcutifyEventsValues<
      typeof ShourtcutifyEvents.ShourtcutifyKeyboardEvents.KeyDownEvent
    >
  | ShourtcutifyEventsValues<
      typeof ShourtcutifyEvents.ShourtcutifyKeyboardEvents.KeyUpEvent
    >;

export type ShourtcutifyModifierKeysType = "control" | "shift" | "alt" | "meta";
// KEYBOARD

export type ShourtcutifyKeyboardEvents =
  | ShourtcutifyKeyDownEvents
  | ShourtcutifyKeyUpEvents;

export type ShourtcutifyKeyDownEvents =
  ShourtcutifyEvents.ShourtcutifyKeyboardEvents.KeyDownEvent;

export type ShourtcutifyKeyUpEvents =
  ShourtcutifyEvents.ShourtcutifyKeyboardEvents.KeyUpEvent;

// KEYBOARD

