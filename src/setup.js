const fs = require('fs');
const koaMount = require('koa-mount');
const koaStatic = require('koa-static');

const responseSynchronizer = require('./responseSynchronizer')
const eventNames = require('./eventNames');

const clipNames = [
    'baller_gerne',
    'hierhoch',
    'jungejunge',
    'keinelust',
    'nichtskoenner',
    'pa_stopp3_halt_stopp',
    'stop',
    'wild',
    'woran_hats_jelechen',
    'zudumm',
];

module.exports = (options) => {
    const { app, eventBus, baseUrl, sonosControl } = options;
    const pathPrefix = options.pathPrefix || '/';

    // Serve static files
    const staticFilesBasePath = `${pathPrefix}/static`;
    const staticFilesDir = `${__dirname}/static`;

    // Audio clips can only be sent one by one to each player over their own https connection.
    // The clips are expected to play somehow synchronous over the individual speakers.
    //
    // Synchronizing the response allows for some tolerance of the timing.
    // 1. We have A the "play clip XYZ" https request with TCP & TLS connection setup
    // 2. We have the setup of the "fetch that mp3" TCP & TLS setup connection setup
    // Synchronizing the response therefore equalizes the delay of "play clip XYZ" and the "fetch" setup time
    //
    // We don't take into account transmission speed & WiFi "jitter", since this would mean a lot more work:
    // => tcp stream flow control.
    app.use(koaMount(staticFilesBasePath, responseSynchronizer(koaStatic(staticFilesDir))));

    eventBus.on(eventNames.audioClip.play, async (buttonIndex) => {
        console.log(buttonIndex);
        if (buttonIndex - 1 >= clipNames.length) {
            console.log(`Button index ${ buttonIndex} out of range.`)
            return;
        }

        const clipName = clipNames[buttonIndex - 1];
        console.log(`Playing clip ${clipName}...`);
        const audioClipUrl = new URL(`${staticFilesBasePath}/${clipName}.mp3`, baseUrl);
        sonosControl.playAudioClipOnAllPlayers(audioClipUrl.toString());
    });
};
