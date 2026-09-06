class ShortcutifyError {
  public static syntaxError(expected: string, got: string) {
    throw new Error(`SyntaxError: Expected ${expected} but got ${got}`);
  }

  public static invalidEventTypeError(got: string) {
    throw new Error(
      `InvalidEventTypeError: Expected (keydown or keyup) but got ${got}`
    );
  }

  public static closingTagMissingError() {
    throw new Error(`ClosingTagMissingError: Some closing tags are missed`);
  }

  public static openTagMissingError() {
    throw new Error(`OpenTagMissingError: Some open tags are missed`);
  }

  public static invalidKeyError(got: string) {
    throw new Error(`InvalidKeyError: ${got} is not a valid key`);
  }

  public static invalidCallbackError(got: any) {
    throw new Error(`InvalidCallbackError: ${got} is not a valid callback`);
  }

  public static leftSideKeyMissingError(got: string) {
    throw new Error(
      `LeftSideKeyMissingError: Left side of -> or | should be a valid key or group, got ${got}`
    );
  }

  public static rightSideKeyMissingError(got: string) {
    throw new Error(
      `RightSideKeyMissingError: Right side of -> or | should be a valid key or group, got ${got}`
    );
  }

  public static shortcutReRegisterationError(key: string) {
    throw new Error(
      `ShortcutReRegistationError: The shortcut ${key} registered more then one time`
    );
  }
}
