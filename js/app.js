
"use strict";

// شاشة البداية
document.addEventListener("DOMContentLoaded", function () {

    const splash = document.getElementById("splashScreen");
    const app = document.getElementById("app");

    setTimeout(function () {
        splash.classList.add("hide");

        setTimeout(function () {
            splash.style.display = "none";
            app.classList.remove("hidden");
        }, 700);

    }, 3000);

    // تحميل عداد التسبيح
    const savedCount = localStorage.getItem("noorTasbeehCount");
    if (savedCount !== null) {
        document.getElementById("counter").textContent = savedCount;
    }

    // تسجيل Service Worker
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.register("./service-worker.js")
            .catch(function (error) {
                console.error("Service Worker Error:", error);
            });
    }
});

// التنقل بين الصفحات
function showSection(sectionId, button) {

    const sections = document.querySelectorAll(".page-section");

    sections.forEach(function (section) {
        section.classList.remove("active");
    });

    const target = document.getElementById(sectionId);

    if (!target) return;

    target.classList.add("active");

    document.querySelectorAll(".nav-item").forEach(function (item) {
        item.classList.remove("active");
    });

    if (button) {
        button.classList.add("active");
    } else {
        document.querySelectorAll(".nav-item").forEach(function (item) {
            if (item.getAttribute("onclick").includes(sectionId)) {
                item.classList.add("active");
            }
        });
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// عداد التسبيح
function increaseTasbeeh() {

    const counter = document.getElementById("counter");

    let count = Number(counter.textContent);

    count++;

    counter.textContent = count;

    localStorage.setItem("noorTasbeehCount", count);
}

// تصفير العداد
function resetTasbeeh() {

    const confirmed = confirm("هل تريد تصفير عداد التسبيح؟");

    if (!confirmed) return;

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

document.addEventListener("DOMContentLoaded", function () {

    const readerList = document.getElementById("readerList");

    readers.forEach(function (reader) {

        const item = document.createElement("div");

        item.className = "feature-card";
        item.style.marginBottom = "12px";
        item.style.width = "100%";

        const name = document.createElement("strong");
        name.textContent = reader;

        const status = document.createElement("small");
        status.textContent = "قارئ من قراء التطبيق";

        item.appendChild(name);
        item.appendChild(status);

        readerList.appendChild(item);

    });

});
