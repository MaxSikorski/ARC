// Schedule Logic
// Depends on js/supabase-client.js

(function () {
    const eventList = document.getElementById('dynamic-schedule');

    async function initSchedule() {
        if (!window.db) return;

        try {
            const events = await window.db.getEvents();
            renderSchedule(events);
        } catch (err) {
            console.error("Schedule fetch failed:", err);
            if (eventList) eventList.innerHTML = '<p>[SYSTEM_SYNC_ERROR]</p>';
        }
    }

    function renderSchedule(events) {
        if (!eventList) return;
        eventList.innerHTML = '';

        if (events.length === 0) {
            eventList.innerHTML = '<p style="text-align:center; padding: 20px;">[NO_UPCOMING_EVENTS_STAGED]</p>';
            return;
        }

        events.forEach(event => {
            const eventEl = document.createElement('div');
            eventEl.className = 'event-card blueprint-line';
            eventEl.setAttribute('data-label', `EVENT_${event.date.replace(/-/g, '')}`);

            eventEl.innerHTML = `
                <div class="event-info">
                    <div class="event-date">${new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} @ ${event.time}</div>
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-desc">${event.description}</p>
                    <div class="event-location"><strong>Location:</strong> ${event.location}</div>
                </div>
                <div class="event-actions">
                    <button class="btn btn-secondary">Details</button>
                    ${event.meetup_link ? `<a href="${event.meetup_link}" target="_blank" class="btn btn-primary">Meetup</a>` : ''}
                </div>
            `;
            eventList.appendChild(eventEl);
        });
    }

    initSchedule();
})();
