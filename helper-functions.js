async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);                    
  
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
  
    // convert bytes to hex string                  
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

//https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array) {
    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
  
class user {
    username;
    tmdbAPIKey;
    googleAPIKey;
    mdblistAPIKey;
    scrapenetworkAPIKey;

    constructor(json) {
        this.username = json.username;
        this.tmdbAPIKey = json.tmdbAPIKey;
        this.googleAPIKey = json.googleAPIKey;
        this.mdblistAPIKey = json.mdblistAPIKey;
        this.scrapenetworkAPIKey = json.scrapenetworkAPIKey;
    }
}

module.exports = {
    sha256,
    user,
    shuffleArray
};