class ArrayHelper {
  public static sortNumberArrayAssending(array: number[]): number[] {
    return array.sort((a: number, b: number) => (a > b ? a : b));
  }

  public static sortNumberArrayDessending(array: number[]): number[] {
    return array.sort((a: number, b: number) => (a < b ? a : b));
  }

  public static sortStringArrayAssending(array: string[]): string[] {
    let newArray: string[] = [];

    for (let i = 0; i <= array.length; i++) {
      if (array[i].charAt(0) > array[i + 1].charAt(0)) newArray.push(array[i]);
      else newArray.push(array[i + 1]);
    }

    return newArray;
  }

  public static sortStringArrayDessending(array: string[]): string[] {
    let newArray: string[] = [];

    for (let i = 0; i <= array.length; i++) {
      if (array[i].charAt(0) < array[i + 1].charAt(0)) newArray.push(array[i]);
      else newArray.push(array[i + 1]);
    }

    return newArray;
  }

  public static sortObjectArrayAssendingAccToNumberMember(
    array: any[],
    member: string,
  ): any[] {
    let newArray: any[] = [];

    for (let i = 0; i <= array.length; i++) {
      if (array[i][member] > array[i + 1][member]) newArray.push(array[i]);
      else newArray.push(array[i + 1]);
    }

    return newArray;
  }
}

export default ArrayHelper;
