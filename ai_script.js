// Section Navigation Logic
function showSection(sectionId) {
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(sec => {
        sec.style.display = 'none';
        sec.classList.remove('active');
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
        setTimeout(() => target.classList.add('active'), 10);
    }

    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.classList.remove('active');
    });

    const navContainer = document.querySelector('.ai-nav');
    if (navContainer) {
        const menuBtns = navContainer.querySelectorAll('.nav-btn');
        // Handle special case for My Page button which might not be in the main loop logic perfectly
        const activeMenuBtn = Array.from(menuBtns).find(btn => btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(sectionId));
        if (activeMenuBtn) {
            activeMenuBtn.classList.add('active');
        }
    }

    // Auto-select actions
    if (sectionId === 'kdc_recommend') {
        filterKDC('800');
    }
    if (sectionId === 'mypage') {
        updateMyPageUI();
    }
}


/* ===============================
   User Management Logic 
   Handles Login, Signup, Data Separation
================================ */
let currentUser = null; // Holds the current user name

// Check login status on load
function checkLoginStatus() {
    const savedUser = localStorage.getItem('ai_reading_current_user');
    if (savedUser) {
        currentUser = savedUser;
        updateUserUI(true);
    } else {
        updateUserUI(false);
    }
}

function updateUserUI(isLoggedIn) {
    const btn = document.getElementById('userStatusBtn');
    const display = document.getElementById('currentUserDisplay');

    if (isLoggedIn) {
        display.innerText = currentUser + '님';
        btn.style.borderColor = '#4CAF50';
        btn.style.color = '#2E7D32';
    } else {
        display.innerText = '로그인';
        btn.style.borderColor = '#9E9E9E';
        btn.style.color = '#757575';
    }
}

function handleUserClick() {
    if (currentUser) {
        // If logged in, go to My Page
        showSection('mypage');
    } else {
        // If not logged in, show Login Modal
        const modal = document.getElementById('loginModal');
        modal.style.display = 'block';
        document.getElementById('loginNameInput').focus();
    }
}

function loginUser() {
    const input = document.getElementById('loginNameInput');
    const name = input.value.trim();

    if (!name) {
        alert('이름을 입력해주세요!');
        return;
    }

    currentUser = name;
    localStorage.setItem('ai_reading_current_user', currentUser);

    // Reset input
    input.value = '';

    // Close modal
    document.getElementById('loginModal').style.display = 'none';

    // Update UI and go to My Page
    updateUserUI(true);
    showSection('mypage'); // This will trigger updateMyPageUI()

    // Welcome message
    alert(`${currentUser}님, 환영합니다! 🚀`);

    // Refresh Library books for this user
    loadBooks();
}

function logoutUser() {
    if (confirm('정말 로그아웃 하시겠습니까?')) {
        currentUser = null;
        localStorage.removeItem('ai_reading_current_user');
        updateUserUI(false);
        showSection('intro'); // Go back to home
        loadBooks(); // Clear library view or show empty
    }
}

function updateMyPageUI() {
    if (!currentUser) return;

    document.getElementById('mypageName').innerText = `${currentUser}님의 독서 공간`;

    // Get stats
    const userStorageKey = `ai_reading_logs_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    const count = logs.length;

    document.getElementById('mypageBookCount').innerText = `${count} 권`;

    // Determine Badge
    let badge = '🌱 독서 새싹';
    if (count >= 30) badge = '👑 독서의 신';
    else if (count >= 10) badge = '🚀 독서 탐험가';
    else if (count >= 5) badge = '📚 책 좋아하는 어린이';

    document.getElementById('mypageBadge').innerText = badge;

    // Load Selection Logs (NEW)
    loadSelectionLogs();
}

/* ===============================
   KDC Recommendation Data & Logic
================================ */

const kdcBookData = {
    '000': [
        { title: "도서관에 간 사자", desc: "도서관에는 어떤 규칙이 있을까요?", color: "#B0BEC5" },
        { title: "백과사전 뚫고 나온 상식", desc: "세상 모든 궁금증을 해결해요.", color: "#B0BEC5" }
    ],
    '100': [
        { title: "생각하는 어린이가 힘이 세다", desc: "철학이 무엇인지 쉽게 배워요.", color: "#FFCC80" },
        { title: "12살에 부자가 된 키라", desc: "올바른 가치관과 경제 습관.", color: "#FFCC80" }
    ],
    '200': [
        { title: "그리스 로마 신화", desc: "신들의 세계로 떠나는 모험.", color: "#CE93D8" },
        { title: "세계의 종교 이야기", desc: "서로 다른 문화를 이해해요.", color: "#CE93D8" }
    ],
    '300': [
        { title: "어린이를 위한 정치란 무엇인가", desc: "우리가 사는 사회의 규칙.", color: "#90CAF9" },
        { title: "법을 아는 어린이가 리더가 된다", desc: "약속과 법에 대한 이야기.", color: "#90CAF9" }
    ],
    '400': [
        { title: "재밌어서 밤새 읽는 화학 이야기", desc: "우리 주변의 모든 것이 화학이라고?", color: "#81D4FA" },
        { title: "코스모스 (어린이판)", desc: "우주의 신비를 탐험해요.", color: "#81D4FA" }
    ],
    '500': [
        { title: "엔트리로 배우는 코딩", desc: "나만의 게임을 만들어봐요!", color: "#80CBC4" },
        { title: "세상을 바꾼 기술", desc: "증기기관부터 AI까지.", color: "#80CBC4" }
    ],
    '600': [
        { title: "명화로 보는 미술사", desc: "그림 속에 숨겨진 이야기를 찾아라.", color: "#FFAB91" },
        { title: "빈센트 반 고흐", desc: "별이 빛나는 밤을 그린 화가.", color: "#FFAB91" }
    ],
    '700': [
        { title: "말이 통하는 영어 회화", desc: "자신감 있게 영어로 말해요.", color: "#C5E1A5" },
        { title: "훈민정음 해례본", desc: "한글의 위대함을 배워요.", color: "#C5E1A5" }
    ],
    '800': [
        { title: "시간을 파는 상점", desc: "시간을 사고 판다면 어떤 일이 벌어질까?", color: "#FFAB91" },
        { title: "아몬드", desc: "감정을 느끼지 못하는 소년의 이야기.", color: "#FFAB91" },
        { title: "이상한 과자 가게 전천당", desc: "소원을 들어주는 신비한 과자.", color: "#FFAB91" }
    ],
    '900': [
        { title: "한국사 편지", desc: "할아버지가 들려주는 우리 역사 이야기.", color: "#B39DDB" },
        { title: "세계사 톡톡", desc: "세계 여러 나라의 역사.", color: "#B39DDB" }
    ]
};

// KDC Divisions Data
const kdcDivisions = {
    '000': '000 총류 | 010 도서학,서지학 | 020 문헌정보학 | 030 백과사전 | 040 강연집 | 050 연속간행물 | 060 학회,협회 | 070 신문,언론 | 080 일반전집 | 090 향토자료',
    '100': '100 철학 | 110 형이상학 | 120 인식론 | 130 철학의 체계 | 140 경학 | 150 동양철학 | 160 서양철학 | 170 논리학 | 180 심리학 | 190 윤리학',
    '200': '200 종교 | 210 비교종교 | 220 불교 | 230 기독교 | 240 도교 | 250 천도교 | 260 신종교 | 270 힌두교 | 280 이슬람교 | 290 기타제종교',
    '300': '300 사회 | 310 통계학 | 320 경제학 | 330 사회학 | 340 정치학 | 350 행정학 | 360 법학 | 370 교육학 | 380 풍속,민속 | 390 국방,군사',
    '400': '400 과학 | 410 수학 | 420 물리학 | 430 화학 | 440 천문학 | 450 지학 | 460 광물학 | 470 생명과학 | 480 식물학 | 490 동물학',
    '500': '500 기술 | 510 의학 | 520 농업 | 530 공학 | 540 건축 | 550 기계공학 | 560 전기공학 | 570 화학공학 | 580 제조업 | 590 생활과학',
    '600': '600 예술 | 610 건축술 | 620 조각 | 630 공예 | 640 서예 | 650 회화 | 660 사진 | 670 음악 | 680 연극 | 690 오락,스포츠',
    '700': '700 언어 | 710 한국어 | 720 중국어 | 730 일본어 | 740 영어 | 750 독일어 | 760 프랑스어 | 770 스페인어 | 780 이탈리아어 | 790 기타제어',
    '800': '800 문학 | 810 한국문학 | 820 중국문학 | 830 일본문학 | 840 영미문학 | 850 독일문학 | 860 프랑스문학 | 870 스페인문학 | 880 이탈리아문학 | 890 기타제문학',
    '900': '900 역사 | 910 아시아 | 920 유럽 | 930 아프리카 | 940 북아메리카 | 950 남아메리카 | 960 오세아니아 | 970 양극지방 | 980 지리 | 990 전기'
};

function filterKDC(kdcCode) {
    const infoPanel = document.getElementById('kdc-info-panel');
    const divisions = kdcDivisions[kdcCode];
    if (divisions && infoPanel) {
        infoPanel.style.display = 'block';
        infoPanel.innerHTML = `<strong>💡 ${kdcCode}번대는 이런 내용이 있어요:</strong><br><span style="font-size:0.9rem; color:#555;">${divisions}</span>`;
    }

    const list = document.getElementById('kdc-book-list');
    list.innerHTML = '';

    const books = kdcBookData[kdcCode];
    if (books) {
        books.forEach(b => {
            const card = document.createElement('div');
            card.className = 'book-card';
            card.style.cssText = 'background:white; padding:15px; border-radius:10px; border:2px solid #EEE; animation: fadeIn 0.3s;';
            card.innerHTML = `
                <div style="background:${b.color}; color:white; padding:5px; border-radius:5px; display:inline-block; margin-bottom:10px;">${kdcCode}</div>
                <h4 style="margin:0 0 10px 0;">${b.title}</h4>
                <p style="color:#666; font-size:0.9rem;">${b.desc}</p>
            `;
            list.appendChild(card);
        });
    } else {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">등록된 도서가 없습니다.</p>';
    }

    const kdcTabs = document.querySelector('.kdc-tabs');
    if (kdcTabs) {
        const btns = kdcTabs.querySelectorAll('.nav-btn');
        btns.forEach(b => {
            if (b.innerText.startsWith(kdcCode)) {
                b.style.background = '#FF6F00';
                b.style.color = 'white';
            } else {
                b.style.background = 'white';
                b.style.color = '#5D4037';
            }
        });
    }
}


// AI Prompt Generation
function generatePrompt() {
    const interest = document.getElementById('interestInput').value.trim();
    const mood = document.getElementById('moodSelect').value;
    const favBook = document.getElementById('favBookInput').value.trim();

    if (!interest) {
        alert('관심 있는 주제를 적어주세요! 예: 공룡, 우주, 요리');
        return;
    }

    let prompt = `당신은 초등학교 5~6학년을 위한 다정한 도서 추천 사서 선생님입니다.\n`;
    prompt += `학생이 다음과 같은 관심사를 가지고 책을 찾고 있습니다.\n\n`;
    prompt += `- 관심 주제: ${interest}\n`;
    prompt += `- 원하는 분위기: ${mood}\n`;
    if (favBook) {
        prompt += `- 재미있게 읽은 책: "${favBook}"\n`;
    }
    prompt += `\n위 내용을 바탕으로 초등학생이 읽기 좋은 책 3권을 추천해주세요.\n`;
    prompt += `각 책에 대해 추천하는 이유를 학생의 눈높이에 맞춰 친절하고 재미있게 설명해주세요.`;

    const resultArea = document.getElementById('resultArea');
    const output = document.getElementById('promptOutput');

    output.value = prompt;
    resultArea.style.display = 'block';

    resultArea.scrollIntoView({ behavior: 'smooth' });
}

function copyPrompt() {
    const output = document.getElementById('promptOutput');
    output.select();
    document.execCommand('copy');
    alert('프롬프트가 복사되었습니다! AI 채팅창에 붙여넣기 해보세요.');
}

/* ===============================
   Modal Logic 
================================ */

// Helper to close all modals
function closeAllModals(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    });
}
window.onclick = closeAllModals;

function openBookmatch() {
    document.getElementById('bookmatchModal').style.display = 'block';
}
function closeBookmatch() {
    document.getElementById('bookmatchModal').style.display = 'none';
}

function openSelfSelectionModal() {
    document.getElementById('selfSelectionModal').style.display = 'block';
}
function closeSelfSelectionModal() {
    document.getElementById('selfSelectionModal').style.display = 'none';
}

function openAttitudeTestModal() {
    document.getElementById('attitudeTestModal').style.display = 'block';
    document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
    document.getElementById('attitudeResult').style.display = 'none';
}
function closeAttitudeTestModal() {
    document.getElementById('attitudeTestModal').style.display = 'none';
}

function checkAttitude() {
    let score = 0;
    let answeredCount = 0;
    const totalQuestions = 5;

    for (let i = 1; i <= totalQuestions; i++) {
        const radios = document.getElementsByName('q' + i);
        let checked = false;
        for (const r of radios) {
            if (r.checked) {
                score += parseInt(r.value);
                checked = true;
                break;
            }
        }
        if (checked) answeredCount++;
    }

    if (answeredCount < totalQuestions) {
        alert('모든 문항에 체크해주세요! ✍️');
        return;
    }

    const resultDiv = document.getElementById('attitudeResult');
    const scoreText = document.getElementById('attitudeScoreText');
    const comment = document.getElementById('attitudeComment');

    resultDiv.style.display = 'block';
    scoreText.innerText = `나의 독서 태도 점수는: ${score}점 / 25점`;

    if (score >= 20) {
        comment.innerText = "와우! 당신은 책을 정말 사랑하는 '독서 영웅'이군요! 🦸‍♂️🦸‍♀️ 앞으로도 즐겁게 읽어봐요.";
    } else if (score >= 15) {
        comment.innerText = "멋져요! 당신은 책과 친해지고 있는 '독서 탐험가'입니다. 🧭 더 재미있는 책들을 찾아볼까요?";
    } else {
        comment.innerText = "괜찮아요! 독서의 즐거움을 천천히 알아가는 단계네요. 🌱 흥미로운 책부터 가볍게 시작해봐요!";
    }
}

// 4. Padlet Integration
function openPadlet() {
    alert("📢 선생님의 패들렛 주소로 연결됩니다.\n(예시 주소: https://padlet.com/)");
    window.open("https://padlet.com/", "_blank");
}

// 5. Profile Card Logic
function openProfileCardModal() {
    const modal = document.getElementById('profileCardModal');
    modal.style.display = 'block';
    if (currentUser) {
        document.getElementById('profileName').value = currentUser;
    }
    document.getElementById('profileCardResult').style.display = 'none';
}

function closeProfileCardModal() {
    document.getElementById('profileCardModal').style.display = 'none';
}

function createProfileCard() {
    const name = document.getElementById('profileName').value.trim();
    const genreCheckboxes = document.querySelectorAll('input[name="genre"]:checked');
    const styleRadio = document.querySelector('input[name="style"]:checked');

    if (!name) {
        alert('이름을 입력해주세요!');
        return;
    }
    if (genreCheckboxes.length === 0) {
        alert('좋아하는 장르를 최소 1개 선택해주세요!');
        return;
    }
    if (!styleRadio) {
        alert('나의 독서 스타일을 선택해주세요!');
        return;
    }

    const genres = Array.from(genreCheckboxes).map(cb => cb.value).join(', ');
    const style = styleRadio.value;

    document.getElementById('cardName').innerText = `${name}의 독서 카드`;
    document.getElementById('cardGenres').innerText = genres;
    document.getElementById('cardStyle').innerText = style;

    document.getElementById('profileCardResult').style.display = 'block';
}

// 6. AI Ethics Modal Logic
function openAIEthicsModal() {
    document.getElementById('aiEthicsModal').style.display = 'block';
}

function closeAIEthicsModal() {
    document.getElementById('aiEthicsModal').style.display = 'none';
}

// 7. Drawing Board Logic (Canvas)
let canvas, ctx;
let isDrawing = false;
let brushColor = '#000000';
let brushSize = 5;

function openDrawingModal() {
    document.getElementById('drawingModal').style.display = 'block';

    // Initialize Canvas
    if (!canvas) {
        canvas = document.getElementById('drawingCanvas');
        ctx = canvas.getContext('2d');

        // Event Listeners
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        // Touch Support
        canvas.addEventListener('touchstart', (e) => {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent("mousedown", {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
        }, false);
        canvas.addEventListener('touchmove', (e) => {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent("mousemove", {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            canvas.dispatchEvent(mouseEvent);
            e.preventDefault(); // Prevent scrolling
        }, false);
        canvas.addEventListener('touchend', (e) => {
            const mouseEvent = new MouseEvent("mouseup", {});
            canvas.dispatchEvent(mouseEvent);
        }, false);

        // Brush Settings
        const colorPicker = document.getElementById('colorPicker');
        colorPicker.addEventListener('change', (e) => {
            brushColor = e.target.value;
        });

        const sizeSlider = document.getElementById('brushSize');
        sizeSlider.addEventListener('input', (e) => {
            brushSize = e.target.value;
            document.getElementById('brushSizeDisplay').innerText = brushSize;
        });
    }
}

function closeDrawingModal() {
    document.getElementById('drawingModal').style.display = 'none';
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function setBrush() {
    brushColor = document.getElementById('colorPicker').value;
}

function setEraser() {
    brushColor = '#FFFFFF';
}

function clearCanvas() {
    if (confirm('모든 그림을 지울까요?')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function saveDrawing() {
    const link = document.createElement('a');
    link.download = `my_drawing_${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}


/* ===============================
   My Library Logic (UPDATED for User Management)
================================ */

function loadBooks() {
    const list = document.getElementById('bookLogList');
    list.innerHTML = '';

    if (!currentUser) {
        list.innerHTML = '<li style="text-align:center; color:#888;">로그인 후 독서 기록을 남겨보세요! 🔐</li>';
        return;
    }

    // Use User specific Key
    const userStorageKey = `ai_reading_logs_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');

    if (logs.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#888;">아직 기록된 책이 없어요. 첫 번째 책을 기록해보세요!</li>';
        return;
    }

    logs.reverse().forEach(log => {
        const li = document.createElement('li');
        li.className = 'log-item';

        const kdcBadge = log.kdc ? `<span style="background:#4DB6AC; color:white; padding:2px 6px; border-radius:4px; font-size:0.8rem; margin-right:5px;">KDC ${log.kdc}</span>` : '';

        li.innerHTML = `
            <div class="log-title">${kdcBadge} ${log.title}</div>
            <div style="margin: 5px 0;">${log.thought}</div>
            <div class="log-date">${log.date}</div>
        `;
        list.appendChild(li);
    });
}

function addBookLog() {
    if (!currentUser) {
        alert('기록을 저장하려면 먼저 로그인해주세요!');
        handleUserClick(); // Show login modal
        return;
    }

    const kdcInput = document.getElementById('kdcInput');
    const titleInput = document.getElementById('bookInput');
    const thoughtInput = document.getElementById('thoughtInput');

    const kdc = kdcInput.value.trim();
    const title = titleInput.value.trim();
    const thought = thoughtInput.value.trim();

    if (!title) {
        alert('책 제목을 입력해주세요!');
        return;
    }

    const newLog = {
        kdc: kdc,
        title: title,
        thought: thought,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
    };

    // Save to User Specific LocalStorage
    const userStorageKey = `ai_reading_logs_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    logs.push(newLog);
    localStorage.setItem(userStorageKey, JSON.stringify(logs));

    // Reset inputs
    kdcInput.value = '';
    titleInput.value = '';
    thoughtInput.value = '';

    // Reload list
    loadBooks();
    alert('독서 기록이 저장되었습니다! 📚');
}

// 8. Book Selection Log (NEW)
function addSelectionLog() {
    if (!currentUser) {
        alert('기록을 저장하려면 먼저 로그인해주세요!');
        handleUserClick();
        return;
    }

    const titleInput = document.getElementById('selectionTitle');
    const promiseInput = document.getElementById('selectionPromise');
    const reasonCheckboxes = document.querySelectorAll('input[name="selReason"]:checked');

    const title = titleInput.value.trim();
    const promise = promiseInput.value.trim();

    if (!title) {
        alert('책 제목을 입력해주세요!');
        return;
    }

    if (reasonCheckboxes.length === 0) {
        alert('책을 고른 이유를 적어도 하나 선택해주세요!');
        return;
    }

    const reasons = Array.from(reasonCheckboxes).map(cb => cb.value).join(', ');

    const newLog = {
        title: title,
        reasons: reasons,
        promise: promise,
        date: new Date().toLocaleDateString()
    };

    const userStorageKey = `ai_reading_selections_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    logs.push(newLog);
    localStorage.setItem(userStorageKey, JSON.stringify(logs));

    // Reset Form
    titleInput.value = '';
    promiseInput.value = '';
    reasonCheckboxes.forEach(cb => cb.checked = false);

    loadSelectionLogs();
    alert('나의 선택 기록이 저장되었습니다! 🎉');
}

function loadSelectionLogs() {
    const list = document.getElementById('selectionLogList');
    list.innerHTML = '';

    if (!currentUser) {
        list.innerHTML = '<li style="text-align:center; color:#999;">로그인이 필요합니다.</li>';
        return;
    }

    const userStorageKey = `ai_reading_selections_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');

    if (logs.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#999;">아직 기록된 내용이 없어요.</li>';
        return;
    }

    logs.reverse().forEach(log => {
        const li = document.createElement('li');
        li.style.cssText = "background:white; border:1px solid #EEE; padding:10px; border-radius:5px; margin-bottom:10px; text-align:left;";
        li.innerHTML = `
            <div style="font-weight:bold; color:#1565C0;">📖 ${log.title} <span style="font-size:0.8rem; color:#999; font-weight:normal;">(${log.date})</span></div>
            <div style="font-size:0.9rem; margin-top:5px; color:#555;">✔️ 이유: ${log.reasons}</div>
            ${log.promise ? `<div style="font-size:0.9rem; margin-top:5px; color:#D84315;">🔥 다짐: "${log.promise}"</div>` : ''}
        `;
        list.appendChild(li);
    });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus(); // Check login
    loadBooks();
});
