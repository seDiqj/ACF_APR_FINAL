class StringHelper {
  /**
   *
   * Converts a camel case type string to space between type string.
   *
   * EX: javascriptIsAScriptLanguage  =>  javascript is a script language
   *
   * @param @string str
   * @returns @string newStr
   */

  public static camelToSpaceBetween(str: string): string {
    const strArr: string[] = Array.from(str);

    let newStr: string = "";

    for (const char of strArr) {
      if (this.isUpperCase(char)) {
        newStr += ` ${char.toLowerCase()}`;
      } else {
        newStr += char;
      }
    }

    return newStr;
  }

  /**
   *
   * Converts a camel case type string to underscore between type string.
   *
   * EX: javascriptIsAScriptLanguage  =>  javascript_is_a_script_language.
   *
   * @param @string str
   * @returns @string newStr
   */

  public static camelToUnderscoreBetween(str: string) {
    const strArr: string[] = Array.from(str);

    let newStr: string = "";

    for (const char of strArr) {
      if (this.isUpperCase(char)) {
        newStr += `_${char.toLowerCase()}`;
      } else {
        newStr += char;
      }
    }

    return newStr;
  }

  /**
   *
   * Converts a space between type string to camel case type string.
   *
   * EX: javasript is a script language  =>  javascriptIsAScriptLanguage.
   *
   * @param @string str
   * @returns @string newStr
   */
  public static spaceBetweenToCamel(str: string): string {
    const strArr: string[] = Array.from(str);

    let newStr: string = "";

    let wasSpace: boolean = false;

    for (const char of strArr) {
      if (this.isSpace(char)) {
        wasSpace = true;
        continue;
      }

      if (wasSpace) {
        newStr += char.toUpperCase();
        wasSpace = false;
      } else newStr += char;
    }

    return newStr;
  }

  /**
   *
   * Converts a underscore between type string to camel case type string.
   *
   * EX: javasrcipt_is_a_script_language  =>  javascriptIsASctiptLanguage.
   *
   * @param @string str
   * @returns @string newStr
   */
  public static underscoreBetweenToCamel(str: string): string {
    const strArr: string[] = Array.from(str);

    let newStr: string = "";

    let wasUnderscore: boolean = false;

    for (const char of strArr) {
      if (this.isUnderscore(char)) {
        wasUnderscore = true;
        continue;
      }

      if (wasUnderscore) {
        newStr += char.toUpperCase();
        wasUnderscore = false;
      } else newStr += char;
    }

    return newStr;
  }

  /**
   *
   * Converts a space between type string to underscore between type string.
   *
   * EX: javasript is a script language  => javasript_is_a_script_language.
   *
   * @param @string str
   * @returns @string newStr
   */
  public static spaceBetweenToUnderscoreBetween(str: string): string {
    const strArr: string[] = Array.from(str);

    let newStr: string = "";

    let wasSpace: boolean = false;

    for (const char of strArr) {
      if (this.isSpace(char)) {
        wasSpace = true;
        continue;
      }

      if (wasSpace) {
        newStr += `_${char}`;
        wasSpace = false;
      } else newStr += char;
    }

    return newStr;
  }

  /**
   *
   * Converts a underscore between type string to space between type string.
   *
   * EX: javascript_is_a_script_language  => javascript is a script language.
   *
   * @param @string str
   * @returns @string newStr
   */
  public static underscoreBetweenToSpaceBetween(str: string): string {
    const strArr: string[] = Array.from(str);

    let newStr: string = "";

    let wasUnderscore: boolean = false;

    for (const char of strArr) {
      if (this.isUnderscore(char)) {
        wasUnderscore = true;
        continue;
      }

      if (wasUnderscore) {
        newStr += ` ${char}`;
        wasUnderscore = false;
      } else newStr += char;
    }

    return newStr;
  }

  /**
   *
   * Converts a string to capitlized type string.
   *
   * EX: javascript is a script language  =>  Javascript Is A Script Language.
   *
   * @param @string str
   * @returns @string newStr
   */
  public static capitlize(str: string): string {
    const strArr: string[] = Array.from(str).map((char, index) =>
      index == 0 ? char.toUpperCase() : char
    );

    let newStr: string = "";

    let separator: false | string = false;

    for (const char of strArr) {
      if (this.isSeparator(char)) {
        separator = char;
        continue;
      }

      if (separator) {
        newStr += separator + char.toUpperCase();
        separator = false;
      } else newStr += char;
    }

    return newStr;
  }

  /**
   *
   * Converts the string to normal form.
   *
   * EX: javascriptIs a script_languagE. it use to_creating websites  =>  Javascript is a script language. It use to creating websites.
   *
   * @param @string str
   * @returns @string newStr
   */
  public static normalize(str: string): string {
    const strArr: string[] = Array.from(this.camelToUnderscoreBetween(str)).map(
      (char, index) => (index == 0 ? char.toUpperCase() : char)
    );

    let newStr: string = "";

    let wasDot: boolean = false;
    let wasSeparator: boolean = false;

    for (const char of strArr) {
      if (this.isDot(char)) {
        newStr += char;
        wasDot = true;
        continue;
      } else if (this.isSeparator(char)) {
        wasSeparator = true;
        continue;
      }

      if (wasDot) {
        if (this.isSpace(char)) {
          continue;
        }
        newStr += char.toUpperCase();
        wasDot = false;
        wasSeparator = false;
      } else if (wasSeparator) {
        newStr += " " + char.toLowerCase();
        wasSeparator = false;
      } else {
        newStr += char;
      }
    }

    return newStr;
  }

  /**
   *
   * Check's if the input character is a uppercase character or not.
   *
   * @param @character char
   * @returns @boolean
   */
  private static isUpperCase(char: string): boolean {
    return char.charCodeAt(0) >= 65 && char.charCodeAt(0) <= 90;
  }

  /**
   *
   * Check's if the input character is a lowercase character or not.
   *
   * @param @character char
   * @returns @boolean
   */
  private static isLowerCase(char: string): boolean {
    return !this.isUpperCase(char);
  }

  /**
   *
   * Converts every single character to lowercase version.
   *
   * @param @character char
   * @returns @boolean
   */
  private static toLowerCase(str: string): string {
    return str.toLowerCase();
  }

  /**
   *
   * Converts every single character to uppercase version.
   *
   * @param @character char
   * @returns @boolean
   */
  private static toUpperCase(str: string): string {
    return str.toUpperCase();
  }

  /**
   *
   * Check's if the input character is a space or not.
   *
   * @param @character char
   * @returns @boolean
   */
  private static isSpace(char: string): boolean {
    return char.charCodeAt(0) == 32;
  }

  /**
   *
   * Check's if the input character is a underscore or not.
   *
   * @param @character char
   * @returns @boolean
   */
  private static isUnderscore(char: string): boolean {
    return char.charCodeAt(0) == 95;
  }

  /**
   *
   * Check's if the input character is a dot (.) or not.
   *
   * @param @character char
   * @returns @boolean
   */
  private static isDot(char: string): boolean {
    return char.charCodeAt(0) == 46;
  }

  /**
   *
   * Check's if the input character is a separator or not.
   *
   *
   * @param @character char
   * @returns @boolean
   */
  private static isSeparator(char: string): boolean {
    return this.isUnderscore(char) || this.isSpace(char);
  }
}

export default StringHelper;
