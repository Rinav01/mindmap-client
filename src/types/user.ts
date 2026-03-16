export interface User {
    _id: string;
    name: string;
    username: string;
    email: string;
    color?: string;
    hasCompletedOnboarding?: boolean;
    hasCompletedAdvancedTutorial?: boolean;
    createdAt?: string;
    updatedAt?: string;
    password?: string;
}
