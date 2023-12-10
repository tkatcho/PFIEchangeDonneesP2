/////////////////////////////////////////////////////////////////////
// This module define global console colors values and the log
// function ment to display text messages into the console
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

globalThis.Reset = "\x1b[0m"
globalThis.Bright = "\x1b[1m"
globalThis.Dim = "\x1b[2m"
globalThis.Underscore = "\x1b[4m"
globalThis.Blink = "\x1b[5m"
globalThis.Reverse = "\x1b[7m"
globalThis.Hidden = "\x1b[8m"

globalThis.FgBlack = "\x1b[30m"
globalThis.FgRed = "\x1b[31m"
globalThis.FgGreen = "\x1b[32m"
globalThis.FgYellow = "\x1b[33m"
globalThis.FgBlue = "\x1b[34m"
globalThis.FgMagenta = "\x1b[35m"
globalThis.FgCyan = "\x1b[36m"
globalThis.FgWhite = "\x1b[37m"

globalThis.BgBlack = "\x1b[40m"
globalThis.BgRed = "\x1b[41m"
globalThis.BgGreen = "\x1b[42m"
globalThis.BgYellow = "\x1b[43m"
globalThis.BgBlue = "\x1b[44m"
globalThis.BgMagenta = "\x1b[45m"
globalThis.BgCyan = "\x1b[46m"
globalThis.BgWhite = "\x1b[47m"

export const log = (...args) => {
    console.log(...args);
}
