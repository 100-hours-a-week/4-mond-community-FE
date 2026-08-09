import { changePassword } from '../api/modifyPasswordRequest.js';
import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    getServerUrl,
    prependChild,
    resolveImageUrl,
    validPassword,
} from '../utils/function.js';

const button = document.querySelector('#signupBtn');

const DEFAULT_PROFILE_IMAGE = '../public/image/profile/default.jpg';
const HTTP_OK = 200;

const dataResponse = await authCheck();
const data = await dataResponse.json();
const profileImage = resolveImageUrl(
    data.data.profile_image,
    DEFAULT_PROFILE_IMAGE,
);

const modifyData = {
    password: '',
    passwordCheck: '',
};

/* 💡 오렌지 테마 동적 버튼 스타일 제어 */
const observeData = () => {
    const { password, passwordCheck } = modifyData;

    if (!password || !passwordCheck || password !== passwordCheck) {
        button.disabled = true;
        button.style.backgroundColor = '#d9d9d9';
    } else {
        button.disabled = false;
        button.style.backgroundColor = '#ff6b35';
    }
};

const blurEventHandler = async (event, uid) => {
    if (uid == 'pw') {
        const value = event.target.value;
        const isValidPassword = validPassword(value);
        const helperElement = document.querySelector(
            `.inputBox p[name="${uid}"]`,
        );
        const helperElementCheck = document.querySelector(
            `.inputBox p[name="pwck"]`,
        );

        if (!helperElement) return;

        if (value == '' || value == null) {
            helperElement.textContent = '*비밀번호를 입력해주세요.';
            helperElementCheck.textContent = '';
            modifyData.password = '';
        } else if (!isValidPassword) {
            helperElement.textContent =
                '*비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.';
            helperElementCheck.textContent = '';
            modifyData.password = ''; /* 💡 유효하지 않을 경우 초기화 */
        } else {
            helperElement.textContent = '';
            modifyData.password = value;

            /* 💡 pwck가 이미 입력되어 있을 경우 비밀번호 일치 재확인 */
            if (modifyData.passwordCheck) {
                if (modifyData.password !== modifyData.passwordCheck) {
                    helperElementCheck.textContent = '*비밀번호가 다릅니다.';
                } else {
                    helperElementCheck.textContent = '';
                }
            }
        }
    } else if (uid == 'pwck') {
        const value = event.target.value;
        const helperElement = document.querySelector(
            `.inputBox p[name="${uid}"]`,
        );
        const password = modifyData.password;

        if (value == '' || value == null) {
            helperElement.textContent = '*비밀번호 한번 더 입력해주세요.';
            modifyData.passwordCheck = '';
        } else if (password !== value) {
            helperElement.textContent = '*비밀번호가 다릅니다.';
            modifyData.passwordCheck = ''; /* 💡 불일치 시 초기화 */
        } else {
            helperElement.textContent = '';
            modifyData.passwordCheck = value;
        }
    }

    observeData();
};

const addEventForInputElements = () => {
    const InputElement = document.querySelectorAll('input');
    InputElement.forEach(element => {
        const id = element.id;

        element.addEventListener('input', event => blurEventHandler(event, id));
    });
};

const modifyPassword = async () => {
    const { password } = modifyData;

    const { status } = await changePassword(password);

    if (status == HTTP_OK) {
        try {
            await fetch(`${getServerUrl()}/auth/token`, {  
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
        Dialog('비밀번호 변경 실패', () => {
            location.href = '/html/modifyPassword.html';
        });
    }
};

const init = () => {
    button.addEventListener('click', modifyPassword);
    prependChild(document.body, Header('커뮤니티', 1, profileImage));
    addEventForInputElements();
    observeData();
};

init();