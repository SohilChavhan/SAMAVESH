/* SignLearn Elementary LMS - Application Logic */
document.addEventListener("DOMContentLoaded", () => {
    const STATE = {
        user: null,
        progress: { courses: {}, quizzes: {}, total_time: 0 },
        lunaTranslator: null  // shared LunaTranslator instance
    };

    // DOM Elements
    const authOverlay = document.getElementById("slAuthModal");
    const closeAuthBtn = document.getElementById("closeAuthModal");
    const loginBtns = document.querySelectorAll(".sl-login-trigger");
    const authTabs = document.querySelectorAll(".sl-auth-tab");
    const authForm = document.getElementById("slAuthForm");
    const authError = document.getElementById("slAuthError");
    const profileBadge = document.getElementById("slProfileBadge");

    const landingView = document.getElementById("slLandingView");
    const dashView = document.getElementById("slDashboardView");

    const API_BASE = (window.location.port === '8080' || window.location.port === '5500') ? 'http://localhost:8000' : '';

    // Initialize
    initSession();

    // Event Listeners
    loginBtns.forEach(btn => btn.addEventListener("click", (e) => {
        e.preventDefault();
        const role = btn.dataset.role || "student";
        if (authForm) authForm.reset();
        const inputReg = document.getElementById("authRegNumber");
        if (inputReg) inputReg.value = "";
        setActiveAuthTab(role);
        authOverlay.style.display = "flex";
        if (inputReg) inputReg.focus();
    }));

    const contactOverlay = document.getElementById("slContactModal");
    const openContactBtn = document.getElementById("openContactModal");
    const closeContactBtn = document.getElementById("closeContactModal");

    if (openContactBtn && contactOverlay) {
        openContactBtn.addEventListener("click", (e) => {
            e.preventDefault();
            contactOverlay.style.display = "flex";
        });
    }

    if (closeContactBtn && contactOverlay) {
        closeContactBtn.addEventListener("click", () => {
            contactOverlay.style.display = "none";
        });
    }

    function closeAuthModal() {
        if (authOverlay) authOverlay.style.display = "none";
        if (authForm) authForm.reset();
        const inputReg = document.getElementById("authRegNumber");
        if (inputReg) inputReg.value = "";
        if (authError) authError.style.display = "none";
    }

    window.addEventListener("click", (e) => {
        if (e.target === authOverlay) closeAuthModal();
        if (e.target === contactOverlay) contactOverlay.style.display = "none";
        const parentProgressModal = document.getElementById("slParentProgressModal");
        if (parentProgressModal && e.target === parentProgressModal) parentProgressModal.style.display = "none";
    });

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", closeAuthModal);
    }

    authTabs.forEach(tab => tab.addEventListener("click", () => {
        setActiveAuthTab(tab.dataset.tab);
    }));

    if (authForm) {
        authForm.addEventListener("submit", handleLogin);
    }


    function setActiveAuthTab(role) {
        authTabs.forEach(t => t.classList.remove("active"));
        const tab = Array.from(authTabs).find(t => t.dataset.tab === role);
        if (tab) tab.classList.add("active");

        const inputLabel = document.getElementById("authInputLabel");
        const inputHint = document.getElementById("authInputHint");
        const inputReg = document.getElementById("authRegNumber");

        if (inputReg) {
            inputReg.value = "";
        }

        if (role === "student") {
            inputLabel.innerText = "Student ID";
            inputHint.innerText = "Format: STU_<year>_<roll> (e.g. STU_01_122)";
            if (inputReg) inputReg.placeholder = "e.g. STU_01_122";
        } else if (role === "teacher") {
            inputLabel.innerText = "Teacher ID";
            inputHint.innerText = "Format: PRO_<id> (e.g. PRO_1233)";
            if (inputReg) inputReg.placeholder = "e.g. PRO_1233";
        } else {
            inputLabel.innerText = "Parent Email or ID";
            inputHint.innerText = "Enter your registered email address";
            if (inputReg) inputReg.placeholder = "Your Registered Email ID";
        }
        document.getElementById("authRole").value = role;
        if (authError) authError.style.display = "none";
    }

    async function handleLogin(e) {
        e.preventDefault();
        const inputReg = document.getElementById("authRegNumber");
        const regNumber = (inputReg ? inputReg.value : "").trim();
        const role = document.getElementById("authRole").value;

        try {
            const response = await fetch(`${API_BASE}/api/lms/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reg_number: regNumber, role: role, remember_me: false })
            });
            const data = await response.json();

            if (response.ok && data.success) {
                STATE.user = data.user;
                sessionStorage.setItem("sl_user", JSON.stringify(data.user));
                localStorage.removeItem("sl_user");
                if (authForm) authForm.reset();
                if (inputReg) inputReg.value = "";
                authOverlay.style.display = "none";
                loadProgressAndRender();
            } else {
                authError.innerText = data.detail || "Login failed. Please check your ID format.";
                authError.style.display = "block";
            }
        } catch (err) {
            authError.innerText = "Network error. Please try again.";
            authError.style.display = "block";
        }
    }

    function initSession() {
        const savedUser = sessionStorage.getItem("sl_user");
        if (savedUser) {
            try {
                STATE.user = JSON.parse(savedUser);
                loadProgressAndRender();
            } catch (e) {
                console.error("Session parse error", e);
            }
        } else {
            showLanding();
        }
    }

    async function loadProgressAndRender() {
        if (!STATE.user) return;

        try {
            const resp = await fetch(`${API_BASE}/api/lms/progress/${STATE.user.id}`);
            const data = await resp.json();
            if (data.success) {
                STATE.progress = data.progress;
            }
        } catch (e) {
            console.error("Progress load error", e);
        }

        renderUI();
    }

    function renderUI() {
        if (!STATE.user) {
            showLanding();
            return;
        }

        landingView.style.display = "none";
        dashView.style.display = "block";

        // Update Nav Profile Badge
        loginBtns.forEach(btn => btn.style.display = "none");
        profileBadge.style.display = "flex";

        const avatarStr = STATE.user.name ? STATE.user.name.charAt(0).toUpperCase() : "U";
        document.getElementById("profileAvatar").innerText = avatarStr;
        document.getElementById("profileName").innerText = STATE.user.name;

        // Render Dashboard based on role
        if (STATE.user.role === "student") {
            renderStudentDashboard();
        } else if (STATE.user.role === "teacher") {
            renderTeacherDashboard();
        } else if (STATE.user.role === "parent") {
            renderParentDashboard();
        }
    }

    function showLanding() {
        if (authForm) authForm.reset();
        const inputReg = document.getElementById("authRegNumber");
        if (inputReg) inputReg.value = "";
        localStorage.removeItem("sl_user");
        sessionStorage.removeItem("sl_user");
        STATE.user = null;
        landingView.style.display = "block";
        dashView.style.display = "none";
        profileBadge.style.display = "none";
        loginBtns.forEach(btn => btn.style.display = "inline-flex");
    }

    // -- Dashboard Renderers --

    function renderStudentDashboard() {
        dashView.innerHTML = `
            <div class="sl-dashboard-container">
                <div class="sl-dash-topbar">
                    <div class="sl-dash-welcome">
                        <h2>Welcome back, ${STATE.user.name}! 🌟</h2>
                        <p style="color:var(--text-muted)">${STATE.user.grade} | Ready to learn?</p>
                    </div>
                    <div>
                        <button class="sl-btn sl-btn-outline" id="btnProfileModal">My Profile & Scores</button>
                    </div>
                </div>

                <div class="sl-subject-nav" id="subjectNav">
                    <div class="sl-subject-tab active maths" data-subj="maths">📐 Maths</div>
                    <div class="sl-subject-tab language" data-subj="language">📚 Language</div>
                    <div class="sl-subject-tab science" data-subj="science">🔬 Science</div>
                    <div class="sl-subject-tab signlang" data-subj="signlang">👋 Sign Language</div>
                </div>

                <div id="courseContent"></div>

                <!-- Luna Translator Widget -->
                <div id="studentLunaWidget"></div>
            </div>
        `;

        document.getElementById("btnProfileModal").addEventListener("click", showProfileModal);

        const tabs = document.querySelectorAll(".sl-subject-tab");
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                tabs.forEach(t => t.classList.remove("active"));
                tab.classList.add("active");
                renderCourseContent(tab.dataset.subj);
            });
        });

        // initial load
        renderCourseContent("maths");

        // Initialize Luna Translator for student dashboard
        initLunaWidget('studentLunaWidget');
    }

    function renderCourseContent(subject) {
        const contentDiv = document.getElementById("courseContent");

        const chapters = [
            { id: 1, title: "Chapter 1: The Basics", icon: "⭐" },
            { id: 2, title: "Chapter 2: Moving Forward", icon: "🚀" },
            { id: 3, title: "Chapter 3: Master Challenge", icon: "🏆" }
        ];

        let html = '';
        chapters.forEach(ch => {
            let videoListHtml = '';

            if (subject === 'signlang') {
                videoListHtml = `
                    <div class="sl-video-list">
                        <div class="sl-video-item" onclick="slPlayVideo('${subject}', ${ch.id}, 'playlist:PLFjydPMg4Dapq9vcdmGyHs8uJhiqMgUrX')">
                            <div><strong>Video 1:</strong> Sign Language Tutorial (Playlist)</div>
                            <div>▶️ Play</div>
                        </div>
                        <div class="sl-video-item" style="cursor: default; opacity: 0.6;">
                            <div><strong>Placeholder 2:</strong> Video coming soon</div>
                            <div>⏳ Pending</div>
                        </div>
                        <div class="sl-video-item" style="cursor: default; opacity: 0.6;">
                            <div><strong>Placeholder 3:</strong> Video coming soon</div>
                            <div>⏳ Pending</div>
                        </div>
                    </div>
                `;
            } else {
                videoListHtml = `
                    <div class="sl-video-list">
                        <div class="sl-video-item" onclick="slPlayVideo('${subject}', ${ch.id}, ${subject === 'maths' && ch.id === 1 ? "'mjlsSYLLOSE'" : "'v1'"})">
                            <div><strong>Video 1:</strong> ${subject === 'maths' && ch.id === 1 ? 'Introduction to Basics (YouTube)' : 'Introduction to ' + subject}</div>
                            <div>▶️ Play</div>
                        </div>
                        <div class="sl-video-item" onclick="slPlayVideo('${subject}', ${ch.id}, 'v2')">
                            <div><strong>Video 2:</strong> Learning the Signs</div>
                            <div>▶️ Play</div>
                        </div>
                        <div class="sl-video-item" onclick="slPlayVideo('${subject}', ${ch.id}, 'v3')">
                            <div><strong>Video 3:</strong> Practice with Friends</div>
                            <div>▶️ Play</div>
                        </div>
                    </div>
                `;
            }

            html += `
                <div class="sl-chapter-card">
                    <div class="sl-chapter-header" onclick="document.getElementById('ch-${subject}-${ch.id}').classList.toggle('open')">
                        <div class="sl-chapter-title">
                            <div class="sl-chapter-icon">${ch.icon}</div>
                            ${ch.title}
                        </div>
                        <div>▼</div>
                    </div>
                    <div class="sl-chapter-content" id="ch-${subject}-${ch.id}">
                        ${videoListHtml}
                        <button class="sl-btn sl-btn-primary" onclick="slStartQuiz('${subject}', ${ch.id})">🏆 Take Chapter Quiz</button>
                    </div>
                </div>
            `;
        });

        contentDiv.innerHTML = html;
    }

    // CWASA Init and Player Logic
    let cwasaInitialized = false;

    function ensureCWASA() {
        if (cwasaInitialized) return;
        if (window.CWASA) {
            CWASA.init({
                avSettings: {
                    avList: "av0",
                    isIE0: false
                }
            });
            cwasaInitialized = true;
        }
    }

    const sampleSiGML = `<sigml>
        <hns_sign gloss="hello">
            <hamnosys_nonmanual>
                <hnm_mouthpicture picture="hVlU"/>
            </hamnosys_nonmanual>
            <hamnosys_manual>
                <hamflathand/>
                <hamthumboutmod/>
                <hambetween/>
                <hamfinger2345/>
                <hamextfingeru/>
                <hampalmd/>
                <hamshouldertop/>
                <hamlrat/>
                <hammoved/>
                <hamsmallmod/>
                <hamarcu/>
                <hamslow/>
            </hamnosys_manual>
        </hns_sign>
    </sigml>`;

    window.slPlayVideo = async function (subject, chapterId, videoId) {
        // Switch views
        document.getElementById("slDashboardView").style.display = "none";
        document.getElementById("slVideoPlayerView").style.display = "block";

        const avatarPane = document.querySelector("#slVideoPlayerView .sl-avatar-pane");
        const videoPane = document.querySelector("#slVideoPlayerView .sl-video-pane");
        if (subject === 'signlang') {
            if (avatarPane) avatarPane.style.display = 'none';
            if (videoPane) videoPane.style.width = '100%';
        } else {
            if (avatarPane) avatarPane.style.display = 'block';
            if (videoPane) videoPane.style.width = '';
        }

        const captions = document.getElementById("slCaptions");
        const container = document.getElementById("slVideoContainer");

        if (window._slVideoTimer) {
            clearInterval(window._slVideoTimer);
        }

        // Helper to translate and play text
        async function playLunaText(text) {
            captions.innerText = text;
            if (window.LunaTranslator && window.CWASA) {
                try {
                    if (!STATE._videoTranslator) {
                        STATE._videoTranslator = new LunaTranslator({
                            containerId: '__lunaVideoHidden__',
                            avatarSlot: 0
                        });
                        STATE._videoTranslator.glossToSign = new Map();
                        STATE._videoTranslator.letterToSign = new Map();
                        STATE._videoTranslator.baseToGloss = new Map();
                        STATE._videoTranslator.conceptToGloss = new Map();
                        STATE._videoTranslator._switchId = 0;
                        STATE._videoTranslator._currentSignLang = '';
                        STATE._videoTranslator._rendered = true;
                    }
                    const vt = STATE._videoTranslator;
                    await vt._loadSignLanguage('isl');
                    const tokens = await vt._doPlan(text, false);
                    if (tokens.length) {
                        const { sigml } = vt._buildSigml(tokens);
                        if (sigml && typeof sigml === 'string' && !sigml.includes('[object Object]') && window.CWASA && typeof window.CWASA.playSiGMLText === 'function') {
                            setTimeout(() => {
                                try {
                                    CWASA.stopSiGML(0);
                                } catch (e) { }
                                try {
                                    CWASA.playSiGMLText(sigml, 0);
                                } catch (e) {
                                    console.error("CWASA Play Error", e);
                                }
                            }, 100);
                        }
                    }
                } catch (e) {
                    console.error("Luna video translate error:", e);
                }
            }
        }

        const isPlaylist = videoId.startsWith('playlist:');
        const ytId = isPlaylist ? videoId.split(':')[1] : videoId;

        if (ytId === 'mjlsSYLLOSE' || ytId === 'RyGU-8ZY5jw' || isPlaylist) {
            container.innerHTML = `<div id="sl-yt-${ytId}"></div>`;
            container.className = "";

            function initYTPlayer() {
                let playerVars = { 'autoplay': 1, 'playsinline': 1 };
                if (isPlaylist) {
                    playerVars.listType = 'playlist';
                    playerVars.list = ytId;
                }

                let playerConfig = {
                    height: '400',
                    width: '100%',
                    playerVars: playerVars,
                    events: {
                        'onReady': (event) => {
                            if (!isPlaylist) {
                                fetch(`/data/yt_${ytId}.json`).then(res => res.json()).then(script => {
                                    window._slCurrentLine = -1;
                                    window._slScript = script;

                                    window._slVideoTimer = setInterval(() => {
                                        if (!window._slYtPlayer || typeof window._slYtPlayer.getCurrentTime !== 'function') return;

                                        if (window._slYtPlayer.getPlayerState && window._slYtPlayer.getPlayerState() === YT.PlayerState.PAUSED) return;

                                        const elapsed = window._slYtPlayer.getCurrentTime();
                                        for (let i = window._slScript.length - 1; i >= 0; i--) {
                                            if (elapsed >= window._slScript[i].time) {
                                                if (window._slCurrentLine !== i) {
                                                    window._slCurrentLine = i;
                                                    playLunaText(window._slScript[i].text);
                                                }
                                                break;
                                            }
                                        }
                                    }, 500);
                                }).catch(e => console.error("Error loading transcript", e));
                            }
                        },
                        'onStateChange': (event) => {
                            if (event.data === YT.PlayerState.PAUSED) {
                                if (window.CWASA) {
                                    try { CWASA.stopSiGML(0); } catch (e) { }
                                }
                            } else if (event.data === YT.PlayerState.PLAYING) {
                                window._slCurrentLine = -1;
                            }
                        }
                    }
                };

                if (!isPlaylist) {
                    playerConfig.videoId = ytId;
                }

                window._slYtPlayer = new YT.Player(`sl-yt-${ytId}`, playerConfig);
            }

            if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
                const tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                const firstScriptTag = document.getElementsByTagName('script')[0];
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                window.onYouTubeIframeAPIReady = initYTPlayer;
            } else {
                initYTPlayer();
            }
        } else {
            container.innerHTML = `
              <div style="font-size: 4rem; margin-bottom: 1rem;">▶️</div>
              <h3>[Educational Video Player]</h3>
              <p style="color:var(--text-muted)">The video lesson plays here.</p>`;
            container.className = "sl-video-placeholder";

            let lessonText = "Hello! Let's learn about " + subject + "!";
            playLunaText(lessonText);

            // Simulate video completion after 5 seconds to update progress
            setTimeout(async () => {
                try {
                    const resp = await fetch(`${API_BASE}/api/lms/progress`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: STATE.user.id,
                            course_id: subject,
                            video_id: `${chapterId}_${videoId}`,
                            completed: true
                        })
                    });
                    const data = await resp.json();
                    if (data.success) {
                        STATE.progress = data.progress;
                        captions.innerText = "Video completed! Course progress saved! 🌟";
                    }
                } catch (e) {
                    console.error(e);
                }
            }, 5000);
        }
    }

    window.slCloseVideo = function () {
        if (window._slVideoTimer) {
            clearInterval(window._slVideoTimer);
        }
        if (window._slYtPlayer) {
            try { window._slYtPlayer.destroy(); } catch (e) { }
            window._slYtPlayer = null;
        }
        if (window.CWASA) {
            try { CWASA.stop(0); } catch (e) { }
        }

        const container = document.getElementById("slVideoContainer");
        if (container) container.innerHTML = "";

        document.getElementById("slVideoPlayerView").style.display = "none";
        document.getElementById("slDashboardView").style.display = "block";
        loadProgressAndRender(); // refresh progress in dashboard
    }

    window.slStartQuiz = function (subject, chapterId) {
        const qid = `${subject}_${chapterId}`;
        slToast(`Starting Quiz for ${subject} Chapter ${chapterId}... Simulating video sign answer.`, "info", 3500);

        // Simulate kid uploading a video sign for question 1
        setTimeout(async () => {
            try {
                const reqData = {
                    question_id: 1,
                    subject: subject,
                    chapter_id: chapterId,
                    question_text: "What is 2 + 3?",
                    expected_answer: "Five",
                    sign_description: "Kid raised hand showing all five fingers open.",
                    sign_language: "asl"
                };

                const resp = await fetch(`${API_BASE}/api/lms/quiz/evaluate-sign`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(reqData)
                });
                const data = await resp.json();

                if (data.success) {
                    slQuizResultModal({
                        score: data.score,
                        feedback: data.feedback,
                        stars: data.stars,
                        subject: subject,
                        chapterId: chapterId
                    });

                    // Save score
                    await fetch(`${API_BASE}/api/lms/progress`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            user_id: STATE.user.id,
                            course_id: subject,
                            quiz_id: qid,
                            quiz_score: data.score
                        })
                    });

                    loadProgressAndRender(); // refresh progress
                }
            } catch (e) {
                console.error(e);
            }
        }, 1200);
    }

    function showProfileModal() {
        if (!STATE.user) return;
        slProfileModal(STATE.user, STATE.progress);
    }

    function renderTeacherDashboard() {
        // 1. Mock Database of Students
        const mockStudents = [
            { id: "STU_01_122", name: "Aarav Sharma", grade: "Grade 3", progress: "88%", status: "On Track", lastActive: "Today" },
            { id: "STU_01_123", name: "Diya Patel", grade: "Grade 3", progress: "95%", status: "Excelling", lastActive: "Yesterday" },
            { id: "STU_01_124", name: "Kabir Singh", grade: "Grade 3", progress: "45%", status: "Needs Help", lastActive: "3 days ago" },
            { id: "STU_01_125", name: "Ananya Iyer", grade: "Grade 3", progress: "72%", status: "On Track", lastActive: "Today" },
            { id: "STU_01_126", name: "Rohan Gupta", grade: "Grade 3", progress: "10%", status: "Inactive", lastActive: "1 week ago" }
        ];

        // 2. Generate HTML Table Rows for each student
        const studentRows = mockStudents.map(student => {
            // Determine badge styling based on their performance status
            let badgeBg = "#EFF6FF";
            let badgeColor = "#1E3A8A"; // Default / On Track (Blue)
            if (student.status === "Excelling") { badgeBg = "#ECFDF5"; badgeColor = "#065F46"; } // Green
            if (student.status === "Needs Help") { badgeBg = "#FEF2F2"; badgeColor = "#991B1B"; } // Red
            if (student.status === "Inactive") { badgeBg = "#F1F5F9"; badgeColor = "#475569"; }   // Gray

            return `
                <tr style="border-bottom: 1px solid #E2E8F0;">
                    <td style="padding: 1rem; font-weight:600; color:var(--text-main);">${student.id}</td>
                    <td style="padding: 1rem;">${student.name}</td>
                    <td style="padding: 1rem;">
                        <!-- Mini Progress Bar -->
                        <div style="width: 100%; background: #E2E8F0; border-radius: 999px; height: 8px; margin-bottom: 4px;">
                            <div style="width: ${student.progress}; background: #06D6A0; height: 8px; border-radius: 999px;"></div>
                        </div>
                        <span style="font-size: 0.85rem; color: var(--text-muted);">${student.progress} Completed</span>
                    </td>
                    <td style="padding: 1rem;">
                        <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600;">
                            ${student.status}
                        </span>
                    </td>
                    <td style="padding: 1rem; color: var(--text-muted); font-size: 0.9rem;">${student.lastActive}</td>
                    <td style="padding: 1rem; text-align: right;">
                        <button class="sl-btn sl-btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="slViewStudent('${student.id}')">View Details</button>
                    </td>
                </tr>
            `;
        }).join('');

        // 3. Render the Dashboard UI
        dashView.innerHTML = `
            <div class="sl-dashboard-container">
                <div class="sl-dash-topbar">
                    <div class="sl-dash-welcome">
                        <h2>Teacher Portal</h2>
                        <p style="color:var(--text-muted)">Welcome back, ${STATE.user.name}. Here is your class overview.</p>
                    </div>
                    <div>
                        <button class="sl-btn sl-btn-secondary" onclick="slExportPDF()">📥 Export Class Report</button>
                    </div>
                </div>

                <!-- Stats Overview Cards -->
                <div class="sl-grid-3" style="margin-bottom: 2rem;">
                    <div class="sl-chapter-card" style="padding:1.5rem; border-left: 4px solid #4A90E2;">
                        <h3 style="color:var(--text-muted); font-size:1rem; margin-bottom:0.5rem;">Average Quiz Score</h3>
                        <p style="font-size: 2rem; font-weight: 900;">84%</p>
                    </div>
                    <div class="sl-chapter-card" style="padding:1.5rem; border-left: 4px solid #FF9F1C;">
                        <h3 style="color:var(--text-muted); font-size:1rem; margin-bottom:0.5rem;">Students Needing Help</h3>
                        <p style="font-size: 2rem; font-weight: 900;">2</p>
                    </div>
                    <div class="sl-chapter-card" style="padding:1.5rem; border-left: 4px solid #06D6A0;">
                        <h3 style="color:var(--text-muted); font-size:1rem; margin-bottom:0.5rem;">Recent Submissions</h3>
                        <p style="font-size: 2rem; font-weight: 900;">12</p>
                    </div>
                </div>

                <!-- Interactive Student List Table -->
                <div class="sl-chapter-card" style="padding: 2rem; overflow-x: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                        <h3 style="font-size: 1.4rem; font-weight: 800;">Student Roster</h3>
                        <input type="text" id="teacherSearchInput" placeholder="Search students by name or ID..." style="padding: 0.6rem 1rem; border: 1px solid #CBD5E1; border-radius: 8px; width: 300px; font-family: inherit;">
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; text-align: left;">
                        <thead>
                            <tr style="border-bottom: 2px solid #E2E8F0; color: var(--text-muted); font-size: 0.9rem; text-transform: uppercase;">
                                <th style="padding: 1rem; font-weight: 800;">Student ID</th>
                                <th style="padding: 1rem; font-weight: 800;">Name</th>
                                <th style="padding: 1rem; font-weight: 800;">Course Progress</th>
                                <th style="padding: 1rem; font-weight: 800;">Status</th>
                                <th style="padding: 1rem; font-weight: 800;">Last Active</th>
                                <th style="padding: 1rem; font-weight: 800; text-align: right;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="teacherRosterBody">
                            ${studentRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // 4. Attach real-time search functionality
        const searchInput = document.getElementById("teacherSearchInput");
        const rosterBody = document.getElementById("teacherRosterBody");

        function renderRows(studentsList) {
            if (studentsList.length === 0) {
                rosterBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="padding: 2rem; text-align: center; color: var(--text-muted);">
                            No students found matching your search.
                        </td>
                    </tr>`;
                return;
            }
            rosterBody.innerHTML = studentsList.map(student => {
                let badgeBg = "#EFF6FF";
                let badgeColor = "#1E3A8A";
                if (student.status === "Excelling") { badgeBg = "#ECFDF5"; badgeColor = "#065F46"; }
                if (student.status === "Needs Help") { badgeBg = "#FEF2F2"; badgeColor = "#991B1B"; }
                if (student.status === "Inactive") { badgeBg = "#F1F5F9"; badgeColor = "#475569"; }

                return `
                    <tr style="border-bottom: 1px solid #E2E8F0;">
                        <td style="padding: 1rem; font-weight:600; color:var(--text-main);">${student.id}</td>
                        <td style="padding: 1rem;">${student.name}</td>
                        <td style="padding: 1rem;">
                            <div style="width: 100%; background: #E2E8F0; border-radius: 999px; height: 8px; margin-bottom: 4px;">
                                <div style="width: ${student.progress}; background: #06D6A0; height: 8px; border-radius: 999px;"></div>
                            </div>
                            <span style="font-size: 0.85rem; color: var(--text-muted);">${student.progress} Completed</span>
                        </td>
                        <td style="padding: 1rem;">
                            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600;">
                                ${student.status}
                            </span>
                        </td>
                        <td style="padding: 1rem; color: var(--text-muted); font-size: 0.9rem;">${student.lastActive}</td>
                        <td style="padding: 1rem; text-align: right;">
                            <button class="sl-btn sl-btn-outline" style="padding: 0.4rem 0.8rem; font-size: 0.85rem;" onclick="slViewStudent('${student.id}')">View Details</button>
                        </td>
                    </tr>
                `;
            }).join('');
        }

        if (searchInput && rosterBody) {
            searchInput.addEventListener("input", (e) => {
                const query = e.target.value.toLowerCase().trim();
                const filtered = mockStudents.filter(student =>
                    student.name.toLowerCase().includes(query) ||
                    student.id.toLowerCase().includes(query)
                );
                renderRows(filtered);
            });
        }
    }

    function renderParentDashboard() {
        dashView.innerHTML = `
            <div class="sl-dashboard-container">
                <div class="sl-dash-topbar">
                    <div class="sl-dash-welcome">
                        <h2>Parent Dashboard</h2>
                        <p style="color:var(--text-muted)">Welcome, ${STATE.user.name}.</p>
                    </div>
                    <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
                        <button class="sl-btn sl-btn-primary" onclick="slOpenParentProgressModal()">📊 View Progress Summary</button>
                        <button class="sl-btn sl-btn-outline" onclick="slToast('Profile management feature coming soon!', 'info')">Manage Child Profiles</button>
                    </div>
                </div>

                <div class="sl-grid-3">
                    <div class="sl-chapter-card" style="padding:1.5rem;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⏳</div>
                        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:0.4rem; color:var(--text-main);">Screen Time Limits</h3>
                        <p style="color:var(--text-muted); margin-bottom:1rem;">Daily limit: 1.5 hours</p>
                        <div style="background:#F1F5F9; border-radius:10px; padding:0.6rem 0.8rem; font-size:0.85rem; font-weight:600; color:var(--text-main);">
                            Used Today: <span style="color:#4A90E2; font-weight:800;">45 mins</span> (45m remaining)
                        </div>
                    </div>

                    <div class="sl-chapter-card" style="padding:1.5rem;">
                        <div style="font-size: 1.5rem; margin-bottom: 0.5rem;">⭐</div>
                        <h3 style="font-size:1.2rem; font-weight:800; margin-bottom:0.4rem; color:var(--text-main);">Weekly Report</h3>
                        <p style="color:var(--text-muted); margin-bottom:1rem;">Your child earned 12 stars this week!</p>
                        <div style="background:#FFF9EC; border-radius:10px; padding:0.6rem 0.8rem; font-size:0.85rem; font-weight:600; color:#B45309;">
                            Achievement: <span style="font-weight:800;">7-Day Study Streak 🔥</span>
                        </div>
                    </div>

                    <div class="sl-chapter-card" style="padding:1.5rem; display:flex; flex-direction:column; justify-content:space-between;">
                        <div>
                            <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.5rem;">
                                <span style="font-size: 1.3rem;">📊</span>
                                <h3 style="font-size:1.2rem; font-weight:800; margin:0; color:#1D2D44;">Progress Summary</h3>
                            </div>
                            <p style="color:var(--text-muted); font-size:0.95rem; line-height:1.5; margin-bottom:1.5rem;">Track your child's learning journey across all subjects.</p>
                        </div>
                        <button class="sl-btn-progress-details" onclick="slOpenParentProgressModal()">View Details</button>
                    </div>
                </div>

                <!-- Luna Translator Widget for Parents -->
                <div id="parentLunaWidget"></div>
            </div>
        `;

        // Initialize Luna Translator for parent dashboard
        initLunaWidget('parentLunaWidget');
    }

    // Logout
    profileBadge.addEventListener("click", () => {
        slConfirm({
            title: "Log Out",
            message: "Do you want to log out of your session?",
            confirmText: "Log Out",
            cancelText: "Cancel",
            icon: "logout",
            danger: true
        }).then(confirmed => {
            if (confirmed) {
                localStorage.removeItem("sl_user");
                sessionStorage.removeItem("sl_user");
                STATE.user = null;
                // Clean up Luna translator
                if (STATE.lunaTranslator) {
                    STATE.lunaTranslator.stop();
                    STATE.lunaTranslator = null;
                }
                showLanding();
                slToast("You have been logged out.", "info");
            }
        });
    });

    // ─── Luna Translator init helper ────────────────────────────
    function initLunaWidget(containerId) {
        // Destroy previous instance if any
        if (STATE.lunaTranslator) {
            STATE.lunaTranslator.stop();
            STATE.lunaTranslator = null;
        }

        // Wait a tick for the DOM to settle
        setTimeout(() => {
            if (!window.LunaTranslator) {
                console.warn('LunaTranslator not loaded yet');
                return;
            }
            STATE.lunaTranslator = new LunaTranslator({
                containerId: containerId,
                avatarSlot: 1,
                onStatusChange: function (status) {
                    // Optional: hook for global status updates
                },
                onTokensReady: function (tokens) {
                    // Optional: hook for analytics
                }
            });
            STATE.lunaTranslator.init();
        }, 100);
    }

});
window.slExportPDF = function () {
    const mockStudents = [
        { id: "STU_01_122", name: "Aarav Sharma", progress: "88%", status: "On Track", lastActive: "Today" },
        { id: "STU_01_123", name: "Diya Patel", progress: "95%", status: "Excelling", lastActive: "Yesterday" },
        { id: "STU_01_124", name: "Kabir Singh", progress: "45%", status: "Needs Help", lastActive: "3 days ago" },
        { id: "STU_01_125", name: "Ananya Iyer", progress: "72%", status: "On Track", lastActive: "Today" },
        { id: "STU_01_126", name: "Rohan Gupta", progress: "10%", status: "Inactive", lastActive: "1 week ago" }
    ];

    if (!window.jspdf) {
        slToast("PDF library is still loading. Please try again in a moment.", "warning");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("SAMAVESH - Class Progress Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text("Generated on: " + new Date().toLocaleDateString(), 14, 30);

    const tableColumn = ["Student ID", "Name", "Progress", "Status", "Last Active"];
    const tableRows = [];

    mockStudents.forEach(student => {
        const studentData = [student.id, student.name, student.progress, student.status, student.lastActive];
        tableRows.push(studentData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        theme: 'grid',
        headStyles: { fillColor: [74, 144, 226] }
    });

    doc.save("Samavesh_Class_Report.pdf");
};
window.slViewStudent = function (studentId) {
    const mockStudents = [
        { id: "STU_01_122", name: "Aarav Sharma", grade: "Grade 3", progress: "88%", status: "On Track", lastActive: "Today" },
        { id: "STU_01_123", name: "Diya Patel", grade: "Grade 3", progress: "95%", status: "Excelling", lastActive: "Yesterday" },
        { id: "STU_01_124", name: "Kabir Singh", grade: "Grade 3", progress: "45%", status: "Needs Help", lastActive: "3 days ago" },
        { id: "STU_01_125", name: "Ananya Iyer", grade: "Grade 3", progress: "72%", status: "On Track", lastActive: "Today" },
        { id: "STU_01_126", name: "Rohan Gupta", grade: "Grade 3", progress: "10%", status: "Inactive", lastActive: "1 week ago" }
    ];

    const student = mockStudents.find(s => s.id === studentId);
    if (!student) return;

    let modal = document.getElementById("slStudentDetailModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "slStudentDetailModal";
        modal.className = "sl-modal-overlay";
        modal.style.display = "none";
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="sl-auth-card" style="max-width: 500px; width: 100%;">
            <button class="sl-modal-close" onclick="document.getElementById('slStudentDetailModal').style.display='none'">✕</button>
            
            <div class="sl-auth-header" style="text-align: left; margin-bottom: 1.5rem;">
                <div style="display:flex; align-items:center; gap:1rem;">
                    <div class="sl-avatar-circle" style="width:50px; height:50px; font-size:1.5rem;">
                        ${student.name.charAt(0)}
                    </div>
                    <div>
                        <h2 style="font-size:1.6rem; font-weight:900; color:var(--text-main); margin:0;">${student.name}</h2>
                        <p style="color:var(--text-muted); margin:0; font-size:0.9rem;">ID: ${student.id} | ${student.grade}</p>
                    </div>
                </div>
            </div>
            
            <div style="background: #F8FAFC; padding: 1.5rem; border-radius: 12px; margin-bottom: 1.5rem;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <span style="font-weight: 600; color: var(--text-muted);">Current Progress</span>
                    <span style="font-weight: 800; color: #06D6A0;">${student.progress}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 1rem;">
                    <span style="font-weight: 600; color: var(--text-muted);">System Status</span>
                    <span style="font-weight: 800;">${student.status}</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span style="font-weight: 600; color: var(--text-muted);">Last Active</span>
                    <span style="font-weight: 800;">${student.lastActive}</span>
                </div>
            </div>

            <div style="display: flex; gap: 1rem;">
                <button class="sl-btn sl-btn-primary" style="flex: 1; justify-content: center; gap: 0.5rem;" onclick="slToast('Message sent to student!', 'success')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Message
                </button>
                <button class="sl-btn sl-btn-outline" style="flex: 1; justify-content: center; gap: 0.5rem;" onclick="slToast('Module assigned successfully!', 'success')">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                    Assign Work
                </button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
};

window.slOpenParentProgressModal = function () {
    let modal = document.getElementById("slParentProgressModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "slParentProgressModal";
        modal.className = "sl-modal-overlay";
        modal.style.display = "none";
        document.body.appendChild(modal);
    }

    const mockData = {
        childName: "Aarav Sharma",
        grade: "Grade 1 • Section B",
        studentId: "STU_01_122",
        school: "Delhi Public School, Primary Wing",
        overallProgress: 88,
        totalTime: "14h 35m",
        quizzesPassed: "12 / 15",
        starsEarned: 48,
        streakDays: 7,
        teacherName: "Mrs. Radhika Sharma",
        subjects: [
            { name: "📐 Mathematics", progress: 88, color: "#4A90E2", detail: "8 / 9 Lessons completed • Quiz avg score 92%" },
            { name: "📚 English Language", progress: 92, color: "#FF9F1C", detail: "9 / 9 Lessons completed • Quiz avg score 95%" },
            { name: "🔬 Environmental Science", progress: 75, color: "#8338EC", detail: "6 / 9 Lessons completed • Quiz avg score 80%" },
            { name: "👋 Indian Sign Language", progress: 95, color: "#06D6A0", detail: "10 / 10 Lessons completed • Quiz avg score 98%" }
        ],
        recentMilestones: [
            { icon: "🏆", title: "Mastered ISL Alphabet Signs", date: "Yesterday, 4:30 PM", badge: "100% Score" },
            { icon: "⭐", title: "Completed Math Chapter 2 Quiz", date: "3 days ago", badge: "+10 Stars" },
            { icon: "🔥", title: "Achieved 7-Day Daily Study Streak", date: "Active Now", badge: "On Fire" }
        ],
        teacherNote: "Aarav is excelling in Sign Language and Mathematics! He actively participates in practice modules. We recommend continuing 15 minutes of daily Science practice."
    };

    modal.innerHTML = `
        <div class="sl-progress-popup-card">
            <button class="sl-modal-close" onclick="document.getElementById('slParentProgressModal').style.display='none'">✕</button>

            <!-- Header Profile -->
            <div style="display:flex; align-items:center; gap:1.2rem; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid #E2E8F0;">
                <div class="sl-avatar-circle" style="width:58px; height:58px; font-size:1.6rem; font-weight:900; background:linear-gradient(135deg, #06D6A0, #4A90E2); color:white; flex-shrink:0;">
                    ${mockData.childName.charAt(0)}
                </div>
                <div style="flex:1;">
                    <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
                        <h2 style="font-size:1.5rem; font-weight:900; color:var(--text-main); margin:0;">${mockData.childName}</h2>
                        <span style="background:#ECFDF5; color:#06D6A0; font-weight:800; font-size:0.8rem; padding:0.25rem 0.75rem; border-radius:50px; border:1px solid #A7F3D0;">
                            Status: Excelling
                        </span>
                    </div>
                    <p style="color:var(--text-muted); margin:0.2rem 0 0 0; font-size:0.88rem; font-weight:600;">
                        ${mockData.grade} | ID: <span style="color:var(--text-main); font-weight:700;">${mockData.studentId}</span>
                    </p>
                </div>
            </div>

            <!-- Title & Subtitle -->
            <div style="margin-bottom:1.5rem;">
                <h3 style="font-size:1.25rem; font-weight:800; color:var(--text-main); margin:0 0 0.3rem 0; display:flex; align-items:center; gap:0.5rem;">
                    📊 Child Progress Summary
                </h3>
                <p style="color:var(--text-muted); font-size:0.9rem; margin:0; line-height:1.5;">
                    Comprehensive overview of learning activity, subject mastery, and teacher feedback.
                </p>
            </div>

            <!-- Stats Bar -->
            <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-bottom:1.8rem;">
                <div class="sl-progress-stat-pill">
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Overall Progress</div>
                    <div style="font-size:1.35rem; font-weight:900; color:#06D6A0; margin-top:0.2rem;">${mockData.overallProgress}%</div>
                </div>
                <div class="sl-progress-stat-pill">
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Study Time</div>
                    <div style="font-size:1.35rem; font-weight:900; color:#4A90E2; margin-top:0.2rem;">${mockData.totalTime}</div>
                </div>
                <div class="sl-progress-stat-pill">
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Quizzes Passed</div>
                    <div style="font-size:1.35rem; font-weight:900; color:#8338EC; margin-top:0.2rem;">${mockData.quizzesPassed}</div>
                </div>
                <div class="sl-progress-stat-pill">
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-muted); text-transform:uppercase;">Stars & Streak</div>
                    <div style="font-size:1.35rem; font-weight:900; color:#FF9F1C; margin-top:0.2rem;">⭐ ${mockData.starsEarned} (${mockData.streakDays}d 🔥)</div>
                </div>
            </div>

            <!-- Subject Progress List -->
            <div style="margin-bottom:1.8rem;">
                <h4 style="font-size:1rem; font-weight:800; color:var(--text-main); margin:0 0 1rem 0;">Subject Performance Breakdown</h4>
                <div style="display:flex; flex-direction:column; gap:0.85rem;">
                    ${mockData.subjects.map(subj => `
                        <div style="background:#F8FAFC; border:1px solid #E2E8F0; padding:0.9rem 1.1rem; border-radius:16px;">
                            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.3rem;">
                                <span style="font-weight:800; font-size:0.92rem; color:var(--text-main);">${subj.name}</span>
                                <span style="font-weight:900; font-size:0.92rem; color:${subj.color};">${subj.progress}%</span>
                            </div>
                            <div class="sl-progress-bar-track">
                                <div class="sl-progress-bar-fill" style="width:${subj.progress}%; background:${subj.color};"></div>
                            </div>
                            <div style="font-size:0.78rem; color:var(--text-muted); margin-top:0.4rem; font-weight:600;">${subj.detail}</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Recent Milestones & Teacher Note Grid -->
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap:1rem; margin-bottom:1.8rem;">
                <div style="background:#FFF9EC; border:1px solid #FDE68A; border-radius:16px; padding:1.1rem;">
                    <h4 style="font-size:0.92rem; font-weight:800; color:#B45309; margin:0 0 0.8rem 0; display:flex; align-items:center; gap:0.4rem;">
                        🏆 Recent Achievements
                    </h4>
                    <div style="display:flex; flex-direction:column; gap:0.5rem;">
                        ${mockData.recentMilestones.map(m => `
                            <div style="display:flex; align-items:center; justify-content:space-between; font-size:0.82rem;">
                                <div>
                                    <span style="margin-right:0.3rem;">${m.icon}</span>
                                    <strong style="color:var(--text-main);">${m.title}</strong>
                                </div>
                                <span style="background:#FEF3C7; color:#92400E; font-size:0.72rem; font-weight:700; padding:0.1rem 0.5rem; border-radius:10px;">${m.badge}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div style="background:#F0F9FF; border:1px solid #BAE6FD; border-radius:16px; padding:1.1rem;">
                    <h4 style="font-size:0.92rem; font-weight:800; color:#0369A1; margin:0 0 0.5rem 0; display:flex; align-items:center; gap:0.4rem;">
                        📝 Teacher's Remark (${mockData.teacherName})
                    </h4>
                    <p style="font-size:0.83rem; color:#1E293B; line-height:1.5; margin:0; font-style:italic;">
                        "${mockData.teacherNote}"
                    </p>
                </div>
            </div>

            <!-- Footer Actions -->
            <div style="display:flex; gap:0.8rem; flex-wrap:wrap; border-top:1px solid #E2E8F0; padding-top:1.2rem;">
                <button class="sl-btn sl-btn-primary" style="flex:1; justify-content:center; gap:0.5rem; font-size:0.9rem;" onclick="slExportChildPDF()">
                    📄 Export PDF Report
                </button>
                <button class="sl-btn sl-btn-outline" style="flex:1; justify-content:center; gap:0.5rem; font-size:0.9rem;" onclick="slToast('Message sent to Mrs. Radhika Sharma!', 'success')">
                    💬 Contact Teacher
                </button>
                <button class="sl-btn sl-btn-outline" style="justify-content:center; padding:0.8rem 1.2rem; font-size:0.9rem;" onclick="document.getElementById('slParentProgressModal').style.display='none'">
                    Close
                </button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
};

window.slExportChildPDF = function (customChildData) {
    if (!window.jspdf) {
        slToast("PDF library is still loading. Please try again in a moment.", "warning");
        return;
    }

    const childData = customChildData || {
        name: "Aarav Sharma",
        grade: "Grade 1 • Section B",
        studentId: "STU_01_122",
        school: "Delhi Public School, Primary Wing",
        overallProgress: "88%",
        totalTime: "14h 35m",
        quizzesPassed: "12 / 15",
        starsEarned: "48 Stars (7-day Streak)",
        teacherName: "Mrs. Radhika Sharma",
        teacherNote: "Aarav is excelling in Sign Language and Mathematics! He actively participates in practice modules. We recommend continuing 15 minutes of daily Science practice.",
        subjects: [
            { name: "Mathematics", progress: "88%", detail: "8 / 9 Lessons completed", quizScore: "92%" },
            { name: "English Language", progress: "92%", detail: "9 / 9 Lessons completed", quizScore: "95%" },
            { name: "Environmental Science", progress: "75%", detail: "6 / 9 Lessons completed", quizScore: "80%" },
            { name: "Indian Sign Language", progress: "95%", detail: "10 / 10 Lessons completed", quizScore: "98%" }
        ]
    };

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Document Header
    doc.setFontSize(20);
    doc.setTextColor(74, 144, 226);
    doc.text("SAMAVESH — Child Learning Progress Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} | Parent Portal Record`, 14, 27);

    // Divider
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 31, 196, 31);

    // Student Metadata Box
    doc.setFontSize(12);
    doc.setTextColor(29, 45, 68);
    doc.text(`Student Name: ${childData.name}`, 14, 40);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Student ID: ${childData.studentId}   |   Grade: ${childData.grade}`, 14, 47);
    doc.text(`School: ${childData.school}`, 14, 53);

    // Summary Highlights Cards Table
    doc.autoTable({
        head: [["Overall Progress", "Total Study Time", "Quizzes Passed", "Stars & Streak"]],
        body: [[childData.overallProgress, childData.totalTime, childData.quizzesPassed, childData.starsEarned]],
        startY: 59,
        theme: 'grid',
        headStyles: { fillColor: [6, 214, 160], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 10, halign: 'center' }
    });

    // Subject Breakdown Table
    doc.setFontSize(12);
    doc.setTextColor(29, 45, 68);
    let currentY = doc.lastAutoTable.finalY + 12;
    doc.text("Subject Performance Breakdown", 14, currentY);

    const subjectRows = childData.subjects.map(s => [s.name, s.detail, s.quizScore, s.progress]);
    doc.autoTable({
        head: [["Subject", "Lessons Completed", "Quiz Avg Score", "Overall Progress"]],
        body: subjectRows,
        startY: currentY + 4,
        theme: 'striped',
        headStyles: { fillColor: [74, 144, 226] },
        styles: { fontSize: 9.5 }
    });

    // Teacher Note Box
    currentY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(11);
    doc.setTextColor(29, 45, 68);
    doc.text(`Teacher's Remark (${childData.teacherName}):`, 14, currentY);

    doc.setFontSize(9.5);
    doc.setTextColor(70, 80, 95);
    const splitNote = doc.splitTextToSize(`"${childData.teacherNote}"`, 180);
    doc.text(splitNote, 14, currentY + 7);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("SAMAVESH LMS — Empowering inclusive learning through Sign Language.", 14, 285);

    const filename = `${childData.name.replace(/\s+/g, '_')}_Progress_Report.pdf`;
    doc.save(filename);
    if (window.slToast) slToast("Child progress report PDF generated!", "success");
};