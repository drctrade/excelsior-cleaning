// Google Calendar Integration
const CLIENT_ID = 'YOUR_CLIENT_ID';
const API_KEY = 'YOUR_API_KEY';
const CALENDAR_ID = 'YOUR_CALENDAR_ID';

// Discovery doc URL for APIs used by the quickstart
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest';

// Authorization scopes required by the API
const SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';

let tokenClient;
let gapiInited = false;
let gisInited = false;

function gapiLoaded() {
    gapi.load('client', initializeGapiClient);
}

async function initializeGapiClient() {
    await gapi.client.init({
        apiKey: API_KEY,
        discoveryDocs: [DISCOVERY_DOC],
    });
    gapiInited = true;
    maybeEnableButtons();
}

function gisLoaded() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: '', // defined later
    });
    gisInited = true;
    maybeEnableButtons();
}

function maybeEnableButtons() {
    if (gapiInited && gisInited) {
        document.getElementById('authorize_button').style.visibility = 'visible';
    }
}

async function handleAuthClick() {
    tokenClient.callback = async (resp) => {
        if (resp.error !== undefined) {
            throw (resp);
        }
        await listUpcomingEvents();
    };

    if (gapi.client.getToken() === null) {
        tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
        tokenClient.requestAccessToken({ prompt: '' });
    }
}

async function handleSignoutClick() {
    const token = gapi.client.getToken();
    if (token !== null) {
        google.accounts.oauth2.revoke(token.access_token);
        gapi.client.setToken('');
    }
}

async function listUpcomingEvents() {
    let response;
    try {
        const request = {
            'calendarId': CALENDAR_ID,
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime',
        };
        response = await gapi.client.calendar.events.list(request);
    } catch (err) {
        document.getElementById('calendar').innerText = err.message;
        return;
    }

    const events = response.result.items;
    if (!events || events.length == 0) {
        document.getElementById('calendar').innerText = 'No events found.';
        return;
    }

    // Render calendar events
    const output = events.map((event) => {
        const start = event.start.dateTime || event.start.date;
        return `${start} - ${event.summary}`;
    }).join('\n');

    document.getElementById('calendar').innerText = output;
}
