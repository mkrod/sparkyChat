import { googleClientID, googleRedirectURI } from ".";

const googleAuth = () => {
    const url = `https://accounts.google.com/o/oauth2/auth?
    client_id=${googleClientID}&
    redirect_uri=${googleRedirectURI}&
    response_type=code&
    scope=openid+email+profile&
    include_granted_scopes=true&
    access_type=offline&
    prompt=consent`;
    window.location.href = url.replace(/\s+/g, '');
}


export { googleAuth };