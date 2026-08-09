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
    // 💡 방어 코드: file 객체 존재 및 file.name 검증
    if (!file || !file.name) {
        console.warn('유효한 파일 객체가 전달되지 않았습니다.');
        return null;
    }

    const extension = file.name.split('.').pop().toLowerCase();

    // 1. presigned URL 발급
    const response = await requestJson(
        `${getServerUrl()}/images/presigned-url/profile/temp`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ extension }),
        },
    );

    // 💡 requestJson 결과가 null이거나 ok가 false인 경우 방어 처리
    if (!response || !response.ok) {
        throw new Error('presigned URL 발급 실패 또는 서버 응답 없음');
    }

    // 💡 백엔드 DTO 응답 필드명 대응 (camelCase / snake_case)
    const data = response.data || {};
    const presignedUrl = data.presignedUrl || data.presigned_url;
    const s3Url = data.s3Url || data.s3_url || data.imageUrl || data.image_url;

    if (!presignedUrl || !s3Url) {
        throw new Error('presigned URL 또는 S3 URL 정보를 수신하지 못했습니다.');
    }

    // 2. S3에 직접 PUT 업로드
    const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
    });

    if (!uploadResponse.ok) throw new Error('S3 업로드 실패');

    // 3. 최종 s3Url 반환 (문자열)
    return s3Url;
};