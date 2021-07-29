import puppeteer from "puppeteer";
import log, { logLogInfo } from "./service/log.js";
import { logBaseDelay } from "./service/common-service.js";
import { waitForTimeout } from "./index.js";
import { login, getAlerts } from "./service/tv-page-actions.js";
const pullChartsMain = async () => {
    const headless = false;
    logLogInfo();
    logBaseDelay();
    log.info("Press Ctrl-C to stop this script");
    let config = {
        url: "https://in.tradingview.com/chart/fl3WTxr7/",
        username: "singhjasdeep496",
        password: "Xyzzy@&$264"
    };
    const browser = await puppeteer.launch({
        headless: headless, userDataDir: "./user_data",
        defaultViewport: null,
        args: headless ? null : [
            `--app=${config.url}#signin`,
            // '--window-size=1440,670'
        ]
    });
    let page;
    let accessDenied;
    if (headless) {
        page = await browser.newPage();
        log.trace(`Go to ${config.url} and wait until networkidle2`);
        const pageResponse = await page.goto(config.url + "#signin", {
            waitUntil: 'networkidle2'
        });
        accessDenied = pageResponse.status() === 403;
    }
    else {
        page = (await browser.pages())[0];
        await waitForTimeout(5, "let page load and see if access is denied");
        accessDenied = await page.evaluate(() => {
            return document.title.includes("Denied");
        });
    }
    if (accessDenied) {
        if (config.username && config.password) {
            await login(page, config.username, config.password);
        }
        else {
            log.warn("You'll need to sign into TradingView in this browser (one time only)\n...after signing in, press ctrl-c to kill this script, then run it again");
            await waitForTimeout(1000000);
            await browser.close();
            process.exit(1);
        }
    }
    await waitForTimeout(3, "wait a little longer for page to load");
    await getAlerts(page);
    log.info("Till here");
    await waitForTimeout(3);
    await browser.close();
};
export default pullChartsMain;
//# sourceMappingURL=pull-charts.js.map