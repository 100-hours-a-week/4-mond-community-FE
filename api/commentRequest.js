import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const deleteComment = (postId, commentId) => {
    const result = requestJson(
        `${getServerUrl()}/posts/${postId}/comments/${commentId}`,
        {
            method: 'DELETE',
            credentials: 'include',
             headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,  
            },
        },
    );
    return result;
};

export const updateComment = (postId, commentId, commentContent) => {
    const result = requestJson(
        `${getServerUrl()}/posts/${postId}/comments/${commentId}`,
        {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`, 
            },
            credentials: 'include',
            body: JSON.stringify(commentContent), 
        },
    );
    return result;
};
