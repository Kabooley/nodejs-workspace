import type puppeteer from 'puppeteer';

interface iOptionNavigateToNextPage {
    waitForResponseCallback?: ((res: puppeteer.HTTPResponse) => boolean | Promise<boolean>);
    navigationOptions?: puppeteer.WaitForOptions;
};

const defaultWaitForResponseCallback = (res: puppeteer.HTTPResponse): boolean => {
    return res.status() === 200;
};

const defaultNavigationOption: puppeteer.WaitForOptions = {
    waitUntil: ["load", "domcontentloaded"]
};

/******
 * Navigate to next page and returns HTTP Response.
 * 
 * @param {() => Promise<void>} trigger - Function that triggers page transition.
 * @param {iOptionNavigateToNextPage} [options] - Optional parameters 
 * @return {Promise<puppeteer.HTTPResponse>} - HTTP Response waitForResponse() has been returned.
 * 
 * Trigger navigation by firing trigger(), get HTTP Response, wait for navigation has been done.
 * */ 
export const navigateToNextPage = async (
        page: puppeteer.Page, 
        trigger: () => Promise<void>,
        options? : iOptionNavigateToNextPage
    ): Promise<puppeteer.HTTPResponse> => {
    try {
        let cb: ((res: puppeteer.HTTPResponse) => boolean | Promise<boolean>) = defaultWaitForResponseCallback;
        let navOption: puppeteer.WaitForOptions = defaultNavigationOption;
        if(options){
            const { waitForResponseCallback, navigationOptions } = options;
            cb = waitForResponseCallback ? waitForResponseCallback : cb;
            navOption = navigationOptions ? navigationOptions : navOption;
        }
		const waitForNextResultResponse = page.waitForResponse(cb);
		const waitForNextPageLoad = page.waitForNavigation(navOption);

        // Triggers navigation to next page.
        await trigger();
        // Capture response of next page request.
        const r: puppeteer.HTTPResponse = await waitForNextResultResponse;
        await waitForNextPageLoad;
        return r;
    }
    catch(e) {
        throw e;
    }
};
