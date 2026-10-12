export function splitProfileChats<T extends {settings:unknown}>(chats:T[]) {
 const isPanel=(chat:T)=>typeof chat.settings==='object'&&chat.settings!==null&&'mode' in chat.settings&&chat.settings.mode==='panel';
 return {debates:chats.filter(c=>!isPanel(c)),panels:chats.filter(isPanel)};
}
