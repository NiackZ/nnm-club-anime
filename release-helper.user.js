
// ==UserScript==
// @name          nnm-club^anime releaser helper by NZ
// @namespace     nnm-club^anime.Scripts
// @description   Генерация оформления релиза по данным на странице аниме в базе World-Art
// @version       1.1.4
// @author        ElSwanko edited by NIK220V
// @homepage      https://github.com/NiackZ/nnm-club-anime
// @updateURL     https://github.com/NiackZ/nnm-club-anime/raw/master/release-helper.meta.js
// @downloadURL   https://github.com/NiackZ/nnm-club-anime/raw/master/release-helper.user.js
// @match         http://www.world-art.ru/animation/*
// @match         *://*.nnmclub.to/forum/release.php?what=anime_common*
// @match         *://*.nnm-club.me/forum/release.php?what=anime_common*
// @match         *://*.nnm-club.name/forum/release.php?what=anime_common*
// @match         *://nnmclub2vvjqzjne6q4rrozkkkdmlvnrcsyes2bbkm7e5ut2aproy4id.onion/forum/release.php?what=anime_common*
// @grant         none
// ==/UserScript==
//
function WAHelper() {

    const defaultTemplate =
        '_STRINGNAMES_ _HEADER_\n' +
        '[align=center][color=#336699][size=22][b]\n' +
        '_NAMES_\n' +
        '[/b][/size][/color][/align]\n' +
        '[poster=right]_POSTER_[/poster]\n' +
        '[b]Жанр:[/b] _GENRE_\n' +
        '[b]Тип:[/b] _TYPE_\n' +
        '[b]Продолжительность:[/b] _DURATION_\n' +
        '[b]Количество серий:[/b] _COUNT_\n' +
        '[b]Выпуск:[/b] _DATE_\n' +
        '_IFCOMPANY[b]Производство:[/b] студия _COMPANY_ IFCOMPANY_\n' +
        '_IFAUTHOR[b]Автор оригинала:[/b] _AUTHOR_ IFAUTHOR_\n' +
        '_IFDIRECTOR[b]Режиссер:[/b] _DIRECTOR_ IFDIRECTOR_\n' +
        '[b]Ссылки:[/b] _INFOLINKS_\n' +
        '[b]Возраст:[/b] _RATING_\n' +
        '\n' +
        '[b]Описание:[/b]\n' +
        '_DESCRIPTION_\n' +
        '\n' +
        '[b]Субтитры:[/b] \n' +
        '_SUBSLINE_\n' +
        '\n' +
        '[b]Качество видео:[/b] _QUALITY_\n' +
        '[b]Видео:[/b] _VIDEO_\n' +
        '\n' +
        '[b]Язык озвучки:[/b] _SOUNDLINE_\n' +
        '[b]Качество озвучки:[/b] Двухголосная, трехголосная, многоголосная, закадровая, дубляж.\n' +
        '[b]Аудио:[/b]\n'+
        '_AUDIO_\n' +
        '\n' +
        '[brc][align=center][b]Скриншоты:[/b]\n' +
        '_SCREENSHOTS_\n' +
        '[/align]\n' +
        '_IFEPISODES[hide=Эпизоды]\n' +
        '_EPISODESFMT_\n' +
        '[/hide]IFEPISODES_\n' +
        '_IFNOTES[hide=Справка]\n' +
        '_NOTES_\n' +
        '[/hide]IFNOTES_\n' +
        '_IFCROSS[hide=Состав серии]\n' +
        '_CROSSLINKS_\n' +
        '[/hide]IFCROSS_\n' +
        '[spoiler=Media Info на первую серию][pre]\n' +
        '_MEDIAINFO_\n' +
        '[/pre][/spoiler]\n' +
        '[align=center][b]Время раздачи:[/b] с 10 до 20[/align]\n';

    const episodeTemplate = localStorage.episode ? localStorage.episode : '[b]_NUM_[/b]. [color=#008000]_TXT_[/color]';

    let description = '';
    let episodes = '';
    let mediaInfo = '';
    let screenshots = '';
    let quality = '';
    let poster = '';
    let translation = '';
    let rating = '';
    const altEpisodes = [];

    const textHelper = TextHelper();
    const waProcessor = WAProcessor();
    const miProcessor = MIProcessor();

    function drawLinks() {
        const div = document.createElement('div');
        div.id = 'waHelper_links';
        div.innerHTML = "<table cellpadding=0 cellspacing=2 border=0><tr>" +
            "<td width=110 height=40 align=center bgcolor=eaeaea><a href='javascript:;' style=text-decoration:none onclick='waHelper.openTemplateDiv();'>Установить шаблон</a></td><td width=1 bgcolor=gray></td>" +
            "<td width=120 height=40 align=center bgcolor=eaeaea><a href='javascript:;' style=text-decoration:none onclick='waHelper.openMediaInfoDiv();'>Задать переменные</a></td><td width=1 bgcolor=gray></td>" +
            "<td width=140 height=40 align=center bgcolor=963D3D><a href='javascript:;' style=text-decoration:none onclick='waHelper.process();'><font color=white>Сгенерировать описание</font></a></td>" +
            "<td width=1 bgcolor=gray></td></tr></table>";
        const a = document.querySelector('a[style="text-decoration:none"]');
        const table = a.parentNode.parentNode.parentNode.parentNode;
        table.parentNode.insertBefore(div, table.nextSibling);
    }

    function openTemplateDiv() {
        openDiv('<strong>Обрабатываемые значения:</strong><br>' +
            '<b>_NAMES_</b> — названия аниме, выводятся по одному названию на строку; ' +
            '<b>_STRINGNAMES_</b> — названия аниме, выводятся все в одну строку;<br>' +
            '<b>_POSTER_</b> — постер; <b>_GENRE_</b> — жанры; <b>_TYPE_</b> — тип;<br>' +
            '<b>_DURATION_</b> — длительность; <b>_COUNT_</b> — количество эпизодов; <b>_DATE_</b> — дата выпуска/премьеры;<br>' +
            '<b>_COMPANY_</b> — готовый BB-код ссылки на студию; ' +
            '<b>_COMPANYNAME_</b>, <b>_COMPANYURL_</b> — название студии и ссылка по отдельности;<br>' +
            '<b>_AUTHOR_</b> — готовый BB-код ссылки на автора оригинала; ' +
            '<b>_AUTHORNAME_</b>, <b>_AUTHORURL_</b> — автор оригинала и ссылка по отдельности;<br>' +
            '<b>_DIRECTOR_</b> — готовый BB-код ссылки на режиссёра; ' +
            '<b>_DIRECTORNAME_</b>, <b>_DIRECTORURL_</b> — режиссёр и ссылка по отдельности;<br>' +
            '<b>_INFOLINKS_</b> — готовый BB-код информационных ссылок одним блоком;<br>' +
            '<b>_RATING_</b> — готовый BB-код с возрастной маркировкой по классификации РФ;<br>' +
            '<b>_WAURL_</b>, <b>_ANNURL_</b>, <b>_ANIDBURL_</b>, <b>_MALURL_</b>, ' +
            '<b>_AIRURL_</b> — информационные ссылки по отдельности;<br>' +
            '<b>_DESCRIPTION_</b> — описание; <b>_NOTES_</b> — справка;<br>' +
            '<b>_EPISODES_</b> — неформатированный список эпизодов; ' +
            '<b>_EPISODESFMT_</b> — BB-код списка эпизодов с небольшим оформлением;<br>' +
            '<b>_CROSSLINKS_</b> — состав серии, список связанных произведений; ' +
            '<b>_CROSSLINKSTBL_</b> — BB-код состава серии с оформлением таблицей;<br>' +
            '<br><b>Условия в шаблоне:</b><br>' +
            'Если переменная выбранного типа не была обнаружена, то всё, что находится внутри условия не будет использовано.<br>' +
            '<b>_IFDIRECTOR IFDIRECTOR_</b> — Режиссёр; <b>_IFAUTHOR IFAUTHOR_</b> — Автор; <b>_IFCOMPANY IFCOMPANY_</b> — Компания;<br>' +
            '<b>_IFEPISODES IFEPISODES_</b> — Эпизоды; <b>_IFNOTES IFNOTES_</b> — Справка; <b>_IFCROSS IFCROSS_</b> — Состав серии<br>' +
            '<br>Если задан отчёт <b>MediaInfo</b>, заполняются следующие поля:<br><br>' +
            '<b>_QUALITY_</b> — качество видео (если задано соответствующее значение);<br>' +
            '<b>_DURATION_</b> — продолжительность видеофайла (если длительность не указана на странице ВА); ' +
            '<b>_MEDIAINFO_</b> — отчёт MediaInfo;<br>' +
            '<b>_AUDIO_</b> — готовый BB-код для параметров аудио и языка звуковой дорожки, по одной дорожке на строку;<br>' +
            '<b>_VIDEO_</b> — параметры видео одной строкой; <b>_AUDIOLINE_</b> — параметры аудио одной строкой;<br>' +
            '<b>_SOUNDLINE_</b> — язык звуковых дорожек одной строкой; <b>_SUBSLINE_</b> — язык субтитров одной строкой;<br>' +
            '<b>_HEADER_</b> — заголовок релиза с краткой технической информацией.<br><br>' +
            '<strong>Шаблон:</strong><br>' +
            '<textarea rows=12 cols=110 id=templateText>' +
            (localStorage.template ? localStorage.template : defaultTemplate) +
            '</textarea><br>',
            'waHelper.setTemplate();');
    }

    function setTemplate() {
        const div = document.getElementById('helperDiv');
        localStorage.template = div.querySelector('textarea#templateText').value;
        closeDiv(div);
    }

    function openMediaInfoDiv() {
        openDiv('<strong>Описание:</strong><br>' +
            '<textarea rows=5 cols=110 id=descriptionInput>' + description + '</textarea><br><br>' +
            '<strong>Эпизоды:</strong><br>' +
            '<textarea rows=5 cols=110 id=episodesInput>' + episodes + '</textarea><br><br>' +
            '<strong>Отчёт Media Info:</strong><br>' +
            '<textarea rows=10 cols=110 id=mediaInfoInput>' + mediaInfo + '</textarea><br><br>' +
            '<strong>Скриншоты:</strong><br>' +
            '<textarea rows=5 cols=110 id=screenShotsInput>' + screenshots + '</textarea><br><br>' +
            '<b>Качество видео:</b>&nbsp;<input id=qualityInput width=300px value="' + quality + '">&nbsp;' +
            '<b>Постер:</b>&nbsp;<input id=posterInput width=400px value="' + poster + '">&nbsp;' +
            '<b>Перевод:</b>&nbsp;<input id=translationInput width=400px value="' + translation + '">&nbsp;' +
            '<b>Возраст:</b>&nbsp;<select id=ratingSelect width=200px>' +
            '<option id=0 value="[b][color=green]0+[/color][/b] (Для любой зрительской аудитории)">0+</option>' +
            '<option id=6 value="[b][color=green]6+[/color][/b] (Для зрителей старше 6 лет)">6+</option>' +
            '<option id=12 selected value="[b][color=blue]12+[/color][/b] (Для зрителей старше 12 лет)">12+</option>' +
            '<option id=16 value="[b][color=blue]16+[/color][/b] (Для зрителей старше 16 лет)">16+</option>' +
            '<option id=18 value="[b][color=red]18+[/color][/b] (Для зрителей старше 18 лет, запрещено для детей)">18+</option>' +
            '<option id=21 value="Без возрастной маркировки">Нет</option>' +
            '</select><br><br>',
            'waHelper.setMediaInfo();');
    }

    function setMediaInfo() {
        const div = document.getElementById('helperDiv');
        description = div.querySelector('textarea#descriptionInput').value;
        episodes = div.querySelector('textarea#episodesInput').value;
        mediaInfo = div.querySelector('textarea#mediaInfoInput').value;
        screenshots = div.querySelector('textarea#screenShotsInput').value;
        quality = div.querySelector('input#qualityInput').value;
        poster = div.querySelector('input#posterInput').value;
        translation = div.querySelector('input#translationInput').value;
        rating = div.querySelector('select#ratingSelect').selectedOptions[0].value;
        closeDiv(div);

        if (episodes && episodes.length > 0) {
            const splited = episodes.split('\n');
            for (let i = 0; i < splited.length; i++) {
                const matches = splited[i].match(/^\d*\.*\s+(.*)$/);
                altEpisodes.push(matches && matches.length > 1 ? matches[1] : splited[i]);
            }
        }
    }

    function openDiv(innerHTML, saveAction) {
        const div = document.createElement('div');
        div.innerHTML = '<div style="position: fixed; z-index: 100; width: 100%; height: 100%; left: 0; top: 0;" id="helperDiv">' +
            '   <div style="position: absolute; top: 0;left: 0; background-color: gray; filter: alpha(opacity=70);' +
            ' -moz-opacity: 0.7; opacity: 0.7; z-index: 200; width: 100%; height: 100%"></div>' +
            '   <div style="position: absolute; top: 0; margin: auto; z-index: 300; width: 100%; height: 500px;">' +
            '       <div style="box-shadow: 0 0 10px 1px black; width: 900px; background-color: white; padding: 20px; margin: 25px auto auto;">' +
            "<p style='text-align:right;'><a href='javascript:;' style=text-decoration:none onclick='waHelper.closeDiv();'><font color=red>X</font></a></p>" +
            innerHTML +
            "<table cellpadding=0 cellspacing=2 border=0>" +
            "   <td width=80 height=30 align=center bgcolor=963D3D><a href='javascript:;' style=text-decoration:none onclick='" + saveAction + "'><font color=white>Сохранить</font></a></td>" +
            "   <td width=1 bgcolor=gray></td><td width=70 height=30 align=center bgcolor=eaeaea><a href='javascript:;' style=text-decoration:none onclick='waHelper.closeDiv();'>Закрыть</a></td>" +
            "</table>" +
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
        const page = document.body;
        const data = waProcessor.loadData(page);
        // console.log('data: ' + JSON.stringify(data));
        const mi = miProcessor.parseMediaInfo(mediaInfo);
        // console.log('mi: ' + JSON.stringify(mi));

        const result = applyTemplate(localStorage.template || defaultTemplate, data, mi);

        copyToClipboard(result);
    }

    function applyTemplate(template, data, mi) {
        let result = template.replace('_POSTER_', poster.length > 0 ? poster : data.poster);

        let text = '';
        if (data.names.oth.length > 0) {
            text += ' | ' + data.names.oth;
        }
        if (data.names.eng.length > 0) {
            text += ' | ' + data.names.eng;
        }
        if (data.names.rus.length > 0) {
            text += ' | ' + data.names.rus;
        }
        result = result.replace('_STRINGNAMES_', text.substring(3));

        text = '';
        if (data.names.oth.length > 0) {
            text += data.names.oth + '\n';
        }
        if (data.names.eng.length > 0) {
            text += data.names.eng + '\n';
        }
        if (data.names.rus.length > 0) {
            text += data.names.rus + '\n';
        }
        if (data.names.jap.length > 0) {
            text += data.names.jap + '\n';
        }
        result = result.replace('_NAMES_', text.substring(0, text.length - 1));

        if (data.company) {
            result = result.replace('_COMPANYURL_', data.company.url);
            result = result.replace('_COMPANYNAME_', data.company.name);
            result = result.replace('_COMPANY_', '[url=' + data.company.url + ']' + data.company.name + '[/url]');
        } else {
            result = replaceVar(result, 'IFCOMPANY');
        }

        const sp = data.infoBlock['SP'];
        const count = data.infoBlock['Количество'];
        const complete = data.infoBlock['Complete'];
        const shortType = data.infoBlock['Сокращённый тип'];
        let header = '[' + data.infoBlock['Дата'].split('.')[2] + ', ' + shortType +
            (count > 1 ? ', ' + (complete ? '' : '1 из ') + count + ' эп.' +
                (sp > 0 ? ' + ' + (complete ? '' : '1 из ') + sp + ' SP' : '') : '') + ']';

        result = result.replace('_GENRE_', data.infoBlock['Жанр']);
        result = result.replace('_TYPE_', data.infoBlock['Тип']);
        result = result.replace('_DURATION_', count + ' эп. по ' + data.infoBlock['Продолжительность'] + (sp > 0 ? ' + ' + sp + ' SP' : ''));
        result = result.replace('_COUNT_', (complete ? count : '1') + ' из ' + count);
        if (data.infoBlock['Выпуск']) {
            result = result.replace('_DATE_', data.infoBlock['Выпуск']);
        }
        if (data.infoBlock['Премьера']) {
            result = result.replace('_DATE_', data.infoBlock['Премьера']);
        }
        text = data.infoBlock['Автор оригинала'];
        if (text) {
            result = result.replace('_AUTHORNAME_', text);
            result = result.replace('_AUTHORURL_', data.infoBlock['links'][text]);
            result = result.replace('_AUTHOR_', '[url=' + data.infoBlock['links'][text] + ']' + text + '[/url]');
        } else {
            result = replaceVar(result, 'IFAUTHOR');
        }
        text = data.infoBlock['Режиссёр'];
        if (text) {
            result = result.replace('_DIRECTORNAME_', text);
            result = result.replace('_DIRECTORURL_', data.infoBlock['links'][text]);
            result = result.replace('_DIRECTOR_', '[url=' + data.infoBlock['links'][text] + ']' + text + '[/url]');
        } else {
            result = replaceVar(result, 'IFDIRECTOR');
        }
        if (description.length > 0) {
            result = result.replace('_DESCRIPTION_', description);
        } else if (data.description) {
            result = result.replace('_DESCRIPTION_', data.description);
        }
        if (screenshots) {
            result = result.replace('_SCREENSHOTS_', screenshots);
        }
        if (rating) {
            result = result.replace('_RATING_', rating);
        }
        if (data.notes) {
            result = result.replace('_NOTES_', data.notes);
        } else {
            result = replaceVar(result, 'IFNOTES');
        }
        if (data.episodes && data.episodes.length > 0) {
            text = '';
            let textFmt = '';
            for (let i = 0; i < data.episodes.length; i++) {
                const ep = textHelper.padZero(data.episodes[i].number, data.episodes[data.episodes.length - 1].number);
                const alt = i < altEpisodes.length ? altEpisodes[i] : '';
                text += '' + ep + '. ' + data.episodes[i].name + (alt.length > 0 ? ' | ' + alt : '') + '\n';
                textFmt += episodeTemplate.replace('_NUM_', ep).replace('_TXT_', data.episodes[i].name).replace('_ALT_', alt) + '\n';
            }
            result = result.replace('_EPISODESFMT_', textFmt.substring(0, textFmt.length - 1));
            result = result.replace('_EPISODES_', text.substring(0, text.length - 1));
        } else {
            result = replaceVar(result, 'IFEPISODES');
        }

        if (data.crossLinks && data.crossLinks.length > 0) {
            text = '';
            let textTbl = '[table][align=center][b]Название[/b][/align][mcol]Релизы\n';
            for (let i = 0; i < data.crossLinks.length; i++) {
                text += data.crossLinks[i] + '\n';
                textTbl += '[row]' + data.crossLinks[i] + ' [col]\n';
            }
            result = result.replace('_CROSSLINKSTBL_', textTbl + '[/table]');
            result = result.replace('_CROSSLINKS_', text.substring(0, text.length - 1));
        } else {
            result = replaceVar(result, 'IFCROSS');
        }

        result = result.replace('_WAURL_', data.infoLinks['WA']);
        let links = '[url=' + data.infoLinks['WA'] + ']World-Art[/url]';
        if (data.infoLinks['ANN']) {
            result = result.replace('_ANNURL_', data.infoLinks['ANN']);
            links += ', [url=' + data.infoLinks['ANN'] + ']ANN[/url]';
        }
        if (data.infoLinks['AniDB']) {
            result = result.replace('_ANIDBURL_', data.infoLinks['AniDB']);
            links += ', [url=' + data.infoLinks['AniDB'] + ']AniDB[/url]';
        }
        if (data.infoLinks['MAL']) {
            result = result.replace('_MALURL_', data.infoLinks['MAL']);
            links += ', [url=' + data.infoLinks['MAL'] + ']MyAnimeList[/url]';
        }
        // if (data.infoLinks['SCHEDULE']) {
        //     result = result.replace('_AIRURL_', data.infoLinks['SCHEDULE']);
        //     links += ', [url=' + data.infoLinks['SCHEDULE'] + ']Сетка вещания[/url]';
        // }
        result = result.replace('_INFOLINKS_', links);

        // IF Replacing
        result = textHelper.replaceAll(result, '_IFDIRECTOR');
        result = textHelper.replaceAll(result, 'IFDIRECTOR_');
        result = textHelper.replaceAll(result, '_IFAUTHOR');
        result = textHelper.replaceAll(result, 'IFAUTHOR_');
        result = textHelper.replaceAll(result, '_IFCOMPANY');
        result = textHelper.replaceAll(result, 'IFCOMPANY_');
        result = textHelper.replaceAll(result, '_IFEPISODES');
        result = textHelper.replaceAll(result, 'IFEPISODES_');
        result = textHelper.replaceAll(result, '_IFCROSS');
        result = textHelper.replaceAll(result, 'IFCROSS_');
        result = textHelper.replaceAll(result, '_IFNOTES');
        result = textHelper.replaceAll(result, 'IFNOTES_');

        if (quality.length > 0) {
            result = result.replace('_QUALITY_', quality);
            header += ' ' + quality;
        }

        if (mi) {
            if (mi.general) {
                result = result.replace('_DURATION_', count + ' эп. по ' + mi.general.duration.total + ' мин.' + (sp > 0 ? ' + ' + sp + ' SP' : ''));
            }

            let video = '';
            if (mi.video.length === 1) {
                video = mi.video[0].string;
                header += ' ' + mi.video[0].scanType + (mi.video[0].format.startsWith('HEVC') ? ' HEVC' : '') +
                    (mi.video[0].bitDepth !== 8 ? ' ' + mi.video[0].bitDepth + '-bit' : '');
            } else {
                for (let i = 0; i < mi.video.length; i++) {
                    video += '#' + (i + 1) + ': ' + mi.video[i].string + '; ';
                }
            }
            result = result.replace('_VIDEO_', video);

            let audio = '';
            let sound = '';
            let block = '';

            //if (mi.audio.length === 1) {
            if (false){
                audio = mi.audio[0].string;
                if (mi.audio[0].lang !== 'und') {
                    sound = mi.audio[0].language;
                }
                header += ' ' + (mi.audio[0].lang === 'jap' ? 'raw' : mi.audio[0].lang);
                block = '[b]Аудио:[/b] ' + audio + ' | [b]Звук:[/b] ' + sound;
            } else {
                for (let i = 0; i < mi.audio.length; i++) {
                    const language = mi.audio[i].language;
                    audio += '#' + (i + 1) + ': ' + mi.audio[i].string + '; ';
                    if (mi.audio[i].lang !== 'und') {
                        //sound += '#' + (i + 1) + ': ' + mi.audio[i].language + '; ';
                        if (!sound.includes(language)) //Избежать дублей
                            sound += language + ', ';
                    }
                    const lang = mi.audio[i].lang === 'jap' ? 'raw' : mi.audio[i].lang;
                    block += '[b]#' + (i + 1) + ':[/b] ' + mi.audio[i].string;// + ' | [b]Звук:[/b] ' + mi.audio[i].language + '\n';
                    block += language === 'Японский' ? ' | [img]http://i5.imageban.ru/out/2015/02/23/839c5b0694b634374eebbe9fcb519cb6.png[/img] | Оригинал\n' : '';
                    block += language === 'Русский' ? ' | [img]http://i4.imageban.ru/out/2015/02/23/2b34ca3f87aa5be5015c3073466f162f.png[/img] | [color=blue][/color] ()\n' : '';
                    if (language !== 'Японский' && language !== 'Русский') block += ' | [b]Звук:[/b] ' + language + '\n';
                    header += (header.indexOf(lang) === -1 ? (i === 0 ? ' ' : '+') + lang : '');
                }
                block = block.substring(0, block.length - 1);
            }
            sound = sound.slice(0, sound.lastIndexOf(", ")).toLowerCase(); //Убрать лишние знаки в конце
            sound = sound.charAt(0).toUpperCase() + sound.slice(1); //Первая буква - заглавная

            result = result.replace('_AUDIOLINE_', audio);
            result = result.replace('_SOUNDLINE_', sound);
            result = result.replace('_AUDIO_', block);

            let subs = '';
            if (mi.text.length === 1) {
                if (mi.text[0].lang !== 'und') {
                    subs = mi.text[0].language;
                }
            } else {
                for (let i = 0; i < mi.text.length; i++) {
                    const language = mi.text[i].language;
                    if (mi.text[i].lang !== 'und') {
                        if(!subs.includes(language))
                            subs += `[b]#${(i + 1)}:[/b] ${language}, ${mi.text[i].fileFormat}, ${mi.text[i].title}`;
                        else
                            subs += `+${mi.text[i].title}`;
                    }
                }
                subs += ' | [img]http://i4.imageban.ru/out/2015/02/23/2b34ca3f87aa5be5015c3073466f162f.png[/img] | [color=blue][/color]';
            }
            let translate = '';
            if (mi.general.filename && subs.length > 0) {
                const ff = mi.general.filename.split(/[\[\]]/);
                if (ff.length > 1) {
                    translate += ff[1];
                }
            }
            if (translation.length > 0) {
                subs += (subs.length > 0 ? '; ' : '') + 'Русские';
                translate += (translate.length > 0 ? '; ' : '') + translation;
            }
            result = result.replace('_TRANSLATION_', translate);
            result = result.replace('_SUBSLINE_', textHelper.replaceAll(subs, 'кий', 'кие'));
            result = result.replace('_MEDIAINFO_', mediaInfo);
        }
        result = result.replace('_HEADER_', header);

        console.log('result: \n' + result);

        return result;
    }

    function replaceVar(a, text) {
        while (a.indexOf('_' + text) > 0 && a.indexOf(text + '_') > 0) {
            a = a.replace(a.substring(a.indexOf('_' + text) - 1, (a.indexOf(text + '_') + text.length + 1)), '');
        }
        a = textHelper.replaceAll(a, text);
        return a;
    }

    function copyToClipboard(text) {
        const textArea = document.createElement("textarea");
        // Place in top-left corner of screen regardless of scroll position.
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        // Ensure it has a small width and height. Setting to 1px / 1em
        // doesn't work as this gives a negative w/h on some browsers.
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        // We don't need padding, reducing the size if it does flash render.
        textArea.style.padding = '0';
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
            const successful = document.execCommand('copy');
            const msg = successful ? 'successful' : 'unsuccessful';
            console.log('Copying text command was ' + msg);
            if (!successful) {
                openDiv('<strong>Результат:</strong><br>' +
                    '<p><font color=red>Скрипту не удалось скопировать текст автоматически. Сделайте это вручную.</font></p>' +
                    '<textarea rows=30 cols=110 id=resultInfo onclick="this.select()">' + text + '</textarea><br>' +
                    '<table cellpadding=0 cellspacing=2 border=0>');
            }
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
        process: process,
        applyTemplate: applyTemplate,
        copyToClipboard: copyToClipboard
    };
}

function NNMHelper() {

    const pageHelper = PageHelper();
    const textHelper = TextHelper();
    const waProcessor = WAProcessor();
    const miProcessor = MIProcessor();

    const table = {};
    const cells = document.querySelectorAll('td.row1[align="right"]');
    for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const name = textHelper.innerText(cell.innerHTML).split(':')[0].trim().replace('\n', '');
        let input = cell.parentNode.querySelector('td.row2 input');
        if (!input) input = cell.parentNode.querySelector('td.row2 textarea');
        if (!input) input = cell.parentNode.querySelectorAll('td.row2 select');
        table[name] = {'label': cell, 'input': input};
    }
    console.log(table);

    function drawLinks() {
        let l = table['Ссылки'].label;
        l.innerHTML = l.innerHTML + '<br>' +
            '<input type=button id=waBtn style="width: 165px;" value="Заполнить описание" onclick="nnmHelper.getData();">' +
            '<br><span id=waLogSpan></span>';
        l = table['MediaInfo'].label;
        l.innerHTML = l.innerHTML + '<br>' +
            '<input type=button style="width: 165px;" value="Заполнить тех.данные" onclick="nnmHelper.parseMI();">';
    }

    function logWARequest(text, blockBtn) {
        document.getElementById('waLogSpan').innerHTML = text;
        document.getElementById('waBtn').disabled = blockBtn;
    }

    function getData() {
        const url = table['Ссылки'].input.value;
        if (url.indexOf('world-art') === -1) {
            logWARequest('Укажите ссылку на WA!', false);
            return;
        }

        clearData();
        logWARequest('Ожидаю ответа...', false);
        const page = pageHelper.loadPage(url)
        const data = waProcessor.loadData(page, url);
        // console.log(data);
        process(data)
    }

    function clearData() {
        table['Обложка'].input.value = '';
        table['Название латиницей'].input.value = '';
        table['Русское название'].input.value = '';
        table['Оригинальное название'].input.value = '';
        table['Английское название'].input.value = '';
        table['Год выпуска'].input.value = '';
        table['Тип'].input[0].selectedIndex = 0;
        table['Жанр'].input.value = '';
        table['Продолжительность'].input.value = '';
        table['Количество серий'].input.value = '';
        table['Дата выпуска'].input.value = '';
        table['Производство'].input.value = '';
        table['Автор оригинала'].input.value = '';
        table['Режиссер'].input.value = '';
        table['Описание'].input.value = '';
        table['Эпизоды'].input.value = '';
        table['Дополнительная информация'].input.value = '';
    }

    function process(data) {
        console.log(data);
        logWARequest('Ответ получен', false);

        table['Обложка'].input.value = data.poster;
        table['Оригинальное название'].input.value = data.names.jap ? data.names.jap : '';
        table['Название латиницей'].input.value = data.names.oth ? data.names.oth : '';
        table['Английское название'].input.value = data.names.eng ? data.names.eng : '';
        table['Русское название'].input.value = data.names.rus ? data.names.rus : '';
        table['Год выпуска'].input.value = data.infoBlock['Дата'].split('.')[2];
        setOption(table['Тип'].input[0], data.infoBlock['Сокращённый тип']);
        table['Жанр'].input.value = data.infoBlock['Жанр'];
        const complete = data.infoBlock['Complete'];
        const count = data.infoBlock['Количество'];
        const sp = data.infoBlock['SP'];
        table['Продолжительность'].input.value = (count > 1 ? count + ' эп. по ' : '') +
            data.infoBlock['Продолжительность'] + (sp > 0 ? ' + ' + sp + ' SP' : '');
        table['Количество серий'].input.value = (count > 1 ? (complete ? count : '1') + ' из ' + count : '') +
            (sp > 0 ? ' + ' + (complete ? sp : '1') + ' SP из ' + sp : '');
        let text = data.infoBlock['Выпуск'];
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
        if (data.episodes && data.episodes.length > 0) {
            text = '';
            const max = data.episodes[data.episodes.length - 1].number;
            for (let i = 0; i < data.episodes.length; i++) {
                text += '[b]' + textHelper.padZero(data.episodes[i].number, max) +
                    '.[/b] [color=#336699]' + data.episodes[i].name + '[/color]\n';
            }
            table['Эпизоды'].input.value = text;
        }

        let notes = '[b]Дополнительные ссылки:[/b]\n';
        text = '';
        if (data.infoLinks['ANN']) {
            text += '[url=' + data.infoLinks['ANN'] + ']ANN[/url]';
        }
        if (data.infoLinks['AniDB']) {
            text += (text.length === 0 ? '' : ', ') + '[url=' + data.infoLinks['AniDB'] + ']AniDB[/url]';
        }
        if (data.infoLinks['MyAnimeList']) {
            text += (text.length === 0 ? '' : ', ') + '[url=' + data.infoLinks['MyAnimeList'] + ']MyAnimeList[/url]';
        }
        if (data.infoLinks['Сетка вещания']) {
            text += (text.length === 0 ? '' : ', ') + '[url=' + data.infoLinks['Сетка вещания'] + ']Сетка вещания[/url]';
        }
        notes += text + '\n[hr]\n[color=red]После обработки введённой информации визардом, ' +
            'вынести ссылки из-под спойлера и разместить их после ссылки на World-Art.[/color]\n[hr]\n';

        if (data.notes) {
            notes += '[hide=Справка]' + data.notes + '[/hide]\n';
        }
        if (data.crossLinks && data.crossLinks.length > 0) {
            text = '';
            for (let i = 0; i < data.crossLinks.length; i++) {
                text += '\n' + data.crossLinks[i];
            }
            notes += '[hide=Состав серии]' + text + '[/hide]';
        }
        notes += '\n[hr][color=red]Вложенные спойлеры также нужно вынести из-под спойлера с доп. информацией, ' +
            'а пустой спойлер убрать.[/color]';
        table['Дополнительная информация'].input.value = notes;
    }

    function parseMI() {
        let mi = table['MediaInfo'].input.value;
        if (mi && mi.length > 0) {
            mi = miProcessor.parseMediaInfo(mi);
            console.log(mi);

            let video = '';
            let videoSpec = '';
            if (mi.video.length === 1) {
                video = mi.video[0].string;
                videoSpec += mi.video[0].scanType + (mi.video[0].format.startsWith('HEVC') ? ' HEVC' : '') +
                    (mi.video[0].bitDepth !== 8 ? ' ' + mi.video[0].bitDepth + '-bit' : '');
            } else {
                for (let i = 0; i < mi.video.length; i++) {
                    video += '#' + (i + 1) + ': ' + mi.video[i].string + '; ';
                }
            }
            table['Видео'].input.value = video;
            table['Характеристики видео(для заголовка)'].input.value = videoSpec;

            let audio = '';
            const audioLang = langObj();
            if (mi.audio.length === 1) {
                audio = mi.audio[0].string;
                audioLang.inc(mi.audio[0].lang);
            } else {
                for (let i = 0; i < mi.audio.length; i++) {
                    console.log(mi.audio[i].lang + ' : ' + audioLang[mi.audio[i].lang]);
                    audio += '#' + (i + 1) + ': ' + mi.audio[i].string + ' [' + mi.audio[i].lang + ']; ';
                    audioLang.inc(mi.audio[i].lang);
                }
            }
            let idx = 5;
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
            table['Язык озвучки'].input[0].selectedIndex = idx;
            table['Язык озвучки (для заголовка)'].input[0].selectedIndex = idx;

            const subsLang = langObj();
            for (let i = 0; i < mi.text.length; i++) {
                console.log(mi.text[i].lang + ' : ' + subsLang[mi.text[i].lang]);
                subsLang.inc(mi.text[i].lang);
            }
            if (subsLang.rus > 0) {
                table['Субтитры'].input[0].selectedIndex = 1;
            }
            if (subsLang.eng > 0) {
                table['Субтитры'].input[1].selectedIndex = 2;
            }
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

    function setOption(selectElement, value) {
        const options = selectElement.options;
        for (let i = 0; i < options.length; i++) {
            if (textHelper.innerText(options[i].innerHTML) === value) {
                selectElement.selectedIndex = i;
                return true;
            }
        }
        return false;
    }

    return {
        drawLinks: drawLinks,
        getData: getData,
        process: process,
        parseMI: parseMI
    }
}

function WAProcessor() {

    const pageHelper = PageHelper();
    const textHelper = TextHelper();

    function loadData(page, url = document.location.href) {
        const blocks = page.querySelectorAll('td[align="left"]');

        const names = getNames(blocks, textHelper.innerText(page.querySelector('font[size="5"]').innerHTML));
        const poster = getPoster(url);
        const company = getCompany(blocks);
        const infoBlock = getInfoBlock(blocks);
        const infoLinks = getInfoLinks(page, url);
        const description = getDescription(page);
        const notes = getNotes(page);
        const episodes = getEpisodes(page);
        const crossLinks = getCrosslinks(page);

        return {
            'names': names,
            'poster': poster,
            'company': company,
            'infoBlock': infoBlock,
            'infoLinks': infoLinks,
            'description': description,
            'notes': notes,
            'episodes': episodes,
            'crossLinks': crossLinks
        }
    }

    function getBlockValue(block) {
        return textHelper.innerText(block.parentNode.children[2].innerHTML).trim();
    }

    function getNames(blocks, rus) {
        const result = {jap: '', rus: rus, eng: '', oth: ''};
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            const blockText = textHelper.innerText(block.innerHTML).trim();
            if (blockText === 'Название (англ.)') {
                result.eng = getBlockValue(block);
            } else if (blockText === 'Название (кандзи)') {
                result.jap = getBlockValue(block);
            } else if (blockText === 'Название (ромадзи)') {
                result.oth = getBlockValue(block);
            }
        }
        return result;
    }

    function getPoster(waUrl) {
        const id = Number(waUrl.split('=')[1]);
        const upId = id - id % 1000 + 1000;
        return waUrl.replace('animation.php?id=', 'img/' + upId + '/') + '/1.jpg'
    }

    function getCompany(blocks) {
        const img = blocks[0].querySelectorAll('img');
        if (img.length === 2 && img[1]) {
            const company = {'name': '', 'url': img[1].parentNode.href};
            const page = pageHelper.loadPage(company['url'])
            company['name'] = textHelper.innerText(page.querySelector('font[size="3"]').innerHTML);
            return company;
        }
    }

    function getInfoBlock(blocks) {
        const result = {};
        result.links = {};
        for (let i = 1; i < blocks.length; i++) {
            const block = blocks[i];
            const blockText = textHelper.innerText(block.innerHTML);
            if (blockText === 'Жанр') {
                result['Жанр'] = getBlockValue(block);
            } else if (blockText === 'Режиссёр') {
                result['Режиссёр'] = getBlockValue(block);
                getBlockLinks(block, result.links);
            } else if (blockText === 'Автор оригинала') {
                result['Автор оригинала'] = getBlockValue(block).split(' | ')[0];
                getBlockLinks(block, result.links);
            } else if (blockText === 'Выпуск') {
                result['Выпуск'] = getBlockValue(block);
                result['Дата'] = result['Выпуск'].split(' ')[1].replace('??', '31').replace('??', '12');
                if (result['Выпуск'].indexOf(' по ') > -1) result['Complete'] = true;
            } else if (blockText === 'Премьера') {
                result['Премьера'] = getBlockValue(block);
                result['Дата'] = result['Премьера'].replace('??', '31').replace('??', '12');
                result['Complete'] = true;
            } else if (blockText === 'Производство') {
                result['Производство'] = getBlockValue(block);
            } else if (blockText === 'Тип') {
                result['Тип'] = getBlockValue(block);
                const type = parseType(result['Тип']);
                result['Тип'] = type.type;
                result['Сокращённый тип'] = type.shortType;
                result['Продолжительность'] = type.duration;
                result['Количество'] = type.count;
                result['SP'] = type.sp;
            }
        }
        return result;

        function getBlockLinks(block, links) {
            if (block.parentNode.children[2]) {
                const aa = block.parentNode.children[2].querySelectorAll('a.review');
                for (let i = 0; i < aa.length; i++) {
                    links[textHelper.innerText(aa[i].innerHTML)] = aa[i].href;
                }
            }
        }
    }

    function parseType(t) {
        let type;
        let shortType;
        let duration = '25 мин.';
        let count = 1;
        let sp = 0;
        let tt = t.split(/[(),]/);// разбираем строку вида - ТВ (24 эп. + 2 спэшла), 25 мин. /  ТВ (>24 эп.), 25 мин.
        type = tt[0].trim();
        if (tt.length > 1) {
            const last = tt[tt.length - 1];
            if (last.indexOf('мин') > 0) {
                duration = last.trim();
            }
            if (tt[1].indexOf('эп') > 0) {
                let s = tt[1];
                if (s.indexOf('+') > 0) {
                    tt = s.split('+');
                    s = tt[0].trim();
                    sp = tt[1].trim().split(' ')[0];
                }
                tt = s.split(/[> ]/);
                if (tt.length === 2) {
                    count = tt[0];
                } else if (tt.length === 3) {
                    count = tt[1];
                }
            }
        }
        if (type === 'ТВ') {
            shortType = 'TV';
        } else if (type === 'OVA' || type === 'OAV' || type === 'OAD') {
            shortType = 'OVA';
        } else if (type.indexOf('фильм') > -1 || type.indexOf('Фильм') > -1) {
            shortType = 'Movie';
        } else {
            shortType = 'Другое';
        }
        return {'type': type, 'shortType': shortType, 'duration': duration, 'count': count, 'sp': sp};
    }

    function getDescription(page) {
        const nearTable = getNearTable(page.querySelectorAll('font[size="2"]'), 'Краткое содержание');
        if (nearTable) {
            const text = textHelper.innerText(nearTable.innerHTML);
            if (text.indexOf('есть описание') > -1) {
                const page_ = pageHelper.loadPage(nearTable.querySelector('a').href);
                const review = page_.querySelector('.comment_block').querySelector('.review');
                if (review.lastChild.tagName === 'I') review.lastChild.remove();
                return review.innerText;
            }
            return text.replace('при копировании текста активная ссылка на www.world-art.ru обязательна, ' +
                'подробнее о перепечатке текстов\n', '');
        }
    }

    function getNotes(page) {
        return getTextFromNearTable(page.querySelectorAll('font[size="2"]'), 'Справка');
    }

    function getEpisodes(page) {
        const result = [];
        const fe = page.querySelectorAll('td[valign="top"]>font[size="2"]');
        if (fe.length > 0) {
            for (let i = 0; i < fe.length; i++) {
                result.push({'number': i + 1, 'name': textHelper.innerText(fe[i].innerHTML)});
            }
            return result;
        } else {
            const text = getTextFromNearTable(page.querySelectorAll('font[size="2"]'), 'Эпизоды');
            if (text) {
                const tt = text.split('\n');
                for (let i = 0; i < tt.length; i++) {
                    if (tt[i].indexOf('. ') > 0) {
                        const ss = tt[i].split('. ');
                        result.push({'number': parseInt(ss[0]), 'name': ss[1]});
                    }
                }
                return result;
            }
        }
    }

    function getCrosslinks(page) {
        let text;
        const pp = page.querySelectorAll('p.review');
        for (let i = 0; i < pp.length; i++) {
            if (textHelper.innerText(pp[i].innerHTML).indexOf('Серия состоит из') >= 0) {
                text = textHelper.innerText(pp[i].parentNode.innerHTML).replace(/ #/g, '\n#');
                const result = [];
                const ss = text.split('\n');
                for (i = 0; i < ss.length; i++) {
                    if (ss[i].indexOf('#') >= 0) {
                        result.push(ss[i]);
                    }
                }
                return result;
            }
        }
    }

    function getNearTable(fe, text) {
        for (let i = 0; i < fe.length; i++) {
            if (textHelper.innerText(fe[i].innerHTML).indexOf(text) > -1) {
                return fe[i].parentNode.parentNode.parentNode.parentNode.parentNode.nextSibling.nextSibling;
            }
        }
    }

    function getTextFromNearTable(fe, text) {
        const nearTable = getNearTable(fe, text);
        if (nearTable) return textHelper.innerText(nearTable.innerHTML);
    }

    function getInfoLinks(page, waUrl) {
        const result = {WA: waUrl};
        const links = page.querySelectorAll('a[target="_blank"]');
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            if (link.href.indexOf('anidb') > 0) {
                result['AniDB'] = link.href;
            } else if (link.href.indexOf('animenewsnetwork') > 0) {
                result['ANN'] = link.href;
            } else if (link.href.indexOf('myanimelist') > 0) {
                result['MAL'] = link.href;
            } else if (link.href.indexOf('syoboi') > 0) {
                result['SCHEDULE'] = link.href;
            } else {
                result[textHelper.innerText(link.innerHTML)] = link.href;
            }
        }
        return result;
    }

    return {
        loadData: loadData
    }
}

function MIProcessor() {

    function parseMediaInfo(mediaInfo) {
        if (!mediaInfo) {
            return;
        }

        const mi = mediaInfo.split('\n');

        const parts = [];
        let start = 0;
        let end = 0;
        do {
            end = mi.indexOf("", start);
            const part = mi.slice(start, (end === -1 ? mi.length : end));
            start = end + 1;
            const infoPart = {'name': part[0]};
            for (let i = 1; i < part.length; i++) {
                const ss = part[i].split(' : ');
                infoPart[ss[0].trim()] = ss[1].trim();
            }
            parts.push(infoPart);
        } while (end > -1);

        let general;
        const video = [];
        const audio = [];
        const text = [];
        for (let i = 0; i < parts.length; i++) {
            if (parts[i].name) {
                if (parts[i].name === 'General' || parts[i].name === 'Общее') {
                    general = parseGeneral(parts[i]);
                } else if (parts[i].name.indexOf('Video') === 0 || parts[i].name.indexOf('Видео') === 0) {
                    video.push(parseVideo(parts[i]));
                } else if (parts[i].name.indexOf('Audio') === 0 || parts[i].name.indexOf('Аудио') === 0) {
                    audio.push(parseAudio(parts[i]));
                } else if (parts[i].name.indexOf('Text') === 0 || parts[i].name.indexOf('Текст') === 0) {
                    text.push(parseText(parts[i]));
                }
            }
        }

        return {general: general, video: video, audio: audio, text: text};
    }

    function parseDuration(object) {
        const duration = {hours: 0, minutes: 0, total: 0};
        let text;
        if (object['Duration']) {
            text = object['Duration'].split(' ');
            for (let i = 0; i < text.length; i++) {
                if (text[i].indexOf('h') > 0) {
                    duration.hours = parseInt(text[i].split('h')[0]);
                } else if (text[i].indexOf('mn') > 0) {
                    duration.minutes = parseInt(text[i].split('mn')[0]);
                }
            }
        } else if (object['Продолжительность']) {
            text = object['Продолжительность'].split('.');
            for (let i = 0; i < text.length; i++) {
                const ss = text[i].trim().split(' ');
                if (ss.length === 2) {
                    if (ss[1] === 'ч') {
                        duration.hours = parseInt(ss[0]);
                    } else if (ss[1] === 'м') {
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
            const pp = numbers.split(' ');
            if (pp.length === 2) {
                return [parseFloat(pp[0].replace(',', '.')), parseUnits(pp[1])];
            } else if (pp.length === 3) {
                return [parseFloat(pp[0] + pp[1].replace(',', '.')), parseUnits(pp[2])];
            }
        }
    }

    function parseUnits(units) {
        if (units.indexOf('bps') === 0 || units.indexOf('бит/сек') === 0) {
            return 'bps';
        } else if (units.indexOf('Kbps') === 0 || units.indexOf('kb/s') === 0 || units.indexOf('Кбит/сек') === 0) {
            return 'kbps';
        } else if (units.indexOf('Mbps') === 0 || units.indexOf('Mb/s') === 0 || units.indexOf('Мбит/сек') === 0) {
            return 'Mbps';
        } else if (units.indexOf('bit') === 0 || units.indexOf('бит') === 0) {
            return 'b';
        } else if (units.indexOf('byte') === 0 || units.indexOf('байт') === 0) {
            return 'B';
        } else if (units.indexOf('KiB') === 0 || units.indexOf('Кбайт') === 0) {
            return 'kB';
        } else if (units.indexOf('MiB') === 0 || units.indexOf('Мбайт') === 0) {
            return 'MB';
        } else if (units.indexOf('GiB') === 0 || units.indexOf('Гбайт') === 0) {
            return 'GB';
        } else if (units.indexOf('pixel') === 0 || units.indexOf('пиксел') === 0) {
            return 'px';
        } else if (units.indexOf('Hz') === 0 || units.indexOf('Гц') === 0) {
            return 'Hz';
        } else if (units.indexOf('KHz') === 0 || units.indexOf('КГц') === 0 ||
            units.indexOf('kHz') === 0 || units.indexOf('кГц') === 0) {
            return 'kHz';
        } else if (units.indexOf('channel') === 0 || units.indexOf('канал') === 0) {
            return 'ch';
        } else if (units.indexOf('') || units.indexOf('')) {
            return '';
        }
    }

    function parseGeneral(general) {
        const result = {
            filename: null,
            duration: null
        };
        result.filename = (general['Complete name'] || general['Полное имя']);
        result.duration = parseDuration(general);
        return result;
    }

    function parseVideo(video) {
        const result = {
            format: null,
            resolution: null,
            scanType: null,
            frameRate: null,
            bitrate: null,
            bitDepth: null,
            string: null
        };

        result.bitDepth = parseNumbers(video['Bit depth'] || video['Битовая глубина'])[0];

        result.format = (video['Format'] || video['Формат']) + ' (' +
            (video['Format profile'] || video['Профиль формата']) + ')' +
            (result.bitDepth !== 8 ? ' ' + result.bitDepth + '-bit' : '');

        const width = parseNumbers(video['Width'] || video['Ширина'])[0];
        const height = parseNumbers(video['Height'] || video['Высота'])[0];
        const dar = video['Display aspect ratio'] || video['Соотношение сторон'];
        result.resolution = width + 'x' + height + ' (' + dar + ')';

        const scanType = video['Scan type'] || video['Тип развёртки'];
        if (scanType === 'Interleave' || scanType === 'Черезстрочная') {
            result.scanType = height + 'i';
        } else {
            result.scanType = height + 'p';
        }

        let frameRate = video['Frame rate'] || video['Частота кадров'];
        if (frameRate) {
            frameRate = frameRate.split(' ')[0].replace(',', '.');
            result.frameRate = '~' + frameRate + ' fps';
        }

        let bitrate = parseNumbers(video['Bit rate'] || video['Битрейт']);
        if (!bitrate) {
            const bppf = video['Bits/(Pixel*Frame)'] || video['Бит/(Пиксели*Кадры)'];
            if (bppf) {
                bitrate = [bppf * width * height * frameRate, 'bps'];
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

        result.string = result.format + ', ' + result.resolution +
            (result.frameRate ? ', ' + result.frameRate : '') +
            (result.bitrate ? ', ' + result.bitrate : '');

        return result;
    }

    function parseAudio(audio) {
        const result = {
            format: null, channels: null, bitDepth: null, sampleRate: null, bitRate: null,
            language: null, lang: null, title: null, string: null
        };

        result.language = (audio['Language'] || audio['Язык']);
        result.language = translateLang(result.language);
        result.lang = getShortLang(result.language);
        result.title = (audio['Title'] || audio['Заголовок']);

        const bitDepth = parseNumbers(audio['Bit depth'] || audio['Битовая глубина']);
        if (bitDepth) {
            result.bitDepth = bitDepth[0];
        }

        const format = (audio['Format'] || audio['Формат']);
        result.format = format;
        if (audio['Format profile'] || audio['Профиль формата']) {
            result.format += ' ' + (audio['Format profile'] || audio['Профиль формата']);
        }

        let channels = audio['Channel(s)'] || audio['Каналы'] || audio['Channel count'];
        if (channels.indexOf('/') > -1) {
            channels = channels.split('/')[0].trim();
        }
        channels = parseNumbers(channels);
        result.channels = channels[0] + ' ' + channels[1];

        let sampleRate = audio['Sampling rate'] || audio['Частота'];
        if (sampleRate.indexOf('/') > -1) {
            sampleRate = sampleRate.split('/')[0].trim();
        }
        sampleRate = parseNumbers(sampleRate);
        result.sampleRate = sampleRate[0] + ' ' + sampleRate[1];

        let bitrate = audio['Bit rate'] || audio['Битрейт'];
        if (!bitrate) {
            if (format === 'FLAC') {
                if (bitDepth[0] === 16) {
                    bitrate = '1000 Kbps';
                } else if (bitDepth[0] === 24) {
                    bitrate = '1500 Kbps';
                }
            }
        }
        bitrate = parseNumbers(bitrate);
        result.bitRate = bitrate ? '~' + bitrate[0] + ' ' + bitrate[1] : null;

        result.string = result.format + ', ' + result.channels + ', ' + result.sampleRate +
            (result.bitDepth ? ', ' + result.bitDepth + ' bit' : '') + (result.bitRate ? ', ' + result.bitRate
                : '');

        return result;
    }

    function parseText(text) {
        const result = {lang: null, language: null, title: null, fileFormat: null};
        result.title = (text['Title'] || text['Заголовок']);
        result.language = (text['Language'] || text['Язык']);
        result.language = translateLang(result.language);
        result.lang = getShortLang(result.language);
        result.fileFormat = (text['Format'] || text['Формат']);
        return result;
    }

    function translateLang(language) {
        if (language === 'Japanese') {
            return 'Японский';
        } else if (language === 'Chinese') {
            return 'Китайский';
        } else if (language === 'Russian') {
            return 'Русский';
        } else if (language === 'English') {
            return 'Английский';
        } else {
            return language;
        }
    }

    function getShortLang(language) {
        if (language === 'Японский') {
            return 'jap';
        } else if (language === 'Китайский') {
            return 'chi';
        } else if (language === 'Русский') {
            return 'rus';
        } else if (language === 'Английский') {
            return 'eng';
        } else {
            return 'und';
        }
    }

    return {
        parseMediaInfo: parseMediaInfo
    }
}

function PageHelper() {

    function loadPage(url) {
        const xhr = new XMLHttpRequest();
        if (use_proxy) {
            xhr.open('POST', 'https://files.nik.ovh/wa.php', false);
            xhr.send(JSON.stringify({'url': url}));
        } else {
            xhr.open('GET', url, false);
            xhr.send();
        }
        const page = document.body.appendChild(document.createElement("div"));
        page.innerHTML = /<body[^>]*>([\s\S]+)<\/body>/i.exec(xhr.responseText + "</center></body></html>")[1];
        document.body.removeChild(page);
        // console.log(page);
        return page;
    }

    return {
        loadPage: loadPage
    }
}

function TextHelper() {

    function innerText(html) {
        return html.replace(/<br>/g, '\n').replace(/<(?:.|\n)*?>/gm, '').replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/[ \t]+/g, ' ');
    }

    function replaceAll(str, find, replace) {
        if (!replace) replace = '';
        while (str.indexOf(find) >= 0) {
            str = str.replace(find, replace);
        }
        return str;
    }

    function testLang(text) {
        const result = {eng: false, rus: false, jap: false};
        if (text.replace(/[a-zA-Z0-9 _=!@#$%^&*\-()\[\]{}|\\:;"'\/?<>.,]/g, '').length === 0) {
            result.eng = true;
        } else if (text.replace(/[а-яА-ЯёЁa-zA-Z0-9 _=!@#$%^&*\-()\[\]{}|\\:;"'\/?<>.,]/g, '').length === 0) {
            result.rus = true;
        } else {
            result.jap = true;
        }
        return result;
    }

    function padZero(number, count) {
        const maxLength = ('' + count).length;
        const curLength = ('' + number).length;
        let result = '';
        for (let i = 0; i < maxLength - curLength; i++) {
            result += '0';
        }
        return result + number;
    }

    return {
        innerText: innerText,
        replaceAll: replaceAll,
        testLang: testLang,
        padZero: padZero
    }
}

const script = document.createElement('script');
let textContent = TextHelper.toString() + PageHelper.toString() + WAProcessor.toString() + MIProcessor.toString();
let use_proxy = false;
if (window.location.href.indexOf('world-art') > -1) {
    textContent += WAHelper.toString() + ' var waHelper = WAHelper(); ' +
        (!localStorage.guide ? ' waHelper.drawLinks();' : '');
} else {
    use_proxy = true;
    textContent += NNMHelper.toString() + ' var nnmHelper = NNMHelper(); nnmHelper.drawLinks();';
}
textContent += ' const use_proxy = ' + use_proxy + ';';
script.textContent = textContent;
document.body.appendChild(script);
