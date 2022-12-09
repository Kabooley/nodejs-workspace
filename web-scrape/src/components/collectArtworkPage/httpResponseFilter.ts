/**********************************************************
 * Generate HTTP Response filter to get specific response.
 * 
 * Each filter implementations are specialized.
 * 
 * ********************************************************/ 
import type puppeteer from 'puppeteer';
import mustache from '../../utilities/mustache';

/**
 * 
 * */ 
export const httpResponseFilter = (id: string, url: string) => {
    return function(response: puppeteer.HTTPResponse) {
        return response.status() === 200 
            && response.url() === mustache(url, {id: id});
    }
};
