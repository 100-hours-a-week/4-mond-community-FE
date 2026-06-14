import { requestJson } from '../utils/request.js';
import { getServerUrl, getAuthHeader } from '../utils/function.js';

const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
});

export const createPost = boardData => {
    return requestJson(`${getServerUrl()}/posts`, {
        method: 'POST',
        body: JSON.stringify(boardData),
        headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
        },
        credentials: 'include',
    });
};

export const updatePost = (postId, boardData) => {
    return requestJson(`${getServerUrl()}/posts/${postId}`, {
        method: 'PATCH',
        body: JSON.stringify(boardData),
        headers: {
            'Content-Type': 'application/json',
            ...authHeader(),
        },
        credentials: 'include',
    });
};

export const fileUpload = formData => {
    return requestJson(`${getServerUrl()}/images/post`, {
        method: 'POST',
        body: formData,
        headers: {
            ...getAuthHeader(),  // 이게 있어?
        },
    });
};

export const getBoardItem = postId => {
    return requestJson(`${getServerUrl()}/posts/${postId}`, {
        method: 'GET',
        headers: authHeader(),
        credentials: 'include',
    });
};