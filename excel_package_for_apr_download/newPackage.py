from __future__ import annotations

from pathlib import Path
from typing import Any, Dict, List, Tuple

from openpyxl import Workbook
from openpyxl.styles import (
    Alignment,
    Border,
    Font,
    PatternFill,
    Side,
)
from openpyxl.utils import get_column_letter


# ============================================================
# CONFIG
# ============================================================

OUTPUT_FILE = (
    Path(__file__).resolve().parent
    / "APR_Monitoring_Test.xlsx"
)

MONTHS = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
]

QUARTERS = [
    "Q1",
    "Q2",
    "Q3",
    "Q4",
]

# Exact names from JSX
ENACT_COUNSELLORS = (
    "# of supervised psychosocial counsellors"
)

ENACT_SCORE = (
    "# Accumulated score EQUIP (ENACT) Tool"
)

SPECIAL_DISAGGS = [
    ENACT_COUNSELLORS,
    ENACT_SCORE,
]


# ============================================================
# COLORS
# ============================================================

GREEN_DARK = "217346"
GREEN_MAIN = "70AD47"
GREEN_LIGHT = "E2F0D9"

BLUE_DARK = "4472C4"
BLUE_LIGHT = "D9EAF7"

GRAY_DARK = "666666"
GRAY_LIGHT = "F2F2F2"

WHITE = "FFFFFF"
BLACK = "000000"

ORANGE = "FCE4D6"

# ISP3
ISP3_DARK = "1E3A5F"
ISP3_LIGHT = "EEF2FF"

BORDER_COLOR = "B7B7B7"


# ============================================================
# FILLS
# ============================================================

green_header_fill = PatternFill(
    fill_type="solid",
    fgColor=GREEN_DARK,
)

green_main_fill = PatternFill(
    fill_type="solid",
    fgColor=GREEN_MAIN,
)

green_light_fill = PatternFill(
    fill_type="solid",
    fgColor=GREEN_LIGHT,
)

quarter_header_fill = PatternFill(
    fill_type="solid",
    fgColor=BLUE_DARK,
)

quarter_body_fill = PatternFill(
    fill_type="solid",
    fgColor=BLUE_LIGHT,
)

gray_header_fill = PatternFill(
    fill_type="solid",
    fgColor=GRAY_DARK,
)

gray_fill = PatternFill(
    fill_type="solid",
    fgColor=GRAY_LIGHT,
)

orange_fill = PatternFill(
    fill_type="solid",
    fgColor=ORANGE,
)

isp3_section_fill = PatternFill(
    fill_type="solid",
    fgColor=ISP3_DARK,
)

isp3_body_fill = PatternFill(
    fill_type="solid",
    fgColor=ISP3_LIGHT,
)


# ============================================================
# FONTS
# ============================================================

font_header = Font(
    name="Calibri",
    size=11,
    bold=True,
    color=WHITE,
)

font_header_small = Font(
    name="Calibri",
    size=10,
    bold=True,
    color=WHITE,
)

font_body = Font(
    name="Calibri",
    size=10,
    color=BLACK,
)

font_body_bold = Font(
    name="Calibri",
    size=10,
    bold=True,
    color=BLACK,
)

font_small = Font(
    name="Calibri",
    size=9,
    color=BLACK,
)

# ENACT now uses exactly the same
# normal body style as other indicators.
font_enact = Font(
    name="Calibri",
    size=10,
    bold=True,
    color=BLACK,
)

# ISP3 body
font_isp3 = Font(
    name="Calibri",
    size=11,
    bold=True,
    color="374151",
)

# Larger ISP3 section title
font_isp3_section = Font(
    name="Calibri",
    size=15,
    bold=True,
    color=WHITE,
)


# ============================================================
# BORDERS
# ============================================================

thin_side = Side(
    style="thin",
    color=BORDER_COLOR,
)

medium_side = Side(
    style="medium",
    color="7F7F7F",
)

thin_border = Border(
    left=thin_side,
    right=thin_side,
    top=thin_side,
    bottom=thin_side,
)

section_border = Border(
    left=medium_side,
    right=medium_side,
    top=medium_side,
    bottom=medium_side,
)


# ============================================================
# ALIGNMENTS
# ============================================================

# IMPORTANT:
# All normal table cells are centered horizontally
# and vertically.

center_alignment = Alignment(
    horizontal="center",
    vertical="center",
    wrap_text=True,
)

left_alignment = Alignment(
    horizontal="center",
    vertical="center",
    wrap_text=True,
)

top_left_alignment = Alignment(
    horizontal="center",
    vertical="center",
    wrap_text=True,
)

isp3_alignment = Alignment(
    horizontal="center",
    vertical="center",
    wrap_text=True,
)


# ============================================================
# HELPERS
# ============================================================

def safe_number(value: Any) -> float:
    """
    Convert values to numeric values safely.
    """

    if value is None:
        return 0

    if isinstance(value, bool):
        return int(value)

    try:
        return float(value)

    except (TypeError, ValueError):
        return 0


def clean_number(value: float) -> int | float:
    """
    Avoid writing 10.0 into Excel when the value
    is actually 10.
    """

    if float(value).is_integer():
        return int(value)

    return value


def ensure_months(
    months: List[Any] | None,
    count: int = 12,
) -> List[float]:
    """
    Normalize month array.

    Missing values become 0.
    """

    months = months or []

    result: List[float] = []

    for i in range(count):

        if i < len(months):
            result.append(
                safe_number(months[i])
            )

        else:
            result.append(0)

    return result


def enact_label(ratio: float) -> str:
    """
    Exact JSX threshold logic.
    """

    if ratio >= 0.95:
        return "Excellent Performance"

    if ratio >= 0.75:
        return "Good Performance"

    if ratio >= 0.65:
        return "Fair Performance"

    if ratio >= 0.50:
        return "Needs Improvement"

    return "Poor Performance"


def calculate_enact(
    counsellors: List[Any],
    scores: List[Any],
) -> Tuple[List[str], List[str]]:
    """
    Exact equivalent of JSX ENACT calculation.

    Monthly:
        score / (counsellors * 60 || 1)

    Quarter:
        average of the three monthly ratios
    """

    dm1 = counsellors or []
    dm2 = scores or []

    month_count = max(
        len(dm1),
        len(dm2),
    )

    dm1_ensured = [
        safe_number(dm1[i])
        if i < len(dm1)
        else 0
        for i in range(month_count)
    ]

    dm2_ensured = [
        safe_number(dm2[i])
        if i < len(dm2)
        else 0
        for i in range(month_count)
    ]

    each_month_label: List[str] = []

    # --------------------------------------------------------
    # Monthly labels
    # --------------------------------------------------------

    for i in range(month_count):

        denominator = (
            dm1_ensured[i] * 60
        )

        if denominator == 0:
            denominator = 1

        ratio = (
            dm2_ensured[i]
            / denominator
        )

        each_month_label.append(
            enact_label(ratio)
        )

    # --------------------------------------------------------
    # Quarterly labels
    # --------------------------------------------------------

    each_quarter_label: List[str] = []

    for i in range(
        0,
        month_count,
        3,
    ):

        quarter_ratios: List[float] = []

        for j in range(3):

            if i + j >= month_count:
                break

            denominator = (
                dm1_ensured[i + j] * 60
            )

            if denominator == 0:
                denominator = 1

            ratio = (
                dm2_ensured[i + j]
                / denominator
            )

            quarter_ratios.append(
                ratio
            )

        if not quarter_ratios:
            continue

        quarter_avg = (
            sum(quarter_ratios)
            / len(quarter_ratios)
        )

        each_quarter_label.append(
            enact_label(quarter_avg)
        )

    return (
        each_month_label,
        each_quarter_label,
    )


def is_enact_indicator(
    indicator: Dict[str, Any]
) -> bool:
    """
    Exact JSX condition:

    specialDisaggs.every(...)
    &&
    disaggNames.length === 2
    """

    disaggregations = indicator.get(
        "disaggregation",
        []
    )

    names = [
        d.get("name", "")
        for d in disaggregations
    ]

    return (
        all(
            name in names
            for name in SPECIAL_DISAGGS
        )
        and len(names) == 2
    )


def sum_months(
    disaggregation: List[Dict[str, Any]],
    month_count: int,
) -> List[float]:

    result: List[float] = []

    for month_index in range(
        month_count
    ):

        total = 0

        for d in disaggregation:

            months = (
                d.get("months")
                or []
            )

            if month_index < len(months):

                total += safe_number(
                    months[month_index]
                )

        result.append(total)

    return result


def normal_indicator_calculation(
    indicator: Dict[str, Any],
    month_count: int,
) -> Tuple[
    List[float],
    float,
    float,
    str,
]:

    disaggregations = indicator.get(
        "disaggregation",
        []
    )

    months_sum = sum_months(
        disaggregations,
        month_count,
    )

    total_target = sum(
        safe_number(
            d.get("target", 0)
        )
        for d in disaggregations
    )

    total_achievement = sum(
        months_sum
    )

    if total_target:

        percent = (
            total_achievement
            / total_target
        ) * 100

        percent_achieved = (
            f"{percent:.2f}"
        )

    else:

        percent_achieved = "0"

    return (
        months_sum,
        total_target,
        total_achievement,
        percent_achieved,
    )


# ============================================================
# SYNTHETIC TEST DATA
# ============================================================

def make_normal_disaggregation(
    name: str,
    target: int,
    months: List[int],
) -> Dict[str, Any]:

    return {
        "name": name,
        "target": target,
        "months": months,
    }


def make_enact_indicator(
    code: str,
    index: int,
) -> Dict[str, Any]:

    performance_ratios = [
        1.00,
        0.85,
        0.70,
        0.55,
        0.30,
    ]

    ratio = performance_ratios[
        index
        % len(performance_ratios)
    ]

    counsellors = [
        4
        for _ in range(12)
    ]

    scores = [
        int(
            4 * 60 * ratio
        )
        for _ in range(12)
    ]

    return {
        "code": code,
        "name": (
            "ENACT Performance Indicator "
            f"{index + 1}"
        ),
        "disaggregation": [
            {
                "name": ENACT_COUNSELLORS,
                "target": 4,
                "months": counsellors,
            },
            {
                "name": ENACT_SCORE,
                "target": 240,
                "months": scores,
            },
        ],
    }


def make_normal_indicator(
    code: str,
    index: int,
) -> Dict[str, Any]:

    disaggregations = []

    for d_index in range(5):

        base = (
            5
            + d_index
            + (index % 4)
        )

        months = [
            base
            + (
                (m + index + d_index)
                % 5
            )
            for m in range(12)
        ]

        disaggregations.append(
            make_normal_disaggregation(
                name=(
                    f"Disaggregation "
                    f"{d_index + 1}"
                ),
                target=sum(months) + 20,
                months=months,
            )
        )

    return {
        "code": code,
        "name": (
            f"Normal Indicator "
            f"{index + 1}"
        ),
        "disaggregation": (
            disaggregations
        ),
    }


def make_isp3_indicator(
    code: str,
    index: int,
) -> Dict[str, Any]:

    disaggregations = []

    for d_index in range(3):

        base = (
            8
            + d_index
            + (index % 3)
        )

        months = [
            base
            + (
                (m + index + d_index)
                % 4
            )
            for m in range(12)
        ]

        disaggregations.append(
            make_normal_disaggregation(
                name=(
                    f"ISP3 Disaggregation "
                    f"{d_index + 1}"
                ),
                target=sum(months) + 15,
                months=months,
            )
        )

    return {
        "indicatorRef": (
            f"ISP3-I{index + 1}"
        ),
        "indicator": (
            f"ISP3 Indicator "
            f"{index + 1}"
        ),
        "disaggregation": (
            disaggregations
        ),
    }


def create_test_data() -> Dict[str, Any]:

    outcomes = []

    global_indicator_index = 0

    for outcome_index in range(8):

        outputs = []

        for output_index in range(5):

            indicators = []

            # ------------------------------------------------
            # 10 normal indicators
            # ------------------------------------------------

            for _ in range(10):

                indicators.append(
                    make_normal_indicator(
                        code=(
                            f"O{outcome_index + 1}"
                            f".OP{output_index + 1}"
                            f".I{len(indicators) + 1}"
                        ),
                        index=(
                            global_indicator_index
                        ),
                    )
                )

                global_indicator_index += 1

            # ------------------------------------------------
            # 3 ENACT indicators
            # ------------------------------------------------

            for _ in range(3):

                indicators.append(
                    make_enact_indicator(
                        code=(
                            f"O{outcome_index + 1}"
                            f".OP{output_index + 1}"
                            f".E{len(indicators) + 1}"
                        ),
                        index=(
                            global_indicator_index
                        ),
                    )
                )

                global_indicator_index += 1

            outputs.append(
                {
                    "name": (
                        f"Output "
                        f"{outcome_index + 1}."
                        f"{output_index + 1}"
                    ),
                    "indicators": indicators,
                }
            )

        outcomes.append(
            {
                "name": (
                    f"Outcome "
                    f"{outcome_index + 1}"
                ),
                "outputs": outputs,
            }
        )

    # ========================================================
    # ISP3 TEST DATA
    # ========================================================

    isp3s = []

    global_isp3_indicator_index = 0

    for isp3_index in range(3):

        indicators = []

        # ----------------------------------------------------
        # 4 normal ISP3 indicators
        # ----------------------------------------------------

        for _ in range(4):

            indicators.append(
                make_isp3_indicator(
                    code=(
                        f"ISP3-{isp3_index + 1}"
                        f"-I{len(indicators) + 1}"
                    ),
                    index=(
                        global_isp3_indicator_index
                    ),
                )
            )

            global_isp3_indicator_index += 1

        # ----------------------------------------------------
        # 2 ENACT ISP3 indicators
        # ----------------------------------------------------

        for _ in range(2):

            enact_index = (
                global_isp3_indicator_index
            )

            performance_ratios = [
                1.00,
                0.85,
                0.70,
                0.55,
                0.30,
            ]

            ratio = performance_ratios[
                enact_index
                % len(performance_ratios)
            ]

            counsellors = [
                4
                for _ in range(12)
            ]

            scores = [
                int(
                    4 * 60 * ratio
                )
                for _ in range(12)
            ]

            indicators.append(
                {
                    "indicatorRef": (
                        f"ISP3-"
                        f"{isp3_index + 1}-E"
                        f"{len(indicators) + 1}"
                    ),
                    "indicator": (
                        "ISP3 ENACT "
                        "Performance Indicator "
                        f"{len(indicators) + 1}"
                    ),
                    "disaggregation": [
                        {
                            "name": (
                                ENACT_COUNSELLORS
                            ),
                            "target": 4,
                            "months": counsellors,
                        },
                        {
                            "name": (
                                ENACT_SCORE
                            ),
                            "target": 240,
                            "months": scores,
                        },
                    ],
                }
            )

            global_isp3_indicator_index += 1

        isp3s.append(
            {
                "isp3": (
                    f"ISP3 Strategic Result "
                    f"{isp3_index + 1}: "
                    "Improved implementation, "
                    "quality and accountability"
                ),
                "indicators": indicators,
            }
        )

    return {
        "impact": (
            "Improved institutional performance "
            "and sustainable project outcomes"
        ),
        "projectGoal": (
            "Strengthened monitoring, evaluation "
            "and accountability"
        ),
        "projectCode": "APR-2026-TEST",
        "projectManager": "Project Manager",
        "projectStartDate": "2026-01-01",
        "projectEndDate": "2026-12-31",
        "outcomes": outcomes,
        "isp3s": isp3s,
    }


# ============================================================
# ROW CALCULATIONS
# ============================================================

def rows_per_indicator(
    indicator: Dict[str, Any]
) -> int:

    return (
        1
        + len(
            indicator.get(
                "disaggregation",
                []
            )
        )
    )


def rows_per_output(
    output: Dict[str, Any]
) -> int:

    return sum(
        rows_per_indicator(indicator)
        for indicator in output.get(
            "indicators",
            []
        )
    )


def rows_per_outcome(
    outcome: Dict[str, Any]
) -> int:

    return sum(
        rows_per_output(output)
        for output in outcome.get(
            "outputs",
            []
        )
    )


def rows_per_isp3(
    isp3: Dict[str, Any]
) -> int:

    return sum(
        rows_per_indicator(indicator)
        for indicator in isp3.get(
            "indicators",
            []
        )
    )


# ============================================================
# CELL STYLING
# ============================================================

def style_cell(
    cell,
    *,
    fill=None,
    font=None,
    alignment=None,
    border=True,
    number_format=None,
):

    if fill is not None:
        cell.fill = fill

    if font is not None:
        cell.font = font

    if alignment is not None:
        cell.alignment = alignment

    if border:
        cell.border = thin_border

    if number_format is not None:
        cell.number_format = number_format


def write_cell(
    ws,
    row: int,
    column: int,
    value: Any,
    *,
    fill=None,
    font=None,
    alignment=None,
    number_format=None,
):

    cell = ws.cell(
        row=row,
        column=column,
        value=value,
    )

    style_cell(
        cell,
        fill=fill,
        font=font or font_body,
        alignment=(
            alignment
            or center_alignment
        ),
        number_format=number_format,
    )

    return cell


# ============================================================
# MERGE HELPER
# ============================================================

def merge_and_write(
    ws,
    start_row: int,
    end_row: int,
    start_column: int,
    value: Any,
    *,
    end_column: int | None = None,
    fill=None,
    font=None,
    alignment=None,
    border=None,
):

    if end_row < start_row:
        return

    if end_column is None:
        end_column = start_column

    if end_column < start_column:
        return

    # --------------------------------------------------------
    # Merge
    # --------------------------------------------------------

    if (
        end_row > start_row
        or end_column > start_column
    ):

        ws.merge_cells(
            start_row=start_row,
            start_column=start_column,
            end_row=end_row,
            end_column=end_column,
        )

    # --------------------------------------------------------
    # Top-left cell
    # --------------------------------------------------------

    cell = ws.cell(
        row=start_row,
        column=start_column,
        value=value,
    )

    style_cell(
        cell,
        fill=fill,
        font=font or font_body_bold,
        alignment=(
            alignment
            or center_alignment
        ),
        border=False,
    )

    # --------------------------------------------------------
    # Apply fill and border to every
    # cell in merged range.
    # --------------------------------------------------------

    border_to_use = (
        border
        or thin_border
    )

    for r in range(
        start_row,
        end_row + 1,
    ):

        for c in range(
            start_column,
            end_column + 1,
        ):

            merged_cell = ws.cell(
                row=r,
                column=c,
            )

            merged_cell.border = (
                border_to_use
            )

            if fill is not None:
                merged_cell.fill = fill

    return cell


# ============================================================
# HEADER
# ============================================================

def build_header(
    ws,
    timeline: List[str],
) -> None:

    fixed_headers = [
        "Impact/Goal (LFA)",
        "Result/Outcome",
        "Outputs",
        "Indicators",
        "Target",
        "Total Achievement",
        "% Achieved",
    ]

    # --------------------------------------------------------
    # Fixed headers
    # --------------------------------------------------------

    for column, title in enumerate(
        fixed_headers,
        start=1,
    ):

        cell = ws.cell(
            row=1,
            column=column,
            value=title,
        )

        cell.fill = green_header_fill
        cell.font = font_header_small
        cell.alignment = center_alignment
        cell.border = thin_border

    # --------------------------------------------------------
    # Timeline
    # --------------------------------------------------------

    column = 8

    for index, month in enumerate(
        timeline
    ):

        if index % 3 == 0:

            quarter_index = (
                index // 3
            )

            quarter = (
                QUARTERS[quarter_index]
                if (
                    quarter_index
                    < len(QUARTERS)
                )
                else (
                    f"Q{quarter_index + 1}"
                )
            )

            quarter_cell = ws.cell(
                row=1,
                column=column,
                value=quarter,
            )

            quarter_cell.fill = (
                quarter_header_fill
            )

            quarter_cell.font = (
                font_header
            )

            quarter_cell.alignment = (
                center_alignment
            )

            quarter_cell.border = (
                thin_border
            )

            column += 1

        month_cell = ws.cell(
            row=1,
            column=column,
            value=month,
        )

        month_cell.fill = (
            green_header_fill
        )

        month_cell.font = (
            font_header_small
        )

        month_cell.alignment = (
            center_alignment
        )

        month_cell.border = (
            thin_border
        )

        column += 1


# ============================================================
# DATA ROW WRITER
# ============================================================

def write_indicator(
    ws,
    row: int,
    indicator: Dict[str, Any],
    timeline: List[str],
) -> int:

    disaggregations = indicator.get(
        "disaggregation",
        []
    )

    month_count = len(timeline)

    enact = is_enact_indicator(
        indicator
    )

    # ========================================================
    # CALCULATION
    # ========================================================

    if enact:

        dm1 = (
            disaggregations[0].get(
                "months"
            )
            or []
        )

        dm2 = (
            disaggregations[1].get(
                "months"
            )
            or []
        )

        (
            each_month_label,
            each_quarter_label,
        ) = calculate_enact(
            dm1,
            dm2,
        )

        months_sum = (
            each_month_label
        )

        total_target = sum(
            safe_number(
                d.get("target", 0)
            )
            for d in disaggregations
        )

        total_achievement = len(
            each_month_label
        )

    else:

        (
            months_sum,
            total_target,
            total_achievement,
            _,
        ) = normal_indicator_calculation(
            indicator,
            month_count,
        )

        each_quarter_label = []

    # ========================================================
    # INDICATOR MAIN ROW
    # ========================================================

    indicator_name = indicator.get(
        "name",
        indicator.get(
            "indicator",
            "",
        ),
    )

    # --------------------------------------------------------
    # Indicator
    #
    # ENACT intentionally has NO yellow fill.
    # --------------------------------------------------------

    write_cell(
        ws,
        row,
        4,
        indicator_name,
        font=(
            font_enact
            if enact
            else font_body_bold
        ),
        alignment=center_alignment,
    )

    # --------------------------------------------------------
    # Target
    # --------------------------------------------------------

    write_cell(
        ws,
        row,
        5,
        clean_number(
            total_target
        ),
        font=(
            font_enact
            if enact
            else font_body
        ),
        alignment=center_alignment,
    )

    # --------------------------------------------------------
    # Total Achievement
    # --------------------------------------------------------

    write_cell(
        ws,
        row,
        6,
        clean_number(
            total_achievement
        ),
        font=(
            font_enact
            if enact
            else font_body
        ),
        alignment=center_alignment,
    )

    # --------------------------------------------------------
    # Percentage
    # --------------------------------------------------------

    if enact:

        write_cell(
            ws,
            row,
            7,
            "-",
            font=font_enact,
            alignment=center_alignment,
        )

    else:

        write_cell(
            ws,
            row,
            7,
            (
                safe_number(
                    total_achievement
                )
                / safe_number(
                    total_target
                )
                if safe_number(
                    total_target
                )
                else 0
            ),
            font=font_body,
            alignment=center_alignment,
            number_format="0.00%",
        )

    # ========================================================
    # TIMELINE
    # ========================================================

    column = 8

    for i in range(
        0,
        month_count,
        3,
    ):

        chunk = months_sum[
            i:i + 3
        ]

        # ----------------------------------------------------
        # Quarter
        # ----------------------------------------------------

        if len(chunk) == 3:

            if enact:

                quarter_index = (
                    i // 3
                )

                quarter_value = (
                    each_quarter_label[
                        quarter_index
                    ]
                    if (
                        quarter_index
                        < len(
                            each_quarter_label
                        )
                    )
                    else ""
                )

                write_cell(
                    ws,
                    row,
                    column,
                    quarter_value,
                    fill=quarter_body_fill,
                    font=font_enact,
                    alignment=center_alignment,
                )

            else:

                quarter_value = sum(
                    safe_number(v)
                    for v in chunk
                )

                write_cell(
                    ws,
                    row,
                    column,
                    clean_number(
                        quarter_value
                    ),
                    fill=quarter_body_fill,
                    font=font_body,
                    alignment=center_alignment,
                )

        column += 1

        # ----------------------------------------------------
        # Months
        # ----------------------------------------------------

        for value in chunk:

            write_cell(
                ws,
                row,
                column,
                value
                if enact
                else clean_number(
                    safe_number(value)
                ),
                fill=green_light_fill,
                font=(
                    font_enact
                    if enact
                    else font_body
                ),
                alignment=center_alignment,
            )

            column += 1

    # ========================================================
    # DISAGGREGATIONS
    # ========================================================

    current_row = row + 1

    for disagg in disaggregations:

        d_name = disagg.get(
            "name",
            "",
        )

        d_months = ensure_months(
            disagg.get("months"),
            month_count,
        )

        d_target = safe_number(
            disagg.get(
                "target",
                0,
            )
        )

        d_total = sum(
            d_months
        )

        # ----------------------------------------------------
        # Name
        # ----------------------------------------------------

        write_cell(
            ws,
            current_row,
            4,
            d_name,
            font=font_small,
            alignment=center_alignment,
        )

        # ----------------------------------------------------
        # Target
        # ----------------------------------------------------

        write_cell(
            ws,
            current_row,
            5,
            clean_number(
                d_target
            ),
            font=font_small,
            alignment=center_alignment,
        )

        # ----------------------------------------------------
        # Total Achievement
        # ----------------------------------------------------

        write_cell(
            ws,
            current_row,
            6,
            clean_number(
                d_total
            ),
            font=font_small,
            alignment=center_alignment,
        )

        # ----------------------------------------------------
        # Percentage
        # ----------------------------------------------------

        d_percent = (
            d_total / d_target
            if d_target
            else 0
        )

        write_cell(
            ws,
            current_row,
            7,
            d_percent,
            font=font_small,
            alignment=center_alignment,
            number_format="0.00%",
        )

        # ----------------------------------------------------
        # Timeline
        # ----------------------------------------------------

        column = 8

        for i in range(
            0,
            month_count,
            3,
        ):

            quarter_chunk = d_months[
                i:i + 3
            ]

            if len(quarter_chunk) == 3:

                quarter_value = sum(
                    safe_number(v)
                    for v in quarter_chunk
                )

                write_cell(
                    ws,
                    current_row,
                    column,
                    clean_number(
                        quarter_value
                    ),
                    fill=quarter_body_fill,
                    font=font_small,
                    alignment=center_alignment,
                )

            column += 1

            for month_value in (
                quarter_chunk
            ):

                write_cell(
                    ws,
                    current_row,
                    column,
                    clean_number(
                        safe_number(
                            month_value
                        )
                    ),
                    fill=green_light_fill,
                    font=font_small,
                    alignment=center_alignment,
                )

                column += 1

        current_row += 1

    return current_row


# ============================================================
# OUTPUT WRITER
# ============================================================

def write_output(
    ws,
    row: int,
    output: Dict[str, Any],
    timeline: List[str],
) -> int:

    start_row = row

    indicators = output.get(
        "indicators",
        []
    )

    for indicator in indicators:

        row = write_indicator(
            ws,
            row,
            indicator,
            timeline,
        )

    end_row = row - 1

    if end_row >= start_row:

        merge_and_write(
            ws,
            start_row,
            end_row,
            3,
            output.get(
                "name",
                "",
            ),
            fill=gray_fill,
            font=font_body_bold,
            alignment=center_alignment,
        )

    return row


# ============================================================
# OUTCOME WRITER
# ============================================================

def write_outcome(
    ws,
    row: int,
    outcome: Dict[str, Any],
    timeline: List[str],
) -> int:

    start_row = row

    outputs = outcome.get(
        "outputs",
        []
    )

    for output in outputs:

        row = write_output(
            ws,
            row,
            output,
            timeline,
        )

    end_row = row - 1

    if end_row >= start_row:

        merge_and_write(
            ws,
            start_row,
            end_row,
            2,
            outcome.get(
                "name",
                "",
            ),
            fill=gray_fill,
            font=font_body_bold,
            alignment=center_alignment,
        )

    return row


# ============================================================
# ISP3 INDICATOR WRITER
# ============================================================

def write_isp3_indicator(
    ws,
    row: int,
    indicator: Dict[str, Any],
    timeline: List[str],
) -> int:

    disaggregations = indicator.get(
        "disaggregation",
        []
    )

    month_count = len(timeline)

    enact = is_enact_indicator(
        indicator
    )

    # ========================================================
    # CALCULATION
    # ========================================================

    if enact:

        dm1 = (
            disaggregations[0].get(
                "months"
            )
            or []
        )

        dm2 = (
            disaggregations[1].get(
                "months"
            )
            or []
        )

        (
            each_month_label,
            each_quarter_label,
        ) = calculate_enact(
            dm1,
            dm2,
        )

        months_sum = (
            each_month_label
        )

        total_target = sum(
            safe_number(
                d.get("target", 0)
            )
            for d in disaggregations
        )

        total_achievement = len(
            each_month_label
        )

    else:

        (
            months_sum,
            total_target,
            total_achievement,
            _,
        ) = normal_indicator_calculation(
            indicator,
            month_count,
        )

        each_quarter_label = []

    # ========================================================
    # INDICATOR
    # ========================================================

    indicator_name = (
        indicator.get(
            "indicator",
            indicator.get(
                "name",
                "",
            ),
        )
    )

    # --------------------------------------------------------
    # Indicator
    #
    # No yellow fill for ENACT.
    # --------------------------------------------------------

    write_cell(
        ws,
        row,
        4,
        indicator_name,
        font=(
            font_enact
            if enact
            else font_body_bold
        ),
        alignment=center_alignment,
    )

    # --------------------------------------------------------
    # Target
    # --------------------------------------------------------

    write_cell(
        ws,
        row,
        5,
        clean_number(
            total_target
        ),
        font=(
            font_enact
            if enact
            else font_body
        ),
        alignment=center_alignment,
    )

    # --------------------------------------------------------
    # Achievement
    # --------------------------------------------------------

    write_cell(
        ws,
        row,
        6,
        clean_number(
            total_achievement
        ),
        font=(
            font_enact
            if enact
            else font_body
        ),
        alignment=center_alignment,
    )

    # --------------------------------------------------------
    # Percentage
    # --------------------------------------------------------

    if enact:

        write_cell(
            ws,
            row,
            7,
            "-",
            font=font_enact,
            alignment=center_alignment,
        )

    else:

        write_cell(
            ws,
            row,
            7,
            (
                safe_number(
                    total_achievement
                )
                / safe_number(
                    total_target
                )
                if safe_number(
                    total_target
                )
                else 0
            ),
            font=font_body,
            alignment=center_alignment,
            number_format="0.00%",
        )

    # ========================================================
    # TIMELINE
    # ========================================================

    column = 8

    for i in range(
        0,
        month_count,
        3,
    ):

        chunk = months_sum[
            i:i + 3
        ]

        # ----------------------------------------------------
        # Quarter
        # ----------------------------------------------------

        if len(chunk) == 3:

            if enact:

                quarter_index = (
                    i // 3
                )

                quarter_value = (
                    each_quarter_label[
                        quarter_index
                    ]
                    if (
                        quarter_index
                        < len(
                            each_quarter_label
                        )
                    )
                    else ""
                )

                write_cell(
                    ws,
                    row,
                    column,
                    quarter_value,
                    fill=quarter_body_fill,
                    font=font_enact,
                    alignment=center_alignment,
                )

            else:

                quarter_value = sum(
                    safe_number(v)
                    for v in chunk
                )

                write_cell(
                    ws,
                    row,
                    column,
                    clean_number(
                        quarter_value
                    ),
                    fill=quarter_body_fill,
                    font=font_body,
                    alignment=center_alignment,
                )

        column += 1

        # ----------------------------------------------------
        # Months
        # ----------------------------------------------------

        for value in chunk:

            write_cell(
                ws,
                row,
                column,
                value
                if enact
                else clean_number(
                    safe_number(value)
                ),
                fill=green_light_fill,
                font=(
                    font_enact
                    if enact
                    else font_body
                ),
                alignment=center_alignment,
            )

            column += 1

    # ========================================================
    # DISAGGREGATIONS
    # ========================================================

    current_row = row + 1

    for disagg in disaggregations:

        d_name = disagg.get(
            "name",
            "",
        )

        d_months = ensure_months(
            disagg.get("months"),
            month_count,
        )

        d_target = safe_number(
            disagg.get(
                "target",
                0,
            )
        )

        d_total = sum(
            d_months
        )

        # ----------------------------------------------------
        # Name
        # ----------------------------------------------------

        write_cell(
            ws,
            current_row,
            4,
            d_name,
            font=font_small,
            alignment=center_alignment,
        )

        # ----------------------------------------------------
        # Target
        # ----------------------------------------------------

        write_cell(
            ws,
            current_row,
            5,
            clean_number(
                d_target
            ),
            font=font_small,
            alignment=center_alignment,
        )

        # ----------------------------------------------------
        # Achievement
        # ----------------------------------------------------

        write_cell(
            ws,
            current_row,
            6,
            clean_number(
                d_total
            ),
            font=font_small,
            alignment=center_alignment,
        )

        # ----------------------------------------------------
        # Percentage
        # ----------------------------------------------------

        d_percent = (
            d_total / d_target
            if d_target
            else 0
        )

        write_cell(
            ws,
            current_row,
            7,
            d_percent,
            font=font_small,
            alignment=center_alignment,
            number_format="0.00%",
        )

        # ----------------------------------------------------
        # Timeline
        # ----------------------------------------------------

        column = 8

        for i in range(
            0,
            month_count,
            3,
        ):

            quarter_chunk = d_months[
                i:i + 3
            ]

            if len(quarter_chunk) == 3:

                quarter_value = sum(
                    safe_number(v)
                    for v in quarter_chunk
                )

                write_cell(
                    ws,
                    current_row,
                    column,
                    clean_number(
                        quarter_value
                    ),
                    fill=quarter_body_fill,
                    font=font_small,
                    alignment=center_alignment,
                )

            column += 1

            for month_value in (
                quarter_chunk
            ):

                write_cell(
                    ws,
                    current_row,
                    column,
                    clean_number(
                        safe_number(
                            month_value
                        )
                    ),
                    fill=green_light_fill,
                    font=font_small,
                    alignment=center_alignment,
                )

                column += 1

        current_row += 1

    return current_row


# ============================================================
# ISP3 WRITER
# ============================================================

def write_isp3(
    ws,
    row: int,
    isp3: Dict[str, Any],
    timeline: List[str],
) -> int:

    start_row = row

    indicators = isp3.get(
        "indicators",
        []
    )

    # --------------------------------------------------------
    # Indicators
    # --------------------------------------------------------

    for indicator in indicators:

        row = write_isp3_indicator(
            ws,
            row,
            indicator,
            timeline,
        )

    end_row = row - 1

    # --------------------------------------------------------
    # ISP3 hierarchy
    #
    # A:C merged vertically and
    # horizontally.
    # --------------------------------------------------------

    if end_row >= start_row:

        isp3_text = isp3.get(
            "isp3",
            "",
        )

        merge_and_write(
            ws,
            start_row,
            end_row,
            1,
            isp3_text,
            end_column=3,
            fill=isp3_body_fill,
            font=font_isp3,
            alignment=isp3_alignment,
        )

    return row


# ============================================================
# ISP3 SECTION TITLE
# ============================================================

def write_isp3_section_title(
    ws,
    row: int,
    timeline: List[str],
) -> int:

    timeline_column_count = (
        len(timeline)
        + (
            len(timeline) // 3
        )
    )

    total_columns = (
        7
        + timeline_column_count
    )

    # --------------------------------------------------------
    # Merge complete row
    # --------------------------------------------------------

    ws.merge_cells(
        start_row=row,
        start_column=1,
        end_row=row,
        end_column=total_columns,
    )

    # --------------------------------------------------------
    # Style every cell in section
    # --------------------------------------------------------

    for column in range(
        1,
        total_columns + 1,
    ):

        cell = ws.cell(
            row=row,
            column=column,
        )

        cell.fill = (
            isp3_section_fill
        )

        cell.border = (
            section_border
        )

        cell.alignment = (
            center_alignment
        )

    # --------------------------------------------------------
    # Only top-left cell gets the value
    # --------------------------------------------------------

    cell = ws.cell(
        row=row,
        column=1,
        value="ISP3",
    )

    cell.fill = (
        isp3_section_fill
    )

    cell.font = (
        font_isp3_section
    )

    cell.alignment = Alignment(
        horizontal="center",
        vertical="center",
        wrap_text=True,
    )

    cell.border = (
        section_border
    )

    # --------------------------------------------------------
    # Larger title row
    # --------------------------------------------------------

    ws.row_dimensions[
        row
    ].height = 42

    return row + 1


# ============================================================
# MAIN WORKSHEET
# ============================================================

def build_monitoring_sheet(
    wb: Workbook,
    data: Dict[str, Any],
) -> None:

    ws = wb.active
    ws.title = "Monitoring"

    # --------------------------------------------------------
    # Timeline
    # --------------------------------------------------------

    timeline = MONTHS.copy()

    # --------------------------------------------------------
    # Header
    # --------------------------------------------------------

    build_header(
        ws,
        timeline,
    )

    # --------------------------------------------------------
    # Body
    # --------------------------------------------------------

    current_row = 2

    outcomes = data.get(
        "outcomes",
        []
    )

    # ========================================================
    # OUTCOMES
    # ========================================================

    for outcome in outcomes:

        current_row = write_outcome(
            ws,
            current_row,
            outcome,
            timeline,
        )

    outcome_last_row = (
        current_row - 1
    )

    # ========================================================
    # IMPACT / GOAL
    # ========================================================

    if outcome_last_row >= 2:

        impact_text = data.get(
            "impact",
            "",
        )

        merge_and_write(
            ws,
            2,
            outcome_last_row,
            1,
            impact_text,
            fill=green_light_fill,
            font=font_body_bold,
            alignment=center_alignment,
        )

    # ========================================================
    # ISP3
    # ========================================================

    isp3s = data.get(
        "isp3s",
        []
    )

    if isp3s:

        # ----------------------------------------------------
        # ISP3 section title
        # ----------------------------------------------------

        current_row = (
            write_isp3_section_title(
                ws,
                current_row,
                timeline,
            )
        )

        # ----------------------------------------------------
        # ISP3 blocks
        # ----------------------------------------------------

        for isp3 in isp3s:

            current_row = write_isp3(
                ws,
                current_row,
                isp3,
                timeline,
            )

    last_row = (
        current_row - 1
    )

    # ========================================================
    # ROW HEIGHTS
    # ========================================================

    ws.row_dimensions[
        1
    ].height = 42

    for row in range(
        2,
        last_row + 1,
    ):

        # ISP3 section title
        if (
            ws.cell(
                row=row,
                column=1,
            ).value
            == "ISP3"
        ):

            ws.row_dimensions[
                row
            ].height = 42

        else:

            ws.row_dimensions[
                row
            ].height = 30

    # ========================================================
    # COLUMN WIDTHS
    # ========================================================

    widths = {
        "A": 28,
        "B": 24,
        "C": 24,
        "D": 38,
        "E": 12,
        "F": 16,
        "G": 14,
    }

    for column, width in (
        widths.items()
    ):

        ws.column_dimensions[
            column
        ].width = width

    # --------------------------------------------------------
    # Timeline widths
    # --------------------------------------------------------

    column = 8

    for index in range(
        len(timeline)
    ):

        if index % 3 == 0:

            ws.column_dimensions[
                get_column_letter(column)
            ].width = 16

            column += 1

        ws.column_dimensions[
            get_column_letter(column)
        ].width = 11

        column += 1

    # ========================================================
    # FREEZE PANES
    # ========================================================

    # ws.freeze_panes = "E2"

    # ========================================================
    # VIEW
    # ========================================================

    ws.sheet_view.showGridLines = False
    ws.sheet_view.zoomScale = 90

    # ========================================================
    # PRINT SETTINGS
    # ========================================================

    ws.page_setup.orientation = "landscape"
    ws.page_setup.paperSize = (
        ws.PAPERSIZE_A4
    )

    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0

    ws.sheet_properties.pageSetUpPr.fitToPage = True

    ws.print_title_rows = "1:1"

    # ========================================================
    # MARGINS
    # ========================================================

    ws.page_margins.left = 0.25
    ws.page_margins.right = 0.25
    ws.page_margins.top = 0.5
    ws.page_margins.bottom = 0.5

    # ========================================================
    # PRINT AREA
    # ========================================================

    if last_row >= 1:

        last_column = (
            7
            + len(timeline)
            + (
                len(timeline) // 3
            )
        )

        ws.print_area = (
            f"A1:"
            f"{get_column_letter(last_column)}"
            f"{last_row}"
        )


# ============================================================
# TEST INFO SHEET
# ============================================================

def build_test_info_sheet(
    wb: Workbook,
    data: Dict[str, Any],
) -> None:

    ws = wb.create_sheet(
        "Test Info"
    )

    ws.sheet_view.showGridLines = False

    rows = [
        (
            "Test Information",
            "",
        ),
        (
            "Project Code",
            data.get(
                "projectCode",
                "",
            ),
        ),
        (
            "Project Manager",
            data.get(
                "projectManager",
                "",
            ),
        ),
        (
            "Start Date",
            data.get(
                "projectStartDate",
                "",
            ),
        ),
        (
            "End Date",
            data.get(
                "projectEndDate",
                "",
            ),
        ),
        (
            "Outcomes",
            len(
                data.get(
                    "outcomes",
                    [],
                )
            ),
        ),
        (
            "ISP3",
            len(
                data.get(
                    "isp3s",
                    [],
                )
            ),
        ),
    ]

    for row_index, (
        key,
        value,
    ) in enumerate(
        rows,
        start=1,
    ):

        write_cell(
            ws,
            row_index,
            1,
            key,
            fill=(
                green_header_fill
                if row_index == 1
                else None
            ),
            font=(
                font_header
                if row_index == 1
                else font_body_bold
            ),
            alignment=center_alignment,
        )

        write_cell(
            ws,
            row_index,
            2,
            value,
            fill=(
                green_header_fill
                if row_index == 1
                else None
            ),
            font=(
                font_header
                if row_index == 1
                else font_body
            ),
            alignment=center_alignment,
        )

    ws.column_dimensions[
        "A"
    ].width = 28

    ws.column_dimensions[
        "B"
    ].width = 45


# ============================================================
# ENACT TEST SHEET
# ============================================================

def build_enact_test_sheet(
    wb: Workbook,
) -> None:

    ws = wb.create_sheet(
        "ENACT Test"
    )

    ws.sheet_view.showGridLines = False

    headers = [
        "Ratio",
        "Expected Result",
    ]

    for col, value in enumerate(
        headers,
        start=1,
    ):

        write_cell(
            ws,
            1,
            col,
            value,
            fill=quarter_header_fill,
            font=font_header,
            alignment=center_alignment,
        )

    tests = [
        (
            1.00,
            "Excellent Performance",
        ),
        (
            0.95,
            "Excellent Performance",
        ),
        (
            0.85,
            "Good Performance",
        ),
        (
            0.75,
            "Good Performance",
        ),
        (
            0.70,
            "Fair Performance",
        ),
        (
            0.65,
            "Fair Performance",
        ),
        (
            0.55,
            "Needs Improvement",
        ),
        (
            0.50,
            "Needs Improvement",
        ),
        (
            0.30,
            "Poor Performance",
        ),
    ]

    for row, (
        ratio,
        expected,
    ) in enumerate(
        tests,
        start=2,
    ):

        actual = enact_label(
            ratio
        )

        write_cell(
            ws,
            row,
            1,
            ratio,
            alignment=center_alignment,
            number_format="0.00",
        )

        fill = (
            green_light_fill
            if actual == expected
            else orange_fill
        )

        write_cell(
            ws,
            row,
            2,
            actual,
            fill=fill,
            font=font_body_bold,
            alignment=center_alignment,
        )

        write_cell(
            ws,
            row,
            3,
            (
                "PASS"
                if actual == expected
                else "FAIL"
            ),
            fill=(
                green_light_fill
                if actual == expected
                else orange_fill
            ),
            font=font_body_bold,
            alignment=center_alignment,
        )

    ws["C1"] = "Status"
    ws["C1"].fill = quarter_header_fill
    ws["C1"].font = font_header
    ws["C1"].alignment = center_alignment
    ws["C1"].border = thin_border

    ws.column_dimensions[
        "A"
    ].width = 15

    ws.column_dimensions[
        "B"
    ].width = 30

    ws.column_dimensions[
        "C"
    ].width = 15


# ============================================================
# VALIDATION
# ============================================================

def validate_data(
    data: Dict[str, Any],
) -> None:

    # ========================================================
    # OUTCOMES
    # ========================================================

    outcomes = data.get(
        "outcomes",
        []
    )

    if not isinstance(
        outcomes,
        list,
    ):

        raise ValueError(
            "data.outcomes must be a list"
        )

    for outcome in outcomes:

        outputs = outcome.get(
            "outputs",
            []
        )

        if not isinstance(
            outputs,
            list,
        ):

            raise ValueError(
                "outcome.outputs "
                "must be a list"
            )

        for output in outputs:

            indicators = output.get(
                "indicators",
                []
            )

            if not isinstance(
                indicators,
                list,
            ):

                raise ValueError(
                    "output.indicators "
                    "must be a list"
                )

            for indicator in indicators:

                validate_indicator(
                    indicator
                )

    # ========================================================
    # ISP3
    # ========================================================

    isp3s = data.get(
        "isp3s",
        []
    )

    if not isinstance(
        isp3s,
        list,
    ):

        raise ValueError(
            "data.isp3s must be a list"
        )

    for isp3_index, isp3 in enumerate(
        isp3s
    ):

        if not isinstance(
            isp3,
            dict,
        ):

            raise ValueError(
                f"data.isp3s[{isp3_index}] "
                "must be an object"
            )

        if "isp3" not in isp3:

            raise ValueError(
                f"data.isp3s[{isp3_index}] "
                "is missing 'isp3'"
            )

        indicators = isp3.get(
            "indicators",
            []
        )

        if not isinstance(
            indicators,
            list,
        ):

            raise ValueError(
                f"data.isp3s[{isp3_index}]"
                ".indicators "
                "must be a list"
            )

        for indicator in indicators:

            validate_indicator(
                indicator
            )


def validate_indicator(
    indicator: Dict[str, Any],
) -> None:

    if not isinstance(
        indicator,
        dict,
    ):

        raise ValueError(
            "indicator must be an object"
        )

    disaggregations = (
        indicator.get(
            "disaggregation",
            []
        )
    )

    if not isinstance(
        disaggregations,
        list,
    ):

        raise ValueError(
            "indicator.disaggregation "
            "must be a list"
        )

    # --------------------------------------------------------
    # ENACT validation
    # --------------------------------------------------------

    if is_enact_indicator(
        indicator
    ):

        names = [
            d.get(
                "name",
                "",
            )
            for d in disaggregations
        ]

        if names[0] != ENACT_COUNSELLORS:

            raise ValueError(
                "ENACT indicator has invalid "
                "disaggregation order. "
                f"Expected "
                f"'{ENACT_COUNSELLORS}' "
                "at index 0."
            )

        if names[1] != ENACT_SCORE:

            raise ValueError(
                "ENACT indicator has invalid "
                "disaggregation order. "
                f"Expected "
                f"'{ENACT_SCORE}' "
                "at index 1."
            )


# ============================================================
# MAIN
# ============================================================

def main():

    print("=" * 70)
    print("APR Monitoring Excel Generator")
    print("=" * 70)

    # --------------------------------------------------------
    # Test data
    # --------------------------------------------------------

    data = create_test_data()

    # --------------------------------------------------------
    # Validate
    # --------------------------------------------------------

    validate_data(
        data
    )

    # --------------------------------------------------------
    # Workbook
    # --------------------------------------------------------

    wb = Workbook()

    # --------------------------------------------------------
    # Monitoring
    # --------------------------------------------------------

    build_monitoring_sheet(
        wb,
        data,
    )

    # --------------------------------------------------------
    # Test Info
    # --------------------------------------------------------

    build_test_info_sheet(
        wb,
        data,
    )

    # --------------------------------------------------------
    # ENACT Tests
    # --------------------------------------------------------

    build_enact_test_sheet(
        wb
    )

    # --------------------------------------------------------
    # Save
    # --------------------------------------------------------

    wb.save(
        OUTPUT_FILE
    )

    print()
    print(
        "Excel file created successfully:"
    )

    print(
        OUTPUT_FILE
    )

    print()

    print(
        "File size: "
        f"{OUTPUT_FILE.stat().st_size:,} bytes"
    )

    print("=" * 70)


if __name__ == "__main__":
    main()