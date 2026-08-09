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
    // 💡 1. 방어 코드: file이 정상 전달되지 않은 경우 처리 (split 에러 방지)
    if (!file || !file.name) {
        console.warn('업로드할 파일이 올바르게 전달되지 않았습니다.');
        return null;
    }

    const extension = file.name.split('.').pop().toLowerCase();

    // 2. presigned URL 발급
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

    if (!response || !response.ok) throw new Error('presigned URL 발급 실패');

    // 💡 3. 백엔드 DTO 응답 필드명 대응 (camelCase / snake_case 모두 안전하게 추출)
    const data = response.data || {};
    const presignedUrl = data.presignedUrl || data.presigned_url;
    const s3Url = data.s3Url || data.s3_url || data.imageUrl || data.image_url;

    if (!presignedUrl || !s3Url) {
        throw new Error('응답받은 Presigned URL 또는 S3 URL 정보가 올바르지 않습니다.');
    }

    // 4. S3에 직접 PUT 업로드
    const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
            'Content-Type': file.type || 'image/jpeg',
        },
        body: file,
    });

    if (!uploadResponse.ok) throw new Error('S3 업로드 실패');

    // 5. 최종 s3Url 반환
    return s3Url;
};