export interface User {
    mail: string;
    userName: string;
    token: string;
    displayName: string;
}

// This function transforms the oidc-client user profile to your User interface
function transformToUser(oidcUser: any): User {
    return {
        mail: oidcUser.profile.email,
        userName: oidcUser.profile.preferred_username || oidcUser.profile.name,
        token: oidcUser.access_token,
        displayName: oidcUser.profile.name
    };
}