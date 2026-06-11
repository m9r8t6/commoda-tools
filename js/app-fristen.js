document.addEventListener("DOMContentLoaded", () => {
    const calcBtn = document.getElementById('calcFristenBtn');
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateObjectionDeadline);
    }
});

function calculateObjectionDeadline() {
    const bescheidInput = document.getElementById('bescheidDate').value;
    if (!bescheidInput) {
        alert("Bitte gib das Bescheidsdatum ein!");
        return;
    }

    const applyFiktion = document.getElementById('bekanntgabeFiktion').checked;
    const region = document.getElementById('fristenRegion').value;

    const bescheidDate = new Date(bescheidInput);
    
    // UI Elements
    const emptyState = document.getElementById('fristenResultEmpty');
    const timeline = document.getElementById('fristenTimeline');

    emptyState.style.display = 'none';
    timeline.style.display = 'flex';
    timeline.innerHTML = '';

    // Step 1: Bescheid
    addTimelineEvent(
        "Datum des Steuerbescheids",
        formatDateString(bescheidDate),
        "Ausstellungsdatum laut Bescheidkopf.",
        false
    );

    let bekanntgabeDate = new Date(bescheidDate);
    let fiktionShiftInfo = "";

    // Step 2: Bekanntgabe (+3 Tage Fiktion)
    if (applyFiktion) {
        bekanntgabeDate.setDate(bekanntgabeDate.getDate() + 3);
        const normalFiktionDate = new Date(bekanntgabeDate);
        
        // Prüfen auf Verschiebung der Bekanntgabe (§ 108 Abs. 3 AO)
        const workingDayCheck = getNextWorkingDay(bekanntgabeDate, region);
        bekanntgabeDate = workingDayCheck.date;

        if (workingDayCheck.shifted) {
            fiktionShiftInfo = `Verschiebung wegen Wochenende/Feiertag: 3. Tag war ${formatDateString(normalFiktionDate)} (${workingDayCheck.explanation}).`;
            addTimelineEvent(
                "Bekanntgabe des Bescheids",
                formatDateString(bekanntgabeDate),
                `Bekanntgabefiktion (§ 122 Abs. 2 AO) am 3. Tag nach Bescheidsdatum. <br><span style="color: #D97706; font-weight: 600;">⚠️ ${fiktionShiftInfo}</span>`,
                true
            );
        } else {
            addTimelineEvent(
                "Bekanntgabe des Bescheids",
                formatDateString(bekanntgabeDate),
                "Bekanntgabefiktion (§ 122 Abs. 2 AO) am 3. Tag nach Bescheidsdatum.",
                false
            );
        }
    } else {
        addTimelineEvent(
            "Bekanntgabe des Bescheids",
            formatDateString(bekanntgabeDate),
            "Direkte Bekanntgabe (ohne 3-Tage-Fiktion).",
            false
        );
    }

    // Step 3: Fristbeginn (§ 187 Abs. 1 BGB)
    const fristBeginn = new Date(bekanntgabeDate);
    fristBeginn.setDate(fristBeginn.getDate() + 1);
    addTimelineEvent(
        "Fristbeginn (§ 187 Abs. 1 BGB)",
        formatDateString(fristBeginn),
        "Die Einspruchsfrist beginnt am Tag nach der Bekanntgabe zu laufen.",
        false
    );

    // Step 4: Normales Fristende (1 Monat)
    // Nach § 188 Abs. 2 BGB endet die Frist mit dem Ablauf des Tages des Folgemonats, welcher dem Bekanntgabetag entspricht
    let normalFristEnde = new Date(bekanntgabeDate);
    normalFristEnde.setMonth(normalFristEnde.getMonth() + 1);

    // Spezialfall: Wenn der Folgemonat weniger Tage hat (z.B. Bekanntgabe am 31.01., Folgemonat Februar)
    // Wenn wir einen Monat addieren und der Tag abweicht, korrigieren wir auf den Letzten des Monats
    if (normalFristEnde.getDate() !== bekanntgabeDate.getDate()) {
        normalFristEnde = new Date(bekanntgabeDate.getFullYear(), bekanntgabeDate.getMonth() + 2, 0);
    }

    const baselineDeadline = new Date(normalFristEnde);

    // Step 5: Rechtliches Fristende prüfen (§ 108 Abs. 3 AO)
    const deadlineWorkingDayCheck = getNextWorkingDay(normalFristEnde, region);
    const finalFristEnde = deadlineWorkingDayCheck.date;

    if (deadlineWorkingDayCheck.shifted) {
        addTimelineEvent(
            "Reguläres Fristende (1 Monat)",
            formatDateString(baselineDeadline),
            `Fristende nach Ablauf eines Monats (§ 188 Abs. 2 BGB).`,
            false
        );
        addTimelineEvent(
            "Rechtlich verschobenes Fristende",
            formatDateString(finalFristEnde),
            `Verschiebung nach § 108 Abs. 3 AO, da das reguläre Ende auf ein Wochenende/Feiertag fiel (${deadlineWorkingDayCheck.explanation}).`,
            true,
            true // highlight
        );
    } else {
        addTimelineEvent(
            "Rechtliches Fristende",
            formatDateString(finalFristEnde),
            `Einspruchsfrist endet planmäßig nach Ablauf eines Monats (§ 188 Abs. 2 BGB).`,
            false,
            true // highlight
        );
    }
}

function addTimelineEvent(title, dateText, desc, isWarning, isHighlight = false) {
    const timeline = document.getElementById('fristenTimeline');
    let classes = "timeline-event";
    if (isWarning) classes += " warning";
    if (isHighlight) classes += " highlight";

    timeline.innerHTML += `
        <div class="${classes}">
            <span class="timeline-date">${dateText}</span>
            <h4>${title}</h4>
            <p>${desc}</p>
        </div>
    `;
}

function getEasterSunday(year) {
    const f = Math.floor,
          a = year % 19,
          b = f(year / 100),
          c = year % 100,
          d = f(b / 4),
          e = b % 4,
          g = f((8 * b + 13) / 25),
          h = (19 * a + b - d - g + 15) % 30,
          i = f(c / 4),
          k = c % 4,
          l = (32 + 2 * e + 2 * i - h - k) % 7,
          m = f((a + 11 * h + 19 * l) / 433),
          n = f((h + l - 7 * m + 90) / 25),
          p = (h + l - 7 * m + 33 * n + 19) % 32;
    return new Date(year, n - 1, p);
}

function isHoliday(date, region) {
    const year = date.getFullYear();
    const month = date.getMonth(); 
    const day = date.getDate();

    const easter = getEasterSunday(year);
    
    const addDays = (baseDate, days) => {
        const d = new Date(baseDate);
        d.setDate(d.getDate() + days);
        return d;
    };

    const karfreitag = addDays(easter, -2);
    const ostermontag = addDays(easter, 1);
    const christiHimmelfahrt = addDays(easter, 39);
    const pfingstmontag = addDays(easter, 50);
    const fronleichnam = addDays(easter, 60);

    const checkSameDay = (d1, d2) => {
        return d1.getFullYear() === d2.getFullYear() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getDate() === d2.getDate();
    };

    if (checkSameDay(date, karfreitag)) return { name: "Karfreitag" };
    if (checkSameDay(date, ostermontag)) return { name: "Ostermontag" };
    if (checkSameDay(date, christiHimmelfahrt)) return { name: "Christi Himmelfahrt" };
    if (checkSameDay(date, pfingstmontag)) return { name: "Pfingstmontag" };
    if (checkSameDay(date, fronleichnam)) return { name: "Fronleichnam" };

    if (month === 0 && day === 1) return { name: "Neujahr" };
    if (month === 0 && day === 6) return { name: "Heilige Drei Könige" };
    if (month === 4 && day === 1) return { name: "Tag der Arbeit" };
    
    // Mariä Himmelfahrt (15.08.) - Protestantisches Nürnberg (Mittelfranken) vs. Allgemeines Bayern
    if (month === 7 && day === 15) {
        if (region !== 'BY-Mittelfranken') {
            return { name: "Mariä Himmelfahrt" };
        }
    }
    
    if (month === 9 && day === 3) return { name: "Tag der Deutschen Einheit" };
    if (month === 10 && day === 1) return { name: "Allerheiligen" };
    if (month === 11 && day === 25) return { name: "1. Weihnachtstag" };
    if (month === 11 && day === 26) return { name: "2. Weihnachtstag" };

    return null;
}

function getNextWorkingDay(date, region) {
    let current = new Date(date);
    let shiftCount = 0;
    let explanation = [];

    while (true) {
        const dayOfWeek = current.getDay(); 
        const holiday = isHoliday(current, region);

        if (dayOfWeek === 6) {
            explanation.push(`Samstag`);
            current.setDate(current.getDate() + 1);
            shiftCount++;
        } else if (dayOfWeek === 0) {
            explanation.push(`Sonntag`);
            current.setDate(current.getDate() + 1);
            shiftCount++;
        } else if (holiday) {
            explanation.push(`Feiertag: ${holiday.name}`);
            current.setDate(current.getDate() + 1);
            shiftCount++;
        } else {
            break;
        }
    }
    return { date: current, shifted: shiftCount > 0, explanation: explanation.join(', ') };
}

function formatDateString(date) {
    const days = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
    const dayName = days[date.getDay()];
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    return `${dayName}, ${dd}.${mm}.${yyyy}`;
}
