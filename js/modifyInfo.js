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
    profileImageUrl: authData.data.profile_image || null,
};

const DEFAULT_PROFILE_IMAGE = '../public/image/profile/default.jpg';
const HTTP_OK = 200;
const HTTP_CREATED = 201;

const setData = data => {
    if (data.profile_image === null) {
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

/* 💡 오렌지 테마 색상 상태 감시 */
const observeData = () => {
    const button = document.querySelector('#signupBtn');
    if (
        authData.data.nickname !== changeData.nickname ||
        authData.data.profile_image !== changeData.profileImageUrl
    ) {
        button.disabled = false;
        button.style.backgroundColor = '#ff6b35'; /* 활성화 시 메인 오렌지 */
    } else {
        button.disabled = true;
        button.style.backgroundColor = '#d9d9d9'; /* 비활성화 시 연한 그레이 */
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
                console.log('[nickname] 현재 닉네임과 같음');
                helperElement.textContent = '';
                isComplete = false;
            } else if (status === HTTP_OK && data === false) {
                console.log('[nickname] 사용 가능 → isComplete = true');
                helperElement.textContent = '';
                isComplete = true;
            } else {
                console.log('[nickname] 중복');
                helperElement.textContent = '*중복된 닉네임 입니다.';
                isComplete = false;
            }
        }

        if (isComplete) {
            changeData.nickname = value;
        } else {
            changeData.nickname = authData.data.nickname;
        }

        // 💡 [수정 핵심] 닉네임 검증 후 observeData()를 실행해 버튼을 활성화시킵니다.
        observeData();

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
                            imageType: 'PROFILE',
                        }),
                    },
                );

                if (!presignedOk) throw new Error('presigned URL 발급 실패');

                const { presignedUrl, s3Url } = presignedData;

                const uploadResponse = await fetch(presignedUrl, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': file.type,
                    },
                    body: file,
                });

                if (!uploadResponse.ok) throw new Error('S3 업로드 실패');

                localStorage.setItem('profileImageUrl', s3Url);
                changeData.profileImageUrl = s3Url;
                profilePreview.src = resolveImageUrl(s3Url, DEFAULT_PROFILE_IMAGE);
                if (removeProfileButton) removeProfileButton.style.display = 'flex';
            } catch (error) {
                console.error('업로드 중 오류 발생:', error);
            }
        }

        observeData();
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
    // 💡 [수정] change 대신 input 이벤트로 변경하여 타이핑 시 즉시 반응하게 만듭니다.
    nicknameInputElement.addEventListener('input', event =>
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

    setTimeout(() => {
        toast.style.opacity = 1;
        toast.style.bottom = '30px';
    }, 100);

    setTimeout(() => {
        toast.style.opacity = 0;
        toast.style.bottom = '20px';
        setTimeout(() => {
            toast.remove();
            if (callback) callback();
        }, 500);
    }, duration);
};

const saveToastMessage = message => {
    sessionStorage.setItem('toastMessage', message);
};

const displayToastFromStorage = () => {
    const message = sessionStorage.getItem('toastMessage');
    if (message) {
        showToast(message, 3000, () => {
            sessionStorage.removeItem('toastMessage');
        });
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