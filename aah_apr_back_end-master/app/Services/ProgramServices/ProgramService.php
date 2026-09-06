<?php

namespace App\Services\ProgramServices;

use App\Constants\System;
use App\Models\Program;

class ProgramService {

    public function getProgram (string $id): Program | string {

        $program = Program::find($id);

        if (!$program)
            return System::SYSTEM_PROGRAM_404;

        return $program;
        
    }

}