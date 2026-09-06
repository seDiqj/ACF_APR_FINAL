/**
 * 
 * This file is a general lexer class for Shourcutify package version (0.0.1)
 * 
 * Written by Mohammad Mosa Barekzay (baregzay123@gmail.com) 12/20/2025
 * 
 * @copyright 2025 - 2027   Sadat-Upgrade corporation.
 * 
 */



class Lexer {
  /**
   * This property will be used to check if the current character should be include to final array or not.
   *
   * the value of this property will increase according to lenght of characters that should be passed.
   *
   * For example if the character is (a) there is some posibilities that its the a-key or alt-key so
   * it will check for it and if the two comming characters is (l) and t it will increase the value
   * of this property to 2 and returns the alt.
   * by this tric the main function that performs the toknization which is getStringPrimeryCharsList will
   * know that the two comming characters belongs to the alt-key and instead of them the function will returns
   * null.
   */

  private shouldBePass: number = 0;

  private getStringPrimeryCharsList(str: string): string[] {
    const strArray: string[] = Array.from(str);

    const manipulatedArray: any[] = strArray.map(
      (char: string, index: number) => {
        /**
         * If the shouldBePass property is greather then or equal to 1 then decrease the value of it and return null.
         */

        if (this.shouldBePass >= 1) {
          this.shouldBePass--;
          return null;
        }

        /**
         * If the character is (-) and the next character is (>) return (->) and pass next character.
         */

        if (char == "-") {
          if (!(strArray[index + 1] == ">")) {
            throw new Error(
              `Shortcutify Syntax Error 001: Expected -> but got -${strArray[index]}`
            );
          }

          this.shouldBePass++;
          return "->";
        } else if (char == "e") {
          /**
           * If the current character is (e) and the next 4 characters are (n,t,e,r) return (enter) and
           * pass next 4 characters.
           */
          if (strArray.slice(index, index + 5).join("") == "enter") {
            this.shouldBePass += 4;
            return "enter";
          }
        } else if (char == "a") {
          /**
           * If the current character is (a) and the next two characters are (l,t) return alt
           * and pass the next two characters.
           */
          if (strArray.slice(index, index + 3).join("") == "alt") {
            this.shouldBePass += 2;
            return "alt";
          }
        } else if (char == "s") {
          /**
           * If the current character is (s) and the next 4 characters are (h,i,f,t) return (shift)
           * and pass next 4 characters.
           */
          if (strArray.slice(index, index + 5).join("") == "shift") {
            this.shouldBePass += 4;
            return "shift";
          }
        } else if (char == "c") {
          /**
           * If the current character is (c) and the next 6 characters are (o,n,t,r,o,l) return (control)
           * and pass next 6 characters.
           */
          if (strArray.slice(index, index + 7).join("") == "control") {
            this.shouldBePass += 6;
            return "control";
          }
        } else if (char == "d") {
          /**
           * If the current character is (d) and the next 5 characters are (e,l,e,t,e) return (delete)
           * and pass next 5 characters.
           */
          if (strArray.slice(index, index + 6).join("") == "delete") {
            this.shouldBePass += 5;
            return "delete";
          }
        } else if (char == "t") {
          /**
           * If the current character is (t) and the next 2 characters are (a,b) return (tab)
           * and pass next 2 characters.
           */
          if (strArray.slice(index, index + 3).join("") == "tab") {
            this.shouldBePass += 2;
            return "tab";
          }
        }

        return char;
      }
    );

    /**
     * Remove all null values from array and return it.
     */

    return manipulatedArray.filter((item) => item != null);
  }

  /**
   * Tokanized array getter.
   *
   * @param str
   * @returns
   */

  public getFullyString = (str: string) => this.getStringPrimeryCharsList(str);
}

export default Lexer;
