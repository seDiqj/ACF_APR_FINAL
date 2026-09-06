
final_apr = {
    "impact": "Vulnerable receiving focused MHPSS care",
    "outcomes": [
        {
            "name": "Communities have increased access to MHPSS services",
            "outputs": [
                {
                    "name": "Output 1: Hotline & remote services",
                    "indicators": [
                        {
                            "code": "1.1.1",
                            "name": "Dedicated hotline - psychosocial support",
                            "disaggregation": [
                                {"name": "# of Male (above 18)", "target": 26, "months": [5, 8, 13, 0, 0, 0, 0, 0, 0, 2, 1, 1]},
                                {"name": "# of Female (above 18)", "target": 1188, "months": [400, 390, 398, 0, 0, 0, 1, 0, 0, 1, 1, 0]},
                                {"name": "# of Male under 18", "target": 26, "months": [5, 8, 8, 0, 0, 0, 0, 0, 0, 1, 1, 0]},
                            ]
                        },
                        {
                            "code": "1.1.2",
                            "name": "Women friendly spaces - MHPSS sessions",
                            "disaggregation": [
                                {"name": "# of Female (above 18)", "target": 1458, "months": [450, 500, 508, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                                {"name": "# of Male (above 18)", "target": 32, "months": [10, 12, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                            ]
                        }
                    ]
                },
                {
                    "name": "Output 2: Community outreach",
                    "indicators": [
                        {
                            "code": "1.2.1",
                            "name": "Awareness sessions in schools",
                            "disaggregation": [
                                {"name": "Boys", "target": 120, "months": [40, 40, 40, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                                {"name": "Girls", "target": 130, "months": [40, 45, 45, 0, 0, 0, 0, 0, 0, 0, 0, 0]},
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}



total_indicators = 0
total_disaggregations = 0




for outcome in final_apr["outcomes"]:
    for output in outcome["outputs"]:
        for indicator in output["indicators"]:
            total_indicators += 1
            total_disaggregations += len(indicator.get("disaggregation", []))

print("تعداد کل Indicators:", total_indicators)
print("تعداد کل Disaggregation ها:", total_disaggregations)