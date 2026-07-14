import { getServerUrl } from '../utils/function.js';
import { requestJson } from '../utils/request.js';

export const userSignup = async data => {
    const result = await requestJson(`${getServerUrl()}/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
    return result;
};

export const checkEmail = async email => {
    const result = await requestJson(
        `${getServerUrl()}/users/email/check?email=${email}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );
    return result;
};

export const checkNickname = async nickname => {
    const result = await requestJson(
        `${getServerUrl()}/users/nickname/check?nickname=${nickname}`,
        {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        },
    );
    return result;
};

// file: File 객체
export const fileUpload = async file => {
    const extension = file.name.split('.').pop().toLowerCase();

    // 1. presigned URL 발급 (인증 불필요 - 회원가입 전용 temp 엔드포인트)
    const { ok, data } = await requestJson(
        `${getServerUrl()}/images/presigned-url/profile/temp`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ extension }),
        },
    );

    if (!ok) throw new Error('presigned URL 발급 실패');

    const { presignedUrl, s3Url } = data;

    // 2. S3에 직접 PUT 업로드
    const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type,
        },
        body: file,
    });

    if (!uploadResponse.ok) throw new Error('S3 업로드 실패');

    // 3. 최종 s3Url 반환 → userSignup 호출 시 data.profileImageUrl에 담아 사용
    return s3Url;
};
