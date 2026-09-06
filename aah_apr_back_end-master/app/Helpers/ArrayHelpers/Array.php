<?php

namespace App\Helpers\ArrayHelpers;

use App\Constants\ArrConstants;

class Arr {

    private array $array = [];

    private string $arrayElementsType = ArrConstants::TYPE_T;

    public function __construct(?array $array = [], ?string $type = ArrConstants::TYPE_T, ?int $maxSize = 0) {
        $this->array = $array ?? [];
    }

    public function map (callable $callback, ?bool $influanceMainArray = false): array {

        $mappedArray = [];

        foreach ($this->array as $item) {

            $mappedArray[] = $callback($item) ?? null;
        
        }

        if ($influanceMainArray)
            $this->array = $mappedArray;

        return $mappedArray;
    
    }

    public function filter (callable $callback, ?bool $influanceMainArray = false): array {

        $filterdArray = [];

        foreach ($this->array as $item) {

            if ($callback($item))
                $filterdArray[] = $item;                

        }

        if ($influanceMainArray)
            $this->array = $filterdArray;

        return $filterdArray;

    }

    public function find (callable $callback, ?int $fromIndex = null, ?int $toIndex = null): mixed {

        foreach ($this->array as $item) {

            if ($callback($item)) return $item;
                
        }

        return null;

    }

    public function push (mixed $item): array {

        $this->array[] = $item;

        return $this->array;

    }

    public function pop (): mixed {

        $lastElement = $this->array[$this->getArrayLength() - 1];

        unset($this->array[$this->getArrayLength() - 1]);

        return $lastElement;

    }

    public function some (callable $callback): bool {

        $some = false;

        foreach ($this->array as $item) {

            if ($callback($item)) {

                $some = true;
                break;

            }

        }

        return $some;

    }

    public function every (callable $callback): bool {

        $every = true;

        foreach ($this->array as $item) {

            if (!$callback($item)) {

                $every = false;
                break;

            }

        }

        return $every;
    }

    public function fill (int $start, int $count, int | callable $value): array {

        for ($i = $start; $i <= $count; $i++) {

            $this->array[$i] = is_callable($value) ? $value() : $value;

        }

        return $this->array;

    }

    public function lastThatMatches (callable $callback): array | null {

        $matches = null;

        foreach ($this->array as $item) {

            if ($callback($item))
                $matches = $item;

        }

        return $matches;

    }

    public function howMany (callable $callback): int {

        $howMany = 0;

        foreach ($this->array as $item) {

            if ($callback($item))
                $howMany++;

        }

        return $howMany;

    }

    public function howManyNot (callable $callback): int {

        $howManyNot = 0;

        foreach ($this->array as $item) {

            if (!$callback($item))
                $howManyNot++;

        }

        return $howManyNot;
    }

    public function merge (array $array, bool $influanceMainArray = false): array {

        $mergedArray = $this->array + $array;

        if ($influanceMainArray)
            $this->array = $mergedArray;

        return $mergedArray;

    }

    public function isEmpty (): bool {

        return $this->getArrayLength() == 0;
    
    }

    public function isNotEmpty (): bool {

        return $this->getArrayLength() != 0;

    }

    public function includes (mixed $item): bool {

        foreach ($this->array as $arrItem) {

            if ($arrItem == $item)
                return true;

        }

        return false;

    }

    public function indexOf (mixed $item): int | null {

        foreach ($this->array as $index => $arrItem) {

            if ($arrItem == $item)
                return $index;

        }

        return null;

    }

    public function at (int $index): mixed {

        return $this->array[$index];

    }

    public function findLastIndex (mixed $item): int | null {

        $lastIndex = null;

        foreach ($this->array as $index => $arrItem) {

            if ($arrItem == $item)
                $lastIndex = $index;

        }

        return $lastIndex;

    }

    public function slice (?int $start, ?int $end): array {

        $start = $start ?? 0;

        $end = $end ?? $this->getArrayLength() - 1;

        $slicedArray = [];

        for ($i = $start; $i <= $end; $i++)
            $slicedArray[] = $this->array[$i];
        
        return $slicedArray;

    }

    public function reverce (bool $influanceMainArray = false): array {

        $reversedArray = [];

        for ($i = $this->getArrayLength(); $i >= 0; $i--)
            $reversedArray[] = $this->array[$i];

        if ($influanceMainArray)
            $this->array = $reversedArray;

        return $reversedArray;

    }

    public function join (?string $separator): string {

        $separator = $separator ?? " ";

        $joinedString = "";

        foreach ($this->array as $item) {

            $joinedString .= $item;

        }

        return $joinedString;

    }

    public function flat (?int $depth, ?bool $influanceMainArray = false): array {

        $depth = $depth ?? 1;

        $flatedArray = [];

        foreach ($this->array as $item) {

            if (is_array($item))
                $flatedArray = [...$flatedArray, ...$item];

            else 

                $flatedArray[] = $item;

        }

        if ($influanceMainArray)
            $this->array = $flatedArray;

        return $flatedArray;

    }

    public function shift (?bool $influanceMainArray = false): mixed {

        $firstElement = $this->array[0];

        if ($influanceMainArray)
            unset($this->array[0]);

        return $firstElement;

    }

    public function unShift (mixed $item, ?bool $influanceMainArray = false): array {

        $unShiftedArray = [$item, ...$this->array];

        if ($influanceMainArray)
            $this->array = $unShiftedArray;

        return $unShiftedArray;

    }

    public function replaceWith (int $index, mixed $value, ?bool $influanceMainArray = false): array {

        $modifiedArray = $this->array;

        $modifiedArray[$index] = $value;

        if ($influanceMainArray)
            $this->array = $modifiedArray;

        return $modifiedArray;

    }

    public function toString (): string {

        $stringfiedArray = "[";

        foreach ($this->array as $item) {

            $stringfiedArray .= $item . "," ;

        }

        return $stringfiedArray .= "]";
    }

    public function combineWith (array $array): array {

        $combinedArray = [];

        $counter = 0;

        foreach ($this->array as $key => $item) {

                $combinedArray[$key] = $array[$counter] ?? null;

        }

        return $combinedArray;

    }

    public function countValues (): array {

        $arrayCount = [];

        foreach ($this->array as $item) {

            if (isset($arrayCount["$item"])) 
                $arrayCount["$item"]++;
            else 
                $arrayCount["$item"] = 1;

        }

        return $arrayCount;

    }

    public function countValueOf (mixed $item): int {

        $counter = 0;

        foreach ($this->array as $arrItem) {

            if ($arrItem == $item)
                $counter ++;

        }

        return $counter;

    }

    public function replace (mixed $previos, mixed $new, ?bool $influanceMainArray = false): array {

        $manipulatedArray = $this->array;

        foreach ($manipulatedArray as $key => $item) {

            if ($item == $previos) 
                $manipulatedArray[$key] = $new;

        }

        if ($influanceMainArray)
            $this->array = $manipulatedArray;

        return $manipulatedArray;

    }

    public function sum (): int {

        $sum = 0;

        foreach ($this->array as $item) {

            $sum += $item;

        }

        return $sum;
    }

    public function random (): mixed {

        $randomItem = $this->array[rand(0, $this->getArrayLength() - 1)];

        return $randomItem;

    }

    public function getArray (): array {
        
        return $this->array;

    }

    private function getArrayLength (): int {
        return count($this->array);
    }

    private function DoTheTypesHaveMatch (mixed $item): bool {

        $itemType = gettype($item);   
        
        if ($itemType == $this->arrayElementsType)
            return true;

        return false;

    }
}