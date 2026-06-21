import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const getPosts = (cursor = null, limit = 5) => {
    const cursorParam = cursor ? `&cursor=${cursor}` : '';
    return requestJson(
        `${getServerUrl()}/posts?size=${limit}${cursorParam}`,
        {
            credentials: 'include',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        },
    );
};

export const searchPosts = (keyword, cursor = null, limit = 5, sort = 'recent') => {
    const cursorParam = cursor ? `&cursor=${cursor}` : '';
    return requestJson(
        `${getServerUrl()}/posts/search?keyword=${keyword}&size=${limit}${cursorParam}`,
        {
            credentials: 'include',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
        },
    );
};
