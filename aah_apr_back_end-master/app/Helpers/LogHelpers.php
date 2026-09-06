<?php 

namespace App\Helpers;

class LogHelpers {

    public static function logArrToConsole (array $arr) : void
    {
        self::log(self::arrToStr($arr));
    }

    private static function arrToStr (array $arr) : string
    {
        return json_encode($arr, true);
    }

    private static function log (string $str): void
    {
        error_log($str);
    }
}

