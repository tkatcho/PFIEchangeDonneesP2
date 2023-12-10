
import dateAndTime from 'date-and-time';
import { log } from "./log.js";
import { createServer } from 'http';
import HttpContext from './httpContext.js';
import MiddlewaresPipeline from './middlewaresPipeline.js';
import * as router from './router.js';
import { handleCORSPreflight } from './cors.js';
import { handleStaticResourceRequest } from './staticResourcesServer.js';
import CachedRequests from "./CachedRequestsManager.js";

export default class APIServer {
    constructor(port = process.env.PORT || 5000) {
        this.port = port;
        this.initMiddlewaresPipeline();
        this.httpContext = null;
        this.httpServer = createServer(async (req, res) => { this.handleHttpRequest(req, res) });
    }
    initMiddlewaresPipeline() {
        this.middlewaresPipeline = new MiddlewaresPipeline();

        // common middlewares
        this.middlewaresPipeline.add(handleCORSPreflight);
        this.middlewaresPipeline.add(handleStaticResourceRequest);

        // API middlewares
        this.middlewaresPipeline.add(CachedRequests.get);
        this.middlewaresPipeline.add(router.TOKEN_EndPoint);
        this.middlewaresPipeline.add(router.Registered_EndPoint);
        this.middlewaresPipeline.add(router.API_EndPoint);
    }
    
    async handleHttpRequest(req, res) {
        this.markRequestProcessStartTime();
        this.httpContext = await HttpContext.create(req, res);
        this.showShortRequestInfo();
        if (!(await this.middlewaresPipeline.handleHttpRequest(this.httpContext)))
            this.httpContext.response.notFound('this end point does not exist...');
        this.showRequestProcessTime();
    }
    start() {
        this.httpServer.listen(this.port, () => { this.startupMessage() });
    }
    startupMessage() {
        log(FgGreen, "************************************");
        log(FgGreen, "* API SERVER - version beta - 2.00 *");
        log(FgGreen, "************************************");
        log(FgGreen, "* Author: Nicolas Chourot          *");
        log(FgGreen, "* Lionel-Groulx College            *");
        log(FgGreen, "* Release date: november 2023      *");
        log(FgGreen, "************************************");
        log(FgWhite, BgGreen, `HTTP Server running on port ${this.port}...`);
        this.showMemoryUsage();
    }
    showRequestInfo() {
        let time = dateAndTime.format(new Date(), 'YYYY MMMM DD - HH:mm:ss');
        log(FgGreen, '<-------------------------', time, '-------------------------');
        log(FgGreen, Bright, `Request --> [${this.httpContext.req.method}::${this.httpContext.req.url}]`);
        log("User agent ", this.httpContext.req.headers["user-agent"]);
        log("Host ", this.httpContext.hostIp.substring(0, 15), "::", this.httpContext.host);
        if (this.httpContext.payload)
            log("Request payload ", JSON.stringify(this.httpContext.payload).substring(0, 127) + "...");
    }
    showShortRequestInfo() {
        log(FgGreen, Bright, `Request --> [${this.httpContext.req.method}::${this.httpContext.req.url}]`);
        if (this.httpContext.payload)
            log("Request payload ", JSON.stringify(this.httpContext.payload).substring(0, 127) + "...");
    }
    markRequestProcessStartTime() {
        this.requestProcessStartTime = process.hrtime();
    }
    showRequestProcessTime() {
        let requestProcessEndTime = process.hrtime(this.requestProcessStartTime);
        log(FgCyan, "Response time: ", Math.round((requestProcessEndTime[0] * 1000 + requestProcessEndTime[1] / 1000000) / 1000 * 10000) / 10000, "seconds");
    }
    showMemoryUsage() {
        // for more info https://www.valentinog.com/blog/node-usage/
        const used = process.memoryUsage();
        log(FgMagenta, "Memory usage: ", "RSet size:", Math.round(used.rss / 1024 / 1024 * 100) / 100, "Mb |",
            "Heap size:", Math.round(used.heapTotal / 1024 / 1024 * 100) / 100, "Mb |",
            "Used size:", Math.round(used.heapUsed / 1024 / 1024 * 100) / 100, "Mb");
    }
}
