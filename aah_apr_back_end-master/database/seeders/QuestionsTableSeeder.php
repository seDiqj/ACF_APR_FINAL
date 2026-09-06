<?php

namespace Database\Seeders;

use App\Models\Question;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class QuestionsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $assessments = [
            "communicationSkills" => ["None-verbal communication & active listening", "Verbal communication skills", "Report building & self-disclosure", "Demonstration of empathy, warmth & genuineness"],
            "assessmentAndUnderstanging" => [
                "Exploration & normalization of feelings",
                "Assessment of harm to self, harm to others, harm form others & developing collaborative response plan",
                "Connecting to social functioning & impact on life",
                "Exploration of client's & social support network's explanation for problem (casual & explanatory models)",
                "Appropriate involvement of family members & other close persons"
            ],
            "interventionSkills" => [
                "Explanation & promoting of confidentiality",
                "Collaborative goal setting & addressing client's expectations",
                "Promoting of realistic hope for change",
                "Incorporation of coping mechanisms & prior solutions",
                "Psychoeducation & use of local teminalogy"
            ],

            "follow-up & closure" => [
                "Elicitation of feedback when providing advice, suggestions & recommendations"
            ]
        ];

        foreach ($assessments as $group => $groupAssessments) {

            foreach ($groupAssessments as $assessment) {

                Question::create([
                    "group" => $group,
                    "description" => $assessment
                ]);

            }

        }
    }
}
