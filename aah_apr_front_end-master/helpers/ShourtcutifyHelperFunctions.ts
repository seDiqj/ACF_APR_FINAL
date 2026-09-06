const keyMap: Record<string, string> = {
  // (a<->s)<->d<-f
  "a=s+d+f+d": "hello",
  "d+f+d+a=s": "world",
};

// key = s+a+d+f+d
function keyCompilerfunc(key: string): string {
  const keyMapValues: string[] = Object.values(keyMap);

  const keyCharsList = Array.from(key);

  outerLoop: for (const value of keyMapValues) {
    if (key.length != value.length) continue;
    if (!keyCharsList.every((ch) => value.includes(ch))) continue;
    let keyTilNow = "";
    let index = 0;
    // key = s+a+d+f+d
    // keyMapValue = "(a=s)=d+f+d"
    for (let i = 0; i <= value.length; i++) {
      if (key[index] == "+") {
        index++;
        continue;
      }
      const keyChar: string = keyCharsList[index];
      const valueChar: string = value[index];

      if (keyChar === valueChar) {
        if (index == 0) {
          keyTilNow += keyChar;
          index++;
        } else {
          keyTilNow += `+${keyChar}`;
          index++;
        }
      } else {
        if (value[index + 1] == "=" && value[index + 2] == keyChar) {
          if (keyChar[index + 2] == valueChar) {
            keyTilNow += `${value[index]}=${keyChar}`;
            index += 3;
          } else {
            continue outerLoop;
          }
        } else {
          index++;
        }
      }
    }
  }

  return "";
}
