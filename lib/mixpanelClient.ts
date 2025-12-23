import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

export const initMixpanel = () => {
    if (!MIXPANEL_TOKEN) {
        console.warn('Mixpanel token is missing! Check your .env file.');
        return;
    }

    mixpanel.init(MIXPANEL_TOKEN, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage'
    });
};

export const trackPageView = (url: string) => {
    mixpanel.track('Page View', {
        url,
        timestamp: new Date().toISOString()
    });
};

export { mixpanel };
