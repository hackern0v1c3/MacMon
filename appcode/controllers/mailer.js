/******************

This script exports a function called sendMessage.  It takes a message subject, a message body, and a callback function.
All SMTP info is collected from a properly formed config json object, which is required
When the script completes it triggers the callback with the message response and or an error message.

callback(error, message)

******************/
"use strict";

const nodemailer = require('nodemailer');
const config = require('./config.js');

exports.sendMessage = function(messageSubject, messageBody, cb) {
	config.settings.returnAllSettings(function(err, settings){
		let smtpConfig = {
			host: settings.emailServer,
			port: settings.smtpPort,
			secure: false, // upgrade later with STARTTLS
			requireTLS: settings.emailTls,
			auth: {
				user: settings.emailSenderUsername,
				pass: settings.emailSenderPassword
			}
		};
	
		let mailOptions = {
			from: settings.emailSender,
			to: settings.emailRecipient,
			subject: messageSubject,
			text: messageBody,
		};
	
		let transporter = nodemailer.createTransport(smtpConfig);
	
		transporter.sendMail(mailOptions, (error, info) => {
			if (error) {
				cb(error, "");
			} else {
				var result = ('Message %s sent: %s', info.messageId, info.response);
				cb(null, result);
			}
		});
	});
};