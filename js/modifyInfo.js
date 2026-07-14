import { checkNickname } from '../api/signupRequest.js';
import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    prependChild,
    getServerUrl,
    resolveImageUrl,
    validNickname,
} from '../utils/function.js';
import { userModify, userDelete } from '../api/modifyInfoRequest.js';
import { requestJson } from '../utils/request.js';

const emailTextElement = document.querySelector('#id');
const nicknameInputElement = document.querySelector('#nickname');
const profileInputElement = document.querySelector('#profile');
const withdrawBtnElement = document.querySelector('#withdrawBtn');
const nicknameHelpElement = document.querySelector(
    '.inputBox p[name="nickname"]',
);
const resultElement = document.querySelector('.inputBox p[name="result"]');
const modifyBtnElement = document.querySelector('#signupBtn');
const profilePreview = document.querySelector('#profilePreview');
const removeProfileButton = document.querySelector('#removeProfileButton');
const authDataReponse = await authCheck();
const authData = await authDataReponse.json();
const changeData = {
    nickname: authData.data.nickname,
    profileImageUrl: authData.data.profile_image|| null,
};

const DEFAULT_PROFILE_IMAGE = '../public/image/profile/default.jpg';
const HTTP_OK = 200;
const HTTP_CREATED = 201;

const setData = data => {
    if (
        // data.profileImageUrl === DEFAULT_PROFILE_IMAGE ||
        data.profile_image === null
    ) {
        profilePreview.src = DEFAULT_PROFILE_IMAGE;
        if (removeProfileButton) removeProfileButton.style.display = 'none';
    } else {
        profilePreview.src = resolveImageUrl(
            data.profile_image,
            DEFAULT_PROFILE_IMAGE,
        );
        if (removeProfileButton) removeProfileButton.style.display = 'flex';

        const profileImageUrl = data.profile_image;
        const fileName = profileImageUrl.split('/').pop();
        localStorage.setItem('profileImageUrl', data.profileImageUrl);

        const profileImage = new File(
            [resolveImageUrl(profileImageUrl)],
            fileName,
            { type: '' },
        );

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(profileImage);
        profileInputElement.files = dataTransfer.files;
    }
    emailTextElement.textContent = data.email;
    nicknameInputElement.value = data.nickname;
};

const observeData = () => {
    const button = document.querySelector('#signupBtn');
    if (
        authData.data.nickname !== changeData.nickname ||
        authData.data.profile_image !== changeData.profileImageUrl
    ) {
        button.disabled = false;
        button.style.backgroundColor = '#7F6AEE';
    } else {
        button.disabled = true;
        button.style.backgroundColor = '#ACA0EB';
    }
};

const changeEventHandler = async (event, uid) => {
    console.log('[changeEventHandler] uid:', uid);
    const button = document.querySelector('#signupBtn');
    if (uid == 'nickname') {
        const value = event.target.value;
        console.log('[nickname] value:', value);
        const isValidNickname = validNickname(value);
        console.log('[nickname] isValidNickname:', isValidNickname);
        const helperElement = nicknameHelpElement;
        let isComplete = false;
        if (value == '' || value == null) {
            helperElement.textContent = '*닉네임을 입력해주세요.';
        } else if (!isValidNickname) {
            helperElement.textContent =
                '*닉네임은 2~10자의 영문자, 한글 또는 숫자만 사용할 수 있습니다. 특수 문자와 띄어쓰기는 사용할 수 없습니다.';
        } else {
            const { status, data } = await checkNickname(value);
            console.log('[nickname] checkNickname status:', status, 'data:', data);
            if (authData.data.nickname === value) {
                console.log('[nickname] 현재 닉네임과 같음 → 버튼 비활성화');
                helperElement.textContent = '';
                button.disabled = true;
                button.style.backgroundColor = '#ACA0EB';
                return;
            } else if (status === HTTP_OK && data === false) {
                console.log('[nickname] 사용 가능 → isComplete = true');
                helperElement.textContent = '';
                isComplete = true;
            } else {
                console.log('[nickname] 중복');
                helperElement.textContent = '*중복된 닉네임 입니다.';
                button.disabled = true;
                button.style.backgroundColor = '#ACA0EB';
                return;
            }
        }
        console.log('[nickname] isComplete:', isComplete);
        if (isComplete) {
            changeData.nickname = value;
        } else {
            changeData.nickname = authData.data.nickname;
        }
    } else if (uid == 'profile') {
    const file = event.target.files[0];
    console.log(changeData.profileImageUrl);
    if (!file) {
        localStorage.removeItem('profileImageUrl');
        profilePreview.src = DEFAULT_PROFILE_IMAGE;
        changeData.profileImageUrl = null;
        if (removeProfileButton) removeProfileButton.style.display = 'none';
    } else {
        const extension = file.name.split('.').pop().toLowerCase();

        try {
            // 1. presigned URL 발급
            const { ok: presignedOk, data: presignedData } = await requestJson(
                `${getServerUrl()}/images/presigned-url`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    body: JSON.stringify({
                        extension,
                        imageType: 'PROFILE', // 백엔드 ImageType enum 값과 일치해야 함
                    }),
                },
            );

            if (!presignedOk) throw new Error('presigned URL 발급 실패');

            const { presignedUrl, s3Url } = presignedData;

            // 2. S3에 직접 PUT 업로드 (백엔드 경유 X)
            const uploadResponse = await fetch(presignedUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!uploadResponse.ok) throw new Error('S3 업로드 실패');

            // 3. 로컬 상태 갱신 (실제 반영은 sendModifyData에서 userModify 호출 시 처리됨)
            localStorage.setItem('profileImageUrl', s3Url);
            changeData.profileImageUrl = s3Url;
            profilePreview.src = resolveImageUrl(s3Url, DEFAULT_PROFILE_IMAGE);
            if (removeProfileButton) removeProfileButton.style.display = 'flex';
        } catch (error) {
            console.error('업로드 중 오류 발생:', error);
        }
    }

    console.log('[observeData 호출 전] changeData:', changeData);
    console.log('[observeData 호출 전] authData.data:', authData.data);
  
    observeData();
        console.log('[observeData 호출 후] button.disabled:', document.querySelector('#signupBtn').disabled);
    }
};

const sendModifyData = async () => {
    const button = document.querySelector('#signupBtn');

    if (!button.disabled) {
        if (changeData.nickname === '') {
            Dialog('필수 정보 누락', '닉네임을 입력해주세요.');
        } else {
            const { status } = await userModify(changeData);

            if (status === HTTP_OK) {
                localStorage.removeItem('profileImageUrl');
                saveToastMessage('수정완료');
                location.href = '/html/modifyInfo.html';
            } else {
                localStorage.removeItem('profileImageUrl');
                saveToastMessage('수정실패');
                location.href = '/html/modifyInfo.html';
            }
        }
    }
};

// 회원 탈퇴
const deleteAccount = async () => {
    const callback = async () => {
        const { status } = await userDelete();

        if (status === HTTP_OK) {
            try {
                await requestJson(`${getServerUrl()}/auth/token`, {
                    method: 'DELETE',
                    credentials: 'include',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
            } catch (error) {
                console.error('로그아웃 요청 실패:', error);
            }
            localStorage.clear(); 
            location.href = '/html/login.html';
        } else {
            Dialog('회원 탈퇴 실패', '회원 탈퇴에 실패했습니다.');
        }
    };

    Dialog(
        '회원탈퇴 하시겠습니까?',
        '작성된 게시글과 댓글은 삭제 됩니다.',
        callback,
    );
};

const addEvent = () => {
    nicknameInputElement.addEventListener('change', event =>
        changeEventHandler(event, 'nickname'),
    );
    profileInputElement.addEventListener('change', event =>
        changeEventHandler(event, 'profile'),
    );
    if (removeProfileButton) {
        removeProfileButton.addEventListener('click', () => {
            localStorage.removeItem('profileImageUrl');
            profilePreview.src = DEFAULT_PROFILE_IMAGE;
            changeData.profileImageUrl = null;
            profileInputElement.value = '';
            removeProfileButton.style.display = 'none';
            observeData();
        });
    }
    modifyBtnElement.addEventListener('click', async () => sendModifyData());
    withdrawBtnElement.addEventListener('click', async () => deleteAccount());
};

const showToast = (message, duration = 3000, callback = null) => {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.classList.add('toastMessage');
    toast.textContent = message;

    container.appendChild(toast);

    // 메시지를 보여주기
    setTimeout(() => {
        toast.style.opacity = 1;
        // 조금 더 위로 올라가는 효과를 줄 수 있음
        toast.style.bottom = '30px';
    }, 100);

    // 메시지 숨기기 및 콜백 실행
    setTimeout(() => {
        toast.style.opacity = 0;
        // 원래 위치로 돌아가며 사라지는 효과
        toast.style.bottom = '20px';
        setTimeout(() => {
            // 페이드 아웃이 끝난 후 요소 제거
            toast.remove();
            // 콜백 함수가 있으면 실행
            if (callback) callback();
        }, 500); // CSS transition 시간에 맞춰 설정
    }, duration);
};

const saveToastMessage = message => {
    sessionStorage.setItem('toastMessage', message);
};

// 토스트 메시지 표시 및 저장소에서 삭제
const displayToastFromStorage = () => {
    const message = sessionStorage.getItem('toastMessage');
    if (message) {
        showToast(message, 3000, () => {
            // 메시지 삭제
            sessionStorage.removeItem('toastMessage');
        }); // 메시지를 표시하는 기존 함수 사용
    }
};

const init = () => {
    const profileImage =
        resolveImageUrl(authData.data.profile_image, DEFAULT_PROFILE_IMAGE);

    prependChild(document.body, Header('커뮤니티', 2, profileImage));
    setData(authData.data);
    observeData();
    addEvent();
    displayToastFromStorage();
};

init();
