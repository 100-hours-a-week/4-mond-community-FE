import Dialog from '../component/dialog/dialog.js';
import Header from '../component/header/header.js';
import {
    authCheck,
    getQueryString,
    getServerUrl,
    prependChild,
    resolveImageUrl,
} from '../utils/function.js';
import {
    createPost,
    fileUpload,
    updatePost,
    getBoardItem,
} from '../api/board-writeRequest.js';

const HTTP_OK = 200;
const HTTP_CREATED = 201;

const MAX_TITLE_LENGTH = 26;
const MAX_CONTENT_LENGTH = 1500;

const DEFAULT_PROFILE_IMAGE = '../public/image/profile/default.jpg';

const submitButton = document.querySelector('#submit');
const titleInput = document.querySelector('#title');
const contentInput = document.querySelector('#content');
const imageInput = document.querySelector('#image');
const imagePreviewText = document.getElementById('imagePreviewText');
const contentHelpElement = document.querySelector(
    '.inputBox p[name="content"]',
);

const boardWrite = {
    title: '',
    content: '',
};

let isModifyMode = false;
let modifyData = {};

/* 💡 오렌지 테마 적용 */
const observeSignupData = () => {
    const { title, content } = boardWrite;
    if (!title || !content || title.trim() === '' || content.trim() === '') {
        submitButton.disabled = true;
        submitButton.style.backgroundColor = '#d9d9d9'; /* 비활성화 연한 그레이 */
    } else {
        submitButton.disabled = false;
        submitButton.style.backgroundColor = '#ff6b35'; /* 활성화 메인 오렌지 */
    }
};

// 엘리먼트 값 가져오기 title, content
const getBoardData = () => {
    return {
        title: boardWrite.title,
        post_content: boardWrite.content,
        attach_file_url:
            localStorage.getItem('postFileUrl') === null
                ? undefined
                : localStorage.getItem('postFileUrl'),
    };
};

// 버튼 클릭시 이벤트
const addBoard = async () => {
    const boardData = getBoardData();

    if (!boardData) return Dialog('게시글', '게시글을 입력해주세요.');

    if (boardData.title.length > MAX_TITLE_LENGTH)
        return Dialog('게시글', '제목은 26자 이하로 입력해주세요.');

    if (!isModifyMode) {
        const { ok, status, data } = await createPost(boardData);
        if (!ok) throw new Error('서버 응답 오류');

        if (status === HTTP_CREATED) {
            localStorage.removeItem('postFileUrl');
            window.location.href = `/html/board.html?id=${data.post_id}`;
        } else {
            const helperElement = contentHelpElement;
            helperElement.textContent = '제목, 내용을 모두 작성해주세요.';
        }
    } else {
        const postId = getQueryString('postId');
        const setData = {
            ...boardData,
        };

        const { ok, status } = await updatePost(postId, setData);
        if (!ok) throw new Error('서버 응답 오류');

        if (status === HTTP_OK) {
            localStorage.removeItem('postFileUrl');
            window.location.href = `/html/board.html?id=${postId}`;
        } else {
            Dialog('게시글', '게시글 수정 실패');
        }
    }
};

const changeEventHandler = async (event, uid) => {
    if (uid == 'title') {
        const value = event.target.value;
        const helperElement = contentHelpElement;
        if (!value || value == '') {
            boardWrite[uid] = '';
            helperElement.textContent = '제목을 입력해주세요.';
        } else if (value.length > MAX_TITLE_LENGTH) {
            helperElement.textContent = '제목은 26자 이하로 입력해주세요.';
            titleInput.value = value.substring(0, MAX_TITLE_LENGTH);
            boardWrite[uid] = value.substring(0, MAX_TITLE_LENGTH);
        } else {
            boardWrite[uid] = value;
            helperElement.textContent = '';
        }
    } else if (uid == 'content') {
        const value = event.target.value;
        const helperElement = contentHelpElement;
        if (!value || value == '') {
            boardWrite[uid] = '';
            helperElement.textContent = '내용을 입력해주세요.';
        } else if (value.length > MAX_CONTENT_LENGTH) {
            helperElement.textContent = '내용은 1500자 이하로 입력해주세요.';
            contentInput.value = value.substring(0, MAX_CONTENT_LENGTH);
            boardWrite[uid] = value.substring(0, MAX_CONTENT_LENGTH);
        } else {
            boardWrite[uid] = value;
            helperElement.textContent = '';
        }
    } else if (uid == 'image') {
        const file = event.target.files[0];
        if (!file) {
            console.log('파일이 선택되지 않았습니다.');
            return;
        }

        try {
            const s3Url = await fileUpload(file);
            localStorage.setItem('postFileUrl', s3Url);
        } catch (error) {
            console.error('업로드 중 오류 발생:', error);
        }
    } else if (uid === 'imagePreviewText') {
        localStorage.removeItem('postFileUrl');
        imagePreviewText.style.display = 'none';
    }

    observeSignupData();
};

const getBoardModifyData = async postId => {
    const { ok, data } = await getBoardItem(postId);
    if (!ok) throw new Error('서버 응답 오류');
    return data;
};

const checkModifyMode = () => {
    const postId = getQueryString('postId');
    if (!postId) return false;
    return postId;
};

const addEvent = () => {
    submitButton.addEventListener('click', addBoard);
    titleInput.addEventListener('input', event =>
        changeEventHandler(event, 'title'),
    );
    contentInput.addEventListener('input', event =>
        changeEventHandler(event, 'content'),
    );
    imageInput.addEventListener('change', event =>
        changeEventHandler(event, 'image'),
    );
    if (imagePreviewText !== null) {
        imagePreviewText.addEventListener('click', event =>
            changeEventHandler(event, 'imagePreviewText'),
        );
    }
};

const setModifyData = data => {
    titleInput.value = data.title;
    contentInput.value = data.post_content;

    const fileUrl = data.fileUrl || resolveImageUrl(data.filePath);
    if (fileUrl) {
        const fileName = fileUrl.split('/').pop();
        imagePreviewText.innerHTML =
            fileName + `<span class="deleteFile">X</span>`;
        imagePreviewText.style.display = 'block';
        localStorage.setItem('postFileUrl', fileUrl);

        const attachFile = new File(
            [fileUrl],
            fileName,
            { type: '' },
        );

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(attachFile);
        imageInput.files = dataTransfer.files;
    } else {
        imagePreviewText.style.display = 'none';
    }

    boardWrite.title = data.title;
    boardWrite.content = data.post_content;

    observeSignupData();
};

const init = async () => {
    const dataResponse = await authCheck();
    const data = await dataResponse.json();
    const modifyId = checkModifyMode();

    const profileImage = resolveImageUrl(
        data.data.profile_image,
        DEFAULT_PROFILE_IMAGE,
    );

    prependChild(document.body, Header('커뮤니티', 1, profileImage));

    if (modifyId) {
        isModifyMode = true;
        modifyData = await getBoardModifyData(modifyId);

        if (data.idx !== modifyData.writerId) {
            Dialog('권한 없음', '권한이 없습니다.', () => {
                window.location.href = '/';
            });
        } else {
            setModifyData(modifyData);
        }
    } else {
        observeSignupData();
    }

    addEvent();
};

init();