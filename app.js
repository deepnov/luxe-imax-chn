var cron = require('node-cron');
var fetch = require('node-fetch');
var { JSDOM } = require('jsdom');

const { WebClient, LogLevel } = require("@slack/web-api");
const slackAPIKey = "xyz";//removed api key as slack keys cannot be shared publicly
const channelId = "luxe-imax-chn";

const url = 'https://in.bookmyshow.com/chennai/cinemas/luxe-cinemas-chennai/JACM'
const trackingDate = 26;

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

    //console.log(pageResponse);
    let jsdom = new JSDOM(pageResponse);
    let doc = jsdom.window.document;
    let success = false;
    let venue = doc.getElementsByClassName("venue-heading")[0].textContent;
    let SUCCESS_MSG = venue + " bookings available from this month " + trackingDate
    let FAILURE_MSG=venue + " bookings available only until this month " + doc.getElementsByClassName("date-numeric")[doc.getElementsByClassName("date-numeric").length - 1].childNodes[0].textContent.trim()
    console.log("Venue: " + venue);
    for (i = 0; i < doc.getElementsByClassName("date-numeric").length; i++) {

        let dt = doc.getElementsByClassName("date-numeric")[i].childNodes[0].textContent.trim();

        if ( dt>= trackingDate) {
            success = true;
        }
    }
    if (success) {
        console.log(SUCCESS_MSG);
        notifySubscribers(SUCCESS_MSG);
    }
    else {
        console.log(FAILURE_MSG)
        //notifySubscribers(FAILURE_MSG);
    }

    console.log(`finished running your task...`);
}

const getData = async () => {
    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36' }})
    const data = await res.text()
    checkBookingDates(data);    
    
}

console.log(`scheduling your task...`);
cron.schedule(`*/120 * * * *`, async () => {
    console.log(`running your task...`);
    getData();
    
});

