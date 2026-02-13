// Calendar Logic
// Depends on js/supabase-client.js

(function () {
    const calendarGrid = document.getElementById('calendar-grid');

    async function initCalendar() {
        if (!window.db) return;

        try {
            const events = await window.db.getEvents();
            renderCalendar(events);
        } catch (err) {
            console.error("Calendar fetch failed:", err);
        }
    }

    function renderCalendar(events) {
        if (!calendarGrid) return;
        calendarGrid.innerHTML = '';

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth(); // 0-indexed

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const today = new Date();
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

        // Previous month padding
        for (let i = 0; i < firstDay; i++) {
            const emptyEl = document.createElement('div');
            emptyEl.className = 'calendar-date other-month';
            calendarGrid.appendChild(emptyEl);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const dayEl = document.createElement('div');
            const isToday = isCurrentMonth && today.getDate() === i;
            dayEl.className = `calendar-date${isToday ? ' today' : ''}`;

            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);

            dayEl.innerHTML = `
                <div class="date-num">${i}</div>
                <div class="day-events">
                    ${dayEvents.map(e => `<div class="event-pill" title="${e.title}" style="background: var(--accent-primary); color: white; padding: 2px 5px; border-radius: 3px; font-size: 0.6rem; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${e.title}</div>`).join('')}
                </div>
            `;
            calendarGrid.appendChild(dayEl);
        }
    }

    initCalendar();
})();
