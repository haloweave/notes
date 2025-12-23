import mixpanel from 'mixpanel-browser';

const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN;

let isInitialized = false;

export const initMixpanel = () => {
    if (!MIXPANEL_TOKEN) {
        console.warn('❌ Mixpanel token is missing! Check your .env file.');
        return;
    }

    if (isInitialized) {
        console.log('✅ Mixpanel already initialized');
        return;
    }

    mixpanel.init(MIXPANEL_TOKEN, {
        debug: process.env.NODE_ENV === 'development',
        track_pageview: true,
        persistence: 'localStorage'
    });

    isInitialized = true;
    console.log('✅ Mixpanel initialized successfully!');
    console.log('🔍 Token:', MIXPANEL_TOKEN.substring(0, 8) + '...');
    console.log('📊 Autocapture: enabled');
    console.log('💡 Test it: window.testMixpanel()');
};

export const trackPageView = (url: string) => {
    mixpanel.track('Page View', {
        url,
        timestamp: new Date().toISOString()
    });
};

// Test function to verify Mixpanel is working
export const testMixpanel = () => {
    if (!isInitialized) {
        console.error('❌ Mixpanel is not initialized yet!');
        return;
    }

    console.log('🧪 Sending test event to Mixpanel...');
    mixpanel.track('Mixpanel Test Event', {
        timestamp: new Date().toISOString(),
        source: 'manual_test'
    });
    console.log('✅ Test event sent! Check your Mixpanel Live View.');
    console.log('🔗 Go to: https://mixpanel.com/report/live');
};

// Make test function available in browser console
if (typeof window !== 'undefined') {
    (window as any).testMixpanel = testMixpanel;
}

export { mixpanel };
