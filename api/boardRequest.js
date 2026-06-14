import { getServerUrl, getAuthHeader } from '../utils/function.js';  // getAuthHeader 추가
import { requestJson } from '../utils/request.js';

export const getPost = postId => {
    return requestJson(`${getServerUrl()}/posts/${postId}`, {
        credentials: 'include',
        headers: getAuthHeader(),
    });
};

export const deletePost = async postId => {
    return requestJson(`${getServerUrl()}/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,  
        },
    });
};

export const writeComment = async (pageId, comment) => {
    return requestJson(`${getServerUrl()}/posts/${pageId}/comments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...getAuthHeader(),
        },
        credentials: 'include',
        body: JSON.stringify({ content: comment }),
    });
};

export const getComments = async postId => {
    return requestJson(`${getServerUrl()}/posts/${postId}/comments`, {
        credentials: 'include',
        headers: getAuthHeader(),
    });
};

export const likePost = async postId => {
    return requestJson(`${getServerUrl()}/posts/${postId}/likes`, {
        method: 'POST',
        credentials: 'include',
        headers: getAuthHeader(),
    });
};

export const unlikePost = async postId => {
    return requestJson(`${getServerUrl()}/posts/${postId}/likes`, {
        method: 'DELETE',
        credentials: 'include',
        headers: getAuthHeader(),
    });
};