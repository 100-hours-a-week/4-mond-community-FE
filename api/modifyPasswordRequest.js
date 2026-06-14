import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const changePassword = async password => {
    const result = requestJson(`${getServerUrl()}/users/me/password`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`, 
        },
        credentials: 'include',
        body: JSON.stringify({
            new_password: password,          
            new_password_confirm: password,  
        }),
    });
    return result;
};
