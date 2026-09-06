<?php

namespace App\Services\DatabaseServices;

use App\Constants\System;
use App\Models\Database;

class DatabaseService {


    public function getDatabaseViaId (string $id): Database | string {

        $database = Database::find($id);

        if (!$database)
            return System::SYSTEM_DATABASE_404;

        return $database;

    }

    public function getDatabaseViaName (string $name): Database | string {

        $database = Database::where("name", $name)->first();

        if (!$database) 
            return System::SYSTEM_DATABASE_404;

        return $database;

    }

}