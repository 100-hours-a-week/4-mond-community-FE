import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const userModify = async changeData => {
    return requestJson(`${getServerUrl()}/users/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
        body: JSON.stringify(changeData),
    });
}

export const userDelete = async () => {
    return requestJson(`${getServerUrl()}/users/me`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
    });
};
