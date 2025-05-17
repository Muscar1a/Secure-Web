export const host = "https://localhost:8000";
export const ws_host = "wss://localhost:8000";

// export const loginRoute = `${host}/api/auth/login`;
// export const registerRoute = `${host}/api/auth/register`;
export const logoutRoute = `${host}/auth/logout`;
export const allUsersRoute = `${host}/auth/allusers`;
export const sendMessageRoute = `${host}/messages/addmsg`;
export const recieveMessageRoute = `${host}/messages/getmsg`;
export const reactMessageRoute = `${host}/messages/react`;