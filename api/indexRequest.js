import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const getPosts = (offset = 0, limit = 5) => {
    const page = Math.floor(offset / limit);
    return requestJson(
        `${getServerUrl()}/posts?page=${page}&size=${limit}`,
        {
            credentials: 'include',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        },
    );
};

export const searchPosts = (keyword, offset = 0, limit = 5, sort = 'recent') => {
    const page = Math.floor(offset / limit);
    return requestJson(
        `${getServerUrl()}/posts/search?keyword=${keyword}&page=${page}&size=${limit}`,
        {
            credentials: 'include',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        },
    );
};
