// Bookmatch Mission Logic
function pickBookmatchMission() {
    const missions = [
        "📕 [B] 두께가 내 새끼손가락보다 얇은 책 찾아오기!",
        "📙 [O] 첫 문장을 읽고 바로 이해되는 책 찾아오기!",
        "📒 [O] 그림이나 사진이 10장 이상 있는 책 찾아오기!",
        "📗 [K] 내가 이미 알고 있는 내용(동물, 공룡 등)이 나오는 책!",
        "📘 [M] 지금 당장 5쪽까지 읽을 수 있는 책!",
        "📔 [A] 제목이 4글자인 책 찾아오기!",
        "📓 [T] 표지 색깔이 파란색인 책 찾아오기!",
        "📕 [C] 표지에 사람 얼굴이 그려진 책 찾기!",
        "📖 [H] 첫 페이지를 읽자마자 뒷내용이 궁금한 책!"
    ];

    const display = document.getElementById('missionDisplay');
    display.innerText = "두구두구두구...";

    // Simple animation effect
    let count = 0;
    const interval = setInterval(() => {
        display.innerText = missions[Math.floor(Math.random() * missions.length)];
        count++;
        if (count > 10) {
            clearInterval(interval);
            const finalMission = missions[Math.floor(Math.random() * missions.length)];
            display.innerHTML = `<span style="color:#e65100; font-size:1.4rem;">🎉 당첨!</span><br>${finalMission}`;
        }
    }, 100);
}

// Map Logic
function openForestMap() {
    document.getElementById('forestMapModal').style.display = 'block';
}

function closeForestMap() {
    document.getElementById('forestMapModal').style.display = 'none';
}

function warpToSection(sectionId) {
    closeForestMap();
    showSection(sectionId);
    window.scrollTo({ top: document.getElementById('main-content').offsetTop, behavior: 'smooth' });
}

// BGM Control
function toggleMusic() {
    const bgm = document.getElementById('bgm');
    const icon = document.getElementById('musicIcon');
    const text = document.querySelector('.music-toggle span');

    if (bgm.paused) {
        bgm.play();
        icon.className = 'fa-solid fa-volume-high';
        text.innerText = 'BGM ON';
        console.log("Music started! Enjoy your adventure.");
    } else {
        bgm.pause();
        icon.className = 'fa-solid fa-volume-xmark';
        text.innerText = 'BGM OFF';
        console.log("Music paused.");
    }
}

// Initial state setup if needed
window.addEventListener('DOMContentLoaded', () => {
    // Some browsers block autoplay, so we wait for user interaction to play
});

// Existing functions...
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
    loadSessionLogs();
    loadAIFeedbackLogs();
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
        { title: "도서관에 간 사자", desc: "도서관에는 어떤 규칙이 있을까요?", color: "#B0BEC5", keywords: ["동물", "도서관", "규칙"] },
        { title: "백과사전 뚫고 나온 상식", desc: "세상 모든 궁금증을 해결해요.", color: "#B0BEC5", keywords: ["지식", "상식"] }
    ],
    '100': [
        { title: "생각하는 어린이가 힘이 세다", desc: "철학이 무엇인지 쉽게 배워요.", color: "#FFCC80", keywords: ["생각", "철학"] },
        { title: "12살에 부자가 된 키라", desc: "올바른 가치관과 경제 습관.", color: "#FFCC80", keywords: ["경제", "부자", "습관"] }
    ],
    '200': [
        { title: "그리스 로마 신화", desc: "신들의 세계로 떠나는 모험.", color: "#CE93D8", keywords: ["신화", "모험", "상상"] },
        { title: "세계의 종교 이야기", desc: "서로 다른 문화를 이해해요.", color: "#CE93D8", keywords: ["종교", "문화"] }
    ],
    '300': [
        { title: "어린이를 위한 정치란 무엇인가", desc: "우리가 사는 사회의 규칙.", color: "#90CAF9", keywords: ["사회", "정치"] },
        { title: "법을 아는 어린이가 리더가 된다", desc: "약속과 법에 대한 이야기.", color: "#90CAF9", keywords: ["법", "사회", "리더"] }
    ],
    '400': [
        { title: "재밌어서 밤새 읽는 화학 이야기", desc: "우리 주변의 모든 것이 화학이라고?", color: "#81D4FA", keywords: ["과학", "화학"] },
        { title: "코스모스 (어린이판)", desc: "우주의 신비를 탐험해요.", color: "#81D4FA", keywords: ["우주", "과학", "별"] }
    ],
    '500': [
        { title: "엔트리로 배우는 코딩", desc: "나만의 게임을 만들어봐요!", color: "#80CBC4", keywords: ["게임", "코딩", "컴퓨터"] },
        { title: "세상을 바꾼 기술", desc: "증기기관부터 AI까지.", color: "#80CBC4", keywords: ["기술", "발명", "과학"] }
    ],
    '600': [
        { title: "명화로 보는 미술사", desc: "그림 속에 숨겨진 이야기를 찾아라.", color: "#FFAB91", keywords: ["미술", "예술", "그림"] },
        { title: "빈센트 반 고흐", desc: "별이 빛나는 밤을 그린 화가.", color: "#FFAB91", keywords: ["인물", "예술", "화가"] },
        { title: "전설의 야구왕", desc: "야구를 통해 배우는 팀워크와 승부!", color: "#FFAB91", keywords: ["야구", "운동", "스포츠"] },
        { title: "우리는 축구부 주장", desc: "함께 뛰며 성장하는 축구 이야기.", color: "#FFAB91", keywords: ["축구", "운동", "스포츠", "우정"] }
    ],
    '700': [
        { title: "말이 통하는 영어 회화", desc: "자신감 있게 영어로 말해요.", color: "#C5E1A5", keywords: ["영어", "언어"] },
        { title: "훈민정음 해례본", desc: "한글의 위대함을 배워요.", color: "#C5E1A5", keywords: ["한글", "역사", "언어"] }
    ],
    '800': [
        { title: "시간을 파는 상점", desc: "시간을 사고 판다면 어떤 일이 벌어질까?", color: "#FFAB91", keywords: ["시간", "성장", "미스터리"] },
        { title: "아몬드", desc: "감정을 느끼지 못하는 소년의 이야기.", color: "#FFAB91", keywords: ["우정", "성장", "감동", "사랑"] },
        { title: "이상한 과자 가게 전천당", desc: "소원을 들어주는 신비한 과자.", color: "#FFAB91", keywords: ["판타지", "모험", "상상"] },
        { title: "해리포터와 마법사의 돌", desc: "신비한 마법 학교로 떠나요!", color: "#FFAB91", keywords: ["모험", "판타지", "우정", "마법"] }
    ],
    '900': [
        { title: "한국사 편지", desc: "할아버지가 들려주는 우리 역사 이야기.", color: "#B39DDB", keywords: ["역사", "한국사"] },
        { title: "세계사 톡톡", desc: "세계 여러 나라의 역사.", color: "#B39DDB", keywords: ["역사", "세계사"] }
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
    const list = document.getElementById('kdc-book-list');
    list.innerHTML = '';

    // Hide info panel if searching by keyword, show if KDC
    const infoPanel = document.getElementById('kdc-info-panel');
    const divisions = kdcDivisions[kdcCode];
    if (divisions && infoPanel) {
        infoPanel.style.display = 'block';
        infoPanel.innerHTML = `<strong>💡 ${kdcCode}번대는 이런 내용이 있어요:</strong><br><span style="font-size:0.9rem; color:#555;">${divisions}</span>`;
    }

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
                <div style="margin-top:10px;">${b.keywords.map(k => `<span style="background:#E0F2F1; color:#00695C; font-size:0.8rem; padding:2px 6px; border-radius:4px; margin-right:4px;">#${k}</span>`).join('')}</div>
            `;
            list.appendChild(card);
        });
    } else {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">등록된 도서가 없습니다.</p>';
    }

    // Update Tab Styles
    const kdcTabs = document.querySelector('.kdc-tabs');
    if (kdcTabs) {
        const btns = kdcTabs.querySelectorAll('.nav-btn');
        btns.forEach(b => {
            // Reset all buttons
            b.style.background = 'white';
            b.style.color = '#5D4037';

            if (b.innerText.startsWith(kdcCode)) {
                b.style.background = '#FF6F00';
                b.style.color = 'white';
            }
        });
    }

    // Reset Keyword Buttons
    const kwDiv = document.querySelector('.keyword-filter');
    if (kwDiv) {
        const kwBtns = kwDiv.querySelectorAll('.keyword-btn');
        kwBtns.forEach(b => b.classList.remove('active'));
    }
}

function filterByKeyword(keyword) {
    const list = document.getElementById('kdc-book-list');
    list.innerHTML = '';

    // Hide Info Panel for Keywords
    const infoPanel = document.getElementById('kdc-info-panel');
    if (infoPanel) infoPanel.style.display = 'none';

    // Search all KDC categories
    let foundCount = 0;

    // Iterate over all KDC codes
    Object.keys(kdcBookData).forEach(code => {
        const books = kdcBookData[code];
        books.forEach(b => {
            if (b.keywords && b.keywords.includes(keyword)) {
                foundCount++;
                const card = document.createElement('div');
                card.className = 'book-card';
                card.style.cssText = 'background:white; padding:15px; border-radius:10px; border:2px solid #EEE; animation: fadeIn 0.3s;';
                card.innerHTML = `
                    <div style="background:${b.color}; color:white; padding:5px; border-radius:5px; display:inline-block; margin-bottom:10px;">KDC ${code}</div>
                    <h4 style="margin:0 0 10px 0;">${b.title}</h4>
                    <p style="color:#666; font-size:0.9rem;">${b.desc}</p>
                    <div style="margin-top:10px;">${b.keywords.map(k => {
                    const style = k === keyword ? 'background:#FFCC80; color:#E65100; font-weight:bold;' : 'background:#E0F2F1; color:#00695C;';
                    return `<span style="${style} font-size:0.8rem; padding:2px 6px; border-radius:4px; margin-right:4px;">#${k}</span>`;
                }).join('')}</div>
                `;
                list.appendChild(card);
            }
        });
    });

    if (foundCount === 0) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align:center;">해당 키워드의 책을 찾을 수 없습니다. 😢</p>';
    }

    // Reset KDC Tabs
    const kdcTabs = document.querySelector('.kdc-tabs');
    if (kdcTabs) {
        const btns = kdcTabs.querySelectorAll('.nav-btn');
        btns.forEach(b => {
            b.style.background = 'white';
            b.style.color = '#5D4037';
        });
    }

    // Update Keyword Button Styles
    const kwDiv = document.querySelector('.keyword-filter');
    if (kwDiv) {
        const kwBtns = kwDiv.querySelectorAll('.keyword-btn');
        kwBtns.forEach(b => {
            if (b.innerText.includes(keyword)) {
                b.classList.add('active');
            } else {
                b.classList.remove('active');
            }
        });
    }
}


// AI Chatbot Logic
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message) return;

    // Add User Message
    addChatMessage(message, 'user');
    input.value = '';

    // Simulate AI Thinking
    setTimeout(() => {
        const response = getBotResponse(message);
        addChatMessage(response, 'bot');
    }, 600);
}

function addChatMessage(text, sender) {
    const chatBox = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}-message`;
    msgDiv.innerHTML = `<div class="message-bubble">${text}</div>`;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function getBotResponse(input) {
    const lowerInput = input.toLowerCase();

    // 1. Basic Greetings
    if (lowerInput.includes('안녕') || lowerInput.includes('반가워')) {
        return "안녕! 반가워. 나는 네가 좋아할 만한 보물 같은 책을 찾아주는 마법사야. 🧙‍♂️ <br>요즘 관심 있는 게 뭐니? (예: 모험, 축구, 요리 등)";
    }

    // 2. Keyword Search in KDC Data
    let foundBooks = [];
    Object.keys(kdcBookData).forEach(code => {
        const books = kdcBookData[code];
        books.forEach(b => {
            // Check Title, Desc, Keywords
            if (b.title.includes(input) || b.desc.includes(input) || (b.keywords && b.keywords.some(k => input.includes(k)))) {
                foundBooks.push({ ...b, kdc: code });
            }
        });
    });

    if (foundBooks.length > 0) {
        // Randomly pick up to 3 books
        const shuffled = foundBooks.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, 3);

        let response = `오! <strong>"${input}"</strong>에 관심이 있구나! 🧐<br>이런 책들은 어때?<br><br>`;
        selected.forEach(b => {
            response += `
             <div style="background:white; border-radius:10px; padding:10px; margin-bottom:10px; border:2px solid #D1C4E9;">
                <strong style="color:#512DA8;">📖 ${b.title}</strong>
                <span style="font-size:0.8rem; background:#EDE7F6; color:#5E35B1; padding:2px 5px; border-radius:3px; margin-left:5px;">KDC ${b.kdc}</span>
                <p style="margin:5px 0 0 0; font-size:0.9rem; color:#555;">${b.desc}</p>
             </div>`;
        });

        // Self-selection Guide Question
        const questions = [
            "이 중에서 표지나 제목이 가장 마음에 드는 책은 뭐야?",
            "이 책들의 주인공은 어떤 성격일 것 같아?",
            "도서관에서 이 번호(KDC)를 찾아가면 진짜 책을 만날 수 있어! 한번 가볼래?",
            "이 책을 읽으면 너에게 어떤 슈퍼파워가 생길까?"
        ];
        const randomQ = questions[Math.floor(Math.random() * questions.length)];
        response += `<br>👉 <strong>생각해보기:</strong> ${randomQ}`;

        return response;
    }

    // 3. Fallback / Detailed Questions
    if (input.length < 2) {
        return "조금 더 자세히 말해줄래? (예: '재미있는 옛날 이야기가 좋아', '과학 책 찾아줘')";
    }

    const suggestions = ["800번대 문학 책", "역사 이야기", "과학 상식", "추리 소설"];
    const randomSug = suggestions[Math.floor(Math.random() * suggestions.length)];

    return `음... <strong>"${input}"</strong> 관련된 책은 아직 못 찾았어. 😅<br>대신 <strong>${randomSug}</strong>은 어때? 아니면 다른 단어로 다시 물어봐 줄래?`;
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


// Prompt Guide Modal Logic
function openPromptGuideModal() {
    document.getElementById('promptGuideModal').style.display = 'block';
}

function closePromptGuideModal() {
    document.getElementById('promptGuideModal').style.display = 'none';
}

function goToChatbotFromGuide() {
    closePromptGuideModal();
    showSection('consultant');
    // Scroll and focus
    setTimeout(() => {
        const chatSection = document.getElementById('consultant');
        chatSection.scrollIntoView({ behavior: 'smooth' });
        document.getElementById('chatInput').focus();
    }, 100);
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

    // Update Virtual Shelf
    updateVirtualShelf(logs);
}

function updateVirtualShelf(logs) {
    const shelf = document.getElementById('virtualShelf');
    shelf.innerHTML = '';

    if (logs.length === 0) {
        shelf.innerHTML = '<div style="width:100%; text-align:center; align-self:center; color:#8D6E63;">책을 기록하면 책장이 채워져요!</div>';
        return;
    }

    logs.forEach(log => {
        const spine = document.createElement('div');

        // Random visual properties
        const heightClass = Math.random() > 0.7 ? 'tall' : (Math.random() < 0.3 ? 'short' : '');
        const fatClass = Math.random() > 0.8 ? 'fat' : '';
        const colors = ['#5D4037', '#795548', '#8D6E63', '#A1887F', '#4E342E', '#3E2723', '#D84315', '#FF7043'];
        const color = colors[Math.floor(Math.random() * colors.length)];

        spine.className = `book-spine ${heightClass} ${fatClass}`;
        spine.style.backgroundColor = color;
        spine.innerText = log.title;
        spine.title = `${log.title} (${log.date})`;

        // Interaction (Show tooltip or similar via simple title attribute for now)
        spine.onclick = () => alert(`📖 ${log.title}\n\n📝 ${log.reasons}`);

        shelf.appendChild(spine);
    });
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus(); // Check login
    loadBooks();
});

/* ===============================
   Taste Balance Game Logic
================================ */
const tasteGameQuestions = [
    {
        q: "어떤 세상에서 모험을 떠나볼까?",
        a: { text: "마법과 용이 있는 판타지 세계 🏰", icon: "🏰", type: "fantasy" },
        b: { text: "우리 학교나 동네 같은 현실 세계 🏫", icon: "🏫", type: "real" }
    },
    {
        q: "어떤 분위기의 이야기가 좋아?",
        a: { text: "심장이 쫄깃해지는 무서운 이야기 👻", icon: "👻", type: "thrill" },
        b: { text: "마음이 따뜻해지는 감동적인 이야기 🧸", icon: "🧸", type: "emotion" }
    },
    {
        q: "책을 고를 때 더 중요한 건?",
        a: { text: "눈이 즐거운 그림과 사진! 🎨", icon: "🎨", type: "visual" },
        b: { text: "흥미진진한 줄거리와 글! 📝", icon: "📝", type: "text" }
    }
];

let tasteGameState = {
    step: 0,
    scores: { fantasy: 0, real: 0, thrill: 0, emotion: 0, visual: 0, text: 0 }
};

function openTasteGame() {
    document.getElementById('tasteGameModal').style.display = 'block';
    resetTasteGame();
}

function closeTasteGame() {
    document.getElementById('tasteGameModal').style.display = 'none';
}

function resetTasteGame() {
    document.getElementById('tasteGameIntro').style.display = 'block';
    document.getElementById('tasteGamePlay').style.display = 'none';
    document.getElementById('tasteGameResult').style.display = 'none';
    tasteGameState.step = 0;
    tasteGameState.scores = { fantasy: 0, real: 0, thrill: 0, emotion: 0, visual: 0, text: 0 };
}

function startTasteGame() {
    document.getElementById('tasteGameIntro').style.display = 'none';
    document.getElementById('tasteGamePlay').style.display = 'block';
    showQuestion();
}

function showQuestion() {
    const q = tasteGameQuestions[tasteGameState.step];
    document.getElementById('questionTitle').innerText = `질문 ${tasteGameState.step + 1} / ${tasteGameQuestions.length}`;

    document.getElementById('optionAText').innerText = q.a.text;
    document.getElementById('optionAIcon').innerText = q.a.icon;

    document.getElementById('optionBText').innerText = q.b.text;
    document.getElementById('optionBIcon').innerText = q.b.icon;
}

function selectTasteOption(choice) {
    const q = tasteGameQuestions[tasteGameState.step];
    const type = choice === 'A' ? q.a.type : q.b.type;

    tasteGameState.scores[type]++;
    tasteGameState.step++;

    if (tasteGameState.step < tasteGameQuestions.length) {
        showQuestion();
    } else {
        showTasteResult();
    }
}

function showTasteResult() {
    document.getElementById('tasteGamePlay').style.display = 'none';
    document.getElementById('tasteGameResult').style.display = 'block';

    const s = tasteGameState.scores;
    let resultType = "";
    let resultDesc = "";
    let resultIcon = "";
    let recommendKDC = "";

    // Simple Logic to determine type
    if (s.fantasy > 0 && s.thrill > 0) {
        resultType = "용감한 판타지 모험가 🗡️";
        resultDesc = "스릴 넘치는 모험과 마법 세계를 좋아하는 당신! 상상력이 풍부하군요.";
        resultIcon = "🐲";
        recommendKDC = "800"; // Literature
    } else if (s.real > 0 && s.emotion > 0) {
        resultType = "따뜻한 감성 스토리텔러 📚";
        resultDesc = "친구들의 이야기나 감동적인 이야기에서 힘을 얻는 스타일이네요.";
        resultIcon = "💞";
        recommendKDC = "800";
    } else if (s.visual > 0) {
        resultType = "예술적인 비주얼 탐험가 🎨";
        resultDesc = "글자보다는 그림이나 사진으로 정보를 얻는 것을 좋아해요.";
        resultIcon = "🖼️";
        recommendKDC = "600"; // Arts
    } else if (s.real > 0 && s.text > 0) {
        resultType = "똑똑한 지식 탐구자 🧠";
        resultDesc = "세상의 비밀과 원리를 알아가는 것을 즐기는 지적 호기심 대장!";
        resultIcon = "🔬";
        recommendKDC = "400"; // Science
    } else {
        // Default Fallback
        resultType = "자유로운 영혼의 독서가 🕊️";
        resultDesc = "어떤 책이든 편견 없이 즐길 준비가 되어 있군요!";
        resultIcon = "🌈";
        recommendKDC = "000"; // General
    }

    document.getElementById('resultType').innerText = resultType;
    document.getElementById('resultDesc').innerText = resultDesc;
    document.getElementById('resultIcon').innerText = resultIcon;

    // Show Recommended Books based on Logic
    const recContainer = document.getElementById('resultBooks');
    recContainer.innerHTML = '';

    // Find books from data (taking first 2 from recommended KDC)
    const books = kdcBookData[recommendKDC] || kdcBookData['800'];
    books.slice(0, 2).forEach(b => {
        const div = document.createElement('div');
        div.style.cssText = "background:#F5F5F5; padding:10px; border-radius:10px; width:45%; text-align:left; border:1px solid #DDD;";
        div.innerHTML = `<div style="font-weight:bold; color:#E65100;">${b.title}</div><div style="font-size:0.8rem; color:#666;">${b.desc}</div>`;
        recContainer.appendChild(div);
    });
}

function restartTasteGame() {
    resetTasteGame();
    startTasteGame();
}

/* ===============================
   Class Session Journal Logic
================================ */
function addSessionLog() {
    if (!currentUser) {
        alert('기록을 저장하려면 먼저 로그인해주세요!');
        handleUserClick();
        return;
    }

    const sessionSelect = document.getElementById('sessionSelect');
    const thoughtInput = document.getElementById('sessionThoughtInput');

    const session = sessionSelect.value;
    const thought = thoughtInput.value.trim();

    if (!thought) {
        alert('느낀 점을 입력해주세요!');
        return;
    }

    const newLog = {
        session: session,
        thought: thought,
        date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString()
    };

    const userStorageKey = `ai_reading_sessions_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    logs.push(newLog);
    localStorage.setItem(userStorageKey, JSON.stringify(logs));

    // Reset input
    thoughtInput.value = '';

    loadSessionLogs();
    alert('수업 활동 일지가 저장되었습니다! 📝');
}

function loadSessionLogs() {
    const list = document.getElementById('sessionLogList');
    list.innerHTML = '';

    if (!currentUser) {
        list.innerHTML = '<li style="text-align:center; color:#999;">로그인이 필요합니다.</li>';
        return;
    }

    const userStorageKey = `ai_reading_sessions_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');

    if (logs.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#999;">아직 작성된 일지가 없어요.</li>';
        return;
    }

    logs.reverse().forEach(log => {
        const li = document.createElement('li');
        li.style.cssText = "background:white; border:1px solid #C8E6C9; padding:10px; border-radius:5px; margin-bottom:10px; text-align:left; border-left: 5px solid #66BB6A;";
        li.innerHTML = `
            <div style="font-weight:bold; color:#2E7D32;">${log.session} <span style="font-size:0.8rem; color:#999; font-weight:normal;">(${log.date})</span></div>
            <div style="font-size:0.9rem; margin-top:5px; color:#555;">${log.thought}</div>
        `;
        list.appendChild(li);
    });
}

/* ===============================
   AI Feedback Log Logic
================================ */
function addAIFeedbackLog() {
    if (!currentUser) {
        alert('기록을 저장하려면 먼저 로그인해주세요!');
        handleUserClick();
        return;
    }

    const bookInput = document.getElementById('aiBookInput');
    const satisfyRadios = document.querySelectorAll('input[name="aiSatisfy"]:checked');
    const feedbackInput = document.getElementById('aiFeedbackInput');

    const book = bookInput.value.trim();
    const feedback = feedbackInput.value.trim();

    if (!book) {
        alert('추천받은 책 제목을 입력해주세요!');
        return;
    }
    if (satisfyRadios.length === 0) {
        alert('만족도를 선택해주세요!');
        return;
    }

    const satisfy = satisfyRadios[0].value;

    const newLog = {
        book: book,
        satisfy: satisfy,
        feedback: feedback,
        date: new Date().toLocaleDateString()
    };

    const userStorageKey = `ai_reading_feedback_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');
    logs.push(newLog);
    localStorage.setItem(userStorageKey, JSON.stringify(logs));

    // Reset inputs
    bookInput.value = '';
    feedbackInput.value = '';
    document.querySelectorAll('input[name="aiSatisfy"]').forEach(r => r.checked = false);

    loadAIFeedbackLogs();
    alert('평가가 저장되었습니다! 감사합니다. 🧙‍♂️');
}

function loadAIFeedbackLogs() {
    const list = document.getElementById('aiFeedbackList');
    list.innerHTML = '';

    if (!currentUser) {
        list.innerHTML = '<li style="text-align:center; color:#999;">로그인이 필요합니다.</li>';
        return;
    }

    const userStorageKey = `ai_reading_feedback_${currentUser}`;
    const logs = JSON.parse(localStorage.getItem(userStorageKey) || '[]');

    if (logs.length === 0) {
        list.innerHTML = '<li style="text-align:center; color:#999;">아직 평가 기록이 없어요.</li>';
        return;
    }

    logs.reverse().forEach(log => {
        const li = document.createElement('li');
        li.style.cssText = "background:white; border:1px solid #D1C4E9; padding:10px; border-radius:5px; margin-bottom:10px; text-align:left; border-left: 5px solid #7E57C2;";
        li.innerHTML = `
            <div style="font-weight:bold; color:#512DA8;">🤖 ${log.book} <span style="font-size:0.8rem; color:#999; font-weight:normal;">(${log.date})</span></div>
            <div style="margin:5px 0; font-weight:bold; color:#673AB7;">${log.satisfy}</div>
            <div style="font-size:0.9rem; color:#555;">${log.feedback}</div>
        `;
        list.appendChild(li);
    });
}
