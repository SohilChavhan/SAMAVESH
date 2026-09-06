/**
 * SAMAVESH Internationalization (i18n) System
 * Supports seamless switching between English and Gujarati across the entire portal.
 */
(function (window, document) {
  'use strict';

  const STORAGE_KEY = 'samavesh_lang';
  const DEFAULT_LANG = 'en';

  const DICTIONARY = {
    en: {
      // Navigation
      'nav.student_login': 'Student Login',
      'nav.teacher_login': 'Teacher Login',
      'nav.parent_portal': 'Parent Portal',
      'nav.logout': 'Log Out',
      'nav.lang_btn_text': 'ગુજરાતી',
      'nav.lang_btn_title': 'Switch language to Gujarati / ભાષા બદલો',

      // Hero
      'hero.badge': '✨ Made for Students',
      'hero.title': 'Hands that Learn,<br>Hearts that Connect!',
      'hero.desc': 'Watch videos, take quizzes, and track your progress – made just for kids.',
      'hero.btn_student': "I'm a Student - Sign In",
      'hero.btn_teacher': "I'm a Teacher - Sign In",
      'hero.mascot_title': "Hi, I'm Kozhi the Owl!",
      'hero.mascot_desc': "I'll help you learn sign language while you study fun subjects. Are you ready?",
      'hero.pill_hello': '👋 "Hello"',
      'hero.pill_learn': '🧠 "Learn"',
      'hero.pill_math': '🔢 "Math"',

      // How It Works
      'how.title': 'How It Works',
      'how.desc': 'Start learning in 3 simple steps.',
      'how.step1_title': '1. Sign In with Your ID',
      'how.step1_desc': 'Use your school ID like <strong>STU_01_122</strong> or <strong>PRO1233</strong>.',
      'how.step2_title': '2. Watch & Learn',
      'how.step2_desc': 'Choose Maths, Language, or Science and watch short videos.',
      'how.step3_title': '3. Take Quizzes & Grow',
      'how.step3_desc': 'Finish each chapter with a quiz and see your progress in your profile.',

      // Subjects Preview
      'subjects.title': "What You'll Learn",
      'subjects.math_title': 'Maths',
      'subjects.math_desc': 'Numbers, shapes, and fun problems to solve every day.',
      'subjects.math_btn': 'Explore Maths',
      'subjects.lang_title': 'Language',
      'subjects.lang_desc': 'Words, sentences, and fun stories in sign language.',
      'subjects.lang_btn': 'Explore Language',
      'subjects.sci_title': 'Science',
      'subjects.sci_desc': 'Plants, animals, and discovering how things work.',
      'subjects.sci_btn': 'Explore Science',
      'subjects.sign_title': 'Sign Language',
      'subjects.sign_desc': 'Learn to communicate with hands, expressions, and gestures.',
      'subjects.sign_btn': 'Explore Sign Language',

      // Sign Focus
      'sign_focus.title': 'Learn in Your Sign Language',
      'sign_focus.desc': 'Our lessons use sign language so every child can learn easily and playfully!',

      // Parents & Teachers Section
      'pt.title': 'For Parents & Teachers',
      'pt.desc': 'SAMAVESH is built to provide a secure and supervised environment for students.',
      'pt.check1': 'Safe, kid-friendly design.',
      'pt.check2': 'Track progress with simple reports.',
      'pt.check3': 'Easy login with school registration numbers.',
      'pt.btn': 'Contact Us',

      // Footer
      'footer.about': 'About',
      'footer.privacy': 'Privacy Policy',
      'footer.contact': 'Contact Support',
      'footer.tagline': 'Made with ❤️ for students learning sign language.',

      // Auth Modal
      'auth.title': 'Welcome Back!',
      'auth.subtitle': 'Sign in to continue learning.',
      'auth.tab_student': 'Student',
      'auth.tab_teacher': 'Teacher',
      'auth.tab_parent': 'Parent',
      'auth.label_student': 'Student ID',
      'auth.hint_student': 'Format: STU_<year>_<roll> (e.g. STU_01_122)',
      'auth.placeholder_student': 'e.g. STU_01_122',
      'auth.label_teacher': 'Teacher ID',
      'auth.hint_teacher': 'Format: PRO_<id> (e.g. PRO_1233)',
      'auth.placeholder_teacher': 'e.g. PRO_1233',
      'auth.label_parent': 'Parent Email or ID',
      'auth.hint_parent': 'Enter your registered email address',
      'auth.placeholder_parent': 'Your Registered Email ID',
      'auth.btn_submit': 'Sign In',

      // Contact Modal
      'contact.title': 'Contact Us',
      'contact.subtitle': "We're here to help students, parents, and educators.",
      'contact.support_label': 'General Support',
      'contact.school_label': 'School & Teacher Inquiries',
      'contact.phone_label': 'Helpline & Phone',
      'contact.timing': 'Mon – Sat: 9:00 AM – 6:00 PM IST',

      // Video Player
      'player.back': '← Back',
      'player.dash_title': 'Student Dashboard',
      'player.sign_title': 'Sign Language Translation',
      'player.captions_waiting': 'Waiting for signs...',
      'player.video_title': 'Educational Video',
      'player.video_player_holder': '[Educational Video Player]',
      'player.video_desc': 'The video lesson plays here.',

      // Student Dashboard
      'student.welcome': 'Welcome back, {{name}}! 🌟',
      'student.ready': '{{grade}} | Ready to learn?',
      'student.profile_btn': 'My Profile & Scores',
      'student.tab_math': '📐 Maths',
      'student.tab_lang': '📚 Language',
      'student.tab_sci': '🔬 Science',
      'student.tab_sign': '👋 Sign Language',
      'chapters.ch1': 'Chapter 1: The Basics',
      'chapters.ch2': 'Chapter 2: Moving Forward',
      'chapters.ch3': 'Chapter 3: Master Challenge',
      'videos.vid1_math': 'Introduction to Basics (YouTube)',
      'videos.vid1_general': 'Introduction to {{subject}}',
      'videos.vid1_sign': 'Sign Language Tutorial (Playlist)',
      'videos.vid2': 'Learning the Signs',
      'videos.vid3': 'Practice with Friends',
      'videos.play': '▶️ Play',
      'videos.quiz_btn': '🏆 Take Chapter Quiz',
      'videos.coming_soon': 'Video coming soon',
      'videos.pending': '⏳ Pending',

      // Teacher Dashboard
      'teacher.portal': 'Teacher Portal',
      'teacher.welcome': 'Welcome back, {{name}}. Here is your class overview.',
      'teacher.export_pdf': '📥 Export Class Report',
      'teacher.stat_avg': 'Average Quiz Score',
      'teacher.stat_help': 'Students Needing Help',
      'teacher.stat_recent': 'Recent Submissions',
      'teacher.roster_title': 'Student Roster',
      'teacher.search_ph': 'Search students by name or ID...',
      'teacher.th_id': 'Student ID',
      'teacher.th_name': 'Name',
      'teacher.th_prog': 'Course Progress',
      'teacher.th_status': 'Status',
      'teacher.th_active': 'Last Active',
      'teacher.th_actions': 'Actions',
      'teacher.btn_details': 'View Details',
      'teacher.status_ontrack': 'On Track',
      'teacher.status_excelling': 'Excelling',
      'teacher.status_needshelp': 'Needs Help',
      'teacher.status_inactive': 'Inactive',
      'teacher.completed': 'Completed',
      'teacher.today': 'Today',
      'teacher.yesterday': 'Yesterday',
      'teacher.days_ago': '{{n}} days ago',
      'teacher.week_ago': '1 week ago',
      'teacher.no_students': 'No students found matching your search.',

      // Parent Dashboard
      'parent.title': 'Parent Dashboard',
      'parent.welcome': 'Welcome, {{name}}.',
      'parent.btn_view_summary': '📊 View Progress Summary',
      'parent.btn_manage': 'Manage Child Profiles',
      'parent.screen_title': 'Screen Time Limits',
      'parent.daily_limit': 'Daily limit: 1.5 hours',
      'parent.used_today': 'Used Today: ',
      'parent.mins_rem': '45 mins (45m remaining)',
      'parent.report_title': 'Weekly Report',
      'parent.stars_earned': 'Your child earned 12 stars this week!',
      'parent.achievement': 'Achievement: ',
      'parent.streak': '7-Day Study Streak 🔥',
      'parent.prog_title': 'Progress Summary',
      'parent.prog_desc': "Track your child's learning journey across all subjects.",
      'parent.btn_view_details': 'View Details',

      // Luna Translator Widget
      'luna.title': 'Luna Sign Language Translator',
      'luna.subtitle': 'Type anything and watch Luna sign it for you!',
      'luna.write_in': 'You write in',
      'luna.signed_in': 'Signed in',
      'luna.placeholder': 'Try something like: Hello, how are you?',
      'luna.btn_translate': '🤟 Translate to Sign',
      'luna.loading': 'Loading…',
      'luna.ready': 'Ready',

      // Modals & Popups
      'popup.logout_title': 'Log Out',
      'popup.logout_msg': 'Do you want to log out of your session?',
      'popup.btn_logout': 'Log Out',
      'popup.btn_cancel': 'Cancel',
      'popup.toast_logout': 'You have been logged out.',
      'popup.quiz_title': 'AI Sign Evaluation',
      'popup.continue_learning': 'Continue Learning',
      'popup.profile_title': 'Student Profile',
      'popup.course_progress': 'Course Progress',
      'popup.quizzes_taken': 'Quizzes Taken',
      'popup.overall_avg': 'Overall Average',
      'popup.done': 'Done'
    },
    gu: {
      // Navigation
      'nav.student_login': 'વિદ્યાર્થી પ્રવેશ',
      'nav.teacher_login': 'શિક્ષક પ્રવેશ',
      'nav.parent_portal': 'વાલી પોર્ટલ',
      'nav.logout': 'લૉગ આઉટ',
      'nav.lang_btn_text': 'English',
      'nav.lang_btn_title': 'અંગ્રેજીમાં બદલો / Switch to English',

      // Hero
      'hero.badge': '✨ વિદ્યાર્થીઓ માટે બનાવેલ',
      'hero.title': 'શીખતા હાથ,<br>જોડાતા હૃદય!',
      'hero.desc': 'વિડિયો જુઓ, ક્વિઝ આપો અને તમારી પ્રગતિ તપાસો – ખાસ બાળકો માટે.',
      'hero.btn_student': 'હું વિદ્યાર્થી છું - સાઇન ઇન કરો',
      'hero.btn_teacher': 'હું શિક્ષક છું - સાઇન ઇન કરો',
      'hero.mascot_title': 'નમસ્તે, હું કોઝી ઘુવડ છું!',
      'hero.mascot_desc': 'હું તમને રસપ્રદ વિષયો શીખતી વખતે સાંકેતિક ભાષા શીખવામાં મદદ કરીશ. શું તમે તૈયાર છો?',
      'hero.pill_hello': '👋 "નમસ્તે"',
      'hero.pill_learn': '🧠 "શીખો"',
      'hero.pill_math': '🔢 "ગણિત"',

      // How It Works
      'how.title': 'આ કેવી રીતે કાર્ય કરે છે',
      'how.desc': '૩ સરળ પગલાંઓમાં શીખવાનું શરૂ કરો.',
      'how.step1_title': '૧. તમારા આઈડીથી સાઇન ઇન કરો',
      'how.step1_desc': 'તમારા શાળાના આઈડી જેમ કે <strong>STU_01_122</strong> અથવા <strong>PRO1233</strong> નો ઉપયોગ કરો.',
      'how.step2_title': '૨. જુઓ અને શીખો',
      'how.step2_desc': 'ગણિત, ભાષા અથવા વિજ્ઞાન પસંદ કરો અને ટૂંકા વિડિયો જુઓ.',
      'how.step3_title': '૩. ક્વિઝ આપો અને આગળ વધો',
      'how.step3_desc': 'દરેક પ્રકરણ ક્વિઝ સાથે પૂર્ણ કરો અને તમારી પ્રોફાઇલમાં તમારી પ્રગતિ જુઓ.',

      // Subjects Preview
      'subjects.title': 'તમે શું શીખશો',
      'subjects.math_title': 'ગણિત',
      'subjects.math_desc': 'સંખ્યાઓ, આકારો અને દરરોજ ઉકેલવા માટે રસપ્રદ કોયડાઓ.',
      'subjects.math_btn': 'ગણિત શીખો',
      'subjects.lang_title': 'ભાષા',
      'subjects.lang_desc': 'સાંકેતિક ભાષામાં શબ્દો, વાક્યો અને મનોરંજક વાર્તાઓ.',
      'subjects.lang_btn': 'ભાષા શીખો',
      'subjects.sci_title': 'વિજ્ઞાન',
      'subjects.sci_desc': 'વનસ્પતિઓ, પ્રાણીઓ અને વસ્તુઓ કેવી રીતે કાર્ય કરે છે તે જાણો.',
      'subjects.sci_btn': 'વિજ્ઞાન શીખો',
      'subjects.sign_title': 'સાંકેતિક ભાષા',
      'subjects.sign_desc': 'હાથ, હાવભાવ અને સંકેતો વડે વાતચીત કરતા શીખો.',
      'subjects.sign_btn': 'સાંકેતિક ભાષા શીખો',

      // Sign Focus
      'sign_focus.title': 'તમારી સાંકેતિક ભાષામાં શીખો',
      'sign_focus.desc': 'અમારા પાઠો સાંકેતિક ભાષાનો ઉપયોગ કરે છે જેથી દરેક બાળક સરળતાથી અને રમત-રમતમાં શીખી શકે!',

      // Parents & Teachers Section
      'pt.title': 'વાલીઓ અને શિક્ષકો માટે',
      'pt.desc': 'સમાવેશ વિદ્યાર્થીઓ માટે સુરક્ષિત અને માર્ગદર્શિત વાતાવરણ પૂરું પાડવા માટે બનાવવામાં આવ્યો છે.',
      'pt.check1': 'સુરક્ષિત, બાળકો માટે અનુકૂળ ડિઝાઇન.',
      'pt.check2': 'સરળ અહેવાલો સાથે પ્રગતિ તપાસો.',
      'pt.check3': 'શાળા નોંધણી નંબર સાથે સરળ લૉગિન.',
      'pt.btn': 'અમારો સંપર્ક કરો',

      // Footer
      'footer.about': 'અમારા વિશે',
      'footer.privacy': 'ગોપનીયતા નીતિ',
      'footer.contact': 'સહાયતા સંપર્ક',
      'footer.tagline': 'સાંકેતિક ભાષા શીખતા વિદ્યાર્થીઓ માટે ❤️ સાથે બનાવેલ.',

      // Auth Modal
      'auth.title': 'પુનઃ સ્વાગત છે!',
      'auth.subtitle': 'શીખવાનું ચાલુ રાખવા માટે સાઇન ઇન કરો.',
      'auth.tab_student': 'વિદ્યાર્થી',
      'auth.tab_teacher': 'શિક્ષક',
      'auth.tab_parent': 'વાલી',
      'auth.label_student': 'વિદ્યાર્થી ID',
      'auth.hint_student': 'ફોર્મેટ: STU_<વર્ષ>_<રોલ> (દા.ત. STU_01_122)',
      'auth.placeholder_student': 'દા.ત. STU_01_122',
      'auth.label_teacher': 'શિક્ષક ID',
      'auth.hint_teacher': 'ફોર્મેટ: PRO_<આઈડી> (દા.ત. PRO_1233)',
      'auth.placeholder_teacher': 'દા.ત. PRO_1233',
      'auth.label_parent': 'વાલી ઇમેઇલ અથવા ID',
      'auth.hint_parent': 'તમારું નોંધાયેલ ઇમેઇલ સરનામું દાખલ કરો',
      'auth.placeholder_parent': 'તમારું નોંધાયેલ ઇમેઇલ ID',
      'auth.btn_submit': 'સાઇન ઇન કરો',

      // Contact Modal
      'contact.title': 'અમારો સંપર્ક કરો',
      'contact.subtitle': 'અમે વિદ્યાર્થીઓ, વાલીઓ અને શિક્ષકોને મદદ કરવા માટે અહીં છીએ.',
      'contact.support_label': 'સામાન્ય સહાય',
      'contact.school_label': 'શાળા અને શિક્ષક પૂછપરછ',
      'contact.phone_label': 'હેલ્પલાઇન અને ફોન',
      'contact.timing': 'સોમ – શનિ: સવારે ૯:૦૦ થી સાંજે ૬:૦૦ IST',

      // Video Player
      'player.back': '← પાછા જાઓ',
      'player.dash_title': 'વિદ્યાર્થી ડેશબોર્ડ',
      'player.sign_title': 'સાંકેતિક ભાષા અનુવાદ',
      'player.captions_waiting': 'સંકેતોની રાહ જોવાઈ રહી છે...',
      'player.video_title': 'શૈક્ષણિક વિડિયો',
      'player.video_player_holder': '[શૈક્ષણિક વિડિયો પ્લેયર]',
      'player.video_desc': 'વિડિયો પાઠ અહીં ચાલશે.',

      // Student Dashboard
      'student.welcome': 'પુનઃ સ્વાગત છે, {{name}}! 🌟',
      'student.ready': '{{grade}} | શીખવા માટે તૈયાર છો?',
      'student.profile_btn': 'મારી પ્રોફાઇલ અને સ્કોર',
      'student.tab_math': '📐 ગણિત',
      'student.tab_lang': '📚 ભાષા',
      'student.tab_sci': '🔬 વિજ્ઞાન',
      'student.tab_sign': '👋 સાંકેતિક ભાષા',
      'chapters.ch1': 'પ્રકરણ ૧: મૂળભૂત બાબતો',
      'chapters.ch2': 'પ્રકરણ ૨: આગળ વધો',
      'chapters.ch3': 'પ્રકરણ ૩: મુખ્ય પડકાર',
      'videos.vid1_math': 'મૂળભૂત પરિચય (YouTube)',
      'videos.vid1_general': '{{subject}} નો પરિચય',
      'videos.vid1_sign': 'સાંકેતિક ભાષા ટ્યુટોરિયલ (પ્લેલિસ્ટ)',
      'videos.vid2': 'સંકેતો શીખવા',
      'videos.vid3': 'મિત્રો સાથે પ્રેક્ટિસ',
      'videos.play': '▶️ જુઓ',
      'videos.quiz_btn': '🏆 પ્રકરણ ક્વિઝ આપો',
      'videos.coming_soon': 'વિડિયો ટૂંક સમયમાં આવશે',
      'videos.pending': '⏳ બાકી',

      // Teacher Dashboard
      'teacher.portal': 'શિક્ષક પોર્ટલ',
      'teacher.welcome': 'પુનઃ સ્વાગત છે, {{name}}. અહીં તમારા વર્ગની માહિતી છે.',
      'teacher.export_pdf': '📥 વર્ગ અહેવાલ ડાઉનલોડ કરો',
      'teacher.stat_avg': 'સરેરાશ ક્વિઝ સ્કોર',
      'teacher.stat_help': 'મદદની જરૂર હોય તેવા વિદ્યાર્થીઓ',
      'teacher.stat_recent': 'તાજેતરના સબમિશન',
      'teacher.roster_title': 'વિદ્યાર્થી યાદી',
      'teacher.search_ph': 'નામ અથવા ID દ્વારા વિદ્યાર્થીઓ શોધો...',
      'teacher.th_id': 'વિદ્યાર્થી ID',
      'teacher.th_name': 'નામ',
      'teacher.th_prog': 'કોર્સ પ્રગતિ',
      'teacher.th_status': 'સ્થિતિ',
      'teacher.th_active': 'છેલ્લે સક્રિય',
      'teacher.th_actions': 'ક્રિયાઓ',
      'teacher.btn_details': 'વિગતવાર જુઓ',
      'teacher.status_ontrack': 'યોગ્ય ગતિએ',
      'teacher.status_excelling': 'ઉત્કૃષ્ટ',
      'teacher.status_needshelp': 'મદદ જરૂરી',
      'teacher.status_inactive': 'નિષ્ક્રિય',
      'teacher.completed': 'પૂર્ણ',
      'teacher.today': 'આજે',
      'teacher.yesterday': 'ગઈકાલે',
      'teacher.days_ago': '{{n}} દિવસ પહેલા',
      'teacher.week_ago': '૧ અઠવાડિયા પહેલા',
      'teacher.no_students': 'તમારી શોધ મુજબ કોઈ વિદ્યાર્થી મળ્યા નથી.',

      // Parent Dashboard
      'parent.title': 'વાલી ડેશબોર્ડ',
      'parent.welcome': 'સ્વાગત છે, {{name}}.',
      'parent.btn_view_summary': '📊 પ્રગતિ સારાંશ જુઓ',
      'parent.btn_manage': 'બાળકની પ્રોફાઇલ મેનેજ કરો',
      'parent.screen_title': 'સ્ક્રીન સમય મર્યાદા',
      'parent.daily_limit': 'દૈનિક મર્યાદા: ૧.૫ કલાક',
      'parent.used_today': 'આજે વપરાયેલ: ',
      'parent.mins_rem': '૪૫ મિનિટ (૪૫ મિનિટ બાકી)',
      'parent.report_title': 'સાપ્તાહિક અહેવાલ',
      'parent.stars_earned': 'તમારા બાળકે આ અઠવાડિયે ૧૨ સ્ટાર્સ મેળવ્યા!',
      'parent.achievement': 'સિદ્ધિ: ',
      'parent.streak': '૭ દિવસ સતત અભ્યાસ 🔥',
      'parent.prog_title': 'પ્રગતિ સારાંશ',
      'parent.prog_desc': 'બધા વિષયોમાં તમારા બાળકની શીખવાની યાત્રા તપાસો.',
      'parent.btn_view_details': 'વિગતવાર જુઓ',

      // Luna Translator Widget
      'luna.title': 'લુના સાંકેતિક ભાષા અનુવાદક',
      'luna.subtitle': 'કંઈપણ લખો અને લુનાને તમારા માટે સંકેત આપતા જુઓ!',
      'luna.write_in': 'તમે લખો છો',
      'luna.signed_in': 'સાંકેતિક ભાષા',
      'luna.placeholder': 'લખો જેમ કે: નમસ્તે, તમે કેમ છો?',
      'luna.btn_translate': '🤟 સંકેતમાં અનુવાદ કરો',
      'luna.loading': 'લોડ થઈ રહ્યું છે…',
      'luna.ready': 'તૈયાર',

      // Modals & Popups
      'popup.logout_title': 'લૉગ આઉટ',
      'popup.logout_msg': 'શું તમે તમારા સત્રમાંથી લૉગ આઉટ કરવા માંગો છો?',
      'popup.btn_logout': 'લૉગ આઉટ',
      'popup.btn_cancel': 'રદ કરો',
      'popup.toast_logout': 'તમે લૉગ આઉટ થઈ ગયા છો.',
      'popup.quiz_title': 'AI સાંકેતિક મૂલ્યાંકન',
      'popup.continue_learning': 'શીખવાનું ચાલુ રાખો',
      'popup.profile_title': 'વિદ્યાર્થી પ્રોફાઇલ',
      'popup.course_progress': 'કોર્સ પ્રગતિ',
      'popup.quizzes_taken': 'આપેલી ક્વિઝ',
      'popup.overall_avg': 'કુલ સરેરાશ',
      'popup.done': 'પૂર્ણ'
    }
  };

  let currentLang = DEFAULT_LANG;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'gu' || saved === 'en') {
      currentLang = saved;
    }
  } catch (e) {}

  function resolve(key, lang) {
    const targetLang = lang || currentLang;
    if (DICTIONARY[targetLang] && DICTIONARY[targetLang][key] !== undefined) {
      return DICTIONARY[targetLang][key];
    }
    if (DICTIONARY.en && DICTIONARY.en[key] !== undefined) {
      return DICTIONARY.en[key];
    }
    return key;
  }

  function interpolate(template, vars) {
    if (!vars) return template;
    return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, function (_m, name) {
      return Object.prototype.hasOwnProperty.call(vars, name)
        ? String(vars[name])
        : '{{' + name + '}}';
    });
  }

  function t(key, vars, lang) {
    const raw = resolve(key, lang);
    return interpolate(raw, vars);
  }

  function hydrateDOM(root) {
    const scope = root || document;
    if (!scope.querySelectorAll) return;

    // Plain text replacement
    scope.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) {
        el.textContent = t(key);
      }
    });

    // HTML replacement (for strings containing <br> or <strong>)
    scope.querySelectorAll('[data-i18n-html]').forEach((el) => {
      const key = el.getAttribute('data-i18n-html');
      if (key) {
        el.innerHTML = t(key);
      }
    });

    // Attribute replacements
    scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key) {
        el.setAttribute('placeholder', t(key));
      }
    });

    scope.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const key = el.getAttribute('data-i18n-title');
      if (key) {
        el.setAttribute('title', t(key));
      }
    });

    scope.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
      const key = el.getAttribute('data-i18n-aria-label');
      if (key) {
        el.setAttribute('aria-label', t(key));
      }
    });

    // Update Language Toggle Button in Nav
    const langBtnText = document.getElementById('slLangText');
    const langBtn = document.getElementById('slLangToggleBtn');
    if (langBtnText) {
      langBtnText.textContent = t('nav.lang_btn_text');
    }
    if (langBtn) {
      langBtn.setAttribute('title', t('nav.lang_btn_title'));
      langBtn.setAttribute('aria-label', t('nav.lang_btn_title'));
    }
  }

  function setLanguage(newLang) {
    if (newLang !== 'en' && newLang !== 'gu') return;
    currentLang = newLang;
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {}

    document.documentElement.lang = currentLang;

    // Hydrate all static markup
    hydrateDOM(document);

    // Notify listeners / refresh active views if LMS logic is running
    if (window.onSamaveshLanguageChange) {
      window.onSamaveshLanguageChange(currentLang);
    }
  }

  function toggleLanguage() {
    const nextLang = currentLang === 'en' ? 'gu' : 'en';
    setLanguage(nextLang);
    if (window.slToast) {
      const msg = nextLang === 'gu' ? 'ભાષા ગુજરાતીમાં બદલાઈ ગઈ છે (Language set to Gujarati)' : 'Language switched to English';
      slToast(msg, 'info', 2500);
    }
    return nextLang;
  }

  // Global click event delegation for language toggle buttons
  document.addEventListener('click', (e) => {
    const btn = e.target && e.target.closest ? e.target.closest('#slLangToggleBtn, .sl-lang-toggle-btn') : null;
    if (btn) {
      e.preventDefault();
      e.stopPropagation();
      toggleLanguage();
    }
  }, true);

  // Initialize on DOMContentLoaded
  function init() {
    document.documentElement.lang = currentLang;
    hydrateDOM(document);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SamaveshI18n = {
    t: t,
    getLanguage: () => currentLang,
    setLanguage: setLanguage,
    toggleLanguage: toggleLanguage,
    hydrate: hydrateDOM,
    dictionary: DICTIONARY
  };
  window.toggleLanguage = toggleLanguage;
  window.setSamaveshLanguage = setLanguage;

})(window, document);

