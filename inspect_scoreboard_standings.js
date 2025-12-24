const https = require('https');

const url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=17";

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.standings) {
        console.log(JSON.stringify(json.standings, null, 2));
      } else {
        console.log("No 'standings' property found in scoreboard.");
        // Log other top level keys to help find it
        console.log(Object.keys(json));
      }
    } catch (e) {
      console.error(e);
    }
  });
}).on('error', (err) => {
  console.error("Error: " + err.message);
});
