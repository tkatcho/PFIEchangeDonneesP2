////////////////////////////////////////////////////////////////////
// This module define the Gmail class
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////
import nodemailer from 'nodemailer';
import * as serverVariables from "./serverVariables.js";
let GmailAccountEmail = serverVariables.get("main.gmail.accountEmail");
let GmailAccountPassword = serverVariables.get("main.gmail.accountPassword");
let GmailHost = serverVariables.get("main.gmail.host");
let GmailPort = serverVariables.get("main.gmail.port");

export default class Gmail {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: GmailHost,
            port: GmailPort,
            auth: {
                user: GmailAccountEmail,
                pass: GmailAccountPassword
            }
        })
    }

    send(to, subject, html) {
        let from = GmailAccountEmail;
        this.transporter.sendMail({ from, to, subject, html }, function (error, info) {
            if (error)
                console.log(error);
            else
                console.log('Email sent: ' + info.response);
        })
    }
}