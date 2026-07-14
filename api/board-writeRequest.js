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

export const fileUpload = async file => {
    const extension = file.name.split('.').pop().toLowerCase();
    const { ok, data } = await requestJson(
        `${getServerUrl()}/images/presigned-url`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...authHeader(),
            },
            body: JSON.stringify({ extension, imageType: 'POST' }),
            credentials: 'include',
        },
    );
    if (!ok) throw new Error('presigned URL 발급 실패');
    const { presignedUrl, s3Url } = data;

    const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
    });
    if (!uploadResponse.ok) throw new Error('S3 업로드 실패');

    return s3Url; // 문자열 반환
};

export const getBoardItem = postId => {
    return requestJson(`${getServerUrl()}/posts/${postId}`, {
        method: 'GET',
        headers: authHeader(),
        credentials: 'include',
    });
};