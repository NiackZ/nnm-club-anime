// ==UserScript==
// @name          nnm-club^anime releaser helper
// @namespace     nnm-club^anime.Scripts
// @description   Генерация оформления релиза по данным на странице аниме в базе World-Art
// @version       1.0.0.1
// @author        ElSwanko
// @homepage      https://github.com/ElSwanko/nnm-club-anime
// @updateURL     https://github.com/ElSwanko/nnm-club-anime/raw/master/release-helper.meta.js
// @downloadURL   https://github.com/ElSwanko/nnm-club-anime/raw/master/release-helper.full.js
// @include       http://www.world-art.ru/animation/*
// @include       https://www.world-art.ru/animation/*
// @match         http://www.world-art.ru/animation/*
// @match         https://www.world-art.ru/animation/*
// @include       http://nnmclub.to/forum/release.php?what=anime_common*
// @include       https://nnmclub.to/forum/release.php?what=anime_common*
// @include       http://*.nnmclub.to/forum/release.php?what=anime_common*
// @include       https://*.nnmclub.to/forum/release.php?what=anime_common*
// @match         http://nnmclub.to/forum/release.php?what=anime_common*
// @match         https://nnmclub.to/forum/release.php?what=anime_common*
// @match         http://*.nnmclub.to/forum/release.php?what=anime_common*
// @match         https://*.nnmclub.to/forum/release.php?what=anime_common*
// @grant         none
// ==/UserScript==
//

function WAHelper() {

    var defaultTemplate =
            '_STRINGNAMES_ _HEADER_\n' +
            '[align=center][color=#336699][size=22][b]\n' +
            '_NAMES_\n' +
            '[/b][/size][/color][/align][hr]\n' +
            '[poster=right]_POSTER_[/poster]\n' +
            '[b]Жанр:[/b] _GENRE_\n' +
            '[b]Тип:[/b] _TYPE_\n' +
            '[b]Продолжительность:[/b] _DURATION_\n' +
            '[b]Количество серий:[/b] _COUNT_\n' +
            '[b]Выпуск:[/b] _DATE_\n' +
            '[b]Производство:[/b] студия _COMPANY_\n' +
            '[b]Автор оригинала:[/b] _AUTHOR_\n' +
            '[b]Режиссер:[/b] _DIRECTOR_\n' +
            '[b]Сценарий:[/b] _SCENARY_\n' +
            '[b]Ссылки:[/b] _INFOLINKS_\n' +
            '[hr]\n' +
            '[b]Описание:[/b]\n' +
            '_DESCRIPTION_\n' +
            '[hr]\n' +
            '[b]Качество видео:[/b] _QUALITY_\n' +
            '[b]Видео:[/b] _VIDEO_\n' +
            //'[b]Аудио:[/b] _AUDIOLINE_ | [b]Звук:[/b] _SOUNDLINE_\n' +
            '_AUDIOBLOCK_\n' +
            '[b]Тип субтитров:[/b] Отключаемые (softsub)\n' +
            '[b]Язык субтитров:[/b] _SUBSLANG_\n' +
            '[b]Перевод:[/b] TRANSLATION\n' +
            '[brc][align=center][b]Скриншоты:[/b]\n' +
            '_SCREENSHOTS_\n' +
            '[/align]\n' +
            '[hide=Эпизоды]\n' +
            '_EPISODES_\n' +
            '[/hide]\n' +
            '[hide=Справка]\n' +
            '_NOTES_\n' +
            '[/hide]\n' +
            '[hide=Состав серии]\n' +
            '_CROSSLINKS_\n' +
            '[/hide]\n' +
            '[spoiler=Media Info на первую серию][code]\n' +
            '_MEDIAINFO_\n' +
            '[/code][/spoiler]\n' +
            '[align=center][b]Время раздачи:[/b] круглосуточно[/align]\n';

    /*
     var defaultTemplate =
     '[hide=_STRINGNAMES_]\n' +
     '[align=center][color=#336699][size=16][b]\n' +
     '_NAMES_\n' +
     '[/b][/size][/color][/align][hr]\n' +
     '[img=right]_POSTER_[/img]\n' +
     '[b]Жанр:[/b] _GENRE_\n' +
     '[b]Тип:[/b] _TYPE_\n' +
     '[b]Продолжительность:[/b] _DURATION_\n' +
     '[b]Выпуск:[/b] _DATE_\n' +
     '[b]Производство:[/b] студия _COMPANY_\n' +
     '[b]Автор оригинала:[/b] _AUTHOR_\n' +
     '[b]Режиссер:[/b] _DIRECTOR_\n' +
     '[b]Сценарий:[/b] _SCENARY_\n' +
     '[b]Ссылки:[/b] _INFOLINKS_\n' +
     '[hr]\n' +
     '[b]Описание:[/b]\n' +
     '_DESCRIPTION_\n' +
     '[/hide]\n';
     */

    var mediaInfo = '';
    var quality = '';

    var textHelper = TextHelper();
    var waProcessor = WAProcessor();
    var miProcessor = MIProcessor();

    function drawLinks() {
        var div = document.createElement('div');
        div.innerHTML = '<input type="button" value="Установить шаблон" onclick="waHelper.openTemplateDiv();"> || ' +
                '<input type="button" value="Задать MediaInfo" onclick="waHelper.openMediaInfoDiv();">' +
                '<input type="button" value="Сгенерировать описание" onclick="waHelper.process();">';
        var a = document.querySelector('a[style="text-decoration: none"]');
        var table = a.parentNode.parentNode.parentNode.parentNode;
        table.parentNode.insertBefore(div, table);
    }

    function openTemplateDiv() {
        openDiv('<strong>Обрабатываемые значения:</strong><br>' +
                '<b>_NAMES_</b> — названия аниме, выводятся по одному названию на строку;<br>' +
                '<b>_STRINGNAMES_</b> — названия аниме, выводятся все в одну строку;<br>' +
                '<b>_POSTER_</b> — постер;<br>' +
                '<b>_GENRE_</b> — жанры;<br>' +
                '<b>_TYPE_</b> — тип;<br>' +
                '<b>_DURATION_</b> — длительность;<br>' +
                '<b>_COUNT_</b> — количество эпизодов;<br>' +
                '<b>_DATE_</b> — дата выпуска/премьеры;<br>' +
                '<b>_COMPANY_</b> — студия;<br>' +
                '<b>_AUTHOR_</b> — автор оригинала;<br>' +
                '<b>_DIRECTOR_</b> — режиссер;<br>' +
                '<b>_SCENARY_</b> — сценарий;<br>' +
                '<b>_INFOLINKS_</b> — информационные ссылки;<br>' +
                '<b>_DESCRIPTION_</b> — описание;<br>' +
                '<b>_EPISODES_</b> — список эпизодов;<br>' +
                '<b>_NOTES_</b> — справка;<br>' +
                '<b>_CROSSLINKS_</b> — состав серии, список связанных произведений;<br>>' +
                '<b>_QUALITY_</b> — качество видео (если задано соответствующее значение);<br><br>' +
                'Если задан отчёт <b>MediaInfo</b>, заполняются следующие поля:<br>' +
                '<b>_DURATION_</b> — продолжительность видеофайла (если длительность не указана на странице ВА);<br>' +
                '<b>_MEDIAINFO_</b> — отчёт MediaInfo;<br>' +
                '<b>_VIDEO_</b> — параметры видео одной строкой;<br>' +
                '<b>_AUDIOLINE_</b> — параметры аудио одной строкой;<br>' +
                '<b>_SOUNDLINE_</b> — язык звуковых дорожек одной строкой;<br>' +
                '<b>_AUDIOBLOCK_</b> — готовый BB-код для параметров аудио и языка звуковой дорожки, по одной дорожке на строку;<br>' +
                '<b>_SUBSLANG_</b> — язык субтитров одной строкой;<br>' +
                '<b>_HEADER_</b> — заголовок релиза с краткой технической информацией.<br><br>' +
                '<strong>Шаблон:</strong><br>' +
                '<textarea rows="15" cols="90" id="templateText">' +
                (localStorage.template ? localStorage.template : defaultTemplate) +
                '</textarea><br>' +
                '<input type="button" value="Сохранить" onclick="waHelper.setTemplate();">');
    }

    function setTemplate() {
        var div = document.getElementById('helperDiv');
        localStorage.template = div.querySelector('textarea#templateText').value;
        closeDiv(div);
    }

    function openMediaInfoDiv() {
        openDiv('<strong>Отчёт Media Info:</strong><br>' +
                '<textarea rows="30" cols="90" id="mediaInfo">' + mediaInfo + '</textarea><br>' +
                '<b>Качество видео:</b> <input type="text" id="quality" width="200px" value="' + quality + '"><br>' +
                '<input type="button" value="Сохранить" onclick="waHelper.setMediaInfo();">');
    }

    function setMediaInfo() {
        var div = document.getElementById('helperDiv');
        mediaInfo = div.querySelector('textarea#mediaInfo').value;
        quality = div.querySelector('input#quality').value;
        closeDiv(div);
    }

    function openDiv(innerHTML) {
        var div = document.createElement('div');
        div.innerHTML = '<div style="position: fixed; z-index: 100; width: 100%; height: 100%; left: 0; top: 0;" id="helperDiv">' +
                '   <div style="position: relative; width: 100%; height: 100%">' +
                '       <div style="position:absolute; top: 0;left: 0; background-color: gray; filter: alpha(opacity=70);' +
                '                    -moz-opacity: 0.7; opacity: 0.7; z-index: 200; width: 100%; height: 100%"></div>' +
                '       <div style="position: absolute; top: 0; margin: auto; z-index: 300; width: 100%; height: 500px;">' +
                '           <div style="box-shadow: 0 0 10px 1px black; width: 750px; background-color: white; padding: 20px; margin: 50px auto auto;">' +
                innerHTML +
                '<input type="button" value="Закрыть" onclick="waHelper.closeDiv();">' +
                '           </div>' +
                '       </div>' +
                '   </div>' +
                '</div>';
        document.body.appendChild(div);
    }

    function closeDiv(div) {
        if (!div) {
            div = document.getElementById('helperDiv');
        }
        document.body.removeChild(div.parentNode);
    }

    function process() {
        try {
            var page = document;//waProcessor.loadPage(document.location.href);
            var data = waProcessor.loadData(page);

            var result = (localStorage.template || defaultTemplate).replace('_POSTER_', data.poster);
            result = result.replace('_STRINGNAMES_', data.stringNames);
            result = result.replace('_NAMES_', data.names);

            if (data.company) {
                result = result.replace('_COMPANY_', '[url=' + data.company.url + ']' + data.company.name + '[/url]');
            }

            var count = data.infoBlock['Количество'];
            var shortType = data.infoBlock['Сокращённый тип'];
            var header = '[' + data.year + ', ' + shortType + (count > 1 ? ', ' + count : '') + ']';

            result = result.replace('_GENRE_', data.infoBlock['Жанр']);
            result = result.replace('_TYPE_', data.infoBlock['Тип']);
            result = result.replace('_DURATION_', count + ' эп. по ' + data.infoBlock['Продолжительность']);
            result = result.replace('_COUNT_', count + ' из ' + count);
            if (data.infoBlock['Выпуск']) {
                result = result.replace('_DATE_', data.infoBlock['Выпуск']);
            }
            if (data.infoBlock['Премьера']) {
                result = result.replace('_DATE_', data.infoBlock['Премьера']);
            }
            var text = data.infoBlock['Автор оригинала'];
            if (text) {
                result = result.replace('_AUTHOR_', '[url=' + data.infoBlock['links'][text] + ']' + text + '[/url]');
            }
            text = data.infoBlock['Режиссёр'];
            if (text) {
                result = result.replace('_DIRECTOR_', '[url=' + data.infoBlock['links'][text] + ']' + text + '[/url]');
            }
            text = data.infoBlock['Сценарий'];
            if (text) {
                result = result.replace('_SCENARY_', '[url=' + data.infoBlock['links'][text] + ']' + text + '[/url]');
            }
            if (data.description) {
                result = result.replace('_DESCRIPTION_', data.description);
            }
            if (data.notes) {
                result = result.replace('_NOTES_', data.notes);
            }
            if (data.episodes) {
                text = '';
                var max = data.episodes[data.episodes.length - 1].number;
                for (i = 0; i < data.episodes.length; i++) {
                    text += '[b]' + textHelper.padZero(data.episodes[i].number, max) +
                            '.[/b] [color=#336699]' + data.episodes[i].name + '[/color]\n';
                }
                result = result.replace('_EPISODES_', text);
            }
            if (data.crossLinks) {
                text = '';
                for (var i = 0; i < data.crossLinks.length; i++) {
                    text += '\n' + data.crossLinks[i];
                }
                result = result.replace('_CROSSLINKS_', text);
            }
            text = '[url=' + document.location.href + ']World-Art[/url]';
            if (data.infoLinks['ANN']) {
                text += ', [url=' + data.infoLinks['ANN'] + ']ANN[/url]';
            }
            if (data.infoLinks['AniDB']) {
                text += ', [url=' + data.infoLinks['AniDB'] + ']AniDB[/url]';
            }
            if (data.infoLinks['MyAnimeList']) {
                text += ', [url=' + data.infoLinks['MyAnimeList'] + ']MyAnimeList[/url]';
            }
            if (data.infoLinks['Сетка вещания']) {
                text += ', [url=' + data.infoLinks['Сетка вещания'] + ']Сетка вещания[/url]';
            }
            result = result.replace('_INFOLINKS_', text);
            if (quality) {
                result = result.replace('_QUALITY_', quality);
                header += ' ' + quality;
            }

            var mi = miProcessor.parseMediaInfo(mediaInfo);
            if (mi) {
                if (mi.general) {
                    result = result.replace('_DURATION_', count + ' эп. по ' + mi.general.duration.total + ' мин.');
                }

                var video = '';
                if (mi.video.length == 1) {
                    video = mi.video[0].string;
                    header += ' ' + mi.video[0].scanType + (mi.video[0].butDepth == 10 ? ' Hi10P' : '');
                } else {
                    for (i = 0; i < mi.video.length; i++) {
                        video += '#' + (i + 1) + ': ' + mi.video[i].string + '; ';
                    }
                }
                result = result.replace('_VIDEO_', video);

                var audio = '';
                var sound = '';
                var block = '';
                if (mi.audio.length == 1) {
                    audio = mi.audio[0].string;
                    if (mi.audio[0].lang !== 'und') {
                        sound = mi.audio[0].language;
                    }
                    header += ' ' + (mi.audio[0].lang === 'jap' ? 'raw' : mi.audio[0].lang);
                    block = '[b]Аудио:[/b] ' + audio + ' | [b]Звук:[/b] ' + sound;
                } else {
                    for (i = 0; i < mi.audio.length; i++) {
                        audio += '#' + (i + 1) + ': ' + mi.audio[i].string + '; ';
                        if (mi.audio[i].lang !== 'und') {
                            sound += '#' + (i + 1) + ': ' + mi.audio[i].language + '; ';
                        }
                        var lang = mi.audio[0].lang === 'jap' ? 'raw' : mi.audio[0].lang;
                        block += '[b]Аудио #' + (i + 1) + ':[/b] ' + mi.audio[i].string +
                                ' | [b]Звук:[/b] ' + mi.audio[i].language + '\n';
                        header += (header.indexOf(lang) == -1 ? (i == 0 ? ' ' : '+') + lang : '');
                    }
                }
                result = result.replace('_AUDIOLINE_', audio);
                result = result.replace('_SOUNDLINE_', sound);
                result = result.replace('_AUDIOBLOCK_', block);

                var subs = '';
                if (mi.text.length == 1) {
                    if (mi.text[0].lang !== 'und') {
                        subs = mi.text[0].language;
                    }
                } else {
                    for (i = 0; i < mi.text.length; i++) {
                        var language = mi.text[i].language;
                        if (mi.text[i].lang !== 'und') {
                            subs += (subs.indexOf(language) == -1 ? '#' + (i + 1) + ': ' + language + '; ' : '');
                        }
                    }
                }
                result = result.replace('_SUBSLANG_', subs);
                result = result.replace('_MEDIAINFO_', mediaInfo);
            }
            result = result.replace('_HEADER_', header);

            console.log('result: \n' + result);

            copyTextToClipboard(result);
        } catch (e) {
            console.error(e);
        }
    }

    function copyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        // Place in top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = 0;
        textArea.style.left = 0;
        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = 0;
        // Clean up any borders.
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        // Avoid flash of white box if rendered for any reason.
        textArea.style.background = 'transparent';

        textArea.value = text;

        document.body.appendChild(textArea);

        textArea.select();
        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
        document.body.removeChild(textArea);
    }

    return {
        drawLinks: drawLinks,
        openTemplateDiv: openTemplateDiv,
        setTemplate: setTemplate,
        openMediaInfoDiv: openMediaInfoDiv,
        setMediaInfo: setMediaInfo,
        closeDiv: closeDiv,
        process: process
    };
}

function NNMHelper() {

    var textHelper = TextHelper();
    var miProcessor = MIProcessor();

    var table = {};
    var cells = document.querySelectorAll('td.row1[align="right"]');
    for (var i = 0; i < cells.length; i++) {
        var cell = cells[i];
        var name = textHelper.innerText(cell.innerHTML).split(':')[0].trim().replace('\n', '');
        var input = cell.parentNode.querySelector('td.row2 input');
        if (!input) input = cell.parentNode.querySelector('td.row2 textarea');
        if (!input) input = cell.parentNode.querySelectorAll('td.row2 select');
        table[name] = {'label': cell, 'input': input};
    }
    console.log(table);

    var waFrame;

    function drawLinks() {
        var l = table['Ссылки'].label;
        l.innerHTML = l.innerHTML + '<br>' +
                '<input type="button" style="width: 165px;" value="Заполнить описание" onclick="nnmHelper.getData();">';
        l = table['Mediainfo'].label;
        l.innerHTML = l.innerHTML + '<br>' +
                '<input type="button" style="width: 165px;" value="Заполнить тех.данные" onclick="nnmHelper.parseMI();">';
    }

    function getData() {
        var url = table['Ссылки'].input.value;
        if (url.indexOf('http') == 0) {
            if (!waFrame) {
                waFrame = createIFrame(url);
            }
            setTimeout(function () {
                waFrame.contentWindow.postMessage('load', '*');
            }, 1000);
        }
    }

    function process(data) {
        try {
            table['Обложка'].input.value = data.poster;

            var names = data.names.split('\n');
            if (names.length > 0) {
                var rusName = names[0];
            }
            if (names.length > 1) {
                var hirName = names[1];
            }
            if (names.length > 2) {
                var engName = names[2];
            }
            if (names.length > 3) {
                var japName = '';
                for (var i = 3; i < names.length; i++) {
                    japName += names[i] + (i + 1 < names.length ? ' | ' : '');
                }
            }
            table['Название латиницей'].input.value = hirName;
            table['Русское название'].input.value = rusName;
            table['Оригинальное название'].input.value = japName;
            table['Английское название'].input.value = engName;
            table['Год выпуска'].input.value = data.year;
            setOption(table['Тип'].input[0], data.infoBlock['Сокращённый тип']);
            table['Жанр'].input.value = data.infoBlock['Жанр'];
            var count = data.infoBlock['Количество'];
            table['Продолжительность'].input.value = (count > 1 ? count + ' эп. по ' : '') + data.infoBlock['Продолжительность'];
            table['Количество серий'].input.value = (count > 1 ? count + ' из ' + count : '');
            var text = data.infoBlock['Выпуск'];
            table['Дата выпуска'].input.value = text ? text : data.infoBlock['Премьера'];
            if (data.company) {
                table['Производство'].input.value = 'Студия [url=' + data.company.url + ']' + data.company.name + '[/url]';
            }
            text = data.infoBlock['Автор оригинала'];
            if (text) {
                table['Автор оригинала'].input.value = '[url=' + data.infoBlock['links'][text] + ']' + text + '[/url]';
            }
            text = data.infoBlock['Режиссёр'];
            if (text) {
                table['Режиссер'].input.value = '[url=' + data.infoBlock['links'][text] + ']' + text + '[/url]';
            }
            if (data.description) {
                table['Описание'].input.value = data.description;
            }
            if (data.episodes) {
                text = '';
                var max = data.episodes[data.episodes.length - 1].number;
                for (i = 0; i < data.episodes.length; i++) {
                    text += '[b]' + textHelper.padZero(data.episodes[i].number, max) +
                            '.[/b] [color=#336699]' + data.episodes[i].name + '[/color]\n';
                }
                table['Эпизоды'].input.value = text;
            }

            var notes = '[b]Дополнительные ссылки:[/b]\n';
            text = '';
            if (data.infoLinks['ANN']) {
                text += (text.length == 0 ? '' : ', ') + '[url=' + data.infoLinks['ANN'] + ']ANN[/url]';
            }
            if (data.infoLinks['AniDB']) {
                text += (text.length == 0 ? '' : ', ') + '[url=' + data.infoLinks['AniDB'] + ']AniDB[/url]';
            }
            if (data.infoLinks['MyAnimeList']) {
                text += (text.length == 0 ? '' : ', ') + '[url=' + data.infoLinks['MyAnimeList'] + ']MyAnimeList[/url]';
            }
            if (data.infoLinks['Сетка вещания']) {
                text += (text.length == 0 ? ''
                                : ', ') + '[url=' + data.infoLinks['Сетка вещания'] + ']Сетка вещания[/url]';
            }
            notes += text + '[hr]\n';

            if (data.notes) {
                notes += '[hide=Справка]' + data.notes + '[/hide]\n';
            }
            if (data.crossLinks) {
                text = '';
                for (i = 0; i < data.crossLinks.length; i++) {
                    text += '\n' + data.crossLinks[i];
                }
                notes += '[hide=Состав серии]' + text + '[/hide]';
            }
            table['Дополнительная информация'].input.value = notes;
        } catch (e) {
            console.error(e);
        }

        function setOption(selectElement, value) {
            var options = selectElement.options;
            for (var i = 0; i < options.length; i++) {
                if (textHelper.innerText(options[i].innerHTML) == value) {
                    selectElement.selectedIndex = i;
                    return true;
                }
            }
            return false;
        }
    }

    function parseMI() {
        try {
            var mi = table['Mediainfo'].input.value;
            if (mi && mi.length > 0) {
                mi = miProcessor.parseMediaInfo(mi);
                console.log(mi);

                var video = '';
                var videoSpec = '';
                if (mi.video.length == 1) {
                    video = mi.video[0].string;
                    videoSpec += mi.video[0].scanType + (mi.video[0].bitDepth == 10 ? ' Hi10P' : '');
                } else {
                    for (i = 0; i < mi.video.length; i++) {
                        video += '#' + (i + 1) + ': ' + mi.video[i].string + '; ';
                    }
                }
                table['Видео'].input.value = video;
                table['Характеристики видео(для заголовка)'].input.value = videoSpec;

                var audio = '';
                var audioLang = langObj();
                if (mi.audio.length == 1) {
                    audio = mi.audio[0].string;
                    audioLang.inc(mi.audio[0].lang);
                } else {
                    for (i = 0; i < mi.audio.length; i++) {
                        console.log(mi.audio[i].lang + ' : ' + audioLang[mi.audio[i].lang]);
                        audio += '#' + (i + 1) + ': ' + mi.audio[i].string + ' [' + mi.audio[i].lang + ']; ';
                        audioLang.inc(mi.audio[i].lang);
                    }
                }
                var idx = 5;
                if (audioLang.jap > 0 && audioLang.rus > 0) {
                    idx = 3;
                } else if (audioLang.jap > 0 && audioLang.eng > 0) {
                    idx = 4;
                } else if (audioLang.jap > 0) {
                    idx = 1;
                } else if (audioLang.rus > 0) {
                    idx = 2;
                }
                table['Аудио'].input.value = audio;
                table['Звук'].input[0].selectedIndex = idx;
                table['Звук (для заголовка)'].input[0].selectedIndex = idx;

                var subsLang = langObj();
                for (i = 0; i < mi.text.length; i++) {
                    console.log(mi.text[i].lang + ' : ' + subsLang[mi.text[i].lang]);
                    subsLang.inc(mi.text[i].lang);
                }
                if (subsLang.rus > 0) {
                    table['Язык субтитров'].input[0].selectedIndex = 3;
                }
                if (subsLang.eng > 0) {
                    table['Язык субтитров'].input[1].selectedIndex = 1;
                }
            }
        } catch (e) {
            console.error(e);
        }

        function langObj() {
            return {
                jap: 0, rus: 0, eng: 0, inc: function (lang) {
                    switch (lang) {
                    case 'jap': this.jap++; break;
                    case 'rus': this.rus++; break;
                    case 'eng': this.eng++; break;
                    }
                }
            }
        }
    }

    function createIFrame(url) {
        var frame = document.createElement('iframe');
        frame.style.display = 'none';
        frame.src = url;
        document.body.appendChild(frame);
        return frame;
    }

    return {
        drawLinks: drawLinks,
        getData: getData,
        process: process,
        parseMI: parseMI
    }
}

function WAProcessor() {

    var textHelper = TextHelper();

    function loadPage(url) {
        try {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, false);
            xhr.send("");
            //console.log('Загружена страница: ' + url);

            var hidden = document.body.appendChild(document.createElement("div"));
            hidden.style.display = 'none';
            hidden.innerHTML = /<body[^>]*>([\s\S]+)<\/body>/i.exec(xhr.responseText + "</center></body></html>")[1];
            document.body.removeChild(hidden);

            return hidden;
        } catch (e) {
            console.error('Не удалось загрузить страницу: ' + url, e.message);
        }
    }

    function loadData(page) {
        try {
            var blocks = page.querySelectorAll('td[align="left"]');
            var names = getNames(blocks[1]);
            var data = {
                'year': names[1],
                'names': names[0],
                'stringNames': getStringNames(names[0]),
                'poster': getPoster(blocks[0]),
                'company': getCompany(blocks[0]),
                'infoBlock': getInfoBlock(blocks[1]),
                'infoLinks': getInfoLinks(page),
                'description': getDescription(page),
                'notes': getNotes(page),
                'episodes': getEpisodes(page),
                'crossLinks': getCrosslinks(page)
            };
            console.log(data);
            return data;
        } catch (e) {
            console.error(e);
        }
    }

    function getNames(block) {
        var ee = block.querySelectorAll('font[size="3"]');
        var names = (ee && ee.length > 0) ? textHelper.innerText(ee[0].parentNode.innerHTML) : '_NAMES_';
        var year = (ee && ee.length > 1) ? textHelper.innerText(ee[1].innerHTML) : 'YEAR';
        names = names.replace(' [' + year + ']', '');
        return [names, year];
    }

    function getStringNames(names) {
        if (!names || names === '_NAMES_') {
            return names;
        }
        var result = "";
        var nn = names.split('\n');
        for (var i = 0; i < nn.length; i++) {
            result += nn[i] + (i == nn.length - 1 ? '' : ' | ');
        }
        return result;
    }

    function getPoster(block) {
        var img = block.querySelectorAll('img')[0];
        if (img) {
            return img.src;
        }
    }

    function getCompany(block) {
        var img = block.querySelectorAll('img');
        if (img.length = 2 && img[1]) {
            var url = img[1].parentNode.href;
            var page = loadPage(url);
            var name = textHelper.innerText(page.querySelector('font[size="3"]').innerHTML);
            return {'name': name, 'url': url};
        }
    }

    function getInfoBlock(block) {
        var result = {};
        var info = textHelper.innerText(block.querySelector('font[size="2"]').innerHTML).split('\n');
        for (var i = 0; i < info.length; i++) {
            if (info[i].indexOf(':') > 0) {
                var ss = info[i].split(':');
                result[ss[0].trim()] = (ss[1].indexOf('|') > 0 ? ss[1].split('|')[0] : ss[1]).trim();
            }
        }
        if (result['Тип']) {
            var type = parseType(result['Тип']);
            result['Тип'] = type.type;
            result['Сокращённый тип'] = type.shortType;
            result['Продолжительность'] = type.duration;
            result['Количество'] = type.count;
        }
        var aa = block.querySelectorAll('a.estimation');
        var links = {};
        for (i = 0; i < aa.length; i++) {
            links[textHelper.innerText(aa[i].innerHTML)] = aa[i].href;
        }
        result['links'] = links;
        return result;
    }

    function parseType(t) {
        var type;
        var shortType;
        var duration;
        var count = 1;
        var tt = t.split(/[(),]/);
        type = tt[0].trim();
        if (tt.length > 1) {
            var last = tt[tt.length - 1];
            if (last.indexOf('мин') > 0) {
                duration = last.trim();
            }
            if (tt[1].indexOf('эп') > 0) {
                tt = tt[1].split(/[> ]/);
                if (tt.length == 2) {
                    count = tt[0];
                } else if (tt.length == 3) {
                    count = tt[1];
                }
            }
        }
        if (type === 'ТВ') {
            shortType = 'TV';
        } else if (type === 'OVA' || type === 'OAV' || type === 'OAD') {
            shortType = 'OVA';
        } else if (type.indexOf('фильм') > -1) {
            shortType = 'Movie';
        } else {
            shortType = 'Другое';
        }
        return {'type': type, 'shortType': shortType, 'duration': duration, 'count': count};
    }

    function getDescription(page) {
        return getTextFromNearTable(page.querySelectorAll('font[size="2"][color="#99000"]'), 'Краткое содержание:').
                replace('при копировании текста активная ссылка на www.world-art.ru обязательна, подробнее о перепечатке текстов', '');
    }

    function getNotes(page) {
        return getTextFromNearTable(page.querySelectorAll('font[size="2"][color="#99000"]'), 'Справка:');
    }

    function getEpisodes(page) {
        var result = [];
        var fe = document.querySelectorAll('td[valign="top"]>font[size="2"]');
        if (fe.length == 1) {
            var text = getTextFromNearTable(page.querySelectorAll('font[size="2"][color="#990000"]'), 'Эпизоды:');
            if (text) {
                var tt = text.split('\n');
                for (var i = 0; i < tt.length; i++) {
                    if (tt[i].indexOf('. ') > 0) {
                        var ss = tt[i].split('. ');
                        result.push({'number': parseInt(ss[0]), 'name': ss[1]});
                    }
                }
                return result;
            }
        } else if (fe.length > 1) {
            for (i = 1; i < fe.length; i++) {
                result.push({'number': i, 'name': textHelper.innerText(fe[i].innerHTML)});
            }
            return result;
        }
    }

    function getCrosslinks(page) {
        var text;
        var pp = page.querySelectorAll('p.review');
        for (var i = 0; i < pp.length; i++) {
            if (textHelper.innerText(pp[i].innerHTML).indexOf('Серия состоит из') >= 0) {
                text = textHelper.innerText(pp[i].parentNode.innerHTML).replace(/ #/g, '\n#');
                var result = [];
                var ss = text.split('\n');
                for (i = 0; i < ss.length; i++) {
                    if (ss[i].indexOf('#') >= 0) {
                        result.push(ss[i]);
                    }
                }
                return result;
            }
        }
    }

    function getTextFromNearTable(fe, text) {
        for (var i = 0; i < fe.length; i++) {
            if (textHelper.innerText(fe[i].innerHTML).indexOf(text) > -1) {
                return textHelper.innerText(
                        fe[i].parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling.innerHTML);
            }
        }

    }

    function getInfoLinks(page) {
        var result = {};
        var links = page.querySelectorAll('a[target="_blank"]');
        for (var i = 0; i < links.length; i++) {
            var link = links[i];
            result[textHelper.innerText(link.innerHTML)] = link.href;
        }
        return result;
    }

    return {
        loadPage: loadPage,
        loadData: loadData
    }
}

function MIProcessor() {

    function parseMediaInfo(mediaInfo) {
        if (!mediaInfo) {
            return;
        }

        var general;
        var video = [];
        var audio = [];
        var text = [];

        try {
            var mi = mediaInfo.split('\n');

            var parts = [];
            var start = 0;
            var end = 0;
            do {
                end = mi.indexOf("", start);
                var part = mi.slice(start, (end == -1 ? mi.length : end));
                start = end + 1;
                var infoPart = {'name': part[0]};
                for (var i = 1; i < part.length; i++) {
                    var ss = part[i].split(' : ');
                    infoPart[ss[0].trim()] = ss[1].trim();
                }
                parts.push(infoPart);
            } while (end > -1);

            for (i = 0; i < parts.length; i++) {
                if (parts[i].name) {
                    if (parts[i].name == 'General' || parts[i].name == 'Общее') {
                        general = parseGeneral(parts[i]);
                    } else if (parts[i].name.indexOf('Video') == 0 || parts[i].name.indexOf('Видео') == 0) {
                        video.push(parseVideo(parts[i]));
                    } else if (parts[i].name.indexOf('Audio') == 0 || parts[i].name.indexOf('Аудио') == 0) {
                        audio.push(parseAudio(parts[i]));
                    } else if (parts[i].name.indexOf('Text') == 0 || parts[i].name.indexOf('Текст') == 0) {
                        text.push(parseText(parts[i]));
                    }
                }
            }
        } catch (e) {
            console.error(e);
        }

        return {general: general, video: video, audio: audio, text: text};
    }

    function parseDuration(object) {
        var duration = {hours: 0, minutes: 0, total: 0};
        var text;
        if (object['Duration']) {
            text = object['Duration'].split(' ');
            for (var i = 0; i < text.length; i++) {
                if (text[i].indexOf('h') > 0) {
                    duration.hours = parseInt(text[i].split('h')[0]);
                } else if (text[i].indexOf('mn') > 0) {
                    duration.minutes = parseInt(text[i].split('mn')[0]);
                }
            }
        } else if (object['Продолжительность']) {
            text = object['Продолжительность'].split('.');
            for (i = 0; i < text.length; i++) {
                var ss = text[i].trim().split(' ');
                if (ss.length == 2) {
                    if (ss[1] === 'ч') {
                        duration.hours = parseInt(ss[0]);
                    } else if (ss[1] == 'м') {
                        duration.minutes = parseInt(ss[0]);
                    }
                }
            }
        }
        duration.total = duration.hours * 60 + duration.minutes;
        return duration;
    }

    function parseNumbers(numbers) {
        if (numbers) {
            var pp = numbers.split(' ');
            if (pp.length == 2) {
                return [parseFloat(pp[0].replace(',', '.')), parseUnits(pp[1])];
            } else if (pp.length == 3) {
                return [parseFloat(pp[0] + pp[1].replace(',', '.')), parseUnits(pp[2])];
            }
        }
    }

    function parseUnits(units) {
        if (units.indexOf('bps') == 0 || units.indexOf('бит/сек') == 0) {
            return 'bps';
        } else if (units.indexOf('Kbps') == 0 || units.indexOf('Кбит/сек') == 0) {
            return 'kbps';
        } else if (units.indexOf('Mbps') == 0 || units.indexOf('Мбит/сек') == 0) {
            return 'Mbps';
        } else if (units.indexOf('bit') == 0 || units.indexOf('бит') == 0) {
            return 'b';
        } else if (units.indexOf('byte') == 0 || units.indexOf('байт') == 0) {
            return 'B';
        } else if (units.indexOf('KiB') == 0 || units.indexOf('Кбайт') == 0) {
            return 'kB';
        } else if (units.indexOf('MiB') == 0 || units.indexOf('Мбайт') == 0) {
            return 'MB';
        } else if (units.indexOf('GiB') == 0 || units.indexOf('Гбайт') == 0) {
            return 'GB';
        } else if (units.indexOf('pixel') == 0 || units.indexOf('пиксел') == 0) {
            return 'px';
        } else if (units.indexOf('Hz') == 0 || units.indexOf('Гц') == 0) {
            return 'Hz';
        } else if (units.indexOf('KHz') == 0 || units.indexOf('КГц') == 0) {
            return 'kHz';
        } else if (units.indexOf('channel') == 0 || units.indexOf('канал') == 0) {
            return 'ch';
        //} else if (units.indexOf('') || units.indexOf('')) {
        //    return '';
        }
    }

    function parseGeneral(general) {
        var duration = parseDuration(general);
        return {duration: duration};
    }

    function parseVideo(video) {
        var result = {format: null, resolution: null, scanType: null, frameRate: null, bitrate: null, bitDepth: null, string: null};

        result.bitDepth = parseNumbers(video['Bit depth'] || video['Битовая глубина'])[0];

        result.format = (video['Format'] || video['Формат']) + ' (' +
                (video['Format profile'] || video['Профиль формата']) + ')' +
                (result.bitDepth != 8 ? ' ' + result.bitDepth + ' bit' : '');

        var width = parseNumbers(video['Width'] || video['Ширина'])[0];
        var heigth = parseNumbers(video['Height'] || video['Высота'])[0];
        var dar = video['Display aspect ratio'] || video['Соотношение сторон'];
        result.resolution = width + 'x' + heigth + ' (' + dar + ')';

        var scanType = video['Scan type'] || video['Тип развёртки'];
        if (scanType === 'Progressive' || scanType === 'Прогрессивная') {
            result.scanType = heigth + 'p';
        } else if (scanType === 'Interleave') {
            result.scanType = heigth + 'i';
        }

        var frameRate = (video['Frame rate'] || video['Частота кадров']).split(' ')[0].replace(',', '.');
        result.frameRate = '~' + frameRate + ' fps';

        var bitrate = parseNumbers(video['Bit rate'] || video['Битрейт']);
        if (!bitrate) {
            var bppf = video['Bits/(Pixel*Frame)'] || video['Бит/(Пиксели*Кадры)'];
            if (bppf) {
                bitrate = [bppf * width * heigth * frameRate, 'bps'];
                if (bitrate[0] < 1000) {
                    //does nothing
                } else if (bitrate[0] < 10 * 1000 * 1000) {
                    bitrate[0] = Math.round(bitrate[0] / 1000);
                    bitrate[1] = 'Kbps';
                } else {
                    bitrate[0] = Math.round(bitrate[0] / (1000 * 1000));
                    bitrate[1] = 'Mbps';
                }
            }
        }
        result.bitrate = bitrate ? '~' + bitrate[0] + ' ' + bitrate[1] : null;

        result.string = result.format + ', ' + result.resolution + ', ' + result.frameRate +
                (result.bitrate ? ', ' + result.bitrate : '');

        return result;
    }

    function parseAudio(audio) {
        var result = {format: null, channels: null, bitDepth: null, sampleRate: null, bitRate: null,
            language: null, lang: null, title: null, string: null};

        result.language = (audio['Language'] || audio['Язык']);
        result.lang = getShortLang(result.language);
        result.title = (audio['Title'] || audio['Заголовок']);

        var bitDepth = parseNumbers(audio['Bit depth'] || audio['Битовая глубина']);
        if (bitDepth) {
            result.bitDepth = bitDepth[0];
        }

        var format = (audio['Format'] || audio['Формат']);
        result.format = format;
        if (audio['Format profile'] || audio['Профиль формата']) {
            result.format += ' ' + (audio['Format profile'] || audio['Профиль формата']);
        }

        var channels = parseNumbers(audio['Channel(s)'] || audio['Каналы'] || audio['Channel count']);
        result.channels = channels[0] + ' ' + channels[1];

        var sampleRate = audio['Sampling rate'] || audio['Частота'];
        if (sampleRate.indexOf('/') > -1) {
            sampleRate = sampleRate.split('/')[0].trim();
        }
        sampleRate = parseNumbers(sampleRate);
        result.sampleRate = sampleRate[0] + ' ' + sampleRate[1];

        var bitrate = audio['Bit rate'] || audio['Битрейт'];
        if (!bitrate) {
            if (format === 'FLAC') {
                if (bitDepth[0] == 16) {
                    bitrate = '1000 Kbps';
                } else if (bitDepth[0] == 24) {
                    bitrate = '1500 Kbps';
                }
            }
        }
        bitrate = parseNumbers(bitrate);
        result.bitRate = bitrate ? '~' + bitrate[0] + ' ' + bitrate[1] : null;

        result.string = result.format + ', ' + result.channels + ', ' + result.sampleRate +
                (result.bitDepth ? ', ' + result.bitDepth + ' bit' : '') + (result.bitRate ? ', ' + result.bitRate : '');

        return result;
    }

    function parseText(text) {
        var result = {lang: null, language: null, title: null};
        result.title = (text['Title'] || text['Заголовок']);
        result.language = (text['Language'] || text['Язык']);
        result.lang = getShortLang(result.language);
        return result;
    }

    function getShortLang(language) {
        var lang;
        if (language === 'Japanese' || language === 'Японский') {
            lang = 'jap';
        } else if (language === 'Russian' || language === 'Русский') {
            lang = 'rus';
        } else if (language === 'English' || language === 'Английский') {
            lang = 'eng';
        } else {
            lang = 'und';
        }
        return lang;
    }

    return {
        parseMediaInfo: parseMediaInfo
    }
}

function TextHelper() {

    function innerText(html) {
        return html.replace(/<br>/g, '\n').replace(/<(?:.|\n)*?>/gm, '').replace(/&nbsp;/g, ' ');
    }

    function padZero(number, count) {
        var maxLength = ('' + count).length;
        var curLength = ('' + number).length;
        var result = '';
        for (var i = 0; i < maxLength - curLength; i++) {
            result += '0';
        }
        return result + number;
    }

    return {
        innerText: innerText,
        padZero: padZero
    }
}

function IFCommunicator() {

    function WAListener(event) {
        if (event.data && event.data == 'load') {
            var pageData = WAProcessor().loadData(document);
            window.parent.postMessage(JSON.stringify(pageData), '*');
        }
    }

    function NNMListener(event) {
        if (event.data) {
            var waData = JSON.parse(event.data);
            nnmHelper.process(waData);
        }
    }

    return {
        waListener: WAListener,
        nnmListener: NNMListener
    }
}

var ifCommunicator = IFCommunicator();
var script = document.createElement('script');
var textContent = TextHelper.toString() + MIProcessor.toString();
if (window.location.href.indexOf('nnmclub') > -1) {
    textContent += NNMHelper.toString() + ' var nnmHelper = NNMHelper(); nnmHelper.drawLinks(); ';
    window.addEventListener("message", ifCommunicator.nnmListener, false);
} else {
    textContent += WAHelper.toString() + WAProcessor.toString() + ' var waHelper = WAHelper(); waHelper.drawLinks(); ';
    window.addEventListener("message", ifCommunicator.waListener, false);
}
script.textContent = textContent;
document.body.appendChild(script);
