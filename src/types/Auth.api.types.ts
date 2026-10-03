export type LoginResponse = {
    message?: string;
    data?: {
        accessToken?: string;
        refreshToken?: string;
    };
};

export type ProfileResponse = {
    message: string;
    statusCode: number;
    data: {
        id: string;
        organizationId: string;
        roleId: string;
        registerNumber: string | null;
        firstName: string;
        lastName: string;
        phone: string;
        email: string;
    };
};