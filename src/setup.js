const fs = require('fs');
const koaMount = require('koa-mount');
const koaStatic = require('koa-static');

const eventNames = require('./eventNames');
const playerId = 'RINCON_7828CA0F18DA01400';

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
    app.use(koaMount(staticFilesBasePath, koaStatic(staticFilesDir)));

    console.log(players);

    eventBus.on(eventNames.audioClip.play, async (buttonIndex) => {
        const players = await sonosControl.getPlayers();

        console.log(buttonIndex);
        if (buttonIndex - 1 >= clipNames.length) {
            console.log(`Button index ${ buttonIndex} out of range.`)
            return;
        }

        const clipName = clipNames[buttonIndex - 1];
        console.log(`Playing clip ${clipName}...`);
        const audioClipUrl = new URL(`${staticFilesBasePath}/${clipName}.mp3`, baseUrl);
        players.forEach(player => sonosControl.playAudioClipOnPlayer(audioClipUrl.toString(), player.id));
    });
};
