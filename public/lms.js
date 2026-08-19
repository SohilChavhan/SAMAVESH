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
        setActiveAuthTab(role);
        authOverlay.style.display = "flex";
    }));

    if (closeAuthBtn) {
        closeAuthBtn.addEventListener("click", () => {
            authOverlay.style.display = "none";
        });
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
        
        if (role === "student") {
            inputLabel.innerText = "Student ID";
            inputHint.innerText = "Format: STU_<year>_<roll> (e.g. STU_01_122)";
        } else if (role === "teacher") {
            inputLabel.innerText = "Teacher ID";
            inputHint.innerText = "Format: PRO_<id> (e.g. PRO1233)";
        } else {
            inputLabel.innerText = "Parent Email or ID";
            inputHint.innerText = "Enter your registered email address";
        }
        document.getElementById("authRole").value = role;
        authError.style.display = "none";
    }

    async function handleLogin(e) {
        e.preventDefault();
        const regNumber = document.getElementById("authRegNumber").value;
        const role = document.getElementById("authRole").value;
        const remember = document.getElementById("authRemember").checked;

        try {
            const response = await fetch(`${API_BASE}/api/lms/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reg_number: regNumber, role: role, remember_me: remember })
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                STATE.user = data.user;
                if (remember) {
                    localStorage.setItem("sl_user", JSON.stringify(data.user));
                } else {
                    sessionStorage.setItem("sl_user", JSON.stringify(data.user));
                }
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
        const savedUser = localStorage.getItem("sl_user") || sessionStorage.getItem("sl_user");
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
                        <div class="sl-video-list">
                            <div class="sl-video-item" onclick="slPlayVideo('${subject}', ${ch.id}, ${subject === 'maths' && ch.id === 1 ? "'xA1XEVWzAYg'" : "'v1'"})">
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

    window.slPlayVideo = async function(subject, chapterId, videoId) {
        // Switch views
        document.getElementById("slDashboardView").style.display = "none";
        document.getElementById("slVideoPlayerView").style.display = "block";
        
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
                    await vt._loadSignLanguage('gisl');
                    const tokens = await vt._doPlan(text, false);
                    if (tokens.length) {
                        const { sigml } = vt._buildSigml(tokens);
                        if (sigml && window.CWASA) {
                            setTimeout(() => {
                                try {
                                    CWASA.stopSiGML(0);
                                } catch(e) {}
                                try {
                                    console.log('SIGML IS:', sigml);
                                    CWASA.playSiGMLText(sigml, 0);
                                } catch(e) {
                                    console.error("CWASA Play Error", e);
                                }
                            }, 100);
                        }
                    }
                } catch(e) {
                    console.error("Luna video translate error:", e);
                }
            }
        }

        if (videoId === 'xA1XEVWzAYg') {
            container.innerHTML = `<div id="sl-yt-${videoId}"></div>`;
            container.className = "";
            
            function initYTPlayer() {
                window._slYtPlayer = new YT.Player(`sl-yt-${videoId}`, {
                    height: '400',
                    width: '100%',
                    videoId: videoId,
                    playerVars: { 'autoplay': 1, 'playsinline': 1 },
                    events: {
                        'onReady': (event) => {
                            fetch(`/data/yt_${videoId}.json`).then(res => res.json()).then(script => {
                                let currentLine = -1;
                                
                                window._slVideoTimer = setInterval(() => {
                                    if (!window._slYtPlayer || typeof window._slYtPlayer.getCurrentTime !== 'function') return;
                                    
                                    const elapsed = window._slYtPlayer.getCurrentTime();
                                    for (let i = script.length - 1; i >= 0; i--) {
                                        if (elapsed >= script[i].time) {
                                            if (currentLine !== i) {
                                                currentLine = i;
                                                playLunaText(script[i].text);
                                            }
                                            break;
                                        }
                                    }
                                }, 500);
                            }).catch(e => console.error("Error loading transcript", e));
                        }
                    }
                });
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
                    if(data.success) {
                        STATE.progress = data.progress;
                        captions.innerText = "Video completed! Course progress saved! 🌟";
                    }
                } catch(e) {
                    console.error(e);
                }
            }, 5000);
        }
    }

    window.slCloseVideo = function() {
        if (window._slVideoTimer) {
            clearInterval(window._slVideoTimer);
        }
        if (window._slYtPlayer) {
            try { window._slYtPlayer.destroy(); } catch(e) {}
            window._slYtPlayer = null;
        }
        if (window.CWASA) {
            try { CWASA.stop(0); } catch(e) {}
        }
        
        const container = document.getElementById("slVideoContainer");
        if (container) container.innerHTML = "";
        
        document.getElementById("slVideoPlayerView").style.display = "none";
        document.getElementById("slDashboardView").style.display = "block";
        loadProgressAndRender(); // refresh progress in dashboard
    }

    window.slStartQuiz = function(subject, chapterId) {
        const qid = `${subject}_${chapterId}`;
        alert(`Starting Quiz for ${subject} Chapter ${chapterId}...\\n\\nSimulating video sign answer submission...`);
        
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
                
                if(data.success) {
                    alert(`Quiz Evaluated by AI!\\n\\nScore: ${data.score}/10\\nFeedback: ${data.feedback}\\nStars: ${"⭐".repeat(data.stars)}`);
                    
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
            } catch(e) {
                console.error(e);
            }
        }, 1000);
    }

    function showProfileModal() {
        let totalScore = 0;
        let totalQuizzes = 0;
        
        for (const [qid, score] of Object.entries(STATE.progress.quizzes || {})) {
            totalScore += score;
            totalQuizzes += 1;
        }
        
        const percentage = totalQuizzes > 0 ? Math.round((totalScore / (totalQuizzes * 10)) * 100) : 0;
        
        let mathProg = STATE.progress.courses["maths"] ? STATE.progress.courses["maths"].progress_pct : 0;
        let langProg = STATE.progress.courses["language"] ? STATE.progress.courses["language"].progress_pct : 0;
        let sciProg = STATE.progress.courses["science"] ? STATE.progress.courses["science"].progress_pct : 0;

        alert(`
        === MY PROFILE ===
        Name: ${STATE.user.name}
        Student ID: ${STATE.user.id}
        Grade: ${STATE.user.grade}
        
        === PROGRESS ===
        Maths: ${mathProg}% completed
        Language: ${langProg}% completed
        Science: ${sciProg}% completed
        
        === QUIZ STATS ===
        Quizzes Taken: ${totalQuizzes}
        Overall Average: ${percentage}%
        `);
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
                        <input type="text" placeholder="Search students by name or ID..." style="padding: 0.6rem 1rem; border: 1px solid #CBD5E1; border-radius: 8px; width: 300px; font-family: inherit;">
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
                        <tbody>
                            ${studentRows}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function renderParentDashboard() {
        dashView.innerHTML = `
            <div class="sl-dashboard-container">
                <div class="sl-dash-topbar">
                    <div class="sl-dash-welcome">
                        <h2>Parent Dashboard</h2>
                        <p style="color:var(--text-muted)">Welcome, ${STATE.user.name}.</p>
                    </div>
                    <div>
                        <button class="sl-btn sl-btn-outline">Manage Child Profiles</button>
                    </div>
                </div>

                <div class="sl-grid-3">
                    <div class="sl-chapter-card" style="padding:1.5rem;">
                        <h3>Screen Time Limits</h3>
                        <p>Daily limit: 1.5 hours</p>
                    </div>
                    <div class="sl-chapter-card" style="padding:1.5rem;">
                        <h3>Weekly Report</h3>
                        <p>Your child earned 12 stars this week!</p>
                    </div>
                    <div class="sl-chapter-card" style="padding:1.5rem;">
                        <h3>📊 Progress Summary</h3>
                        <p>Track your child's learning journey across all subjects.</p>
                        <button class="sl-btn sl-btn-secondary" style="margin-top:1rem; width:100%; justify-content:center;">View Details</button>
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
        if(confirm("Do you want to log out?")) {
            localStorage.removeItem("sl_user");
            sessionStorage.removeItem("sl_user");
            STATE.user = null;
            // Clean up Luna translator
            if (STATE.lunaTranslator) {
                STATE.lunaTranslator.stop();
                STATE.lunaTranslator = null;
            }
            showLanding();
        }
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
window.slExportPDF = function() {
    const mockStudents = [
        { id: "STU_01_122", name: "Aarav Sharma", progress: "88%", status: "On Track", lastActive: "Today" },
        { id: "STU_01_123", name: "Diya Patel", progress: "95%", status: "Excelling", lastActive: "Yesterday" },
        { id: "STU_01_124", name: "Kabir Singh", progress: "45%", status: "Needs Help", lastActive: "3 days ago" },
        { id: "STU_01_125", name: "Ananya Iyer", progress: "72%", status: "On Track", lastActive: "Today" },
        { id: "STU_01_126", name: "Rohan Gupta", progress: "10%", status: "Inactive", lastActive: "1 week ago" }
    ];

    if (!window.jspdf) {
        alert("PDF library is still loading. Please try again in a second.");
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
window.slViewStudent = function(studentId) {
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
                <button class="sl-btn sl-btn-primary" style="flex: 1; justify-content: center;" onclick="alert('Message sent!')">💬 Message</button>
                <button class="sl-btn sl-btn-outline" style="flex: 1; justify-content: center;" onclick="alert('Module assigned.')">📚 Assign Work</button>
            </div>
        </div>
    `;

    modal.style.display = "flex";
};