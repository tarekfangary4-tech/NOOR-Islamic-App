
"use strict";

const QURAN_API = "https://api.alquran.cloud/v1";

let allSurahs = [];
let currentSurah = null;
let currentAyahs = [];
let savedAyahs = loadSavedAyahs();

function loadSavedAyahs() {
    try {
        const data = JSON.parse(localStorage.getItem("noorSavedAyahs") || "[]");
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function getLastRead() {
    try {
        return JSON.parse(localStorage.getItem("noorLastRead") || "null");
    } catch {
        return null;
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const splash = document.getElementById("splashScreen");
    const app = document.getElementById("app");

    setTimeout(function () {
        splash.classList.add("hide");

        setTimeout(function () {
            splash.style.display = "none";
            app.classList.remove("hidden");
        }, 700);
    }, 2500);

    const savedCount = localStorage.getItem("noorTasbeehCount");
    if (savedCount !== null) {
        document.getElementById("counter").textContent = savedCount;
    }

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js")
            .catch(error => console.error("Service Worker:", error));
    }

    setupQuran();
    loadSurahs();
    loadReaders();
});

// التنقل بين الصفحات
function showSection(sectionId, button) {
    document.querySelectorAll(".page-section").forEach(section => {
        section.classList.remove("active");
    });

    const target = document.getElementById(sectionId);
    if (!target) return;

    target.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {
        document.querySelectorAll(".nav-item").forEach(item => {
            const action = item.getAttribute("onclick") || "";
            if (action.includes("'" + sectionId + "'")) {
                item.classList.add("active");
            }
        });
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
}

// إعداد أحداث القرآن
function setupQuran() {
    document.getElementById("quranSearch").addEventListener("input", function () {
        renderSurahs(this.value);
    });

    document.getElementById("backToSurahsBtn").addEventListener("click", showSurahList);

    document.getElementById("resumeReadingBtn").addEventListener("click", resumeReading);

    document.getElementById("showBookmarksBtn").addEventListener("click", showBookmarks);
    document.getElementById("readerBookmarksBtn").addEventListener("click", showBookmarks);

    document.getElementById("closeBookmarksBtn").addEventListener("click", closeBookmarks);

    document.getElementById("previousSurahBtn").addEventListener("click", function () {
        if (currentSurah && currentSurah.number > 1) {
            openSurah(currentSurah.number - 1);
        }
    });

    document.getElementById("nextSurahBtn").addEventListener("click", function () {
        if (currentSurah && currentSurah.number < 114) {
            openSurah(currentSurah.number + 1);
        }
    });
}

// تحميل أسماء السور
async function loadSurahs() {
    const status = document.getElementById("quranStatus");
    status.textContent = "جاري تحميل أسماء السور...";

    try {
        const response = await fetch(QURAN_API + "/surah");

        if (!response.ok) {
            throw new Error("تعذر الاتصال بمصدر القرآن");
        }

        const result = await response.json();

        if (result.code !== 200 || !Array.isArray(result.data)) {
            throw new Error("بيانات السور غير متاحة");
        }

        allSurahs = result.data;
        renderSurahs();
        updateLastReadBox();

    } catch (error) {
        console.error("Quran loading error:", error);
        status.textContent = "تعذر تحميل السور. تحقق من الإنترنت وحاول مرة أخرى.";

        const retry = document.createElement("button");
        retry.className = "primary-button";
        retry.textContent = "إعادة المحاولة";
        retry.addEventListener("click", loadSurahs);
        status.appendChild(document.createElement("br"));
        status.appendChild(retry);
    }
}

// عرض قائمة السور
function renderSurahs(searchText = "") {
    const list = document.getElementById("surahList");
    const status = document.getElementById("quranStatus");

    list.innerHTML = "";

    const query = searchText.trim().toLowerCase();

    const filtered = allSurahs.filter(surah => {
        return (
            surah.name.includes(query) ||
            surah.englishName.toLowerCase().includes(query) ||
            String(surah.number) === query
        );
    });

    status.textContent = "عدد السور: " + filtered.length + " من 114";

    filtered.forEach(surah => {
        const card = document.createElement("button");
        card.className = "surah-card";
        card.type = "button";

        const number = document.createElement("span");
        number.className = "surah-number";
        number.textContent = surah.number;

        const details = document.createElement("span");
        details.className = "surah-details";

        const name = document.createElement("strong");
        name.textContent = surah.name;

        const info = document.createElement("small");
        info.textContent =
            (surah.revelationType === "Meccan" ? "مكية" : "مدنية") +
            " • " + surah.numberOfAyahs + " آية";

        const arrow = document.createElement("span");
        arrow.className = "surah-arrow";
        arrow.textContent = "‹";

        details.appendChild(name);
        details.appendChild(info);

        card.appendChild(number);
        card.appendChild(details);
        card.appendChild(arrow);

        card.addEventListener("click", () => openSurah(surah.number));
        list.appendChild(card);
    });

    if (filtered.length === 0) {
        list.textContent = "لا توجد سورة بهذا الاسم.";
    }
}

// فتح سورة
async function openSurah(number, targetAyah = 1) {
    document.getElementById("quranHome").classList.add("hidden");
    document.getElementById("quranReader").classList.remove("hidden");
    document.getElementById("bookmarksPanel").classList.add("hidden");

    document.getElementById("currentSurahName").textContent = "جاري تحميل السورة...";
    document.getElementById("currentSurahInfo").textContent = "";
    document.getElementById("ayahList").innerHTML = "";

    try {
        const response = await fetch(
            QURAN_API + "/surah/" + number + "/quran-uthmani"
        );

        if (!response.ok) {
            throw new Error("تعذر تحميل السورة");
        }

        const result = await response.json();

        if (result.code !== 200 || !result.data) {
            throw new Error("بيانات السورة غير متاحة");
        }

        currentSurah = result.data;
        currentAyahs = result.data.ayahs;

        document.getElementById("currentSurahName").textContent =
            currentSurah.name;

        document.getElementById("currentSurahInfo").textContent =
            (currentSurah.revelationType === "Meccan" ? "مكية" : "مدنية") +
            " • " + currentSurah.numberOfAyahs + " آية";

        renderAyahs();

        localStorage.setItem("noorLastRead", JSON.stringify({
            surahNumber: number,
            surahName: currentSurah.name,
            ayahNumber: targetAyah
        }));

        updateLastReadBox();

        document.getElementById("previousSurahBtn").disabled = number === 1;
        document.getElementById("nextSurahBtn").disabled = number === 114;

        if (targetAyah > 1) {
            setTimeout(function () {
                const target = document.getElementById("ayah-" + targetAyah);
                if (target) {
                    target.scrollIntoView({ behavior: "smooth", block: "center" });
                }
            }, 150);
        } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
        }

    } catch (error) {
        console.error("Surah error:", error);
        document.getElementById("currentSurahName").textContent = "تعذر تحميل السورة";
        document.getElementById("currentSurahInfo").textContent =
            "تأكد من اتصال الإنترنت ثم حاول مرة أخرى.";
    }
}

// عرض الآيات
function renderAyahs() {
    const container = document.getElementById("ayahList");
    container.innerHTML = "";

    currentAyahs.forEach(ayah => {
        const card = document.createElement("article");
        card.className = "ayah-card";
        card.id = "ayah-" + ayah.numberInSurah;

        const text = document.createElement("p");
        text.className = "ayah-text";
        text.textContent = ayah.text;

        const footer = document.createElement("div");
        footer.className = "ayah-footer";

        const number = document.createElement("span");
        number.className = "ayah-number";
        number.textContent = "آية " + ayah.numberInSurah;

        const saveButton = document.createElement("button");
        saveButton.className = "bookmark-button";
        saveButton.type = "button";

        const isSaved = savedAyahs.some(item =>
            item.surahNumber === currentSurah.number &&
            item.ayahNumber === ayah.numberInSurah
        );

        saveButton.textContent = isSaved ? "★ محفوظة" : "☆ حفظ الآية";

        saveButton.addEventListener("click", function () {
            toggleBookmark(ayah);
        });

        footer.appendChild(number);
        footer.appendChild(saveButton);

        card.appendChild(text);
        card.appendChild(footer);

        card.addEventListener("click", function (event) {
            if (event.target.closest("button")) return;

            localStorage.setItem("noorLastRead", JSON.stringify({
                surahNumber: currentSurah.number,
                surahName: currentSurah.name,
                ayahNumber: ayah.numberInSurah
            }));

            updateLastReadBox();
        });

        container.appendChild(card);
    });
}

// الرجوع لقائمة السور
function showSurahList() {
    document.getElementById("quranHome").classList.remove("hidden");
    document.getElementById("quranReader").classList.add("hidden");
    document.getElementById("bookmarksPanel").classList.add("hidden");

    renderSurahs();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// آخر موضع قراءة
function updateLastReadBox() {
    const last = getLastRead();
    const box = document.getElementById("lastReadBox");

    if (!last || !last.surahNumber) {
        box.classList.add("hidden");
        return;
    }

    box.classList.remove("hidden");
    document.getElementById("lastReadText").textContent =
        "آخر قراءة: " + (last.surahName || "السورة") +
        " - الآية " + (last.ayahNumber || 1);
}

function resumeReading() {
    const last = getLastRead();
    if (!last) return;

    openSurah(last.surahNumber, last.ayahNumber || 1);
}

// حفظ وإلغاء حفظ الآية
function toggleBookmark(ayah) {
    const index = savedAyahs.findIndex(item =>
        item.surahNumber === currentSurah.number &&
        item.ayahNumber === ayah.numberInSurah
    );

    if (index >= 0) {
        savedAyahs.splice(index, 1);
    } else {
        savedAyahs.push({
            surahNumber: currentSurah.number,
            surahName: currentSurah.name,
            ayahNumber: ayah.numberInSurah,
            text: ayah.text
        });
    }

    localStorage.setItem("noorSavedAyahs", JSON.stringify(savedAyahs));
    renderAyahs();
}

// المحفوظات
function showBookmarks() {
    document.getElementById("quranHome").classList.add("hidden");
    document.getElementById("quranReader").classList.add("hidden");
    document.getElementById("bookmarksPanel").classList.remove("hidden");

    const list = document.getElementById("bookmarksList");
    list.innerHTML = "";

    if (savedAyahs.length === 0) {
        list.textContent = "لم تحفظ أي آيات حتى الآن.";
        return;
    }

    savedAyahs.forEach(item => {
        const card = document.createElement("article");
        card.className = "ayah-card";

        const heading = document.createElement("strong");
        heading.textContent = item.surahName + " - الآية " + item.ayahNumber;

        const text = document.createElement("p");
        text.className = "ayah-text";
        text.textContent = item.text;

        const openButton = document.createElement("button");
        openButton.className = "primary-button";
        openButton.textContent = "فتح الآية";
        openButton.addEventListener("click", function () {
            openSurah(item.surahNumber, item.ayahNumber);
        });

        const removeButton = document.createElement("button");
        removeButton.className = "reset-button";
        removeButton.textContent = "إزالة من المحفوظات";
        removeButton.addEventListener("click", function () {
            savedAyahs = savedAyahs.filter(saved =>
                !(saved.surahNumber === item.surahNumber &&
                  saved.ayahNumber === item.ayahNumber)
            );

            localStorage.setItem("noorSavedAyahs", JSON.stringify(savedAyahs));
            showBookmarks();
        });

        card.appendChild(heading);
        card.appendChild(text);
        card.appendChild(openButton);
        card.appendChild(removeButton);
        list.appendChild(card);
    });
}

function closeBookmarks() {
    document.getElementById("bookmarksPanel").classList.add("hidden");

    if (currentSurah) {
        document.getElementById("quranReader").classList.remove("hidden");
    } else {
        document.getElementById("quranHome").classList.remove("hidden");
    }
}

// عداد التسبيح
function increaseTasbeeh() {
    const counter = document.getElementById("counter");
    const count = Number(counter.textContent) + 1;

    counter.textContent = count;
    localStorage.setItem("noorTasbeehCount", count);
}

function resetTasbeeh() {
    if (!confirm("هل تريد تصفير عداد التسبيح؟")) return;

    document.getElementById("counter").textContent = "0";
    localStorage.setItem("noorTasbeehCount", "0");
}

// قائمة القراء
const readers = [
    "محمد صديق المنشاوي",
    "محمود خليل الحصري",
    "عبد الباسط عبد الصمد",
    "ياسر الدوسري",
    "ماهر المعيقلي",
    "سعد الغامدي",
    "فارس عباد",
    "أبو بكر الشاطري"
];

function loadReaders() {
    const readerList = document.getElementById("readerList");
    if (!readerList) return;

    readerList.innerHTML = "";

    readers.forEach(function (reader) {
        const item = document.createElement("div");
        item.className = "feature-card reader-card";

        const name = document.createElement("strong");
        name.textContent = reader;

        const status = document.createElement("small");
        status.textContent = "قارئ من قراء التطبيق";

        item.appendChild(name);
        item.appendChild(status);
        readerList.appendChild(item);
    });
}
