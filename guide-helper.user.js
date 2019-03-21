// ==UserScript==
// @name          nnm-club^anime guide helper
// @namespace     nnm-club^anime.Scripts
// @description   Генерация расписания аниме-сезона по данным базы World-Art и портала KG-Portal
// @version       1.0.0.2
// @author        ElSwanko
// @homepage      https://github.com/ElSwanko/nnm-club-anime
// @updateURL     https://github.com/ElSwanko/nnm-club-anime/raw/master/guide-helper.meta.js
// @downloadURL   https://github.com/ElSwanko/nnm-club-anime/raw/master/guide-helper.user.js
// @match         http://www.world-art.ru/animation/*
// @grant         none
// ==/UserScript==
//

function GuideHelper() {

    var guideTemplate =
        '[hide=_STRINGNAMES_][align=center][color=#336699][size=22][b]_NAMES_[/b][/size][/color][/align][hr]\n' +
        '[poster=right]_POSTER_[/poster]\n' +
        '[b]Жанр:[/b] _GENRE_\n' +
        '[b]Тип:[/b] _TYPE_\n' +
        '[b]Продолжительность:[/b] _DURATION_\n' +
        '[b]Выпуск:[/b] _DATE_\n' +
        '_IFCOMPANY[b]Производство:[/b] студия _COMPANY_ IFCOMPANY_\n' +
        '_IFAUTHOR[b]Автор оригинала:[/b] _AUTHOR_ IFAUTHOR_\n' +
        '_IFDIRECTOR[b]Режиссер:[/b] _DIRECTOR_ IFDIRECTOR_\n' +
        '[b]Ссылки:[/b] _INFOLINKS_\n' +
        '[hr]\n' +
        '[b]Описание:[/b]\n' +
        '_DESCRIPTION_\n' +
        '[/hide]\n';
    var trashTemplate = '[url=_WAURL_]_STRINGNAMES_[/url]: Выпуск - _DATE_\n';

    var catNames = {TV: 'Сериалы', OVA: 'OVA/OAD', Movie: 'Фильмы'};
    var guideData = localStorage.guideData ? JSON.parse(localStorage.guideData) : {
        TV: {}, TV_trash: {}, OVA: {}, OVA_trash: {}, Movie: {}, Movie_trash: {}
    };
    var maxLenght = {TV: 0, TV_trash: 0, OVA: 0, OVA_trash: 0, Movie: 0, Movie_trash: 0};

    var waProcessor = WAProcessor();
    var waHelper = WAHelper();

    function ownCategory() {
        for (var category in guideData) {
            if (guideData.hasOwnProperty(category) && guideData[category].hasOwnProperty(document.location.href)) return category;
        }
        return '';
    }

    function count() {
        return {
            TV: countCategory(guideData.TV), TV_trash: countCategory(guideData.TV_trash),
            OVA: countCategory(guideData.OVA), OVA_trash: countCategory(guideData.OVA_trash),
            Movie: countCategory(guideData.Movie), Movie_trash: countCategory(guideData.Movie_trash),
            ownCategory: ownCategory()
        };

        function countCategory(category) {
            var count = 0;
            for (var key in category) {
                if (category.hasOwnProperty(key))
                    count++;
            }
            return count;
        }
    }

    function getCurrent() {
        var category = ownCategory();
        if (category.length > 0) {
            var data = guideData[category][document.location.href];
            if (!data.infoBlock['Продолжительность']) data.infoBlock['Продолжительность'] = (localStorage.duration ? localStorage.duration : '');
            if (!data.infoBlock['Количество']) data.infoBlock['Количество'] = (localStorage.count ? localStorage.count : '');
            return data;
        }
        return {
            names: {
                rus: ''
            },
            infoBlock: {
                'Продолжительность': localStorage.duration ? localStorage.duration : '',
                'Количество': localStorage.count ? localStorage.count : ''
            },
            description: '',
            checked: ''
        }
    }

    function drawInputs() {
        var data = getCurrent();
        var div = document.createElement('div');
        div.id = 'guideHelper_links';
        div.innerHTML = '<table cellpadding=0 cellspacing=2 border=0><tr>' +
            '<td width=80 align=right bgcolor=eaeaea>Название:</td>' +
            '<td width=420 align=left bgcolor=eaeaea><textarea id=guide_name rows=1 cols=110>' + data.names.rus + '</textarea></td>' +
            '</tr><tr>' +
            '<td align=right bgcolor=eaeaea>Описание:</td>' +
            '<td align=left bgcolor=eaeaea><textarea id=guide_desc rows=5 cols=110>' + data.description + '</textarea></td>' +
            '</tr><tr>' +
            '<td align=right bgcolor=eaeaea>Длительность:</td>' +
            '<td align=left bgcolor=eaeaea>' +
            '<table><tr>' +
            '   <td align=left width=50><input id=title_duration width=50 value="' + data.infoBlock['Продолжительность'] + '"/></td>' +
            '   <td align=right width=125>Количество серий:&nbsp;</td>' +
            '   <td align=left width=50><input id=title_count width=50 value="' + data.infoBlock['Количество'] + '"/></td>' +
            '   <td align=left width=25><input id=title_crosslinks type=checkbox ' + data.checked + '/></td>' +
            '</tr></table>' +
            '</td></tr><tr>' +
            '<td align=right bgcolor=eaeaea>Добавить в:</td>' +
            '<td align=left bgcolor=eaeaea>' +
            '<table><tr>' +
            '   <td align=left width=100><select id=guide_category></select></td>' +
            '   <td align=center width=100 bgcolor=963D3D><a href="javascript:;" onclick="guideHelper.add();"><font color="white">Добавить</font></a></td>' +
            '   <td align=center width=100 bgcolor=963D3D><a href="javascript:;" onclick="guideHelper.del();"><font color="white">Удалить</font></a></td>' +
            '   <td align=center width=100 bgcolor=963D3D><a href="javascript:;" onclick="guideHelper.get();"><font color="white">Получить</font></a></td>' +
            '</tr></table>' +
            '</td></tr></table>';
        var a = document.querySelector('a[style="text-decoration:none"]');
        var table = a.parentNode.parentNode.parentNode.parentNode;
        table.parentNode.insertBefore(div, table.nextSibling);
        drawSelect();
    }

    function drawSelect() {
        var select = document.querySelector('select[id=guide_category]');
        if (select.selectedIndex > -1) {
            localStorage.categoryIdx = select.selectedIndex;
        }
        while (select.children.length > 0) {
            select.removeChild(select.children[0]);
        }
        var countData = count();
        for (var category in countData) {
            if (countData.hasOwnProperty(category) && category !== 'ownCategory') {
                var option = document.createElement('option');
                option.value = category;
                option.text = category + ' [' + countData[category] + ']' + (category === countData['ownCategory'] ? '*' : '');
                select.appendChild(option);
            }
        }
        select.selectedIndex = (localStorage.categoryIdx ? localStorage.categoryIdx : 0);
    }

    function add() {
        var select = document.querySelector('select[id=guide_category]');
        var category = select.selectedOptions[0].value;

        var duration = document.querySelector('input[id=title_duration]');
        if (duration.value && duration.value.length > 0) {
            localStorage.duration = duration.value;
        } else {
            delete localStorage.duration;
        }
        var count = document.querySelector('input[id=title_count]');
        if (count.value && count.value.length > 0) {
            localStorage.count = count.value;
        } else {
            delete localStorage.count;
        }

        var data = waProcessor.loadData(document);
        if (data.episodes && data.episodes.length > 0) data.episodes = false;
        if (data.crossLinks && data.crossLinks.length > 0) data.crossLinks = true;
        if ((data.infoBlock['Тип'] === 'ТВ' || data.infoBlock['Тип'] === 'web')
            && data.infoBlock['Количество'] === 1 && localStorage.count) data.infoBlock['Количество'] = localStorage.count;
        if (localStorage.duration) data.infoBlock['Продолжительность'] = localStorage.duration;

        var name = document.querySelector('textarea[id=guide_name]').value;
        if (name) {
            data.names.jap = data.names.rus;
            data.names.rus = name;
        }
        if (data.names.jap) data.names.jap = data.names.jap.replace('[', '(').replace(']', ')');
        if (data.names.eng) data.names.eng = data.names.eng.replace('[', '(').replace(']', ')');
        if (data.names.rus) data.names.rus = data.names.rus.replace('[', '(').replace(']', ')');

        data.description = document.querySelector('textarea[id=guide_desc]').value.trim();
        if (data.description > 0 && data.description.indexOf('©') < 0) {
            data.description += ' © KG-Portal';
        }
        data.checked = document.querySelector('input[id=title_crosslinks]').checked ? 'checked' : '';
        if (data.checked.length > 0 && data.description.indexOf('TBD') < 0) {
            data.description += '\nПродолжение [topic=TBD]истории[/topic].';
        }

        guideData[category][document.location.href] = data;
        localStorage.guideData = JSON.stringify(guideData);

        drawSelect();
    }

    function del() {
        var select = document.querySelector('select[id=guide_category]');
        var category = select.selectedOptions[0].value;

        if (guideData[category][document.location.href]) delete guideData[category][document.location.href];

        localStorage.guideData = JSON.stringify(guideData);

        drawSelect();
    }

    function get() {
        getMaxLength();
        var sortedData = sort();
        var guide = generateCoverage(sortedData);
        guide += generateCategory(sortedData, 'TV', true);
        guide += generateCategory(sortedData, 'OVA');
        guide += generateCategory(sortedData, 'Movie');
        guide += generateDisclaimer();
        waHelper.copyToClipboard(guide);
    }

    function sort() {
        var sortedData = {};
        for (var category in guideData) {
            var categoryData = guideData[category];
            var sortedCategory = {};
            var sortedDates = [];
            var byDates = {};
            for (var key in categoryData) {
                if (categoryData.hasOwnProperty(key)) {
                    var data = categoryData[key];
                    var date = toDate(data.infoBlock['Дата']);
                    if (!byDates[date]) {
                        byDates[date] = {names: [], values: []};
                        sortedDates.push(date);
                    }
                    byDates[date].names.push(data.names.jap);
                    byDates[date].values.push(data);
                }
            }
            sortedDates = sortedDates.sort();
            for (var i = 0; i < sortedDates.length; i++) {
                var date = sortedDates[i];
                var dateString = toString(date);
                if (!sortedCategory[dateString]) sortedCategory[dateString] = {};
                var dateValue = byDates[date];
                dateValue.names = dateValue.names.sort();
                for (var j = 0; j < dateValue.names.length; j++) {
                    var name = dateValue.names[j];
                    for (var k = 0; k < dateValue.values.length; k++) {
                        var value = dateValue.values[k];
                        if (value.names.jap === name) {
                            sortedCategory[dateString][name] = value;
                            break;
                        }
                    }
                }
            }
            sortedData[category] = sortedCategory;
        }
        return sortedData;

        function toDate(string) {
            var ss = string.split('.');
            return new Date(ss[1] + '.' + ss[0] + '.' + ss[2]).getTime();
        }

        function toString(date) {
            return new Date(date).toLocaleDateString("ru-RU");
        }
    }

    function generateCoverage(data) {
        var result = '[hide=Покрытие сезона]\n';

        result += '[url=http://anichart.net/' + localStorage.season + '/]anichart[/url]\n';
        result += '[url=http://rusub.tk/]Сводная таблица русаба[/url]\n\n';

        var cat = 'TV';
        var rowEnd = '[col color=#FFFFFF]—\t\t[col color=#FFFFFF]—\t\t[col color=#FFFFFF]—\t[col color=#FFFFFF]—\t\t[col]—\n';
        result += '[b]' + catNames[cat] + '[/b]\n\n';
        result += padTabs('[b][table][align=center]Название[/align]', cat) +
            '[mcol]TV 720\t\t\t[mcol]TV 720 rus\t\t[mcol]BD 720\t\t[mcol]BD 1080\t\t\t[mcol]Комментарии\n';
        iterateDateCategory(data[cat], function (values) {
            result += padTabs('[row]' + values.names.jap, cat) + rowEnd;
        }, function (date) {
            result += '[row color=#80FFFF]с ' + date + '[col][col][col][col][col]\n';
        });
        result += padTabs('[row]—', cat) + rowEnd;
        result += '[/table][/b]\n\n';

        cat = 'OVA';
        rowEnd = '[col color=#FFFFFF]—\t\t[col color=#FFFFFF]—\t\t[col color=#FFFFFF]—\t\t[col]—\n';
        result += '[b]' + catNames[cat] + '[/b]\n\n';
        result += padTabs('[b][table][align=center]Название[/align]', cat) +
            '[mcol]TV/BD 720\t\t\t[mcol]BD 1080\t\t\t[mcol]BD 720/1080 rus\t\t[mcol]Комментарии\n';
        iterateDateCategory(data[cat], function (values) {
            result += padTabs('[row]' + values.names.jap, cat) + rowEnd;
        });
        result += padTabs('[row]—', cat) + rowEnd;
        result += '[/table][/b]\n\n';

        cat = 'Movie';
        result += '[b]' + catNames[cat] + '[/b]\n\n';
        result += padTabs('[b][table][align=center]Название[/align]', cat) +
            '[mcol]BD 1080\t\t\t[mcol]BD 720\t\t\t[mcol]BD 720/1080 rus\t\t[mcol]Комментарии\n';
        iterateDateCategory(data[cat], function (values) {
            result += padTabs('[row]' + values.names.jap, cat) + rowEnd;
        });
        result += padTabs('[row]—', cat) + rowEnd;
        result += '[/table][/b]\n\n';

        result += '[b]Легенда[/b]\n\n';
        result += '[table][b]Цвет ячейки[/b][mcol]Значение\n';
        result += '[row color=#FFFFFF]—[col color=#FFFFFF]Релиз свободен\n';
        result += '[row color=#40FF80][b]Релизер[/b][col color=#FFFFFF]Забронирован ТВ/Web-релиз\n';
        result += '[row color=#40BFFF][b]Релизер[/b][col color=#FFFFFF]Забронирован BD/DVD-релиз\n';
        result += '[row color=#FFFFFF][b]Релизер[/b][col color=#FFFFFF]Релиз забронирован, но релизер может передать его другому релизеру\n';
        result += '[/table]\n';

        result += '[/hide]\n\n[hr]\n';

        return result;

        function padTabs(text, category) {
            var max = maxLenght[category] + 5;
            max = max + (8 - (max % 8));
            var spaces = max - text.length;
            var left = spaces % 8;
            var count = ((spaces - left) / 8) + (left > 0 ? 1 : 0);
            for (var i = 0; i < count; i++) text += '\t';
            return text;
        }
    }

    function generateDisclaimer() {
        return '[hr]\n[hr]\n\n[hide=DISCLAIMER]\n' +
            'Вся информация взята из сетей интернета на ресурсах:\n' +
            'world-art.ru, kg-portal.ru, anichart.net\n' +
            '[/hide]\n';
    }

    function generateCategory(data, category, strikeoutDate) {
        console.log('category: ' + category + ', value: ' + JSON.stringify(data[category]));
        var result = '\n[hide=' + catNames[category] + ']\n\n';
        iterateDateCategory(data[category], function (values) {
            result += waHelper.applyTemplate(guideTemplate, values) + '\n';
        }, null, strikeoutDate ? function () {
            result += '[hr]\n\n'
        } : null);
        console.log('category: ' + category + '_trash, value: ' + JSON.stringify(data[category + '_trash']));
        result += '[hide=Прочее:]\n';
        iterateDateCategory(data[category + '_trash'], function (values) {
            result += waHelper.applyTemplate(trashTemplate, values);
        });
        result += '[/hide]\n\n[/hide]\n\n[hr]\n';
        return result;
    }

    function iterateDateCategory(categoryData, iterateAction, preDateAction, postDateAction) {
        for (var date in categoryData) {
            if (categoryData.hasOwnProperty(date)) {
                if (preDateAction) preDateAction(date);
                var dateValues = categoryData[date];
                for (var name in dateValues) {
                    if (dateValues.hasOwnProperty(name)) {
                        iterateAction(dateValues[name]);
                    }
                }
                if (postDateAction) postDateAction(date);
            }
        }
    }

    function checkData(action) {
        for (var category in guideData) {
            if (guideData.hasOwnProperty(category)) {
                var categoryData = guideData[category];
                for (var url in categoryData) {
                    if (categoryData.hasOwnProperty(url)) {
                        if (action) action(category, url);
                    }
                }
            }
        }
        localStorage.guideData = JSON.stringify(guideData);
    }

    function getMaxLength() {
        checkData(function (category, url) {
            var data = guideData[category][url];
            if (data.names.jap.length > maxLenght[category]) maxLenght[category] = data.names.jap.length;
        });
    }

    function checkPoster() {
        checkData(function (category, url) {
            var data = guideData[category][url];
            if (!data['poster']) {
                var waUrl = data.infoLinks['WA'];
                var id = Number(waUrl.split('=')[1]);
                var upId = id - id % 1000 + 1000;
                data['poster'] = waUrl.replace('animation.php?id=', 'img/' + upId + '/') + '/1.jpg';
            }
        })
    }

    function checkDesc() {
        checkData(function (category, url) {
            var data = guideData[category][url];
            var desc = data['description'];
            if (!desc) desc = '';
            if (desc.indexOf('undefined') > -1) desc = desc.substring(10);
            data['description'] = desc;
        })
    }

    return {
        drawInputs: drawInputs,
        checkPoster: checkPoster,
        checkDesc: checkDesc,
        add: add,
        del: del,
        get: get
    }
}

var script = document.createElement('script');
var textContent = (localStorage.guide ? GuideHelper.toString() + ' var guideHelper = GuideHelper(); guideHelper.drawInputs(); ' : '');
script.textContent = textContent;
document.body.appendChild(script);
