<?php

namespace App;

enum RolesEnum: string
{
    case SYSTEM_ADMIN = "SYSTEM_ADMIN";

    case CD_DCD = "CD_DCD";

    case HOD_DHOD_FM = "FOD_DHOD_FM";

    case GRANT_CO = "GRANT_CO";

    case HQ = "HQ";

    case RFM = "RFM";

    case PM_DPM = "PM_DPM";

    case SUPERVISOR = "SUPERVISOR";

    case DATA_ENTRY = "DATA_ENTRY";

    case USER = "USER";
    
}
