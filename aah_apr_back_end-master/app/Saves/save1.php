private function updateDessaggregationsFromBeneficiaries(Indicator $indicator, $beneficiaries, $provinceId)
    {
        // load dessaggregations for this indicator and province
        $dess = $indicator->dessaggregations()->where('province_id', $provinceId)->get();


        if ($dess->isEmpty()) return;

        // pre-calculate group/individual sessions totals and demographic buckets
        $groupTotal = 0;
        $individualTotal = 0;

        $demographics = [
            "Of Male (above 18)" => 0,
            "Of Female (above 18)" => 0,
            "of Male adolescents (12 to 17 years old)" => 0,
            "of Female adolescents (12 to 17 years old)" => 0,
            "of Male children (6 to 11 years old)" => 0,
            "of Female children (6 to 11 years old)" => 0,
            "of Male CU5 (boys)" => 0,
            "of Female CU5 (girls)" => 0,
        ];

        $demographicMonthDate = [
            "Of Male (above 18)" => array_fill(0, 12, 0),
            "Of Female (above 18)" => array_fill(0, 12, 0),
            "of Male adolescents (12 to 17 years old)" => array_fill(0, 12, 0),
            "of Female adolescents (12 to 17 years old)" => array_fill(0, 12, 0),
            "of Male children (6 to 11 years old)" => array_fill(0, 12, 0),
            "of Female children (6 to 11 years old)" => array_fill(0, 12, 0),
            "of Male CU5 (boys)" => array_fill(0, 12, 0),
            "of Female CU5 (girls)" => array_fill(0, 12, 0),
        ];

        foreach ($beneficiaries as $b) {
            if (! $b->indicators->contains('id', $indicator->id)) continue;

            // sessions relation already filtered to this beneficiary in main code
            $ind = $b->indicators->firstWhere('id', $indicator->id);
            if ($ind) {
                $groupTotal += $ind->sessions->whereNotNull('group')->count();
                $individualTotal += $ind->sessions->whereNull('group')->count();
            }

            // demographic buckets (count beneficiaries having this indicator)
            $age = (int) $b->age;
            $gender = strtolower($b->gender ?? '');
            $dateOfRegistration = is_string($b->dateOfRegistration)
                ? new Carbon($b->dateOfRegistration)
                : $b->dateOfRegistration;
            $monthIndex = (int) $dateOfRegistration->format("n") - 1;

            if ($gender === 'male' && $age >= 18) {
                $demographics["Of Male (above 18)"]++;
                $demographicMonthDate["Of Male (above 18)"][$monthIndex]++;
            } elseif ($gender === 'female' && $age >= 18) {
                $demographics["Of Female (above 18)"]++;
                $demographicMonthDate["Of Female (above 18)"][$monthIndex]++;
            } elseif ($gender === 'male' && $age >= 12 && $age <= 17) {
                $demographics["of Male adolescents (12 to 17 years old)"]++;
                $demographicMonthDate["of Male adolescents (12 to 17 years old)"][$monthIndex]++;
            } elseif ($gender === 'female' && $age >= 12 && $age <= 17) {
                $demographics["of Female adolescents (12 to 17 years old)"]++;
                $demographicMonthDate["of Female adolescents (12 to 17 years old)"][$monthIndex]++;
            } elseif ($gender === 'male' && $age >= 6 && $age <= 11) {
                $demographics["of Male children (6 to 11 years old)"]++;
                $demographicMonthDate["of Male children (6 to 11 years old)"][$monthIndex]++;
            } elseif ($gender === 'female' && $age >= 6 && $age <= 11) {
                $demographics["of Female children (6 to 11 years old)"]++;
                $demographicMonthDate["of Female children (6 to 11 years old)"][$monthIndex]++;
            } elseif ($gender === 'male' && $age >= 1 && $age <= 5) {
                $demographics["of Male CU5 (boys)"]++;
                $demographicMonthDate["of Male CU5 (boys)"][$monthIndex]++;
            } elseif ($gender === 'female' && $age >= 1 && $age <= 5) {
                $demographics["of Female CU5 (girls)"]++;
                $demographicMonthDate["of Female CU5 (girls)"][$monthIndex]++;
            }
        }

        // iterate dess and save appropriate achived_target
        foreach ($dess as $d) {

            $desc = trim($d->description);

            if (stripos($desc, 'group') !== false) {
                // any dessaggregation mentioning "group" -> groupTotal
                $d->achived_target = $groupTotal;

            } elseif (stripos($desc, 'indevidual') !== false || stripos($desc, 'individual') !== false) {
                // individual sessions
                $d->achived_target = $individualTotal;

            } elseif (array_key_exists($desc, $demographics)) {

                $d->achived_target = $demographics[$desc];

                $d->months = $demographicMonthDate[$desc];

            } else {
                // fallback: if dessaggregation has no special rule, try to set to indicator achived_target (or zero)
                $d->achived_target = $d->achived_target ?? 0;
            }

            
            $d->save();
        }
    }