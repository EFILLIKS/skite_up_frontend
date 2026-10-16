export type LoginResponse = {
    message?: string;
    statusCode?: number;
    data?: {
        accessToken?: string;
        refreshToken?: string;
    };
};

export type RefreshTokenRequest = {
    refreshToken?: string;
};

export type RefreshTokenResponse = {
    message?: string;
    statusCode?: number;
    data?: {
        accessToken?: string;
        refreshToken?: string;
    };
};

export type ProfileSettings = {
    mcqTest?: boolean | null;
    codingTest?: boolean | null;
    lsrwTest?: boolean | null;
    keyboardOption?: boolean | null;
    defaultPasswordView?: boolean | null;
    notificationSettings?: boolean | null;
    studentRange?: number | null;
    teacherRange?: number | null;
    theme?: string | null;
};

export type ProfileData = {
    id: string;
    organizationId?: string;
    institutionId?: string;
    role?: string;
    roleId?: string;
    registerNumber: string | null;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    profilePicture?: string | null;
    totalMembers?: number;
    studentRange?: number;
    teacherRange?: number;
    currentStudentCount?: number;
    currentTeacherCount?: number;
    remainingStudents?: number;
    remainingTeachers?: number;
    planCode?: string;
    planName?: string;
    isTrial?: boolean;
    teachersAllowed?: boolean;
    keyboardOption?: boolean;
    defaultPasswordView?: boolean;
    notificationSettings?: boolean;
    theme?: string;
    settings?: ProfileSettings;
};

export type ProfileResponse = {
    message: string;
    statusCode: number;
    data: ProfileData;
};

export type ProfileUpdateDto = {
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    password?: string;
    profilePicture?: string;
    studentRange?: number;
    teacherRange?: number;
    keyboardOption?: boolean;
    defaultPasswordView?: boolean;
    notificationSettings?: boolean;
    theme?: string;
    settings?: ProfileSettings;
};