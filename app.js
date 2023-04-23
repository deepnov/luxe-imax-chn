var cron = require('node-cron');
var fetch = require('node-fetch');

const tDate = new Date();

const { WebClient, LogLevel } = require("@slack/web-api");
const slackAPIKey = (typeof process.env.SLACK_API_VAL != "undefined") ? process.env.SLACK_API_VAL :"";
let trackingDate = 0;

const channelId = "C024V8L99NC";//C024V8L99NC-luxe-imax-chn 


if (slackAPIKey == "" ) {

    throw new Error('Slack API ID missing');
}

//const url = 'https://in.bookmyshow.com/cinemas/chennai/inox-luxe-phoenix-market-city-velachery/INPR'
const url = 'https://paytm.com/movies/chennai/inox-phoenix-market-city-velachery-formerly-jazz-cinemas-c/51767?fromdate=2023-04-28'


function english_ordinal_suffix(dt) {
    return dt.getDate() + (dt.getDate() % 10 == 1 && dt.getDate() != 11 ? 'st' : (dt.getDate() % 10 == 2 && dt.getDate() != 12 ? 'nd' : (dt.getDate() % 10 == 3 && dt.getDate() != 13 ? 'rd' : 'th')));
}

function notifySubscribers(msg) {

    // WebClient insantiates a client that can call API methods
    const client = new WebClient(slackAPIKey, {
        // LogLevel can be imported and used to make debugging simpler
        logLevel: LogLevel.DEBUG
    });

    const ret = client.chat.postMessage({
        channel: channelId,
        text: msg,
        as_user: "superfeed" // slackbot's user id
    });

    console.log("Notification Sent "+ret);
}


function checkBookingDates(pageResponse) {
    let ts = Date.now();

    let date_time = new Date(ts);
    let date = date_time.getDate();
    let month = date_time.getMonth() + 1;
    let year = date_time.getFullYear();
    let min = date_time.getMinutes();
    let hrs = date_time.getHours();
    let log_dt = "["+year + "-" + month + "-" + date + " " + hrs + ":" + min+"]"
    //console.log(pageResponse.includes("No movies found for the search result"));
    //console.log(pageResponse);
    let success = false;
    let venue = "Luxe Inox";
    let SUCCESS_MSG = "";
    //console.log(doc);
    console.log("Venue: " + venue);

    
    if (!pageResponse.includes("No movies found for the search result")&&pageResponse.includes(">29<")) {
        success = true;
        SUCCESS_MSG = log_dt + " " + venue + " bookings available for 28th april ";
    }

    if (success) {
        console.log(SUCCESS_MSG);
        notifySubscribers(SUCCESS_MSG);
    }
    else {
        console.log(log_dt + " " + venue + " bookings not available");
        //notifySubscribers(FAILURE_MSG);
    }

    console.log(`finished running your task...`);
}

const getData = async () => {
    const res = await fetch(url, {
        headers: {
            
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/110.0',
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1",
            "Cache-Control": "max-age=0",

        }
    })
    if (res.status >= 400) {
        for (const k of res.headers.keys()) {
            console.log(k + " : " + res.headers.get(k));
        }
        throw new Error('Target website is not providing content! ');
    }
    else {
        const data = await res.text()
        checkBookingDates(data);
    }
}

console.log(`scheduling your task...`);
cron.schedule(`*/30 * * * *`, async () => {//in production this is */125 minutes field
    console.log(`running your task...`);
    getData();
    
});

