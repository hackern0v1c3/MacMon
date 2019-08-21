const regexTypes = {};
// regexTypes.emailAddress = /[^a-zA-Z0-9\-_\.@$]/
// regexTypes.username = /[^a-zA-Z0-9\-_\.@$]/
// regexTypes.servername = /[^a-zA-Z0-9\-_\.@$]/
// regexTypes.assetName = /[^a-zA-Z0-9\-_!\.@$?,;:& ]/
// regexTypes.macAddress = /^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$/
// regexTypes.multiLineDescription = /[^a-zA-Z0-9\-_!\.@$?,;:&/\n/ ]/

regexTypes.emailAddress = new RegExp('[^a-zA-Z0-9\-_\.@$]');
regexTypes.userName = new RegExp('[^a-zA-Z0-9\-_\.@$]');
regexTypes.serverName = new RegExp('[^a-zA-Z0-9\-_\.@$]');
regexTypes.assetName = new RegExp('[^a-zA-Z0-9\-_!\.@$?,;:& ]');
regexTypes.macAddress = new RegExp('^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$');
regexTypes.multiLineDescription = new RegExp('[^a-zA-Z0-9\-_!\.@$?,;:&/\n/ ]');

module.exports = regexTypes;