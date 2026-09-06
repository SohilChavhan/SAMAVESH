# 🤟 SAMAVESH 🤟

Welcome to **SAMAVESH**, an open-source, multi-modal sign language translation platform! 🌟 

SAMAVESH breaks down communication barriers by translating written or spoken text into realistic 3D avatar sign language, featuring our interactive avatar, **Luna**. 👩‍🦰✨

---

## 🎯 What is SAMAVESH?

SAMAVESH is an LMS (Learning Management System) equipped with a state-of-the-art sign language translation engine. We support multiple sign languages including:
- 🇮🇳 Indian Sign Language (ISL)
- 📍 Gujarat-Localised ISL (G-ISL)
- 🇺🇸 American Sign Language (ASL)

Whether you're using our **Web Application** 🌐 or our handy **Chrome Extension** 🧩, SAMAVESH is designed to make digital spaces significantly more accessible for the Deaf and Hard of Hearing community. 🦻🤝

---

## 🚀 Key Features

* **Real-time Translation** ⏱️: Type or speak, and Luna will sign it instantly!
* **Multi-lingual Support** 🌍: Built-in machine translation allows you to input text in languages like Gujarati or English.
* **Smart Fingerspelling** 🔠: If a specific word isn't in our sign dictionary, Luna seamlessly fingerspells it—even for non-Latin scripts like Gujarati!
* **Accessible & Open Source** 🔓: Built with web accessibility (a11y) in mind and driven by open datasets.

---

## 🛠️ Technology Stack

SAMAVESH is built for performance, accessibility, and modularity:

* **Backend** 🐍: Python, FastAPI, and Uvicorn.
* **NLP Processing** 🧠: `spaCy` analyzes grammar and optimizes the text for sign language syntax.
* **Sign Language Notation** 📝: HamNoSys and SiGML form the backbone of the avatar's gestures.
* **Frontend** 🖥️: Vanilla HTML/CSS/JS and the CWASA (JASigning) WebGL engine for rendering the 3D avatar.
* **Extension** 🧩: Chrome Extension Manifest V3 for translating selected text across the web.

---

## ⚙️ How It Works (The Magic Behind Luna)

1. 🗣️ **Input**: You speak or type your sentence.
2. 🧹 **NLP Cleanup**: We use AI (spaCy) to clean up the grammar, removing unnecessary fluff but keeping crucial meaning.
3. 📖 **Dictionary Lookup**: Words are mapped to "Glosses" and checked against our massive sign lexicon.
4. 🤖 **SiGML Generation**: The text is converted into SiGML (Signing Gesture Markup Language)—a script that tells Luna how to move.
5. ✨ **Animation**: The CWASA engine renders Luna, who smoothly signs your sentence in the browser!

---

*Let's build a world without communication barriers!* 🌉💬
