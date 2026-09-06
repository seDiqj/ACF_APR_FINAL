class ShourtcutifyConstants {
  /**
   *
   * Checks if the terminal that passed to it is a key or not according to shourtcut grammer which is defined in Grammer.ts.
   *
   * @param terminal
   * @returns boolean
   */
  public isKeyAccToGrammer(terminal: string): boolean {
    if (terminal.length == 1)
      return terminal.charCodeAt(0) >= 97 && terminal.charCodeAt(0) <= 122;
    if (
      terminal == "enter" ||
      terminal == "alt" ||
      terminal == "control" ||
      terminal == "shift" ||
      terminal == "delete" ||
      terminal == "tab"
    )
      return true;
    return false;
  }

  /**
   *
   * Checks if the terminal that has been passed to it is a Or (|) or not according to shourtcut grammer which is defined in Grammer.ts.
   *
   * @param terminal
   * @returns boolean
   */
  public isOrTerminalAccToGrammer(terminal: string): boolean {
    return terminal.charCodeAt(0) == 124;
  }

  /**
   *
   * Checks if the terminal that has been passed to it is a arrow or not according to shourcut grammer which is defined in Grammer.ts.
   *
   * @param terminal
   * @returns boolean
   */
  public isArrowAccToGrammer(terminal: string): boolean {
    return terminal == "->";
  }

  /**
   *
   * Checks if the terminal that has been passed to it is an open ( ( ) or not according to shourtcut grammer which is defined in Grammer.ts.
   *
   * @param terminal
   * @returns boolean
   */
  public isOpenAccToGrammer(terminal: string): boolean {
    return terminal.charCodeAt(0) == 40;
  }

  /**
   *
   * Checks if the terminal that has been passed to it is an close ( ) ) or not according to shourtcut grammer which is defined in Grammer.ts.
   *
   * @param terminal
   * @returns boolean
   */
  public isCloseAccToGrammer(terminal: string): boolean {
    return terminal.charCodeAt(0) == 41;
  }
}

export default ShourtcutifyConstants;
