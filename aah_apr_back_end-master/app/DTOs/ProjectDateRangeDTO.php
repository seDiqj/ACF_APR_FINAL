<?php

namespace App\DTOs;


class ProjectDateRangeDTO {

    public function __construct(
            public string $startDate,
            public string $endDate,
    ){}
    
}